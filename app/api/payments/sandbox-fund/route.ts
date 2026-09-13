import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { calculateEscrowBreakdown, recordPaymentAudit } from "@/lib/escrow";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["EMPLOYER", "ADMIN"]);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    const body = await req.json();
    const { assignmentId } = body;

    if (!assignmentId) {
      return NextResponse.json({ error: "Assignment ID is required." }, { status: 400 });
    }

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
        { error: "Forbidden. You can only fund assignments you have created." },
        { status: 403 }
      );
    }

    // Check if payment is already active/completed in escrow
    if (assignment.payment) {
      const activeEscrowStates = ["HELD", "RELEASE_ELIGIBLE", "RELEASED", "SETTLED"];
      if (activeEscrowStates.includes(assignment.payment.escrowStatus)) {
        return NextResponse.json(
          {
            error: `Payment is already active in Escrow (Status: ${assignment.payment.escrowStatus}).`,
            payment: assignment.payment,
          },
          { status: 400 }
        );
      }
    }

    const breakdown = calculateEscrowBreakdown(assignment.agreedAmount);
    if (breakdown.jobAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid agreed amount for this assignment." },
        { status: 400 }
      );
    }

    const now = new Date();
    const sandboxOrderId = `order_sbx_${Date.now()}`;
    const sandboxPaymentId = `pay_sbx_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Create or update Payment
    let payment;
    if (assignment.payment) {
      payment = await db.payment.update({
        where: { id: assignment.payment.id },
        data: {
          amount: breakdown.jobAmount,
          platformFee: breakdown.platformFee,
          workerAmount: breakdown.workerAmount,
          status: "HELD",
          escrowStatus: "HELD",
          paymentMethod: "SANDBOX_ESCROW",
          razorpayOrderId: sandboxOrderId,
          razorpayPaymentId: sandboxPaymentId,
          razorpaySignature: "sandbox_verified_signature",
          paidAt: now,
          heldAt: now,
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
          paymentMethod: "SANDBOX_ESCROW",
          razorpayOrderId: sandboxOrderId,
          razorpayPaymentId: sandboxPaymentId,
          razorpaySignature: "sandbox_verified_signature",
          paidAt: now,
          heldAt: now,
        },
        include: {
          job: true,
          payer: { select: { id: true, name: true, phone: true } },
          receiver: { select: { id: true, name: true, phone: true } },
        },
      });
    }

    // 2. Upsert Escrow Ledger
    const ledger = await db.escrowLedger.upsert({
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
        releasedAmount: 0.0,
        refundedAmount: 0.0,
        isReconciled: true,
      },
    });

    // 3. Update Work Assignment to IN_PROGRESS
    await db.workAssignment.update({
      where: { id: assignment.id },
      data: {
        status: "IN_PROGRESS",
        completionStatus: "IN_PROGRESS",
      },
    });

    // 4. Record Immutable Audit Log
    await recordPaymentAudit({
      paymentId: payment.id,
      jobId: assignment.jobId,
      actorId: user.id,
      actorRole: user.role === "ADMIN" ? "ADMIN" : "HIRER",
      eventType: "ESCROW_HELD",
      fromStatus: "PENDING",
      toStatus: "HELD",
      metadata: {
        mode: "SANDBOX_SIMULATION",
        razorpayOrderId: sandboxOrderId,
        razorpayPaymentId: sandboxPaymentId,
        amount: breakdown.jobAmount,
        heldAmount: breakdown.jobAmount,
        note: "Escrow funds locked via Sandbox verification",
      },
    });

    // 5. Notifications
    // Worker notification
    await db.notification.create({
      data: {
        userId: payment.receiverId,
        title: "Payment Secured in Escrow! 🔒",
        message: `₹${payment.workerAmount.toLocaleString("en-IN")} has been deposited and securely held in Work Adda Escrow for "${assignment.job.title}". You can now proceed with the work safely. Funds will be released upon job completion.`,
        type: "PAYMENT",
      },
    });

    // Employer notification
    await db.notification.create({
      data: {
        userId: payment.payerId,
        title: "Funds Held in Escrow 🛡️",
        message: `₹${payment.amount.toLocaleString("en-IN")} is held in Escrow for "${assignment.job.title}". Money will remain safeguarded until you confirm work completion.`,
        type: "PAYMENT",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Funds deposited and securely held in Escrow (Sandbox Mode).",
      payment,
      ledger,
    });
  } catch (error: any) {
    console.error("Sandbox escrow deposit error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fund escrow in sandbox mode." },
      { status: 500 }
    );
  }
}
