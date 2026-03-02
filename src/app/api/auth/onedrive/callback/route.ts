import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/admin/imports?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/admin/imports?error=no_code", request.url)
    );
  }

  const clientId = process.env.ONEDRIVE_CLIENT_ID;
  const clientSecret = process.env.ONEDRIVE_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin}/api/auth/onedrive/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL("/admin/imports?error=config", request.url)
    );
  }

  const tokenRes = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    return NextResponse.redirect(
      new URL(`/admin/imports?error=${encodeURIComponent(err)}`, request.url)
    );
  }

  const tokens = await tokenRes.json();
  return NextResponse.redirect(
    new URL(
      `/admin/imports?onedrive_connected=1&access_token=${tokens.access_token}`,
      request.url
    )
  );
}
