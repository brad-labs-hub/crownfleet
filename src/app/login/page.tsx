"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const MicrosoftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="9" height="9" fill="#F25022" />
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
  </svg>
);

const ERROR_MESSAGES: Record<string, string> = {
  no_access: "Your Microsoft account hasn't been invited yet. Contact your admin to request access.",
  auth_failed: "Authentication failed. Please try again.",
};

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msLoading, setMsLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (searchParams.get("reset") === "success") setResetSuccess(true);
    const errKey = searchParams.get("error");
    if (errKey && ERROR_MESSAGES[errKey]) setError(ERROR_MESSAGES[errKey]);
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data: profile } = await supabase
        .from("user_profiles").select("role").eq("id", data.user.id).single();
      const isAdmin = profile?.role === "controller" || profile?.role === "employee";
      router.push(isAdmin ? "/admin/dashboard" : "/driver/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  }

  async function handleMicrosoftLogin() {
    setError(null);
    setMsLoading(true);
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        scopes: "email profile openid",
        redirectTo: `${origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setMsLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      <div className="w-full max-w-sm space-y-6">

        {/* Brand */}
        <div className="text-center mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-indigo">
            <span className="text-white font-bold font-syne text-base">FM</span>
          </div>
          <h1 className="text-2xl font-bold font-syne text-foreground">Fleet Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
        </div>

        {resetSuccess && (
          <div className="p-3 rounded-xl text-sm" style={{ background: "var(--emerald-dim)", color: "var(--emerald)" }}>
            Password updated — you can now sign in.
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl border text-sm" style={{ background: "var(--rose-dim)", borderColor: "rgba(244,63,94,0.25)", color: "var(--rose)" }}>
            {error}
          </div>
        )}

        {/* Microsoft SSO */}
        <button
          type="button"
          onClick={handleMicrosoftLogin}
          disabled={msLoading || loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-border bg-card hover:bg-accent text-sm font-medium text-foreground transition-all disabled:opacity-50"
        >
          <MicrosoftIcon />
          {msLoading ? "Redirecting…" : "Continue with Microsoft"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or sign in with email</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Email/password form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-sm"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading || msLoading}
            className="w-full py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, var(--indigo) 0%, var(--violet) 100%)", color: "#fff" }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Access is by invitation only.{" "}
          <Link href="/forgot-password" className="hover:text-foreground underline underline-offset-2">
            Forgot your password?
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">Loading…</div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
