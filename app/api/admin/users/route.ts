import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["ADMIN"]);
    if ("error" in authResult) return authResult.error;

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const role = searchParams.get("role") || "";

    const where: any = {};
    if (role && role !== "ALL") where.role = role;
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
        { location: { contains: q } },
      ];
    }

    const users = await db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        phoneVerified: true,
        role: true,
        location: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        workerProfile: {
          select: { rating: true, completedJobs: true },
        },
        employerProfile: {
          select: { businessName: true, businessType: true, rating: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ users });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["ADMIN"]);
    if ("error" in authResult) return authResult.error;

    const body = await req.json();
    const { userId, isActive, isVerified } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: {
        isActive: isActive !== undefined ? isActive : undefined,
        isVerified: isVerified !== undefined ? isVerified : undefined,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update user" }, { status: 500 });
  }
}
