import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("user_profiles")
    .select("id, email, name, role")
    .order("email");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Users</h1>
      <div className="space-y-3">
        {users?.map((u) => (
          <Card key={u.id}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{u.name ?? u.email}</p>
                <p className="text-sm text-muted-foreground">{u.email}</p>
              </div>
              <span className="text-sm px-2 py-1 bg-neutral-100 rounded capitalize">
                {u.role}
              </span>
            </CardContent>
          </Card>
        ))}
        {(!users || users.length === 0) && (
          <p className="text-muted-foreground text-center py-8">No users</p>
        )}
      </div>
    </div>
  );
}
