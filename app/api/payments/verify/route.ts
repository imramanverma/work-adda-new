import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { assertValidEscrowTransition, recordPaymentAudit } from "@/lib/escrow";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["EMPLOYER", "ADMIN"]);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      assignmentId,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required Razorpay verification parameters." },
        { status: 400 }
      );
    }

    // 1. Authenticate and cryptographically verify signature
    const isValid = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      // Find payment to flag failure
      const failedPayment = await db.payment.findUnique({
        where: { razorpayOrderId: razorpay_order_id },
      });

      if (failedPayment) {
        await db.payment.update({
          where: { id: failedPayment.id },
          data: {
            status: "FAILED",
            failureReason: "Cryptographic HMAC-SHA256 signature mismatch",
          },
        });

        await recordPaymentAudit({
          paymentId: failedPayment.id,
          jobId: failedPayment.jobId,
          actorId: user.id,
          actorRole: user.role === "ADMIN" ? "ADMIN" : "HIRER",
          eventType: "PAYMENT_FAILED",
          fromStatus: failedPayment.status,
          toStatus: "FAILED",
          metadata: {
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            reason: "Signature mismatch",
          },
        });
      }

      return NextResponse.json(
        { error: "Payment verification failed. Cryptographic signature is invalid." },
        { status: 400 }
      );
    }

    // 2. Fetch payment record
    const payment = await db.payment.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
      include: {
        job: true,
        assignment: true,
        payer: true,
        receiver: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment record for this order not found in database." },
        { status: 404 }
      );
    }

    if (user.role !== "ADMIN" && payment.payerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden. You are not authorized to verify this payment." },
        { status: 403 }
      );
    }

    // Idempotency: If already held in escrow or beyond, return success immediately
    if (payment.escrowStatus === "HELD" && payment.razorpayPaymentId === razorpay_payment_id) {
      return NextResponse.json({
        success: true,
        message: "Payment is already verified and held in escrow.",
        payment,
      });
    }

    // Validate state transition
    assertValidEscrowTransition(payment.escrowStatus, "HELD");

    const now = new Date();

    // 3. Atomically transition payment to HELD in Escrow & create/update Escrow Ledger
    const [updatedPayment, ledger] = await db.$transaction([
      db.payment.update({
        where: { id: payment.id },
        data: {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          status: "HELD",
          escrowStatus: "HELD",
          paidAt: payment.paidAt || now,
          heldAt: now,
        },
        include: {
          job: true,
          payer: { select: { id: true, name: true, phone: true } },
          receiver: { select: { id: true, name: true, phone: true } },
        },
      }),

      db.escrowLedger.upsert({
        where: { paymentId: payment.id },
        create: {
          paymentId: payment.id,
          jobAmount: payment.amount,
          platformFee: payment.platformFee,
          workerAmount: payment.workerAmount,
          heldAmount: payment.amount,
          releasedAmount: 0.0,
          refundedAmount: 0.0,
          currency: payment.currency,
          isReconciled: true,
        },
        update: {
          jobAmount: payment.amount,
          platformFee: payment.platformFee,
          workerAmount: payment.workerAmount,
          heldAmount: payment.amount,
          releasedAmount: 0.0,
          refundedAmount: 0.0,
          isReconciled: true,
        },
      }),

      db.workAssignment.update({
        where: { id: payment.assignmentId || assignmentId },
        data: {
          status: "IN_PROGRESS",
          completionStatus: "IN_PROGRESS",
        },
      }),
    ]);

    // 4. Audit Log
    await recordPaymentAudit({
      paymentId: payment.id,
      jobId: payment.jobId,
      actorId: user.id,
      actorRole: user.role === "ADMIN" ? "ADMIN" : "HIRER",
      eventType: "ESCROW_HELD",
      fromStatus: payment.escrowStatus,
      toStatus: "HELD",
      metadata: {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        amount: payment.amount,
        heldAmount: payment.amount,
      },
    });

    // 5. Notifications
    // Notify Worker: Funds are secured in escrow
    await db.notification.create({
      data: {
        userId: payment.receiverId,
        title: "Payment Secured in Escrow! 🔒",
        message: `₹${payment.workerAmount.toLocaleString("en-IN")} has been deposited and securely held in Work Adda Escrow for "${payment.job.title}". You can now proceed with the job safely. Funds will be released upon job completion.`,
        type: "PAYMENT",
      },
    });

    // Notify Employer: Confirmation of escrow hold
    await db.notification.create({
      data: {
        userId: payment.payerId,
        title: "Funds Held in Escrow 🛡️",
        message: `₹${payment.amount.toLocaleString("en-IN")} is held in Escrow for "${payment.job.title}". Money will remain safeguarded until you confirm the work is completed to your satisfaction.`,
        type: "PAYMENT",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified and held in escrow.",
      payment: updatedPayment,
      ledger,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment." },
      { status: 500 }
    );
  }
}
