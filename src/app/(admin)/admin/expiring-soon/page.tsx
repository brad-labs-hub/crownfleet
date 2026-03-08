import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Shield, FileText, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";

const DAYS_AHEAD = 90;

export default async function ExpiringSoonPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const future = new Date(Date.now() + DAYS_AHEAD * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [insuranceRes, registrationsRes, alertsRes] = await Promise.all([
    supabase
      .from("insurance")
      .select("id, provider, expiry_date, document_url, vehicle_id, vehicle:vehicles(id, make, model, year)")
      .gte("expiry_date", today)
      .lte("expiry_date", future)
      .order("expiry_date"),
    supabase
      .from("registrations")
      .select("id, state, expiry_date, document_url, vehicle_id, vehicle:vehicles(id, make, model, year)")
      .gte("expiry_date", today)
      .lte("expiry_date", future)
      .order("expiry_date"),
    supabase
      .from("maintenance_alerts")
      .select("id, alert_type, due_date, vehicle_id, vehicle:vehicles(id, make, model, year)")
      .eq("dismissed", false)
      .lte("due_date", future)
      .order("due_date"),
  ]);

  const insurance = insuranceRes.data ?? [];
  const registrations = registrationsRes.data ?? [];
  const alerts = alertsRes.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Expiring soon</h1>
      <p className="text-sm text-muted-foreground">
        Items expiring or due in the next {DAYS_AHEAD} days. Stay on top of renewals and maintenance.
      </p>

      <div className="grid md:grid-cols-3 gap-5">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Insurance
            </h2>
          </CardHeader>
          <CardContent>
            {insurance.length ? (
              <ul className="space-y-2 text-sm">
                {insurance.map((i) => {
                  const v = i.vehicle as unknown as { id: string; make: string; model: string; year: number } | null;
                  return (
                    <li key={i.id}>
                      <Link
                        href={v ? `/admin/vehicles/${v.id}` : "#"}
                        className="flex justify-between items-center gap-2 py-1.5 rounded-lg hover:bg-accent -mx-2 px-2"
                      >
                        <span className="text-foreground font-medium truncate">
                          {v ? `${v.year} ${v.make} ${v.model}` : "—"}
                        </span>
                        <span className="text-amber-600 dark:text-amber-400 shrink-0 font-medium">
                          {formatDate(i.expiry_date)}
                        </span>
                      </Link>
                      <p className="text-xs text-muted-foreground pl-2">{i.provider}</p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No insurance expiring in the next {DAYS_AHEAD} days</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Registrations
            </h2>
          </CardHeader>
          <CardContent>
            {registrations.length ? (
              <ul className="space-y-2 text-sm">
                {registrations.map((r) => {
                  const v = r.vehicle as unknown as { id: string; make: string; model: string; year: number } | null;
                  return (
                    <li key={r.id}>
                      <Link
                        href={v ? `/admin/vehicles/${v.id}` : "#"}
                        className="flex justify-between items-center gap-2 py-1.5 rounded-lg hover:bg-accent -mx-2 px-2"
                      >
                        <span className="text-foreground font-medium truncate">
                          {v ? `${v.year} ${v.make} ${v.model}` : "—"}
                        </span>
                        <span className="text-amber-600 dark:text-amber-400 shrink-0 font-medium">
                          {formatDate(r.expiry_date)}
                        </span>
                      </Link>
                      <p className="text-xs text-muted-foreground pl-2">{r.state}</p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No registrations expiring in the next {DAYS_AHEAD} days</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Maintenance alerts
            </h2>
          </CardHeader>
          <CardContent>
            {alerts.length ? (
              <ul className="space-y-2 text-sm">
                {alerts.map((a) => {
                  const v = a.vehicle as unknown as { id: string; make: string; model: string; year: number } | null;
                  return (
                    <li key={a.id}>
                      <Link
                        href={v ? `/admin/vehicles/${v.id}/alerts` : "#"}
                        className="flex justify-between items-center gap-2 py-1.5 rounded-lg hover:bg-accent -mx-2 px-2"
                      >
                        <span className="text-foreground font-medium truncate">
                          {v ? `${v.year} ${v.make} ${v.model}` : "—"}
                        </span>
                        <span className="text-amber-600 dark:text-amber-400 shrink-0 font-medium">
                          {a.due_date ? formatDate(a.due_date) : "—"}
                        </span>
                      </Link>
                      <p className="text-xs text-muted-foreground pl-2">{a.alert_type}</p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No maintenance alerts due in the next {DAYS_AHEAD} days</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
