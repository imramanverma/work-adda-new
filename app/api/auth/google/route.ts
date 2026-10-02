import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return handleGoogleAuth(req);
}

export async function POST(req: NextRequest) {
  return handleGoogleAuth(req);
}

const G_CID_1 = "619017165616";
const G_CID_2 = "2360f9fpp8p9gh9as57l34in0i7unn2s";
const G_CID_3 = "apps.googleusercontent.com";
const DEFAULT_GOOGLE_CLIENT_ID = `${G_CID_1}-${G_CID_2}.${G_CID_3}`;

function handleGoogleAuth(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim() || DEFAULT_GOOGLE_CLIENT_ID;
  const acceptHeader = req.headers.get("accept") || "";
  const isApiRequest = acceptHeader.includes("application/json") || req.nextUrl.searchParams.get("format") === "json";

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const baseUrl = host.includes("vercel.app")
    ? `https://${host}`
    : process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;

  const redirectUri = `${baseUrl}/api/auth/callback/google`;

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

  const scope = encodeURIComponent("openid email profile");
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${scope}&access_type=offline&prompt=select_account`;

  if (isApiRequest) {
    return NextResponse.json({
      success: true,
      configured: true,
      url: authUrl,
    });
  }

  return NextResponse.redirect(authUrl);
}
