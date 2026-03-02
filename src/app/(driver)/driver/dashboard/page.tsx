import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Receipt, Car, Wrench, AlertTriangle } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

export default async function DriverDashboardPage() {
  const supabase = await createClient();
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, make, model, year, location:locations(name)")
    .order("make");
  const { data: alerts } = await supabase
    .from("maintenance_alerts")
    .select("id, alert_type, due_date, vehicle:vehicles(make, model)")
    .eq("dismissed", false)
    .order("due_date", { ascending: true })
    .limit(5);
  const { data: recentReceipts } = await supabase
    .from("receipts")
    .select("id, amount, date, category")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/driver/receipts/new">
          <Button className="w-full h-24 flex flex-col gap-2" size="lg">
            <Receipt className="h-6 w-6" />
            Add Receipt
          </Button>
        </Link>
        <Link href="/driver/vehicles">
          <Button variant="outline" className="w-full h-24 flex flex-col gap-2" size="lg">
            <Car className="h-6 w-6" />
            Vehicles
          </Button>
        </Link>
        <Link href="/driver/requests/new">
          <Button variant="outline" className="w-full h-24 flex flex-col gap-2 col-span-2" size="lg">
            <Wrench className="h-6 w-6" />
            Request a Car
          </Button>
        </Link>
      </div>

      {alerts && alerts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <h2 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Maintenance Alerts
            </h2>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((a) => (
              <div
                key={a.id}
                className="flex justify-between text-sm py-2 border-b border-neutral-100 last:border-0"
              >
                <span>
                  {(a.vehicle as unknown as { make: string; model: string })?.make}{" "}
                  {(a.vehicle as unknown as { make: string; model: string })?.model}
                </span>
                <span className="text-muted-foreground">
                  {a.due_date ? formatDate(a.due_date) : a.alert_type}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <h2 className="font-semibold">Recent Receipts</h2>
        </CardHeader>
        <CardContent>
          {recentReceipts && recentReceipts.length > 0 ? (
            <div className="space-y-2">
              {recentReceipts.map((r) => (
                <Link
                  key={r.id}
                  href={`/driver/receipts/${r.id}`}
                  className="flex justify-between text-sm py-2 border-b border-neutral-100 last:border-0 hover:bg-neutral-50 -mx-2 px-2 rounded"
                >
                  <span className="capitalize">{r.category?.replace("_", " ")}</span>
                  <span>{formatCurrency(Number(r.amount))}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No receipts yet</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <h2 className="font-semibold">Fleet Overview</h2>
        </CardHeader>
        <CardContent>
          {vehicles && vehicles.length > 0 ? (
            <div className="space-y-2">
              {vehicles.slice(0, 5).map((v) => (
                <Link
                  key={v.id}
                  href={`/driver/vehicles/${v.id}`}
                  className="flex justify-between text-sm py-2 border-b border-neutral-100 last:border-0 hover:bg-neutral-50 -mx-2 px-2 rounded"
                >
                  <span>
                    {v.year} {v.make} {v.model}
                  </span>
                  <span className="text-muted-foreground">
                    {(v.location as unknown as { name: string })?.name ?? "—"}
                  </span>
                </Link>
              ))}
              {vehicles.length > 5 && (
                <Link
                  href="/driver/vehicles"
                  className="block text-sm text-muted-foreground hover:text-foreground pt-2"
                >
                  View all {vehicles.length} vehicles →
                </Link>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No vehicles in fleet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
