import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { AssignmentRevisionSchema } from "@/lib/validations";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(req, ["EMPLOYER", "ADMIN", "BOTH"]);
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

    if (user.role !== "ADMIN" && assignment.employerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden. Only the hirer can request revisions." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = AssignmentRevisionSchema.parse(body);

    const updated = await db.workAssignment.update({
      where: { id: params.id },
      data: {
        status: "REVISION_REQUESTED",
        completionStatus: "REVISION_REQUESTED",
        revisionRequestedNote: validated.revisionRequestedNote,
        revisionCount: { increment: 1 },
      },
    });

    // Notify worker
    await db.notification.create({
      data: {
        userId: assignment.workerId,
        title: "Revision Requested 🔄",
        message: `The poster for "${assignment.job.title}" requested revisions: "${validated.revisionRequestedNote}". Please review and resubmit.`,
        type: "ASSIGNMENT",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Revision requested successfully. Worker has been notified.",
      assignment: updated,
    });
  } catch (err: any) {
    if (err.errors) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to request revision" }, { status: 500 });
  }
}
