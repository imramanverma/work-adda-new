import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { ApplicationCreateSchema } from "@/lib/validations";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(req, ["WORKER"]);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    const job = await db.job.findUnique({
      where: { id: params.id },
      include: {
        employer: {
          include: { user: true },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status !== "OPEN") {
      return NextResponse.json(
        { error: `This job is currently ${job.status.toLowerCase()} and cannot accept new applications.` },
        { status: 400 }
      );
    }

    // Check if worker has already applied
    const existing = await db.application.findUnique({
      where: {
        jobId_workerId: {
          jobId: job.id,
          workerId: user.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already submitted an application for this job.", existing },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const validated = ApplicationCreateSchema.parse(body);

    const application = await db.application.create({
      data: {
        jobId: job.id,
        workerId: user.id,
        coverMessage: validated.coverMessage,
        proposedPay: validated.proposedPay ?? job.payAmount,
        status: "PENDING",
      },
    });

    // Notify Employer
    await db.notification.create({
      data: {
        userId: job.employer.userId,
        title: "New Application Received! 📨",
        message: `${user.name} applied for "${job.title}".`,
        type: "APPLICATION",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully! The employer has been notified.",
      application,
    });
  } catch (err: any) {
    console.error("Apply error:", err);
    if (err.errors) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to submit application" }, { status: 500 });
  }
}
