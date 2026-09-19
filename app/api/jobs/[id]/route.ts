import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRequestUser, requireAuth } from "@/lib/session";
import { calculateDistanceKm } from "@/lib/location";
import { calculateMatchScore } from "@/lib/matching";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await db.job.findUnique({
      where: { id: params.id },
      include: {
        employer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                createdAt: true,
              },
            },
          },
        },
        _count: {
          select: {
            applications: true,
            assignments: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const currentUser = await getRequestUser(req);
    let applicationState = null;
    let matchData = null;
    let distanceKm = null;

    if (currentUser) {
      // Check if user has already applied
      const existingApplication = await db.application.findUnique({
        where: {
          jobId_workerId: {
            jobId: job.id,
            workerId: currentUser.id,
          },
        },
      });

      if (existingApplication) {
        applicationState = existingApplication;
      }

      // If worker, compute match
      if (currentUser.role === "WORKER") {
        const workerUser = await db.user.findUnique({
          where: { id: currentUser.id },
          include: { workerProfile: true },
        });

        if (workerUser?.workerProfile) {
          let skillsList: string[] = [];
          try {
            skillsList = JSON.parse(workerUser.workerProfile.skills || "[]");
          } catch {}

          let reqSkillsList: string[] = [];
          try {
            reqSkillsList = JSON.parse(job.requiredSkills || "[]");
          } catch {}

          matchData = calculateMatchScore(
            {
              skills: skillsList,
              latitude: workerUser.latitude,
              longitude: workerUser.longitude,
              preferredDistance: workerUser.workerProfile.preferredDistance,
              availability: workerUser.workerProfile.availability,
              experience: workerUser.workerProfile.experience,
              rating: workerUser.workerProfile.rating,
              completedJobs: workerUser.workerProfile.completedJobs,
            },
            {
              requiredSkills: reqSkillsList,
              latitude: job.latitude,
              longitude: job.longitude,
              jobType: job.jobType,
            }
          );

          if (workerUser.latitude && workerUser.longitude && job.latitude && job.longitude) {
            distanceKm = calculateDistanceKm(
              workerUser.latitude,
              workerUser.longitude,
              job.latitude,
              job.longitude
            );
          }
        }
      }
    }

    return NextResponse.json({
      job: {
        ...job,
        requiredSkills: (() => {
          try {
            return JSON.parse(job.requiredSkills);
          } catch {
            return [];
          }
        })(),
        categoryDetails: (() => {
          if (!job.categoryDetails) return null;
          try {
            return typeof job.categoryDetails === "string" ? JSON.parse(job.categoryDetails) : job.categoryDetails;
          } catch {
            return null;
          }
        })(),
        attachmentUrls: (() => {
          if (!job.attachmentUrls) return [];
          try {
            return typeof job.attachmentUrls === "string" ? JSON.parse(job.attachmentUrls) : job.attachmentUrls;
          } catch {
            return [];
          }
        })(),
        distanceKm,
        matchScore: matchData?.score ?? null,
        matchReasons: matchData?.reasons ?? [],
        applicantsCount: job._count.applications,
        assignmentsCount: job._count.assignments,
      },
      userApplication: applicationState,
      isOwner: currentUser ? job.employer.userId === currentUser.id : false,
    });
  } catch (err: any) {
    console.error("Job details error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch job" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(req, ["EMPLOYER", "ADMIN"]);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    const job = await db.job.findUnique({
      where: { id: params.id },
      include: { employer: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && job.employer.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden. You do not own this job listing." }, { status: 403 });
    }

    const body = await req.json();
    const updated = await db.job.update({
      where: { id: params.id },
      data: {
        title: body.title ?? job.title,
        description: body.description ?? job.description,
        category: body.category ?? job.category,
        requiredSkills: body.requiredSkills ? JSON.stringify(body.requiredSkills) : job.requiredSkills,
        jobType: body.jobType ?? job.jobType,
        location: body.location ?? job.location,
        payAmount: body.payAmount ?? job.payAmount,
        payType: body.payType ?? job.payType,
        workersRequired: body.workersRequired ?? job.workersRequired,
        status: body.status ?? job.status,
      },
    });

    return NextResponse.json({ success: true, job: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(req, ["EMPLOYER", "ADMIN"]);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    const job = await db.job.findUnique({
      where: { id: params.id },
      include: { employer: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && job.employer.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden. You do not own this job listing." }, { status: 403 });
    }

    await db.job.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Job listing deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
