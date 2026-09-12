import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { processRazorpayRefund } from "@/lib/razorpay";
import { assertValidEscrowTransition, recordPaymentAudit } from "@/lib/escrow";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["EMPLOYER", "ADMIN"]);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    const body = await req.json();
    const { paymentId, reason = "Job cancelled / refund requested" } = body;

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required." }, { status: 400 });
    }

    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: {
        job: true,
        assignment: true,
        payer: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
        ledger: true,
        disputes: true,
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment record not found." }, { status: 404 });
    }

    if (user.role !== "ADMIN" && payment.payerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden. You can only request refund for your own payments." },
        { status: 403 }
      );
    }

    if (payment.escrowStatus === "RELEASED" || payment.escrowStatus === "SETTLED") {
      return NextResponse.json(
        {
          error:
            "Cannot refund. Funds have already been released to the worker. Please raise a dispute for administrative review.",
        },
        { status: 400 }
      );
    }

    if (payment.escrowStatus === "REFUNDED") {
      return NextResponse.json(
        { error: "This payment has already been refunded." },
        { status: 400 }
      );
    }

    if (!payment.razorpayPaymentId) {
      return NextResponse.json(
        { error: "No settled Razorpay transaction found for this payment to refund." },
        { status: 400 }
      );
    }

    // Only Admin can override dispute state
    if (payment.escrowStatus === "DISPUTED" && user.role !== "ADMIN") {
      return NextResponse.json(
        {
          error:
            "This payment is currently under dispute. Only an administrator can execute a refund during dispute review.",
        },
        { status: 403 }
      );
    }

    assertValidEscrowTransition(payment.escrowStatus, "REFUNDED");

    // Execute refund through Razorpay official API
    let razorpayRefundResult;
    try {
      razorpayRefundResult = await processRazorpayRefund({
        paymentId: payment.razorpayPaymentId,
        amount: payment.amount,
        notes: {
          jobId: payment.jobId,
          paymentId: payment.id,
          reason,
          refundedBy: user.id,
        },
      });
    } catch (rzpErr: any) {
      console.error("Razorpay refund API error:", rzpErr);
      return NextResponse.json(
        {
          error:
            rzpErr.error?.description ||
            rzpErr.message ||
            "Failed to initiate refund with Razorpay gateway.",
        },
        { status: 502 }
      );
    }

    const now = new Date();

    // Atomic database update
    const [updatedPayment, updatedLedger] = await db.$transaction([
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
              data: {
                status: "CANCELLED",
              },
            }),
          ]
        : []),
    ]);

    // Audit log
    await recordPaymentAudit({
      paymentId: payment.id,
      jobId: payment.jobId,
      actorId: user.id,
      actorRole: user.role === "ADMIN" ? "ADMIN" : "HIRER",
      eventType: "REFUND_COMPLETED",
      fromStatus: payment.escrowStatus,
      toStatus: "REFUNDED",
      metadata: {
        refundId: razorpayRefundResult?.id,
        refundAmount: payment.amount,
        reason,
      },
    });

    // Notify Hirer
    await db.notification.create({
      data: {
        userId: payment.payerId,
        title: "Refund Initiated 💸",
        message: `₹${payment.amount.toLocaleString("en-IN")} has been refunded to your original payment method for "${payment.job.title}".`,
        type: "PAYMENT",
      },
    });

    // Notify Worker
    await db.notification.create({
      data: {
        userId: payment.receiverId,
        title: "Assignment Cancelled / Refunded",
        message: `The escrow payment for "${payment.job.title}" has been refunded to the hirer.`,
        type: "PAYMENT",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Refund processed successfully via Razorpay.",
      refund: razorpayRefundResult,
      payment: updatedPayment,
      ledger: updatedLedger,
    });
  } catch (error: any) {
    console.error("Refund error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process refund." },
      { status: 500 }
    );
  }
}
