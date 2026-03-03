import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  const isMfaPage = pathname.startsWith("/mfa");
  const isApiRoute = pathname.startsWith("/api/");
  const isCallback = pathname.startsWith("/auth/callback");
  const isPublic = pathname === "/" || isCallback || isAuthPage;

  // ── Not logged in ──────────────────────────────────────────────────────
  if (!user && !isPublic && !isMfaPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ── Logged-in user visiting an auth page → send to dashboard ──────────
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    const { data: profile } = await supabase
      .from("user_profiles").select("role").eq("id", user.id).single();
    const isAdmin = profile?.role === "controller" || profile?.role === "employee";
    url.pathname = isAdmin ? "/admin/dashboard" : "/driver/dashboard";
    return NextResponse.redirect(url);
  }

  // ── MFA enforcement on all protected non-API routes ────────────────────
  if (user && !isPublic && !isMfaPage && !isApiRoute) {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (aal && aal.currentLevel !== "aal2") {
      const url = request.nextUrl.clone();
      const next = encodeURIComponent(pathname);

      if (aal.nextLevel === "aal2") {
        // User has enrolled factors but hasn't verified this session
        url.pathname = "/mfa/verify";
        url.searchParams.set("next", next);
      } else {
        // User hasn't enrolled any MFA factor yet → force setup
        url.pathname = "/mfa/setup";
        url.searchParams.set("next", next);
      }
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
