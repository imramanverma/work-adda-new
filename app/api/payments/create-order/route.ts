import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { createRazorpayOrder, isRazorpayConfigured } from "@/lib/razorpay";
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

    // Check if payment already exists and is active/completed
    if (assignment.payment) {
      const activeEscrowStates = ["HELD", "RELEASE_ELIGIBLE", "RELEASED", "SETTLED"];
      if (activeEscrowStates.includes(assignment.payment.escrowStatus)) {
        return NextResponse.json(
          {
            error: `Payment is already active or completed in Escrow (Status: ${assignment.payment.escrowStatus}).`,
            payment: assignment.payment,
          },
          { status: 400 }
        );
      }
    }

    // Calculate escrow breakdown (respects PLATFORM_FEE_ENABLED & PLATFORM_FEE_PERCENTAGE, defaults to 0%)
    const breakdown = calculateEscrowBreakdown(assignment.agreedAmount);

    if (breakdown.jobAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid agreed amount for this assignment." },
        { status: 400 }
      );
    }

    // Check if Razorpay credentials are validly configured
    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        {
          error: "Razorpay API credentials are not configured or are set to placeholders.",
          isKeyMissing: true,
          message: "Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment or use Sandbox Escrow to test immediately.",
          breakdown,
          assignment: {
            id: assignment.id,
            jobTitle: assignment.job.title,
            workerName: assignment.worker.name,
          },
        },
        { status: 400 }
      );
    }

    // Create Razorpay Order via official SDK
    const receipt = `rcpt_${assignment.id.substring(0, 20)}_${Date.now().toString().slice(-6)}`;
    const rzpOrder = await createRazorpayOrder({
      amount: breakdown.jobAmount,
      receipt,
      notes: {
        assignmentId: assignment.id,
        jobId: assignment.jobId,
        employerId: assignment.employerId,
        workerId: assignment.workerId,
      },
    });

    // Create or update Payment record with the Razorpay order ID
    let payment;
    if (assignment.payment) {
      payment = await db.payment.update({
        where: { id: assignment.payment.id },
        data: {
          amount: breakdown.jobAmount,
          platformFee: breakdown.platformFee,
          workerAmount: breakdown.workerAmount,
          razorpayOrderId: rzpOrder.id,
          status: "PAYMENT_PENDING",
          escrowStatus: "PENDING",
          paymentMethod: "RAZORPAY",
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
          razorpayOrderId: rzpOrder.id,
          status: "PAYMENT_PENDING",
          escrowStatus: "PENDING",
          paymentMethod: "RAZORPAY",
        },
      });
    }

    // Audit log
    await recordPaymentAudit({
      paymentId: payment.id,
      jobId: assignment.jobId,
      actorId: user.id,
      actorRole: user.role === "ADMIN" ? "ADMIN" : "HIRER",
      eventType: "ORDER_CREATED",
      fromStatus: "NOT_INITIATED",
      toStatus: "PAYMENT_PENDING",
      metadata: {
        razorpayOrderId: rzpOrder.id,
        amountInPaisa: rzpOrder.amount,
        breakdown,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
      paymentId: payment.id,
      breakdown,
      assignment: {
        id: assignment.id,
        jobTitle: assignment.job.title,
        workerName: assignment.worker.name,
      },
    });
  } catch (error: any) {
    console.error("Create payment order error:", error);
    const errorMsg = error.message || error.description || "Failed to create payment order.";
    const isKeyError =
      errorMsg.includes("api key") ||
      errorMsg.includes("credentials") ||
      errorMsg.includes("Authentication failed") ||
      errorMsg.includes("Key ID") ||
      errorMsg.includes("BAD_REQUEST_ERROR");

    return NextResponse.json(
      {
        error: errorMsg,
        isKeyMissing: isKeyError,
      },
      { status: 500 }
    );
  }
}
