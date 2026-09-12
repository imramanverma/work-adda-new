import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(req);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    const assignment = await db.workAssignment.findUnique({
      where: { id: params.id },
      include: {
        job: {
          include: {
            employer: true,
          },
        },
        worker: {
          include: {
            workerProfile: true,
          },
        },
        employer: {
          include: {
            employerProfile: true,
          },
        },
        payment: true,
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    if (
      user.role !== "ADMIN" &&
      assignment.workerId !== user.id &&
      assignment.employerId !== user.id
    ) {
      return NextResponse.json({ error: "Unauthorized to view this work assignment" }, { status: 403 });
    }

    // Check if review already given by current user
    const existingReview = await db.review.findFirst({
      where: {
        jobId: assignment.jobId,
        reviewerId: user.id,
      },
    });

    return NextResponse.json({
      assignment,
      hasReviewed: !!existingReview,
      userReview: existingReview,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
