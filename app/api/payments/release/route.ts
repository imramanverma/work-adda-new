import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { assertValidEscrowTransition, recordPaymentAudit } from "@/lib/escrow";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["EMPLOYER", "ADMIN"]);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    const body = await req.json();
    const { paymentId, assignmentId } = body;

    if (!paymentId && !assignmentId) {
      return NextResponse.json(
        { error: "Payment ID or Assignment ID is required." },
        { status: 400 }
      );
    }

    // Locate payment
    const payment = await db.payment.findFirst({
      where: paymentId ? { id: paymentId } : { assignmentId },
      include: {
        job: true,
        assignment: true,
        payer: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
        ledger: true,
        disputes: {
          where: {
            status: { in: ["OPEN", "UNDER_REVIEW"] },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment record not found." }, { status: 404 });
    }

    if (user.role !== "ADMIN" && payment.payerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden. Only the hirer or an administrator can release escrow funds." },
        { status: 403 }
      );
    }

    // Safety Gate: Dispute check
    if (payment.escrowStatus === "DISPUTED" || (payment.disputes && payment.disputes.length > 0)) {
      return NextResponse.json(
        {
          error:
            "Escrow release blocked. There is an active dispute open for this payment. Please resolve the dispute via Admin Dispute Resolution before releasing funds.",
        },
        { status: 400 }
      );
    }

    if (payment.escrowStatus === "RELEASED" || payment.escrowStatus === "SETTLED") {
      return NextResponse.json(
        { error: "Escrow funds have already been released for this job." },
        { status: 400 }
      );
    }

    if (payment.escrowStatus !== "HELD" && payment.escrowStatus !== "RELEASE_ELIGIBLE") {
      return NextResponse.json(
        {
          error: `Cannot release funds from current escrow status: ${payment.escrowStatus}. Funds must be held in escrow first.`,
        },
        { status: 400 }
      );
    }

    // Assert transition
    assertValidEscrowTransition(payment.escrowStatus, "RELEASED");

    const now = new Date();

    // Perform atomic release in Escrow
    const [updatedPayment, updatedLedger] = await db.$transaction([
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
              data: {
                status: "PAID",
                completionStatus: "APPROVED",
              },
            }),
          ]
        : []),

      ...(payment.jobId
        ? [
            db.job.update({
              where: { id: payment.jobId },
              data: { status: "COMPLETED" },
            }),
          ]
        : []),
    ]);

    // Audit logging
    await recordPaymentAudit({
      paymentId: payment.id,
      jobId: payment.jobId,
      actorId: user.id,
      actorRole: user.role === "ADMIN" ? "ADMIN" : "HIRER",
      eventType: "RELEASE_COMPLETED",
      fromStatus: payment.escrowStatus,
      toStatus: "RELEASED",
      metadata: {
        releasedAmount: payment.workerAmount,
        platformFee: payment.platformFee,
      },
    });

    // Notify Worker
    await db.notification.create({
      data: {
        userId: payment.receiverId,
        title: "Escrow Released! 💰",
        message: `₹${payment.workerAmount.toLocaleString("en-IN")} has been released to your account for completion of "${payment.job.title}". Great work!`,
        type: "PAYMENT",
      },
    });

    // Notify Hirer
    await db.notification.create({
      data: {
        userId: payment.payerId,
        title: "Escrow Released ✔️",
        message: `You confirmed completion and released ₹${payment.workerAmount.toLocaleString("en-IN")} to ${payment.receiver.name} for "${payment.job.title}".`,
        type: "PAYMENT",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Escrow funds released to worker successfully.",
      payment: updatedPayment,
      ledger: updatedLedger,
    });
  } catch (error: any) {
    console.error("Release escrow error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to release escrow funds." },
      { status: 500 }
    );
  }
}
