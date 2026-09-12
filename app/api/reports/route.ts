import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { ReportCreateSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    const body = await req.json();
    const validated = ReportCreateSchema.parse(body);

    const report = await db.report.create({
      data: {
        reporterId: user.id,
        reportedUserId: validated.reportedUserId,
        jobId: validated.jobId,
        reason: validated.reason,
        description: validated.description,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Report submitted successfully. Work Adda safety team will review this shortly.",
      report,
    });
  } catch (err: any) {
    console.error("Submit report error:", err);
    if (err.errors) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to submit report" }, { status: 500 });
  }
}
