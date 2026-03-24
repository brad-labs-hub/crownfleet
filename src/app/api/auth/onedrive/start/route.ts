import { NextRequest, NextResponse } from "next/server";

const ONEDRIVE_STATE_COOKIE = "oauth_onedrive_state";

export async function GET(request: NextRequest) {
  const clientId = process.env.ONEDRIVE_CLIENT_ID ?? process.env.NEXT_PUBLIC_ONEDRIVE_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin}/api/auth/onedrive/callback`;

  if (!clientId) {
    return NextResponse.redirect(new URL("/admin/imports?error=config", request.url));
  }

  const state = crypto.randomUUID();
  const authUrl = new URL("https://login.microsoftonline.com/common/oauth2/v2.0/authorize");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", "Files.Read offline_access");
  authUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authUrl);
  response.cookies.set({
    name: ONEDRIVE_STATE_COOKIE,
    value: state,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
}
