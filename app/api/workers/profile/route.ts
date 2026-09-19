import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { WorkerProfileUpdateSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["WORKER", "BOTH"]);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    let fullUser = await db.user.findUnique({
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

    if (!fullUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const workerProfile = fullUser.workerProfile || (await db.workerProfile.create({
      data: {
        userId: user.id,
        bio: `Local ${fullUser.name} ready for tasks.`,
        skills: "[]",
        categories: "[]",
        languages: "[]",
        preferredWorkType: "ANY",
      },
    }));

    let skillsList: string[] = [];
    try {
      skillsList = JSON.parse(workerProfile.skills || "[]");
    } catch {}

    let categoriesList: string[] = [];
    try {
      categoriesList = JSON.parse(workerProfile.categories || "[]");
    } catch {}

    let languagesList: string[] = [];
    try {
      languagesList = JSON.parse(workerProfile.languages || "[]");
    } catch {}

    // Calculate profile completion percentage
    let completion = 20;
    if (skillsList.length > 0) completion += 20;
    if (workerProfile.experience) completion += 15;
    if (workerProfile.bio) completion += 15;
    if (workerProfile.education) completion += 10;
    if (workerProfile.availability) completion += 10;
    if (fullUser.location) completion += 10;

    const workerData = {
      ...workerProfile,
      skills: skillsList,
      categories: categoriesList,
      languages: languagesList,
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
    const authResult = await requireAuth(req, ["WORKER", "BOTH"]);
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
    const updated = await db.workerProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        bio: validated.bio,
        skills: JSON.stringify(validated.skills),
        categories: validated.categories ? JSON.stringify(validated.categories) : "[]",
        languages: validated.languages ? JSON.stringify(validated.languages) : "[]",
        portfolio: validated.portfolio || null,
        preferredWorkType: validated.preferredWorkType || "ANY",
        experience: validated.experience,
        education: validated.education,
        availability: validated.availability,
        preferredJobType: validated.preferredJobType,
        preferredDistance: validated.preferredDistance,
        expectedPay: validated.expectedPay,
      },
      update: {
        bio: validated.bio,
        skills: JSON.stringify(validated.skills),
        categories: validated.categories ? JSON.stringify(validated.categories) : undefined,
        languages: validated.languages ? JSON.stringify(validated.languages) : undefined,
        portfolio: validated.portfolio !== undefined ? validated.portfolio : undefined,
        preferredWorkType: validated.preferredWorkType || undefined,
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
        categories: validated.categories || [],
        languages: validated.languages || [],
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
