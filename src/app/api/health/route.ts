import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

async function sendHealthAlert(message: string) {
  const webhookUrl = process.env.ALERT_WEBHOOK_URL;
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "crownfleet-health",
        severity: "error",
        message,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch {
    // Avoid cascading failures in health checks.
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const healthToken = process.env.HEALTHCHECK_TOKEN;
  if (healthToken && authHeader !== `Bearer ${healthToken}`) {
    return NextResponse.json({ status: "unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    await sendHealthAlert("Health check failed: missing Supabase configuration.");
    return NextResponse.json(
      {
        status: "degraded",
        checks: { app: "ok", supabase: "failed", reason: "missing_configuration" },
      },
      { status: 503 }
    );
  }

  const admin = createSupabaseAdmin(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await admin.from("user_profiles").select("id", { count: "exact", head: true });
  if (error) {
    await sendHealthAlert(`Health check failed: ${error.message}`);
    return NextResponse.json(
      { status: "degraded", checks: { app: "ok", supabase: "failed" }, error: error.message },
      { status: 503 }
    );
  }

  return NextResponse.json({
    status: "ok",
    checks: { app: "ok", supabase: "ok" },
    timestamp: new Date().toISOString(),
  });
}
