import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signToken, hashPassword, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { credential } = await req.json();

    if (!credential) {
      return NextResponse.json(
        { success: false, error: "Missing Google ID token" },
        { status: 400 }
      );
    }

    // Verify token with Google's tokeninfo endpoint
    const verifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );

    if (!verifyRes.ok) {
      return NextResponse.json(
        { success: false, error: "Invalid Google ID token" },
        { status: 401 }
      );
    }

    const payload = await verifyRes.json();
    const email = payload.email?.toLowerCase().trim();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Google token has no email" },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await db.user.findUnique({
      where: { email },
      include: {
        workerProfile: true,
        employerProfile: true,
      },
    });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-12) + "Gg1!";
      const passwordHash = await hashPassword(randomPassword);
      const generatedPhone = `+9199${Math.floor(10000000 + Math.random() * 90000000)}`;

      user = await db.user.create({
        data: {
          name: payload.name || payload.given_name || "Google User",
          email,
          phone: generatedPhone,
          passwordHash,
          role: "WORKER",
          profileImage: payload.picture || null,
          isVerified: payload.email_verified === "true" || payload.email_verified === true,
          phoneVerified: false,
          workerProfile: {
            create: {
              bio: "Verified Google account user on Work Adda.",
              skills: "[]",
              categories: "[]",
            },
          },
        },
        include: {
          workerProfile: true,
          employerProfile: true,
        },
      });
    } else {
      if (!user.profileImage && payload.picture) {
        user = await db.user.update({
          where: { id: user.id },
          data: { profileImage: payload.picture },
          include: {
            workerProfile: true,
            employerProfile: true,
          },
        });
      }
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: "Account suspended" },
        { status: 403 }
      );
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "WORKER" | "EMPLOYER" | "ADMIN" | "BOTH",
      phone: user.phone,
      isVerified: user.isVerified,
    };

    const token = signToken(sessionUser);

    const redirectPath =
      user.role === "ADMIN"
        ? "/admin"
        : user.role === "EMPLOYER"
        ? "/employer/dashboard"
        : "/worker/dashboard";

    const response = NextResponse.json({
      success: true,
      user: sessionUser,
      redirectUrl: redirectPath,
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Google One Tap error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process Google sign-in" },
      { status: 500 }
    );
  }
}
