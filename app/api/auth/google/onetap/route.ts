import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signToken, hashPassword, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { credential, accessToken, role: requestedRole } = await req.json();

    if (!credential && !accessToken) {
      return NextResponse.json(
        { success: false, error: "Missing Google authentication token" },
        { status: 400 }
      );
    }

    let email = "";
    let name = "Google User";
    let picture: string | null = null;
    let isEmailVerified = false;

    if (credential) {
      // 1. Verify Google ID token via tokeninfo
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
      email = payload.email?.toLowerCase().trim() || "";
      name = payload.name || payload.given_name || "Google User";
      picture = payload.picture || null;
      isEmailVerified = payload.email_verified === "true" || payload.email_verified === true;
    } else if (accessToken) {
      // 2. Verify Google access token via userinfo endpoint
      const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!profileRes.ok) {
        return NextResponse.json(
          { success: false, error: "Invalid or expired Google access token" },
          { status: 401 }
        );
      }

      const userInfo = await profileRes.json();
      email = userInfo.email?.toLowerCase().trim() || "";
      name = userInfo.name || userInfo.given_name || "Google User";
      picture = userInfo.picture || null;
      isEmailVerified = Boolean(userInfo.email_verified);
    }

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Google account has no associated email" },
        { status: 400 }
      );
    }

    // Determine target role for new users
    const validRoles = ["WORKER", "EMPLOYER", "BOTH"];
    const role = validRoles.includes(requestedRole) ? requestedRole : "WORKER";

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
          name,
          email,
          phone: generatedPhone,
          passwordHash,
          role,
          profileImage: picture,
          isVerified: isEmailVerified,
          phoneVerified: false,
          ...(role === "EMPLOYER"
            ? {
                employerProfile: {
                  create: {
                    businessName: name ? `${name}'s Tasks` : "Individual Poster",
                    businessType: "Personal / Individual",
                    posterType: "INDIVIDUAL",
                    description: "Verified Google account employer on Work Adda.",
                  },
                },
              }
            : role === "BOTH"
            ? {
                workerProfile: {
                  create: {
                    bio: "Verified Google account user on Work Adda.",
                    skills: "[]",
                    categories: "[]",
                  },
                },
                employerProfile: {
                  create: {
                    businessName: name ? `${name}'s Tasks` : "Individual Poster",
                    businessType: "Personal / Individual",
                    posterType: "INDIVIDUAL",
                  },
                },
              }
            : {
                workerProfile: {
                  create: {
                    bio: "Verified Google account user on Work Adda.",
                    skills: "[]",
                    categories: "[]",
                  },
                },
              }),
        },
        include: {
          workerProfile: true,
          employerProfile: true,
        },
      });
    } else {
      if (!user.profileImage && picture) {
        user = await db.user.update({
          where: { id: user.id },
          data: { profileImage: picture },
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
