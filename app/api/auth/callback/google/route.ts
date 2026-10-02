import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signToken, hashPassword, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const baseUrl = host.includes("vercel.app")
    ? `https://${host}`
    : process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;

  if (oauthError || !code) {
    console.error("Google OAuth error or missing code:", oauthError);
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent(oauthError || "Google authorization failed")}`
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const redirectUri = `${baseUrl}/api/auth/callback/google`;

  if (!clientId || !clientSecret) {
    console.error("Google credentials missing in environment");
    return NextResponse.redirect(`${baseUrl}/login?error=google_credentials_missing`);
  }

  try {
    // 1. Exchange authorization code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Google token exchange failure:", tokenData);
      return NextResponse.redirect(`${baseUrl}/login?error=token_exchange_failed`);
    }

    // 2. Fetch authenticated user profile from Google
    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await profileResponse.json();
    if (!googleUser.email) {
      return NextResponse.redirect(`${baseUrl}/login?error=google_email_missing`);
    }

    const email = googleUser.email.toLowerCase().trim();

    // 3. Find existing user or register new user
    let user = await db.user.findUnique({
      where: { email },
      include: {
        workerProfile: true,
        employerProfile: true,
      },
    });

    if (!user) {
      // Create new user account via Google Sign-In
      const randomPassword = Math.random().toString(36).slice(-12) + "Gg1!";
      const passwordHash = await hashPassword(randomPassword);
      const generatedPhone = `+9199${Math.floor(10000000 + Math.random() * 90000000)}`;

      user = await db.user.create({
        data: {
          name: googleUser.name || googleUser.given_name || "Google User",
          email,
          phone: generatedPhone,
          passwordHash,
          role: "WORKER",
          profileImage: googleUser.picture || null,
          isVerified: Boolean(googleUser.email_verified),
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
      // Update profile image if not present
      if (!user.profileImage && googleUser.picture) {
        user = await db.user.update({
          where: { id: user.id },
          data: { profileImage: googleUser.picture },
          include: {
            workerProfile: true,
            employerProfile: true,
          },
        });
      }
    }

    if (!user.isActive) {
      return NextResponse.redirect(`${baseUrl}/login?error=account_suspended`);
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

    const response = NextResponse.redirect(`${baseUrl}${redirectPath}`);

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Google OAuth callback exception:", err);
    return NextResponse.redirect(`${baseUrl}/login?error=internal_oauth_error`);
  }
}
