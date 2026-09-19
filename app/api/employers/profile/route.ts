import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { EmployerProfileUpdateSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["EMPLOYER", "BOTH"]);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    let employer = await db.employerProfile.findUnique({
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
      // Auto-create for individual poster
      const fullUser = await db.user.findUnique({ where: { id: user.id } });
      employer = await db.employerProfile.create({
        data: {
          userId: user.id,
          posterType: "INDIVIDUAL",
          businessName: fullUser?.name || "Personal Profile",
          businessType: "Personal / Individual",
          description: "Task poster on Work Adda",
          location: fullUser?.location || "Local",
          verificationStatus: "VERIFIED",
        },
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
            include: {
              _count: {
                select: { applications: true, assignments: true },
              },
            },
          },
        },
      });
    }

    return NextResponse.json({ employer, profile: employer });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["EMPLOYER", "BOTH"]);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    const body = await req.json();
    const validated = EmployerProfileUpdateSchema.parse(body);

    const updated = await db.employerProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        posterType: validated.posterType || "INDIVIDUAL",
        businessName: validated.businessName,
        businessType: validated.businessType || "Personal / Individual",
        shopImage: validated.shopImage !== undefined ? validated.shopImage : null,
        description: validated.description || "",
        address: validated.address || "",
        location: validated.location || "",
        latitude: validated.latitude || null,
        longitude: validated.longitude || null,
        website: validated.website || "",
      },
      update: {
        posterType: validated.posterType !== undefined ? validated.posterType : undefined,
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
