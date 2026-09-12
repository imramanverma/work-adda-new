import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(req, ["EMPLOYER", "ADMIN"]);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    const assignment = await db.workAssignment.findUnique({
      where: { id: params.id },
      include: {
        job: true,
        employer: {
          include: { employerProfile: true },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && assignment.employerId !== user.id) {
      return NextResponse.json({ error: "Forbidden. Only the employer can approve work." }, { status: 403 });
    }

    const updated = await db.workAssignment.update({
      where: { id: params.id },
      data: {
        status: "APPROVED",
        completionStatus: "APPROVED",
      },
    });

    // Increment worker completedJobs
    await db.workerProfile.updateMany({
      where: { userId: assignment.workerId },
      data: {
        completedJobs: { increment: 1 },
      },
    });

    // Notify Worker
    await db.notification.create({
      data: {
        userId: assignment.workerId,
        title: "Work Approved! 🌟",
        message: `${assignment.employer.employerProfile?.businessName || "Employer"} has approved your work for "${assignment.job.title}". Payment release is pending.`,
        type: "ASSIGNMENT",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Work approved successfully. You can now release payment to the worker.",
      assignment: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to approve work" }, { status: 500 });
  }
}
