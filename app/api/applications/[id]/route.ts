import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { ApplicationStatusUpdateSchema } from "@/lib/validations";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(req);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    const application = await db.application.findUnique({
      where: { id: params.id },
      include: {
        job: {
          include: {
            employer: true,
          },
        },
        worker: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const body = await req.json();
    const { status } = ApplicationStatusUpdateSchema.parse(body);

    // Permission checks
    const isEmployerOwner = application.job.employer.userId === user.id;
    const isWorkerOwner = application.workerId === user.id;

    if (status === "WITHDRAWN") {
      if (!isWorkerOwner && user.role !== "ADMIN") {
        return NextResponse.json({ error: "Only the applicant can withdraw this application." }, { status: 403 });
      }
    } else {
      if (!isEmployerOwner && user.role !== "ADMIN") {
        return NextResponse.json({ error: "Only the employer who posted this job can update its status." }, { status: 403 });
      }
    }

    // Perform status update
    const updatedApplication = await db.application.update({
      where: { id: params.id },
      data: { status },
    });

    // Workflow actions based on new status
    if (status === "ACCEPTED") {
      // 1. Create or ensure WorkAssignment exists
      let assignment = await db.workAssignment.findFirst({
        where: {
          jobId: application.jobId,
          workerId: application.workerId,
        },
      });

      if (!assignment) {
        assignment = await db.workAssignment.create({
          data: {
            jobId: application.jobId,
            workerId: application.workerId,
            employerId: application.job.employer.userId,
            agreedAmount: application.proposedPay ?? application.job.payAmount,
            status: "ASSIGNED",
            completionStatus: "NOT_STARTED",
          },
        });
      }

      // 2. Ensure conversation thread exists between worker and employer for this job
      let conv = await db.conversation.findFirst({
        where: {
          jobId: application.jobId,
          workerId: application.workerId,
          employerId: application.job.employer.userId,
        },
      });

      if (!conv) {
        conv = await db.conversation.create({
          data: {
            jobId: application.jobId,
            workerId: application.workerId,
            employerId: application.job.employer.userId,
          },
        });
      }

      // 3. Notify Worker
      await db.notification.create({
        data: {
          userId: application.workerId,
          title: "Congratulations! You have been hired! 🎉",
          message: `${application.job.employer.businessName} accepted your application for "${application.job.title}". You can now begin work and track progress.`,
          type: "APPLICATION",
        },
      });
    } else if (status === "SHORTLISTED") {
      await db.notification.create({
        data: {
          userId: application.workerId,
          title: "Application Shortlisted ⭐",
          message: `${application.job.employer.businessName} shortlisted you for "${application.job.title}".`,
          type: "APPLICATION",
        },
      });
    } else if (status === "REJECTED") {
      await db.notification.create({
        data: {
          userId: application.workerId,
          title: "Application Status Update",
          message: `Your application for "${application.job.title}" was not selected this time. Keep exploring new local gigs!`,
          type: "APPLICATION",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Application marked as ${status.toLowerCase()}`,
      application: updatedApplication,
    });
  } catch (err: any) {
    console.error("Update application status error:", err);
    if (err.errors) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to update application" }, { status: 500 });
  }
}
