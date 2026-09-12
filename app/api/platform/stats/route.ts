import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const [
      totalWorkers,
      totalBusinesses,
      openJobs,
      completedTasks,
      paymentAggregate,
      categoryGroups,
      latestJob,
    ] = await Promise.all([
      db.user.count({ where: { role: "WORKER" } }),
      db.employerProfile.count(),
      db.job.count({ where: { status: "OPEN" } }),
      db.workAssignment.count({
        where: { status: { in: ["COMPLETED", "APPROVED", "PAID"] } },
      }),
      db.payment.aggregate({
        _sum: { amount: true },
        where: { status: "SUCCESS" },
      }),
      db.job.groupBy({
        by: ["category"],
        _count: { id: true },
        where: { status: "OPEN" },
      }),
      db.job.findFirst({
        where: { status: "OPEN" },
        orderBy: { createdAt: "desc" },
        include: {
          employer: {
            select: {
              id: true,
              businessName: true,
              businessType: true,
              location: true,
              rating: true,
              verificationStatus: true,
            },
          },
          _count: {
            select: { applications: true },
          },
        },
      }),
    ]);

    // Build category map: { "Delivery": 2, "Retail": 0, ... }
    const categoryCounts: Record<string, number> = {};
    for (const group of categoryGroups) {
      categoryCounts[group.category] = group._count.id;
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalWorkers,
        totalBusinesses,
        openJobs,
        completedTasks,
        totalSettledAmount: paymentAggregate._sum.amount || 0,
        categoryCounts,
        latestJob: latestJob || null,
      },
    });
  } catch (error: any) {
    console.error("Platform stats error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch platform statistics." },
      { status: 500 }
    );
  }
}
