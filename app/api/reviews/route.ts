import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { ReviewCreateSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const jobId = searchParams.get("jobId");

    const where: any = {};
    if (userId) where.reviewedUserId = userId;
    if (jobId) where.jobId = jobId;

    const reviews = await db.review.findMany({
      where,
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            role: true,
            employerProfile: { select: { businessName: true } },
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reviews });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    const body = await req.json();
    const validated = ReviewCreateSchema.parse(body);

    if (validated.reviewedUserId === user.id) {
      return NextResponse.json({ error: "You cannot submit a review for yourself." }, { status: 400 });
    }

    // Check if the assignment exists and was completed
    const assignment = await db.workAssignment.findFirst({
      where: {
        jobId: validated.jobId,
        OR: [
          { workerId: user.id, employerId: validated.reviewedUserId },
          { employerId: user.id, workerId: validated.reviewedUserId },
        ],
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "You can only review participants from work assignments you were involved in." },
        { status: 403 }
      );
    }

    if (!["COMPLETED", "APPROVED", "PAID"].includes(assignment.status)) {
      return NextResponse.json(
        { error: "Reviews can only be submitted after the work is marked completed or paid." },
        { status: 400 }
      );
    }

    // Check for duplicate review
    const existing = await db.review.findFirst({
      where: {
        jobId: validated.jobId,
        reviewerId: user.id,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already submitted a review for this job." },
        { status: 400 }
      );
    }

    const review = await db.review.create({
      data: {
        reviewerId: user.id,
        reviewedUserId: validated.reviewedUserId,
        jobId: validated.jobId,
        rating: validated.rating,
        comment: validated.comment,
      },
    });

    // Recalculate target user's aggregate rating
    const allUserReviews = await db.review.findMany({
      where: { reviewedUserId: validated.reviewedUserId },
      select: { rating: true },
    });

    const avgRating =
      allUserReviews.reduce((sum, r) => sum + r.rating, 0) / allUserReviews.length;
    const roundedRating = Math.round(avgRating * 10) / 10;

    // Update in worker or employer profile
    await db.workerProfile.updateMany({
      where: { userId: validated.reviewedUserId },
      data: { rating: roundedRating },
    });

    await db.employerProfile.updateMany({
      where: { userId: validated.reviewedUserId },
      data: { rating: roundedRating },
    });

    // Notify the reviewed user
    await db.notification.create({
      data: {
        userId: validated.reviewedUserId,
        title: "New Review Received ⭐",
        message: `${user.name} rated you ${validated.rating}/5 stars: "${validated.comment || "Great experience!"}"`,
        type: "REVIEW",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully",
      review,
      newAverageRating: roundedRating,
    });
  } catch (err: any) {
    console.error("Create review error:", err);
    if (err.errors) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to submit review" }, { status: 500 });
  }
}
