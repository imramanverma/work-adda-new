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
        assignment: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                category: true,
              },
            },
          },
        },
        payer: {
          select: {
            id: true,
            name: true,
            employerProfile: {
              select: { businessName: true },
            },
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalEarned = payments
      .filter((p) => p.status === "SUCCESS")
      .reduce((sum, p) => sum + (p.amount - p.platformFee), 0);

    const totalPaid = payments
      .filter((p) => p.status === "SUCCESS")
      .reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      payments,
      stats: {
        totalEarned,
        totalPaid,
        totalTransactions: payments.length,
      },
    });
  } catch (err: any) {
    console.error("Fetch payments error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch payments" }, { status: 500 });
  }
}
