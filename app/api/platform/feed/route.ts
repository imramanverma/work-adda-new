import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const [recentJobs, recentAssignments, recentPayments] = await Promise.all([
      db.job.findMany({
        where: { status: "OPEN" },
        take: 3,
        orderBy: { createdAt: "desc" },
        include: {
          employer: {
            select: { businessName: true, location: true },
          },
        },
      }),
      db.workAssignment.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        include: {
          job: { select: { title: true } },
          employer: { select: { name: true } },
          worker: { select: { name: true } },
        },
      }),
      db.payment.findMany({
        where: {
          OR: [
            { status: "SUCCESS" },
            { status: "RELEASED" },
            { escrowStatus: "RELEASED" },
          ],
        },
        take: 3,
        orderBy: { createdAt: "desc" },
        include: {
          assignment: {
            include: {
              job: { select: { title: true } },
            },
          },
        },
      }),
    ]);

    const events: Array<{
      id: string;
      type: "JOB_POSTED" | "WORKER_HIRED" | "PAYMENT_RELEASED";
      title: string;
      subtitle: string;
      timestamp: Date;
    }> = [];

    for (const j of recentJobs) {
      events.push({
        id: `job-${j.id}`,
        type: "JOB_POSTED",
        title: `New Job Posted: ${j.title}`,
        subtitle: `${j.employer.businessName} • ${j.location}`,
        timestamp: j.createdAt,
      });
    }

    for (const a of recentAssignments) {
      events.push({
        id: `assign-${a.id}`,
        type: "WORKER_HIRED",
        title: `Worker Hired for ${a.job.title}`,
        subtitle: `Status: ${a.status}`,
        timestamp: a.createdAt,
      });
    }

    for (const p of recentPayments) {
      events.push({
        id: `pay-${p.id}`,
        type: "PAYMENT_RELEASED",
        title: `Payment Released: ₹${p.amount}`,
        subtitle: p.assignment?.job?.title || "Completed Task",
        timestamp: p.createdAt,
      });
    }

    // Sort combined events by most recent first
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return NextResponse.json({
      success: true,
      events: events.slice(0, 5),
    });
  } catch (error: any) {
    console.error("Platform feed error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch platform feed." },
      { status: 500 }
    );
  }
}
