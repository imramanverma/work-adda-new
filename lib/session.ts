import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyToken, SessionUser } from "./auth";
import { db } from "./db";

/**
 * Retrieve session user from Next.js server components or Server Actions
 */
export async function getServerSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * Retrieve session user from API Request (supports Cookie or Authorization: Bearer <token>)
 */
export async function getRequestUser(req: Request | NextRequest): Promise<SessionUser | null> {
  try {
    // 1. Check Authorization header
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7).trim();
      const user = verifyToken(token);
      if (user) return user;
    }

    // 2. Check Cookie header
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      const cookiesArr = cookieHeader.split(";");
      for (const c of cookiesArr) {
        const eqIdx = c.indexOf("=");
        if (eqIdx !== -1) {
          const name = c.substring(0, eqIdx).trim();
          const val = c.substring(eqIdx + 1).trim();
          if (name === AUTH_COOKIE_NAME && val) {
            const user = verifyToken(decodeURIComponent(val));
            if (user) return user;
          }
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Helper to ensure the request is authenticated and optionally matches one of the allowed roles
 */
export async function requireAuth(
  req: Request | NextRequest,
  allowedRoles?: ("WORKER" | "EMPLOYER" | "ADMIN" | "BOTH")[]
): Promise<{ user: SessionUser } | { error: NextResponse }> {
  const user = await getRequestUser(req);

  if (!user) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized. Please log in to continue." },
        { status: 401 }
      ),
    };
  }

  // Check if user is active in database
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { isActive: true, role: true },
  });

  if (!dbUser || !dbUser.isActive) {
    return {
      error: NextResponse.json(
        { error: "Account is inactive or suspended. Please contact support." },
        { status: 403 }
      ),
    };
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const isDirectMatch = allowedRoles.includes(user.role);
    const isDualUserAllowed =
      user.role === "BOTH" &&
      (allowedRoles.includes("WORKER") || allowedRoles.includes("EMPLOYER"));

    if (!isDirectMatch && !isDualUserAllowed) {
      return {
        error: NextResponse.json(
          { error: `Forbidden. This action requires one of the following roles: ${allowedRoles.join(", ")}` },
          { status: 403 }
        ),
      };
    }
  }

  return { user };
}
