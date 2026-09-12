import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { paymentProvider, calculatePaymentBreakdown } from "@/lib/payments";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["EMPLOYER", "ADMIN"]);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    const body = await req.json();
    const { assignmentId, paymentMethod = "UPI" } = body;

    if (!assignmentId) {
      return NextResponse.json({ error: "Assignment ID is required" }, { status: 400 });
    }

    const assignment = await db.workAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        job: true,
        worker: true,
        employer: {
          include: { employerProfile: true },
        },
        payment: true,
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Work assignment not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && assignment.employerId !== user.id) {
      return NextResponse.json({ error: "Forbidden. You can only pay for your own hired workers." }, { status: 403 });
    }

    if (assignment.payment && assignment.payment.status === "SUCCESS") {
      return NextResponse.json(
        { error: "Payment for this assignment has already been completed.", payment: assignment.payment },
        { status: 400 }
      );
    }

    // Calculate platform fee and worker net payout
    const breakdown = calculatePaymentBreakdown(assignment.agreedAmount);

    // Call payment provider abstraction
    const order = await paymentProvider.createOrder(breakdown.grossAmount);
    const providerResult = await paymentProvider.processPayment(order.orderId, paymentMethod);

    if (!providerResult.success) {
      return NextResponse.json(
        { error: "Payment gateway transaction failed. Please try again." },
        { status: 400 }
      );
    }

    // Persist Payment record
    const payment = await db.payment.create({
      data: {
        assignmentId: assignment.id,
        payerId: assignment.employerId,
        receiverId: assignment.workerId,
        amount: breakdown.grossAmount,
        platformFee: breakdown.platformFee,
        status: "SUCCESS",
        paymentMethod,
        transactionId: providerResult.transactionId,
      },
    });

    // Update assignment status to PAID
    await db.workAssignment.update({
      where: { id: assignment.id },
      data: {
        status: "PAID",
        completionStatus: "APPROVED",
      },
    });

    // Notify Worker
    await db.notification.create({
      data: {
        userId: assignment.workerId,
        title: "Payment Received! 💰",
        message: `₹${breakdown.workerPayout} has been credited for "${assignment.job.title}". (Gross: ₹${breakdown.grossAmount}, Platform Fee: ₹${breakdown.platformFee}). Txn ID: ${providerResult.transactionId}`,
        type: "PAYMENT",
      },
    });

    // Notify Employer
    await db.notification.create({
      data: {
        userId: assignment.employerId,
        title: "Payment Successful ✔️",
        message: `Payment of ₹${breakdown.grossAmount} to ${assignment.worker.name} completed successfully.`,
        type: "PAYMENT",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment processed successfully",
      payment,
      breakdown,
    });
  } catch (err: any) {
    console.error("Process payment error:", err);
    return NextResponse.json({ error: err.message || "Failed to process payment" }, { status: 500 });
  }
}
