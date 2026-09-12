import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await db.user.findFirst({
      where: {
        OR: [
          { id: params.id },
          { workerProfile: { id: params.id } },
        ],
      },
      include: {
        workerProfile: true,
        reviewsReceived: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                employerProfile: { select: { businessName: true } },
              },
            },
            job: { select: { id: true, title: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user || !user.workerProfile) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    let skillsList: string[] = [];
    try {
      skillsList = JSON.parse(user.workerProfile.skills || "[]");
    } catch {}

    return NextResponse.json({
      worker: {
        id: user.id,
        name: user.name,
        location: user.location,
        isVerified: user.isVerified,
        bio: user.workerProfile.bio,
        skills: skillsList,
        experience: user.workerProfile.experience,
        education: user.workerProfile.education,
        availability: user.workerProfile.availability,
        preferredJobType: user.workerProfile.preferredJobType,
        expectedPay: user.workerProfile.expectedPay,
        rating: user.workerProfile.rating,
        completedJobs: user.workerProfile.completedJobs,
        reviews: user.reviewsReceived,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch worker" }, { status: 500 });
  }
}
