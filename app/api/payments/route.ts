import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    let where: any = {};
    if (user.role === "WORKER") {
      where.receiverId = user.id;
    } else if (user.role === "EMPLOYER") {
      where.payerId = user.id;
    }

    const payments = await db.payment.findMany({
      where,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            category: true,
            location: true,
          },
        },
        assignment: {
          select: {
            id: true,
            status: true,
            completionStatus: true,
            agreedAmount: true,
          },
        },
        payer: {
          select: {
            id: true,
            name: true,
            phone: true,
            employerProfile: {
              select: { businessName: true },
            },
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        ledger: true,
        disputes: {
          select: {
            id: true,
            status: true,
            reason: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate role-specific stats
    const releasedPayments = payments.filter(
      (p) => p.escrowStatus === "RELEASED" || p.escrowStatus === "SETTLED" || p.status === "SUCCESS"
    );
    const heldPayments = payments.filter(
      (p) => p.escrowStatus === "HELD" || p.escrowStatus === "RELEASE_ELIGIBLE"
    );
    const disputedPayments = payments.filter((p) => p.escrowStatus === "DISPUTED");
    const refundedPayments = payments.filter((p) => p.escrowStatus === "REFUNDED");

    let stats: any = {};

    if (user.role === "WORKER") {
      const totalEarned = releasedPayments.reduce((sum, p) => sum + p.workerAmount, 0);
      const totalHeldInEscrow = heldPayments.reduce((sum, p) => sum + p.workerAmount, 0);
      const totalDisputed = disputedPayments.reduce((sum, p) => sum + p.workerAmount, 0);

      stats = {
        totalEarned,
        totalHeldInEscrow,
        totalDisputed,
        totalTransactions: payments.length,
      };
    } else {
      const totalPaid = releasedPayments.reduce((sum, p) => sum + p.amount, 0);
      const totalHeldInEscrow = heldPayments.reduce((sum, p) => sum + p.amount, 0);
      const totalRefunded = refundedPayments.reduce((sum, p) => sum + p.amount, 0);

      stats = {
        totalPaid,
        totalHeldInEscrow,
        totalRefunded,
        totalTransactions: payments.length,
      };
    }

    return NextResponse.json({
      payments,
      stats,
    });
  } catch (err: any) {
    console.error("Fetch payments error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
