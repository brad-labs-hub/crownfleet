import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  // Verify the caller is an authenticated controller
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: callerProfile } = await supabase
    .from("user_profiles").select("role").eq("id", user.id).single();
  if (callerProfile?.role !== "controller") {
    return NextResponse.json({ error: "Forbidden — only controllers can invite users" }, { status: 403 });
  }

  const { email, name, role } = await request.json();
  if (!email || !role) {
    return NextResponse.json({ error: "email and role are required" }, { status: 400 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json({ error: "Server misconfiguration: missing service role key" }, { status: 500 });
  }

  const admin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Derive app URL from env var, falling back to the incoming request's origin
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (() => { const u = new URL(request.url); return `${u.protocol}//${u.host}`; })();

  const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { name, role },
    redirectTo: `${appUrl}/auth/callback?type=invite`,
  });

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 400 });
  }

  // Create the user_profiles record immediately so the role is set
  const { error: profileError } = await admin.from("user_profiles").upsert({
    id: inviteData.user.id,
    email: inviteData.user.email,
    name: name ?? null,
    role,
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, userId: inviteData.user.id });
}

export async function DELETE(request: Request) {
  // Delete (revoke) a user — controller only
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: callerProfile } = await supabase
    .from("user_profiles").select("role").eq("id", user.id).single();
  if (callerProfile?.role !== "controller") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await request.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  if (userId === user.id) return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });

  const admin = createSupabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  await admin.from("user_profiles").delete().eq("id", userId);
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  // Update a user's role — controller only
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: callerProfile } = await supabase
    .from("user_profiles").select("role").eq("id", user.id).single();
  if (callerProfile?.role !== "controller") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, role } = await request.json();
  if (!userId || !role) return NextResponse.json({ error: "userId and role required" }, { status: 400 });

  const { error } = await supabase
    .from("user_profiles").update({ role }).eq("id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
