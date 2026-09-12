import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparePassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { LoginSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.parse(body);
    const { password } = parsed;
    const idInput = (parsed.identifier || parsed.email || parsed.phone || "").trim();

    const isEmail = idInput.includes("@");
    const user = await db.user.findFirst({
      where: isEmail
        ? { email: idInput.toLowerCase() }
        : { phone: idInput },
      include: {
        workerProfile: true,
        employerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email/phone or password" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "This account has been suspended by administration." },
        { status: 403 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid email/phone or password" }, { status: 401 });
    }

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
      message: "Login successful",
      user: sessionUser,
      token,
      redirectUrl:
        user.role === "ADMIN"
          ? "/admin"
          : user.role === "EMPLOYER"
          ? "/employer/dashboard"
          : "/worker/dashboard",
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
    console.error("Login error:", err);
    if (err.errors) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to log in" }, { status: 500 });
  }
}
