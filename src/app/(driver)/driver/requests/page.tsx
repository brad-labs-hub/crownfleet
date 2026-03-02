import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { DriverRequestCancel } from "./request-cancel";

export default async function CarRequestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: requests } = await supabase
    .from("car_requests")
    .select("id, date, status, requested_for, notes, vehicle:vehicles(make, model, year)")
    .eq("requested_by", user?.id ?? "")
    .order("date", { ascending: false });

  const STATUS_STYLES: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    approved: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    denied: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    completed: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">My Requests</h1>
        <Link href="/driver/requests/new">
          <Button size="sm">New Request</Button>
        </Link>
      </div>
      <div className="space-y-3">
        {requests?.map((r) => {
          const v = r.vehicle as unknown as { make: string; model: string; year: number } | null;
          return (
            <Card key={r.id}>
              <CardContent className="p-4 flex justify-between items-start gap-3">
                <div>
                  {v ? (
                    <p className="font-medium text-foreground">
                      {v.year} {v.make} {v.model}
                    </p>
                  ) : (
                    <p className="font-medium text-foreground">No vehicle specified</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {formatDate(r.date)}{r.requested_for ? ` — ${r.requested_for}` : ""}
                  </p>
                  {r.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{r.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_STYLES[r.status] ?? ""}`}>
                    {r.status}
                  </span>
                  {r.status === "pending" && (
                    <DriverRequestCancel requestId={r.id} />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {(!requests || requests.length === 0) && (
          <p className="text-muted-foreground text-center py-8">No car requests yet</p>
        )}
      </div>
    </div>
  );
}
