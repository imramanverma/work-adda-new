import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { WorkerProfileUpdateSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["WORKER"]);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    const fullUser = await db.user.findUnique({
      where: { id: user.id },
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
        },
      },
    });

    if (!fullUser || !fullUser.workerProfile) {
      return NextResponse.json({ error: "Worker profile not found" }, { status: 404 });
    }

    let skillsList: string[] = [];
    try {
      skillsList = JSON.parse(fullUser.workerProfile.skills || "[]");
    } catch {}

    // Calculate profile completion percentage
    let completion = 20; // Base for user registration
    if (skillsList.length > 0) completion += 20;
    if (fullUser.workerProfile.experience) completion += 15;
    if (fullUser.workerProfile.bio) completion += 15;
    if (fullUser.workerProfile.education) completion += 10;
    if (fullUser.workerProfile.availability) completion += 10;
    if (fullUser.location) completion += 10;
    if (fullUser.profileImage) completion += 10;

    const workerData = {
      ...fullUser.workerProfile,
      skills: skillsList,
      name: fullUser.name,
      fullName: fullUser.name,
      email: fullUser.email,
      phone: fullUser.phone,
      location: fullUser.location,
      latitude: fullUser.latitude,
      longitude: fullUser.longitude,
      profileImage: fullUser.profileImage,
      isVerified: fullUser.isVerified,
      completionPercentage: Math.min(100, completion),
      reviews: fullUser.reviewsReceived,
    };

    return NextResponse.json({
      profile: workerData,
      worker: workerData,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["WORKER"]);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    const body = await req.json();
    const validated = WorkerProfileUpdateSchema.parse(body);

    // Update User location and profileImage if provided
    if (
      validated.location ||
      validated.latitude !== undefined ||
      validated.longitude !== undefined ||
      validated.profileImage !== undefined
    ) {
      await db.user.update({
        where: { id: user.id },
        data: {
          location: validated.location ?? undefined,
          latitude: validated.latitude ?? undefined,
          longitude: validated.longitude ?? undefined,
          profileImage: validated.profileImage !== undefined ? validated.profileImage : undefined,
        },
      });
    }

    // Update WorkerProfile
    const updated = await db.workerProfile.update({
      where: { userId: user.id },
      data: {
        bio: validated.bio,
        skills: JSON.stringify(validated.skills),
        experience: validated.experience,
        education: validated.education,
        availability: validated.availability,
        preferredJobType: validated.preferredJobType,
        preferredDistance: validated.preferredDistance,
        expectedPay: validated.expectedPay,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        ...updated,
        skills: validated.skills,
      },
    });
  } catch (err: any) {
    console.error("Update profile error:", err);
    if (err.errors) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to update profile" }, { status: 500 });
  }
}
