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
    const jobId = searchParams.get("jobId");

    if (user.role === "WORKER") {
      const where: any = { workerId: user.id };
      if (status && status !== "ALL") where.status = status;

      const applications = await db.application.findMany({
        where,
        include: {
          job: {
            include: {
              employer: {
                select: {
                  id: true,
                  businessName: true,
                  businessType: true,
                  rating: true,
                  location: true,
                  verificationStatus: true,
                },
              },
            },
          },
        },
        orderBy: { appliedAt: "desc" },
      });

      return NextResponse.json({
        applications: applications.map((app) => ({
          ...app,
          job: {
            ...app.job,
            requiredSkills: (() => {
              try {
                return JSON.parse(app.job.requiredSkills);
              } catch {
                return [];
              }
            })(),
          },
        })),
      });
    }

    if (user.role === "EMPLOYER") {
      const employerProfile = await db.employerProfile.findUnique({
        where: { userId: user.id },
      });

      if (!employerProfile) {
        return NextResponse.json({ applications: [] });
      }

      const where: any = {
        job: { employerId: employerProfile.id },
      };
      if (jobId) where.jobId = jobId;
      if (status && status !== "ALL") where.status = status;

      const applications = await db.application.findMany({
        where,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              category: true,
              jobType: true,
              payAmount: true,
              payType: true,
              requiredSkills: true,
            },
          },
          worker: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              location: true,
              latitude: true,
              longitude: true,
              profileImage: true,
              workerProfile: true,
            },
          },
        },
        orderBy: { appliedAt: "desc" },
      });

      return NextResponse.json({
        applications: applications.map((app) => ({
          ...app,
          job: {
            ...app.job,
            requiredSkills: (() => {
              try {
                return JSON.parse(app.job.requiredSkills);
              } catch {
                return [];
              }
            })(),
          },
          worker: {
            ...app.worker,
            workerProfile: app.worker.workerProfile
              ? {
                  ...app.worker.workerProfile,
                  skills: (() => {
                    try {
                      return JSON.parse(app.worker.workerProfile.skills);
                    } catch {
                      return [];
                    }
                  })(),
                }
              : null,
          },
        })),
      });
    }

    // ADMIN view
    if (user.role === "ADMIN") {
      const applications = await db.application.findMany({
        include: {
          job: {
            include: { employer: true },
          },
          worker: true,
        },
        orderBy: { appliedAt: "desc" },
        take: 50,
      });
      return NextResponse.json({ applications });
    }

    return NextResponse.json({ error: "Invalid role" }, { status: 403 });
  } catch (err: any) {
    console.error("Fetch applications error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch applications" }, { status: 500 });
  }
}
