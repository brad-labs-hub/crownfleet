import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDate, formatCurrency } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  out_of_service: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  in_repair: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  out_of_service: "Out of Service",
  in_repair: "In Repair",
};

export default async function AdminVehicleDetailPage({
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
      maintenance_records(*),
      insurance(*),
      registrations(*),
      keys(*)
    `
    )
    .eq("id", id)
    .single();

  if (error || !vehicle) notFound();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>
            {vehicle.status && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[vehicle.status as string] ?? ""}`}>
                {STATUS_LABELS[vehicle.status as string] ?? vehicle.status}
              </span>
            )}
          </div>
          <p className="text-muted-foreground">
            {(vehicle.location as unknown as { name: string })?.name ?? "—"}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href={`/admin/vehicles/${id}/documents`}>
            <Button variant="outline">Documents</Button>
          </Link>
          <Link href={`/admin/vehicles/${id}/keys`}>
            <Button variant="outline">Keys</Button>
          </Link>
          <Link href={`/admin/vehicles/${id}/tires`}>
            <Button variant="outline">Tires</Button>
          </Link>
          <Link href={`/admin/vehicles/${id}/alerts`}>
            <Button variant="outline">Alerts</Button>
          </Link>
          <Link href={`/admin/vehicles/${id}/maintenance/new`}>
            <Button variant="outline">Add Maintenance</Button>
          </Link>
          <Link href={`/admin/vehicles/${id}/edit`}>
            <Button>Edit</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-foreground">Details</h2>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-foreground">
          {vehicle.vin && <p><span className="text-muted-foreground">VIN:</span> {vehicle.vin}</p>}
          {vehicle.license_plate && <p><span className="text-muted-foreground">License:</span> {vehicle.license_plate}</p>}
          {vehicle.color && <p><span className="text-muted-foreground">Color:</span> {vehicle.color}</p>}
          {vehicle.notes && <p><span className="text-muted-foreground">Notes:</span> {vehicle.notes}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-foreground">Insurance</h2>
        </CardHeader>
        <CardContent>
          {(vehicle.insurance as unknown[])?.length ? (
            <ul className="space-y-2 text-sm">
              {(vehicle.insurance as { id: string; provider: string; expiry_date: string }[]).map(
                (i) => (
                  <li key={i.id} className="flex justify-between">
                    <span className="text-foreground">{i.provider}</span>
                    <span className="text-muted-foreground">expires {formatDate(i.expiry_date)}</span>
                  </li>
                )
              )}
            </ul>
          ) : (
            <p className="text-muted-foreground">No insurance records</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-foreground">Registrations</h2>
        </CardHeader>
        <CardContent>
          {(vehicle.registrations as unknown[])?.length ? (
            <ul className="space-y-2 text-sm">
              {(vehicle.registrations as { id: string; state: string; expiry_date: string }[]).map(
                (r) => (
                  <li key={r.id} className="flex justify-between">
                    <span className="text-foreground">{r.state}</span>
                    <span className="text-muted-foreground">expires {formatDate(r.expiry_date)}</span>
                  </li>
                )
              )}
            </ul>
          ) : (
            <p className="text-muted-foreground">No registration records</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-foreground">Maintenance</h2>
          </div>
        </CardHeader>
        <CardContent>
          {(vehicle.maintenance_records as unknown[])?.length ? (
            <ul className="space-y-2 text-sm">
              {(vehicle.maintenance_records as {
                id: string;
                type: string;
                date: string;
                cost: number;
              }[]).map((m) => (
                <li key={m.id} className="flex justify-between">
                  <span className="text-foreground capitalize">{m.type.replace("_", " ")} — {formatDate(m.date)}</span>
                  <span className="text-muted-foreground">{m.cost ? formatCurrency(m.cost) : "—"}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No maintenance records</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
