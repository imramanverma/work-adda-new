import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { recordPaymentAudit } from "@/lib/escrow";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    if (!signature) {
      return NextResponse.json(
        { error: "Missing x-razorpay-signature header." },
        { status: 400 }
      );
    }

    const isValid = verifyWebhookSignature({ rawBody, signature });
    if (!isValid) {
      console.error("Razorpay webhook signature verification failed.");
      return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const entity = payload.payload?.payment?.entity || payload.payload?.order?.entity;

    const orderId = entity?.order_id || entity?.id;
    const paymentId = entity?.id;

    if (!orderId) {
      return NextResponse.json({ status: "ignored_no_order_id" }, { status: 200 });
    }

    const payment = await db.payment.findFirst({
      where: {
        OR: [{ razorpayOrderId: orderId }, { razorpayPaymentId: paymentId }],
      },
    });

    if (!payment) {
      // Payment might belong to a different environment or test
      return NextResponse.json({ status: "payment_not_found" }, { status: 200 });
    }

    const now = new Date();

    if (event === "payment.captured" || event === "order.paid") {
      // If already in escrow or released, ignore idempotently
      if (payment.escrowStatus !== "PENDING" && payment.escrowStatus !== "FAILED") {
        return NextResponse.json({ status: "already_processed" }, { status: 200 });
      }

      await db.$transaction([
        db.payment.update({
          where: { id: payment.id },
          data: {
            razorpayPaymentId: paymentId,
            status: "HELD",
            escrowStatus: "HELD",
            paidAt: payment.paidAt || now,
            heldAt: now,
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
            heldAmount: payment.amount,
            isReconciled: true,
          },
        }),
        ...(payment.assignmentId
          ? [
              db.workAssignment.update({
                where: { id: payment.assignmentId },
                data: { status: "IN_PROGRESS" },
              }),
            ]
          : []),
      ]);

      await recordPaymentAudit({
        paymentId: payment.id,
        jobId: payment.jobId,
        actorId: "WEBHOOK",
        actorRole: "WEBHOOK",
        eventType: "ESCROW_HELD",
        fromStatus: payment.escrowStatus,
        toStatus: "HELD",
        metadata: { event, razorpayPaymentId: paymentId },
      });
    } else if (event === "payment.failed") {
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          failureReason: entity?.error_description || "Payment failed at gateway",
        },
      });

      await recordPaymentAudit({
        paymentId: payment.id,
        jobId: payment.jobId,
        actorId: "WEBHOOK",
        actorRole: "WEBHOOK",
        eventType: "PAYMENT_FAILED",
        fromStatus: payment.status,
        toStatus: "FAILED",
        metadata: { error: entity?.error_description },
      });
    } else if (event === "refund.processed") {
      await db.$transaction([
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
      ]);

      await recordPaymentAudit({
        paymentId: payment.id,
        jobId: payment.jobId,
        actorId: "WEBHOOK",
        actorRole: "WEBHOOK",
        eventType: "REFUND_COMPLETED",
        fromStatus: payment.escrowStatus,
        toStatus: "REFUNDED",
        metadata: { event },
      });
    }

    return NextResponse.json({ status: "success", received: true }, { status: 200 });
  } catch (error: any) {
    console.error("Razorpay webhook handler error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
