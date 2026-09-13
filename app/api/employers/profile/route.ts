import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { EmployerProfileUpdateSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["EMPLOYER"]);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    const employer = await db.employerProfile.findUnique({
      where: { userId: user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            location: true,
            isVerified: true,
          },
        },
        jobs: {
          orderBy: { createdAt: "desc" },
          include: {
            _count: {
              select: { applications: true, assignments: true },
            },
          },
        },
      },
    });

    if (!employer) {
      return NextResponse.json({ error: "Employer profile not found" }, { status: 404 });
    }

    return NextResponse.json({ employer, profile: employer });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["EMPLOYER"]);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    const body = await req.json();
    const validated = EmployerProfileUpdateSchema.parse(body);

    const updated = await db.employerProfile.update({
      where: { userId: user.id },
      data: {
        businessName: validated.businessName,
        businessType: validated.businessType,
        shopImage: validated.shopImage !== undefined ? validated.shopImage : undefined,
        description: validated.description,
        address: validated.address,
        location: validated.location,
        latitude: validated.latitude,
        longitude: validated.longitude,
        website: validated.website,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Employer profile updated successfully",
      profile: updated,
    });
  } catch (err: any) {
    console.error("Update employer profile error:", err);
    if (err.errors) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to update profile" }, { status: 500 });
  }
}
