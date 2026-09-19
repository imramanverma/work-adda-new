import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { calculateEscrowBreakdown, recordPaymentAudit } from "@/lib/escrow";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["ADMIN"]);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    const body = await req.json();
    const { paymentId, action, rejectionReason } = body;

    if (!paymentId || !action || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json(
        { error: "paymentId and a valid action ('APPROVE' or 'REJECT') are required." },
        { status: 400 }
      );
    }

    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: {
        assignment: true,
        job: true,
        payer: true,
        receiver: true,
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment record not found." }, { status: 404 });
    }

    const now = new Date();
    let currentMetadata: any = {};
    try {
      if (payment.metadata) {
        currentMetadata = JSON.parse(payment.metadata);
      }
    } catch {
      currentMetadata = {};
    }

    if (action === "APPROVE") {
      const breakdown = calculateEscrowBreakdown(payment.amount);

      const updatedMetadata = {
        ...currentMetadata,
        verificationStatus: "APPROVED_BY_ADMIN",
        verifiedAt: now.toISOString(),
        verifiedByAdminId: user.id,
      };

      // 1. Update payment status to HELD in escrow
      const updatedPayment = await db.payment.update({
        where: { id: payment.id },
        data: {
          status: "HELD",
          escrowStatus: "HELD",
          paidAt: now,
          heldAt: now,
          metadata: JSON.stringify(updatedMetadata),
        },
      });

      // 2. Upsert Escrow Ledger
      await db.escrowLedger.upsert({
        where: { paymentId: payment.id },
        create: {
          paymentId: payment.id,
          jobAmount: breakdown.jobAmount,
          platformFee: breakdown.platformFee,
          workerAmount: breakdown.workerAmount,
          heldAmount: breakdown.jobAmount,
          releasedAmount: 0.0,
          refundedAmount: 0.0,
          currency: "INR",
          isReconciled: true,
        },
        update: {
          jobAmount: breakdown.jobAmount,
          platformFee: breakdown.platformFee,
          workerAmount: breakdown.workerAmount,
          heldAmount: breakdown.jobAmount,
          isReconciled: true,
        },
      });

      // 3. Update assignment to IN_PROGRESS if attached
      if (payment.assignmentId) {
        await db.workAssignment.update({
          where: { id: payment.assignmentId },
          data: {
            status: "IN_PROGRESS",
            completionStatus: "IN_PROGRESS",
          },
        });
      }

      // 4. Record audit log
      await recordPaymentAudit({
        paymentId: payment.id,
        jobId: payment.jobId,
        actorId: user.id,
        actorRole: "ADMIN",
        eventType: "ESCROW_HELD",
        fromStatus: payment.status,
        toStatus: "HELD",
        metadata: {
          ...updatedMetadata,
          amount: payment.amount,
          note: "Direct UPI payment approved by Administrator after bank reconciliation.",
        },
      });

      // 5. Send notifications
      await db.notification.create({
        data: {
          userId: payment.receiverId,
          title: "Work Escrow Funded! 🔒",
          message: `Employer payment of ₹${payment.amount} is verified in Escrow. You can now start the work.`,
          type: "PAYMENT",
        },
      });
      await db.notification.create({
        data: {
          userId: payment.payerId,
          title: "UPI Payment Approved! ✅",
          message: `Your Direct UPI payment of ₹${payment.amount} has been verified by the admin. Worker has been notified to start!`,
          type: "PAYMENT",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully and funds secured in Escrow.",
        payment: updatedPayment,
      });
    } else {
      // REJECT
      const updatedMetadata = {
        ...currentMetadata,
        verificationStatus: "REJECTED_BY_ADMIN",
        rejectedAt: now.toISOString(),
        rejectedByAdminId: user.id,
        rejectionReason: rejectionReason || "UTR not found or invalid in bank statement.",
      };

      const updatedPayment = await db.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          failureReason: rejectionReason || "Payment could not be verified in bank statement.",
          metadata: JSON.stringify(updatedMetadata),
        },
      });

      // Record audit log
      await recordPaymentAudit({
        paymentId: payment.id,
        jobId: payment.jobId,
        actorId: user.id,
        actorRole: "ADMIN",
        eventType: "PAYMENT_FAILED",
        fromStatus: payment.status,
        toStatus: "FAILED",
        metadata: updatedMetadata,
      });

      // Notify employer
      await db.notification.create({
        data: {
          userId: payment.payerId,
          title: "Payment Verification Issue ⚠️",
          message: `Your UPI payment for "${payment.job.title}" could not be verified: ${rejectionReason || "UTR not found"}. Please retry or contact support.`,
          type: "PAYMENT",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Payment rejected.",
        payment: updatedPayment,
      });
    }
  } catch (error: any) {
    console.error("Admin approve-utr error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process payment approval." },
      { status: 500 }
    );
  }
}
