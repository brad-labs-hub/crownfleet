import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AdminNav } from "./admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "driver";
  const isAdmin = role === "controller" || role === "employee";
  if (!isAdmin) redirect("/driver/dashboard");

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-muted/30 dark:bg-background">
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-2.5">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold text-foreground">
              <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-bold">FM</span>
              </div>
              <span className="hidden sm:inline">Fleet Manager</span>
            </Link>
            <span className="text-border">|</span>
            <Link
              href="/driver/dashboard"
              className="text-xs text-muted-foreground hover:text-foreground border border-border rounded px-2 py-1 transition-colors"
            >
              Driver View
            </Link>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <form action={signOut}>
              <button
                type="submit"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>
      <AdminNav role={role} />
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
