import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(req, ["WORKER", "ADMIN", "BOTH"]);
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

    const body = await req.json().catch(() => ({}));

    const updated = await db.workAssignment.update({
      where: { id: params.id },
      data: {
        status: "COMPLETED",
        completionStatus: "SUBMITTED",
        submissionNote: body.submissionNote || undefined,
        submissionFiles: body.submissionFiles || undefined,
      },
    });

    // Notify Employer
    await db.notification.create({
      data: {
        userId: assignment.employerId,
        title: "Work Submitted for Review! 📋",
        message: `${assignment.worker.name} has submitted the work for "${assignment.job.title}". Please inspect and approve completion to release payment, or request revisions.`,
        type: "ASSIGNMENT",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Work submitted for employer review and escrow approval.",
      assignment: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to mark completion" }, { status: 500 });
  }
}
