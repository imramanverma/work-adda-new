import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  normalizePhoneNumber,
  isValidIndianPhone,
  generateOtp,
  maskPhoneNumber,
} from "@/lib/privacy";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, purpose = "REGISTER" } = body;

    if (!phone) {
      return NextResponse.json(
        { error: "Mobile phone number is required." },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    if (!isValidIndianPhone(normalizedPhone)) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    // Rate Limiting: Max 3 requests in 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentRequests = await db.otpVerification.count({
      where: {
        phone: normalizedPhone,
        createdAt: { gte: fiveMinutesAgo },
      },
    });

    if (recentRequests >= 4) {
      return NextResponse.json(
        {
          error:
            "Too many OTP requests. Please wait a few minutes before trying again for security.",
        },
        { status: 429 }
      );
    }

    // For LOGIN purpose, check if user exists
    if (purpose === "LOGIN") {
      const existingUser = await db.user.findFirst({
        where: {
          OR: [
            { phone: normalizedPhone },
            { phone: normalizedPhone.replace("+91", "") },
            { phone: `+91${normalizedPhone.replace("+91", "")}` },
          ],
        },
      });

      if (!existingUser) {
        return NextResponse.json(
          {
            error:
              "No account is registered with this mobile number. Please create an account first.",
          },
          { status: 404 }
        );
      }

      if (!existingUser.isActive) {
        return NextResponse.json(
          { error: "This account has been suspended by administration." },
          { status: 403 }
        );
      }
    }

    // Invalidate prior unverified OTPs for this phone and purpose
    await db.otpVerification.updateMany({
      where: {
        phone: normalizedPhone,
        purpose,
        verified: false,
      },
      data: {
        verified: true, // soft expire
      },
    });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.otpVerification.create({
      data: {
        phone: normalizedPhone,
        otp,
        purpose,
        expiresAt,
        verified: false,
      },
    });

    console.log(`[Work Adda OTP System] Generated OTP ${otp} for ${normalizedPhone} (${purpose})`);

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to ${maskPhoneNumber(normalizedPhone)}`,
      normalizedPhone,
      expiresAt: expiresAt.toISOString(),
      // debugOtp provided for immediate demo/testing convenience
      debugOtp: otp,
    });
  } catch (err: any) {
    console.error("OTP send error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to send verification OTP." },
      { status: 500 }
    );
  }
}
