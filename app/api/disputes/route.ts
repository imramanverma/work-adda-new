import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { processRazorpayRefund } from "@/lib/razorpay";
import { recordPaymentAudit } from "@/lib/escrow";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    let where: any = {};
    if (user.role === "WORKER") {
      where = {
        OR: [{ raisedById: user.id }, { payment: { receiverId: user.id } }],
      };
    } else if (user.role === "EMPLOYER") {
      where = {
        OR: [{ raisedById: user.id }, { payment: { payerId: user.id } }],
      };
    } // Admin sees all

    const disputes = await db.dispute.findMany({
      where,
      include: {
        job: { select: { id: true, title: true, category: true } },
        payment: {
          include: {
            payer: { select: { id: true, name: true, phone: true } },
            receiver: { select: { id: true, name: true, phone: true } },
            ledger: true,
          },
        },
        raisedBy: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ disputes });
  } catch (error: any) {
    console.error("Fetch disputes error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch disputes." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["EMPLOYER", "WORKER", "ADMIN"]);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    const body = await req.json();
    const { paymentId, reason, description, evidence } = body;

    if (!paymentId || !reason || !description) {
      return NextResponse.json(
        { error: "Payment ID, reason, and detailed description are required." },
        { status: 400 }
      );
    }

    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: { job: true },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found." }, { status: 404 });
    }

    if (
      user.role !== "ADMIN" &&
      payment.payerId !== user.id &&
      payment.receiverId !== user.id
    ) {
      return NextResponse.json(
        { error: "Forbidden. You are not a party to this payment." },
        { status: 403 }
      );
    }

    // Check if open dispute already exists
    const existingDispute = await db.dispute.findFirst({
      where: {
        paymentId: payment.id,
        status: { in: ["OPEN", "UNDER_REVIEW"] },
      },
    });

    if (existingDispute) {
      return NextResponse.json(
        { error: "A dispute is already open for this payment.", dispute: existingDispute },
        { status: 400 }
      );
    }

    // Create dispute & put payment into DISPUTED escrow state
    const [dispute, updatedPayment] = await db.$transaction([
      db.dispute.create({
        data: {
          jobId: payment.jobId,
          paymentId: payment.id,
          raisedById: user.id,
          reason,
          description,
          evidence: evidence || null,
          status: "OPEN",
        },
        include: {
          job: true,
          raisedBy: { select: { id: true, name: true } },
        },
      }),

      db.payment.update({
        where: { id: payment.id },
        data: {
          status: "DISPUTED",
          escrowStatus: "DISPUTED",
        },
      }),
    ]);

    // Audit log
    await recordPaymentAudit({
      paymentId: payment.id,
      jobId: payment.jobId,
      actorId: user.id,
      actorRole: user.role === "EMPLOYER" ? "HIRER" : user.role === "WORKER" ? "WORKER" : "ADMIN",
      eventType: "DISPUTE_OPENED",
      fromStatus: payment.escrowStatus,
      toStatus: "DISPUTED",
      metadata: {
        disputeId: dispute.id,
        reason,
        description,
      },
    });

    // Notify opposing party
    const targetUserId = user.id === payment.payerId ? payment.receiverId : payment.payerId;
    await db.notification.create({
      data: {
        userId: targetUserId,
        title: "Dispute Raised on Escrow ⚠️",
        message: `A dispute has been opened regarding "${payment.job.title}". Escrow funds are temporarily locked while under administrative review.`,
        type: "PAYMENT",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Dispute has been registered. Escrow funds are safely frozen pending review.",
      dispute,
      payment: updatedPayment,
    });
  } catch (error: any) {
    console.error("Create dispute error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to raise dispute." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["ADMIN"]);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    const body = await req.json();
    const { disputeId, resolution, notes = "" } = body;

    if (!disputeId || !resolution) {
      return NextResponse.json(
        { error: "Dispute ID and resolution action are required." },
        { status: 400 }
      );
    }

    const dispute = await db.dispute.findUnique({
      where: { id: disputeId },
      include: {
        payment: {
          include: { job: true, assignment: true },
        },
      },
    });

    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found." }, { status: 404 });
    }

    const payment = dispute.payment;
    const now = new Date();

    if (resolution === "RELEASE_TO_WORKER") {
      await db.$transaction([
        db.dispute.update({
          where: { id: dispute.id },
          data: {
            status: "RESOLVED",
            resolution: `RESOLVED: Released to worker. ${notes}`,
            resolvedAt: now,
            resolvedById: user.id,
          },
        }),
        db.payment.update({
          where: { id: payment.id },
          data: {
            status: "RELEASED",
            escrowStatus: "RELEASED",
            releasedAt: now,
          },
        }),
        db.escrowLedger.upsert({
          where: { paymentId: payment.id },
          create: {
            paymentId: payment.id,
            jobAmount: payment.amount,
            platformFee: payment.platformFee,
            workerAmount: payment.workerAmount,
            heldAmount: 0.0,
            releasedAmount: payment.workerAmount,
            refundedAmount: 0.0,
            currency: payment.currency,
            isReconciled: true,
          },
          update: {
            heldAmount: 0.0,
            releasedAmount: payment.workerAmount,
            isReconciled: true,
          },
        }),
        ...(payment.assignmentId
          ? [
              db.workAssignment.update({
                where: { id: payment.assignmentId },
                data: { status: "PAID", completionStatus: "APPROVED" },
              }),
            ]
          : []),
      ]);

      await recordPaymentAudit({
        paymentId: payment.id,
        jobId: payment.jobId,
        actorId: user.id,
        actorRole: "ADMIN",
        eventType: "DISPUTE_RESOLVED",
        fromStatus: "DISPUTED",
        toStatus: "RELEASED",
        metadata: { resolution, notes },
      });

      return NextResponse.json({
        success: true,
        message: "Dispute resolved in worker's favor. Funds released.",
      });
    } else if (resolution === "REFUND_TO_HIRER") {
      // Execute Razorpay refund if paymentId exists
      if (payment.razorpayPaymentId) {
        try {
          await processRazorpayRefund({
            paymentId: payment.razorpayPaymentId,
            amount: payment.amount,
            notes: { disputeId: dispute.id, reason: notes || "Dispute resolved - refund to hirer" },
          });
        } catch (rErr: any) {
          console.warn("Dispute refund gateway notice:", rErr);
        }
      }

      await db.$transaction([
        db.dispute.update({
          where: { id: dispute.id },
          data: {
            status: "RESOLVED",
            resolution: `RESOLVED: Refunded to hirer. ${notes}`,
            resolvedAt: now,
            resolvedById: user.id,
          },
        }),
        db.payment.update({
          where: { id: payment.id },
          data: {
            status: "REFUNDED",
            escrowStatus: "REFUNDED",
            refundedAt: now,
          },
        }),
        db.escrowLedger.upsert({
          where: { paymentId: payment.id },
          create: {
            paymentId: payment.id,
            jobAmount: payment.amount,
            platformFee: payment.platformFee,
            workerAmount: payment.workerAmount,
            heldAmount: 0.0,
            releasedAmount: 0.0,
            refundedAmount: payment.amount,
            currency: payment.currency,
            isReconciled: true,
          },
          update: {
            heldAmount: 0.0,
            refundedAmount: payment.amount,
            isReconciled: true,
          },
        }),
        ...(payment.assignmentId
          ? [
              db.workAssignment.update({
                where: { id: payment.assignmentId },
                data: { status: "CANCELLED" },
              }),
            ]
          : []),
      ]);

      await recordPaymentAudit({
        paymentId: payment.id,
        jobId: payment.jobId,
        actorId: user.id,
        actorRole: "ADMIN",
        eventType: "DISPUTE_RESOLVED",
        fromStatus: "DISPUTED",
        toStatus: "REFUNDED",
        metadata: { resolution, notes },
      });

      return NextResponse.json({
        success: true,
        message: "Dispute resolved in hirer's favor. Funds refunded.",
      });
    } else if (resolution === "DISMISS_DISPUTE") {
      await db.$transaction([
        db.dispute.update({
          where: { id: dispute.id },
          data: {
            status: "REJECTED",
            resolution: `REJECTED: ${notes}`,
            resolvedAt: now,
            resolvedById: user.id,
          },
        }),
        db.payment.update({
          where: { id: payment.id },
          data: {
            status: "HELD",
            escrowStatus: "HELD",
          },
        }),
      ]);

      await recordPaymentAudit({
        paymentId: payment.id,
        jobId: payment.jobId,
        actorId: user.id,
        actorRole: "ADMIN",
        eventType: "DISPUTE_REJECTED",
        fromStatus: "DISPUTED",
        toStatus: "HELD",
        metadata: { notes },
      });

      return NextResponse.json({
        success: true,
        message: "Dispute dismissed. Escrow status restored to HELD.",
      });
    }

    return NextResponse.json({ error: "Invalid resolution action." }, { status: 400 });
  } catch (error: any) {
    console.error("Resolve dispute error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to resolve dispute." },
      { status: 500 }
    );
  }
}
