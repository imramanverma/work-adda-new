import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["ADMIN"]);
    if ("error" in authResult) return authResult.error;

    const [payments, disputes, auditLogs, ledgers] = await Promise.all([
      db.payment.findMany({
        include: {
          job: { select: { id: true, title: true, category: true } },
          assignment: { select: { id: true, status: true, completionStatus: true } },
          payer: { select: { id: true, name: true, phone: true, email: true } },
          receiver: { select: { id: true, name: true, phone: true, email: true } },
          ledger: true,
          disputes: true,
        },
        orderBy: { createdAt: "desc" },
      }),

      db.dispute.findMany({
        include: {
          job: { select: { id: true, title: true } },
          raisedBy: { select: { id: true, name: true, role: true } },
          payment: {
            include: {
              payer: { select: { id: true, name: true } },
              receiver: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),

      db.paymentAuditLog.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
      }),

      db.escrowLedger.findMany(),
    ]);

    // Aggregate Escrow Vault stats
    const totalEscrowHeld = ledgers.reduce((acc, l) => acc + l.heldAmount, 0);
    const totalReleased = ledgers.reduce((acc, l) => acc + l.releasedAmount, 0);
    const totalRefunded = ledgers.reduce((acc, l) => acc + l.refundedAmount, 0);
    const totalPlatformFee = ledgers.reduce((acc, l) => acc + l.platformFee, 0);
    const totalGrossVolume = ledgers.reduce((acc, l) => acc + l.jobAmount, 0);

    const activeDisputesCount = disputes.filter(
      (d) => d.status === "OPEN" || d.status === "UNDER_REVIEW"
    ).length;

    return NextResponse.json({
      payments,
      disputes,
      auditLogs,
      vaultStats: {
        totalGrossVolume,
        totalEscrowHeld,
        totalReleased,
        totalRefunded,
        totalPlatformFee,
        activeDisputesCount,
        totalTransactions: payments.length,
      },
    });
  } catch (error: any) {
    console.error("Admin payments overview error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch admin payment data." },
      { status: 500 }
    );
  }
}
