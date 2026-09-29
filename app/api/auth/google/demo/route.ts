import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signToken, hashPassword, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const role = (body.role as "WORKER" | "EMPLOYER") || "WORKER";
    const demoEmail = `google.demo@workadda.com`;

    let user = await db.user.findUnique({
      where: { email: demoEmail },
      include: {
        workerProfile: true,
        employerProfile: true,
      },
    });

    if (!user) {
      const passwordHash = await hashPassword("GoogleDemoUser2026!");
      user = await db.user.create({
        data: {
          name: "Raman (Google Member)",
          email: demoEmail,
          phone: "+919876543210",
          passwordHash,
          role,
          profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          isVerified: true,
          phoneVerified: true,
          location: "Fatehabad",
          workerProfile: {
            create: {
              bio: "Verified Google account member exploring local gigs and tasks.",
              skills: JSON.stringify(["Computer Skills", "Communication", "Data Entry"]),
              categories: JSON.stringify(["Digital Work", "Academic & Assignment Work"]),
            },
          },
          employerProfile: {
            create: {
              businessName: "Google Verified Hirer",
              businessType: "Local Enterprise",
              location: "Fatehabad",
            },
          },
        },
        include: {
          workerProfile: true,
          employerProfile: true,
        },
      });
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

    const redirectUrl =
      user.role === "EMPLOYER" ? "/employer/dashboard" : "/worker/dashboard";

    const response = NextResponse.json({
      success: true,
      message: "Signed in with Google (Demo Mode)",
      user: sessionUser,
      token,
      redirectUrl,
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
    console.error("Demo Google sign in error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to sign in with demo Google account" },
      { status: 500 }
    );
  }
}
