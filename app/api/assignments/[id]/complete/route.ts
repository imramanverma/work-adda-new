import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(req, ["WORKER", "ADMIN"]);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    const assignment = await db.workAssignment.findUnique({
      where: { id: params.id },
      include: {
        job: true,
        worker: true,
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && assignment.workerId !== user.id) {
      return NextResponse.json({ error: "Forbidden. Only the assigned worker can submit completion." }, { status: 403 });
    }

    const updated = await db.workAssignment.update({
      where: { id: params.id },
      data: {
        status: "COMPLETED",
        completionStatus: "SUBMITTED",
      },
    });

    // Notify Employer
    await db.notification.create({
      data: {
        userId: assignment.employerId,
        title: "Work Marked Completed! 📋",
        message: `${assignment.worker.name} has completed the task for "${assignment.job.title}". Please review and approve completion to release payment.`,
        type: "ASSIGNMENT",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Work submitted as completed. The employer has been asked to verify and approve.",
      assignment: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to mark completion" }, { status: 500 });
  }
}
