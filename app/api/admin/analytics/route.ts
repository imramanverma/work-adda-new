import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["ADMIN"]);
    if ("error" in authResult) return authResult.error;

    const [
      totalUsers,
      totalWorkers,
      totalEmployers,
      totalJobs,
      activeJobs,
      totalApplications,
      activeAssignments,
      completedAssignments,
      payments,
      pendingReports,
      categoryGroups,
      recentUsers,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: "WORKER" } }),
      db.user.count({ where: { role: "EMPLOYER" } }),
      db.job.count(),
      db.job.count({ where: { status: "OPEN" } }),
      db.application.count(),
      db.workAssignment.count({ where: { status: { in: ["ASSIGNED", "IN_PROGRESS"] } } }),
      db.workAssignment.count({ where: { status: { in: ["COMPLETED", "APPROVED", "PAID"] } } }),
      db.payment.findMany({
        where: { status: "SUCCESS" },
        select: { amount: true, platformFee: true },
      }),
      db.report.count({ where: { status: "PENDING" } }),
      db.job.groupBy({
        by: ["category"],
        _count: { _all: true },
      }),
      db.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, email: true, role: true, location: true, createdAt: true },
      }),
    ]);

    const totalTransactionVolume = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalPlatformRevenue = payments.reduce((sum, p) => sum + p.platformFee, 0);

    const stats = {
      totalUsers,
      totalWorkers,
      totalEmployers,
      totalJobs,
      activeJobs,
      totalApplications,
      activeAssignments,
      completedAssignments,
      totalTransactionVolume,
      totalPlatformRevenue,
      pendingReports,
    };

    return NextResponse.json({
      stats,
      overview: {
        ...stats,
        grossVolume: totalTransactionVolume,
        platformRevenue: totalPlatformRevenue,
      },
      categoryBreakdown: categoryGroups.map((c) => ({
        category: c.category,
        count: c._count._all,
      })),
      recentUsers,
    });
  } catch (err: any) {
    console.error("Admin analytics error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch analytics" }, { status: 500 });
  }
}
