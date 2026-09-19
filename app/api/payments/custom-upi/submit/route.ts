import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { calculateEscrowBreakdown, recordPaymentAudit } from "@/lib/escrow";
import { validateUtr, DEFAULT_UPI_CONFIG } from "@/lib/upi";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { assignmentId, utrNumber, upiVpa, amount } = body;

    if (!assignmentId) {
      return NextResponse.json({ error: "Assignment ID is required." }, { status: 400 });
    }

    // Support standalone demo testing on localhost without requiring pre-existing DB session
    if (assignmentId === "demo" || assignmentId.startsWith("demo_")) {
      const utrCheck = validateUtr(utrNumber || "");
      if (!utrCheck.isValid) {
        return NextResponse.json({ error: utrCheck.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        isAutoApproved: true,
        message: "Payment verified successfully in Localhost Test Mode!",
        payment: {
          id: `demo_${Date.now()}`,
          amount: Number(amount || 29),
          paymentMethod: "DIRECT_UPI",
          status: "HELD",
          escrowStatus: "HELD",
          utrNumber: utrNumber.trim(),
          createdAt: new Date().toISOString(),
        },
      });
    }

    const authResult = await requireAuth(req, ["EMPLOYER", "ADMIN"]);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    // 1. Validate 12-digit UTR
    const utrCheck = validateUtr(utrNumber || "");
    if (!utrCheck.isValid) {
      return NextResponse.json({ error: utrCheck.error }, { status: 400 });
    }

    const cleanUtr = utrNumber.trim();

    // 2. Prevent duplicate UTR replay attacks
    const existingPaymentWithUtr = await db.payment.findFirst({
      where: {
        metadata: {
          contains: cleanUtr,
        },
      },
    });

    if (existingPaymentWithUtr && existingPaymentWithUtr.assignmentId !== assignmentId) {
      return NextResponse.json(
        { error: "This UPI Reference Number (UTR) has already been submitted for another transaction." },
        { status: 409 }
      );
    }

    // 3. Fetch Assignment
    const assignment = await db.workAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        job: true,
        worker: true,
        employer: true,
        payment: true,
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Work assignment not found." }, { status: 404 });
    }

    if (user.role !== "ADMIN" && assignment.employerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden. You can only fund assignments you own." },
        { status: 403 }
      );
    }

    // 4. Calculate amounts
    const breakdown = calculateEscrowBreakdown(assignment.agreedAmount);
    if (breakdown.jobAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid agreed amount for this assignment." },
        { status: 400 }
      );
    }

    const now = new Date();
    const isAutoApproval = DEFAULT_UPI_CONFIG.autoApprovalEnabled;
    const transactionId = `txn_upi_${Date.now()}_${cleanUtr.slice(-4)}`;

    const metadataObj = {
      paymentMethod: "DIRECT_UPI",
      utrNumber: cleanUtr,
      payerVpa: upiVpa?.trim() || "direct_upi",
      receiverVpa: DEFAULT_UPI_CONFIG.vpa,
      verificationStatus: isAutoApproval ? "AUTO_APPROVED" : "PENDING_ADMIN_VERIFICATION",
      submittedAt: now.toISOString(),
    };

    let payment;

    if (isAutoApproval) {
      // Auto-approval: immediately lock in Escrow
      if (assignment.payment) {
        payment = await db.payment.update({
          where: { id: assignment.payment.id },
          data: {
            amount: breakdown.jobAmount,
            platformFee: breakdown.platformFee,
            workerAmount: breakdown.workerAmount,
            status: "HELD",
            escrowStatus: "HELD",
            paymentMethod: "DIRECT_UPI",
            paidAt: now,
            heldAt: now,
            metadata: JSON.stringify(metadataObj),
          },
          include: {
            job: true,
            payer: { select: { id: true, name: true, phone: true } },
            receiver: { select: { id: true, name: true, phone: true } },
          },
        });
      } else {
        payment = await db.payment.create({
          data: {
            jobId: assignment.jobId,
            payerId: assignment.employerId,
            receiverId: assignment.workerId,
            assignmentId: assignment.id,
            amount: breakdown.jobAmount,
            platformFee: breakdown.platformFee,
            workerAmount: breakdown.workerAmount,
            status: "HELD",
            escrowStatus: "HELD",
            paymentMethod: "DIRECT_UPI",
            paidAt: now,
            heldAt: now,
            transactionId,
            metadata: JSON.stringify(metadataObj),
          },
          include: {
            job: true,
            payer: { select: { id: true, name: true, phone: true } },
            receiver: { select: { id: true, name: true, phone: true } },
          },
        });
      }

      // Upsert Escrow Ledger
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

      // Advance Assignment
      await db.workAssignment.update({
        where: { id: assignment.id },
        data: {
          status: "IN_PROGRESS",
          completionStatus: "IN_PROGRESS",
        },
      });

      // Audit Log
      await recordPaymentAudit({
        paymentId: payment.id,
        jobId: assignment.jobId,
        actorId: user.id,
        actorRole: user.role === "ADMIN" ? "ADMIN" : "HIRER",
        eventType: "ESCROW_HELD",
        fromStatus: "PENDING",
        toStatus: "HELD",
        metadata: {
          ...metadataObj,
          amount: breakdown.jobAmount,
          note: "Direct UPI payment auto-verified via valid UTR submission",
        },
      });

      // Notifications
      await db.notification.create({
        data: {
          userId: assignment.workerId,
          title: "Work Escrow Funded! 🔒",
          message: `Employer deposited ₹${breakdown.jobAmount} via Direct UPI (UTR: ${cleanUtr}). You may begin work now.`,
          type: "PAYMENT",
        },
      });
      await db.notification.create({
        data: {
          userId: assignment.employerId,
          title: "Payment Confirmed! ✅",
          message: `Your Direct UPI payment of ₹${breakdown.jobAmount} (UTR: ${cleanUtr}) is secured in Escrow.`,
          type: "PAYMENT",
        },
      });

      return NextResponse.json({
        success: true,
        isAutoApproved: true,
        message: "Payment verified successfully and locked in Escrow!",
        payment,
      });
    } else {
      // Manual approval mode: create as pending verification
      if (assignment.payment) {
        payment = await db.payment.update({
          where: { id: assignment.payment.id },
          data: {
            amount: breakdown.jobAmount,
            platformFee: breakdown.platformFee,
            workerAmount: breakdown.workerAmount,
            status: "PAYMENT_PENDING",
            escrowStatus: "PENDING",
            paymentMethod: "DIRECT_UPI",
            metadata: JSON.stringify(metadataObj),
          },
          include: {
            job: true,
            payer: { select: { id: true, name: true, phone: true } },
            receiver: { select: { id: true, name: true, phone: true } },
          },
        });
      } else {
        payment = await db.payment.create({
          data: {
            jobId: assignment.jobId,
            payerId: assignment.employerId,
            receiverId: assignment.workerId,
            assignmentId: assignment.id,
            amount: breakdown.jobAmount,
            platformFee: breakdown.platformFee,
            workerAmount: breakdown.workerAmount,
            status: "PAYMENT_PENDING",
            escrowStatus: "PENDING",
            paymentMethod: "DIRECT_UPI",
            transactionId,
            metadata: JSON.stringify(metadataObj),
          },
          include: {
            job: true,
            payer: { select: { id: true, name: true, phone: true } },
            receiver: { select: { id: true, name: true, phone: true } },
          },
        });
      }

      // Record Audit
      await recordPaymentAudit({
        paymentId: payment.id,
        jobId: assignment.jobId,
        actorId: user.id,
        actorRole: user.role === "ADMIN" ? "ADMIN" : "HIRER",
        eventType: "PAYMENT_INITIATED",
        fromStatus: "CREATED",
        toStatus: "PAYMENT_PENDING",
        metadata: {
          ...metadataObj,
          amount: breakdown.jobAmount,
          note: "Direct UPI payment submitted by employer. Awaiting admin bank reconciliation.",
        },
      });

      // Notification
      await db.notification.create({
        data: {
          userId: assignment.employerId,
          title: "UPI Payment Submitted ⏳",
          message: `Your payment of ₹${breakdown.jobAmount} (UTR: ${cleanUtr}) is submitted. We will verify and activate your contract shortly.`,
          type: "PAYMENT",
        },
      });

      return NextResponse.json({
        success: true,
        isAutoApproved: false,
        message: "UPI Reference Number (UTR) submitted successfully. Verification in progress.",
        payment,
      });
    }
  } catch (error: any) {
    console.error("Direct UPI submission error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit UPI payment." },
      { status: 500 }
    );
  }
}
