import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { RegisterSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = RegisterSchema.parse(body);

    // Check if email or phone already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ email: validatedData.email }, { phone: validatedData.phone }],
      },
    });

    if (existingUser) {
      if (existingUser.email === validatedData.email) {
        return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
      }
      return NextResponse.json({ error: "Phone number is already registered" }, { status: 400 });
    }

    const passwordHash = await hashPassword(validatedData.password);

    const user = await db.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email.toLowerCase(),
        phone: validatedData.phone,
        passwordHash,
        role: validatedData.role,
        location: validatedData.location,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        isVerified: true, // Auto-verified for instant marketplace usage
        phoneVerified: true,
        ...(validatedData.role === "WORKER"
          ? {
              workerProfile: {
                create: {
                  bio: `Local ${validatedData.name} ready for tasks.`,
                  skills: "[]",
                  availability: "Flexible",
                  preferredJobType: "ANY",
                  preferredDistance: 15,
                },
              },
            }
          : {
              employerProfile: {
                create: {
                  businessName: validatedData.businessName || `${validatedData.name}'s Enterprise`,
                  businessType: validatedData.businessType || "Local Business",
                  description: "Local employer on Work Adda",
                  location: validatedData.location,
                  latitude: validatedData.latitude,
                  longitude: validatedData.longitude,
                  verificationStatus: "VERIFIED",
                },
              },
            }),
      },
      include: {
        workerProfile: true,
        employerProfile: true,
      },
    });

    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "WORKER" | "EMPLOYER" | "ADMIN",
      phone: user.phone,
      isVerified: user.isVerified,
    };

    const token = signToken(sessionUser);

    const response = NextResponse.json({
      success: true,
      message: "Registration successful",
      user: sessionUser,
      token,
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Register error:", err);
    if (err.errors) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to register" }, { status: 500 });
  }
}
