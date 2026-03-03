import { createClient } from "@/lib/supabase/server";
import { InviteForm, UserList } from "./user-management";
import { Users } from "lucide-react";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const { data: users } = await supabase
    .from("user_profiles")
    .select("id, email, name, role")
    .order("role")
    .order("email");

  const userList = users ?? [];
  const counts = {
    controller: userList.filter((u) => u.role === "controller").length,
    employee: userList.filter((u) => u.role === "employee").length,
    driver: userList.filter((u) => u.role === "driver").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-syne text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Invite users and manage their access roles
          </p>
        </div>
        <InviteForm />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Controllers", count: counts.controller, color: "var(--indigo-soft)", bg: "var(--indigo-dim)" },
          { label: "Employees", count: counts.employee, color: "var(--gold)", bg: "var(--gold-dim)" },
          { label: "Drivers", count: counts.driver, color: "var(--muted-foreground)", bg: "var(--surface2)" },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold font-syne" style={{ color }}>{count}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Microsoft SSO notice */}
      <div className="rounded-2xl border border-[rgba(99,102,241,0.25)] p-4 flex items-start gap-3" style={{ background: "var(--indigo-dim)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--indigo-dim)" }}>
          <Users className="h-4 w-4" style={{ color: "var(--indigo-soft)" }} />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Microsoft SSO is enabled</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Users you invite can log in with their Microsoft identity. Their Microsoft email must match the invited email address.
            To enable SSO, configure the Azure provider in your{" "}
            <a
              href="https://supabase.com/dashboard/project/_/auth/providers"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
              style={{ color: "var(--indigo-soft)" }}
            >
              Supabase Auth settings
            </a>.
          </p>
        </div>
      </div>

      {/* User list */}
      <UserList users={userList} currentUserId={currentUser?.id ?? ""} />
    </div>
  );
}
