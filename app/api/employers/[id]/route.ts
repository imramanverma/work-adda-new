import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employer = await db.employerProfile.findFirst({
      where: {
        OR: [
          { id: params.id },
          { userId: params.id },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            location: true,
            isVerified: true,
            createdAt: true,
          },
        },
        jobs: {
          where: { status: "OPEN" },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            category: true,
            jobType: true,
            payAmount: true,
            payType: true,
            location: true,
            createdAt: true,
          },
        },
      },
    });

    if (!employer) {
      return NextResponse.json({ error: "Employer not found" }, { status: 404 });
    }

    return NextResponse.json({ employer });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch employer" }, { status: 500 });
  }
}
