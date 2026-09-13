import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let where: any = {};
    if (user.role === "WORKER") {
      where.workerId = user.id;
    } else if (user.role === "EMPLOYER") {
      where.employerId = user.id;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    const assignments = await db.workAssignment.findMany({
      where,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            category: true,
            jobType: true,
            location: true,
            payAmount: true,
            payType: true,
          },
        },
        worker: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            location: true,
            profileImage: true,
            workerProfile: {
              select: { rating: true, completedJobs: true },
            },
          },
        },
        employer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            employerProfile: {
              select: { businessName: true, location: true, rating: true, shopImage: true },
            },
          },
        },
        payment: {
          include: {
            ledger: true,
            disputes: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ assignments });
  } catch (err: any) {
    console.error("Fetch assignments error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch assignments" }, { status: 500 });
  }
}
