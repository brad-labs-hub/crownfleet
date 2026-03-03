import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Key, Droplets, Wrench, AlertTriangle, FileText } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .select(
      `
      *,
      location:locations(*),
      keys(*),
      fluid_checks(*),
      maintenance_records(*),
      maintenance_alerts(*),
      insurance(*),
      registrations(*)
    `
    )
    .eq("id", id)
    .single();

  if (error || !vehicle) notFound();

  const loc = vehicle.location as { name: string; code: string } | null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h1>
          {vehicle.color && (
            <p className="text-muted-foreground">{vehicle.color}</p>
          )}
          {vehicle.license_plate && (
            <p className="text-sm text-muted-foreground">{vehicle.license_plate}</p>
          )}
          {loc && (
            <p className="text-sm text-muted-foreground mt-1">
              Location: {loc.name}
            </p>
          )}
        </div>
        <Link href={`/driver/vehicles/${id}/maintenance/new`}>
          <Button size="sm">Log Maintenance</Button>
        </Link>
      </div>

      {vehicle.maintenance_alerts &&
        (
          vehicle.maintenance_alerts as { dismissed: boolean }[]
        ).filter((a) => !a.dismissed).length > 0 && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader className="pb-2">
              <h2 className="font-semibold flex items-center gap-2 text-amber-800">
                <AlertTriangle className="h-4 w-4" />
                Alerts
              </h2>
            </CardHeader>
            <CardContent className="space-y-1">
              {(
                    vehicle.maintenance_alerts as {
                      id: string;
                      alert_type: string;
                      due_date: string;
                      dismissed: boolean;
                    }[]
                  )
                    .filter((a) => !a.dismissed)
                    .map((a) => (
                    <p key={a.id} className="text-sm">
                        {a.alert_type} — {a.due_date ? formatDate(a.due_date) : "Due"}
                      </p>
                    ))}
            </CardContent>
          </Card>
        )}

      <Card>
        <CardHeader className="pb-2">
          <h2 className="font-semibold flex items-center gap-2 text-foreground">
            Insurance
          </h2>
        </CardHeader>
        <CardContent>
          {(vehicle.insurance as unknown[])?.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {(vehicle.insurance as {
                id: string;
                provider: string;
                policy_number: string | null;
                expiry_date: string;
                document_url: string | null;
              }[]).map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-2">
                  <span className="text-foreground">
                    {i.provider}
                    {i.policy_number && ` — ${i.policy_number}`}
                    <span className="text-muted-foreground ml-1">(expires {formatDate(i.expiry_date)})</span>
                  </span>
                  {i.document_url && (
                    <a
                      href={i.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                      aria-label="View insurance document"
                    >
                      <FileText className="h-4 w-4" />
                      View PDF
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No insurance records</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <h2 className="font-semibold flex items-center gap-2 text-foreground">
            Registrations
          </h2>
        </CardHeader>
        <CardContent>
          {(vehicle.registrations as unknown[])?.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {(vehicle.registrations as {
                id: string;
                state: string;
                expiry_date: string;
                document_url: string | null;
              }[]).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2">
                  <span className="text-foreground">
                    {r.state}
                    <span className="text-muted-foreground ml-1">(expires {formatDate(r.expiry_date)})</span>
                  </span>
                  {r.document_url && (
                    <a
                      href={r.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                      aria-label="View registration document"
                    >
                      <FileText className="h-4 w-4" />
                      View PDF
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No registration records</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <h2 className="font-semibold flex items-center gap-2">
            <Key className="h-4 w-4" />
            Keys
          </h2>
        </CardHeader>
        <CardContent>
          {(vehicle.keys as unknown[])?.length > 0 ? (
            <ul className="space-y-1 text-sm">
              {(vehicle.keys as { id: string; key_type: string; location: string }[]).map(
                (k) => (
                  <li key={k.id}>
                    {k.key_type} — {k.location ?? "—"}
                  </li>
                )
              )}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No keys recorded</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <h2 className="font-semibold flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            Fluid Checks
          </h2>
        </CardHeader>
        <CardContent>
          {(vehicle.fluid_checks as unknown[])?.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {(vehicle.fluid_checks as {
                id: string;
                fluid_type: string;
                level: string;
                last_check_date: string;
              }[]).map((f) => (
                <li key={f.id} className="flex justify-between">
                  <span>{f.fluid_type}</span>
                  <span>
                    {f.level} — {formatDate(f.last_check_date)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No fluid checks</p>
          )}
          <Link href={`/driver/vehicles/${id}/fluids/new`} className="mt-2 block">
            <Button variant="outline" size="sm">
              Add Fluid Check
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <h2 className="font-semibold flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Recent Maintenance
          </h2>
        </CardHeader>
        <CardContent>
          {(vehicle.maintenance_records as unknown[])?.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {(vehicle.maintenance_records as {
                id: string;
                type: string;
                description: string;
                date: string;
                cost: number;
              }[])
                .slice(0, 5)
                .map((m) => (
                  <li key={m.id} className="flex justify-between">
                    <span>
                      {m.type} — {formatDate(m.date)}
                    </span>
                    <span>{m.cost ? formatCurrency(m.cost) : "—"}</span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No maintenance records</p>
          )}
          <Link href={`/driver/vehicles/${id}/maintenance/new`} className="mt-2 block">
            <Button variant="outline" size="sm">
              Log Maintenance
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
