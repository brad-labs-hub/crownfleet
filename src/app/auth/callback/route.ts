import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type"); // 'invite' | 'recovery' | null (OAuth)

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Invite acceptance → send to reset-password to set their password
      if (type === "invite" || type === "recovery") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }

      // OAuth login (e.g. Microsoft) → check they have a profile (were invited)
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (!profile) {
        // Not invited — sign them out and return to login with error
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${origin}/login?error=no_access`
        );
      }

      const isAdmin = profile.role === "controller" || profile.role === "employee";
      return NextResponse.redirect(
        `${origin}${isAdmin ? "/admin/dashboard" : "/driver/dashboard"}`
      );
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
