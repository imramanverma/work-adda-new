import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizePhoneNumber } from "@/lib/privacy";
import { signToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, otp, purpose = "REGISTER" } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { error: "Phone number and 6-digit OTP code are required." },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    const cleanedOtp = otp.toString().trim();

    // Find the latest active OTP record for this phone & purpose
    const otpRecord = await db.otpVerification.findFirst({
      where: {
        phone: normalizedPhone,
        purpose,
        verified: false,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "No active OTP found. Please request a new code." },
        { status: 400 }
      );
    }

    // Check expiration
    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Check max attempts
    if (otpRecord.attempts >= 5) {
      return NextResponse.json(
        { error: "Too many incorrect attempts. Please request a new OTP." },
        { status: 400 }
      );
    }

    // Check code match
    if (otpRecord.otp !== cleanedOtp) {
      await db.otpVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      return NextResponse.json(
        { error: "Invalid OTP code. Please enter the 6-digit code received." },
        { status: 400 }
      );
    }

    // Mark OTP record as verified
    await db.otpVerification.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    // Handle LOGIN purpose: authenticate user and set cookie
    if (purpose === "LOGIN") {
      const user = await db.user.findFirst({
        where: {
          OR: [
            { phone: normalizedPhone },
            { phone: normalizedPhone.replace("+91", "") },
            { phone: `+91${normalizedPhone.replace("+91", "")}` },
          ],
        },
        include: {
          workerProfile: true,
          employerProfile: true,
        },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Account not found for this phone number." },
          { status: 404 }
        );
      }

      if (!user.isActive) {
        return NextResponse.json(
          { error: "This account has been suspended by administration." },
          { status: 403 }
        );
      }

      // Mark user's phoneVerified as true
      await db.user.update({
        where: { id: user.id },
        data: { phoneVerified: true },
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

      const redirectUrl =
        user.role === "ADMIN"
          ? "/admin"
          : user.role === "EMPLOYER"
          ? "/employer/dashboard"
          : "/worker/dashboard";

      const response = NextResponse.json({
        success: true,
        verified: true,
        message: "Signed in successfully with verified phone.",
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
    }

    // Handle REGISTER or PHONE_VERIFY purpose
    // Check if user already exists (for in-profile verification)
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { phone: normalizedPhone },
          { phone: normalizedPhone.replace("+91", "") },
        ],
      },
    });

    if (existingUser) {
      await db.user.update({
        where: { id: existingUser.id },
        data: { phoneVerified: true },
      });
    }

    return NextResponse.json({
      success: true,
      verified: true,
      phone: normalizedPhone,
      message: "Phone number verified successfully.",
    });
  } catch (err: any) {
    console.error("OTP verify error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to verify OTP." },
      { status: 500 }
    );
  }
}
