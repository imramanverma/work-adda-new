import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return handleGoogleAuth(req);
}

export async function POST(req: NextRequest) {
  return handleGoogleAuth(req);
}

function handleGoogleAuth(req: NextRequest) {
  const clientId = (process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "").trim();
  const acceptHeader = req.headers.get("accept") || "";
  const isApiRequest = acceptHeader.includes("application/json") || req.nextUrl.searchParams.get("format") === "json";

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  
  // Resolve base URL accurately:
  // If running locally, strictly use the actual active host:port to match local dev
  let baseUrl = host.includes("localhost") || host.includes("127.0.0.1")
    ? `http://${host}`.replace(/\/+$/, "")
    : ((process.env.NEXT_PUBLIC_APP_URL || "").trim().replace(/\/+$/, "") || `${proto}://${host}`.replace(/\/+$/, ""));

  const redirectUri = `${baseUrl}/api/auth/callback/google`;
  console.log(`[Google OAuth] Request redirect_uri: ${redirectUri}`);

  if (!clientId) {
    if (isApiRequest) {
      return NextResponse.json({
        success: false,
        configured: false,
        error: "Google OAuth is not configured. Please set GOOGLE_CLIENT_ID in your .env file.",
      });
    }
    return NextResponse.redirect(`${baseUrl}/login?error=google_not_configured`);
  }

  const role = req.nextUrl.searchParams.get("role") || "";
  const redirectTo = req.nextUrl.searchParams.get("redirect") || "";
  const statePayload = JSON.stringify({ role, redirectTo, ts: Date.now() });
  const state = Buffer.from(statePayload).toString("base64url");

  const scope = encodeURIComponent("openid email profile");
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${scope}&access_type=offline&prompt=select_account&state=${encodeURIComponent(
    state
  )}`;

  if (isApiRequest) {
    return NextResponse.json({
      success: true,
      configured: true,
      url: authUrl,
    });
  }

  return NextResponse.redirect(authUrl);
}
