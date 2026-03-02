import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Car, Receipt, AlertTriangle, Shield,
  Plus, FileDown, ClipboardList, ArrowRight,
} from "lucide-react";
import {
  SpendByCategoryChart,
  MonthlySpendChart,
  PerVehicleChart,
} from "./analytics-charts";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { count: vehicleCount } = await supabase
    .from("vehicles")
    .select("*", { count: "exact", head: true });

  const ytdStart = `${new Date().getFullYear()}-01-01`;
  const { data: receiptSum } = await supabase
    .from("receipts")
    .select("amount")
    .gte("date", ytdStart);
  const totalReceipts = receiptSum?.reduce((s, r) => s + Number(r.amount), 0) ?? 0;

  const in90Days = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  const [expiringInsuranceRes, alertsRes, allReceiptsRes, vehiclesForChartsRes, recentReceiptsRes] =
    await Promise.all([
      supabase
        .from("insurance")
        .select("id, expiry_date, vehicle_id, vehicle:vehicles(id, make, model, year)")
        .lte("expiry_date", in90Days)
        .gte("expiry_date", today)
        .order("expiry_date")
        .limit(5),
      supabase
        .from("maintenance_alerts")
        .select("id, alert_type, due_date, vehicle_id, vehicle:vehicles(id, make, model, year)")
        .eq("dismissed", false)
        .order("due_date")
        .limit(5),
      supabase.from("receipts").select("amount, category, date, vehicle_id").gte("date", ytdStart),
      supabase.from("vehicles").select("id, make, model, year"),
      supabase
        .from("receipts")
        .select("id, amount, category, date, vendor")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const expiringInsurance = expiringInsuranceRes.data ?? [];
  const alerts = alertsRes.data ?? [];
  const allReceipts = allReceiptsRes.data ?? [];

  // Analytics data
  const categoryMap = new Map<string, number>();
  allReceipts.forEach((r) => {
    const cat = r.category ?? "other";
    categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + Number(r.amount));
  });
  const categoryData = Array.from(categoryMap.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  const monthMap = new Map<string, number>();
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
    monthMap.set(key, 0);
  }
  allReceipts.forEach((r) => {
    const d = new Date(r.date);
    const key = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
    if (monthMap.has(key)) monthMap.set(key, (monthMap.get(key) ?? 0) + Number(r.amount));
  });
  const monthlyData = Array.from(monthMap.entries()).map(([month, total]) => ({ month, total }));

  const vehicles = vehiclesForChartsRes.data ?? [];
  const vehicleMap = new Map<string, number>();
  allReceipts.forEach((r) => {
    if (!r.vehicle_id) return;
    vehicleMap.set(r.vehicle_id, (vehicleMap.get(r.vehicle_id) ?? 0) + Number(r.amount));
  });
  const vehicleData = Array.from(vehicleMap.entries())
    .map(([vid, total]) => {
      const v = vehicles.find((vv) => vv.id === vid);
      return { name: v ? `${v.year} ${v.make} ${v.model}` : "Unknown", total };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{todayLabel}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/receipts/new">
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Receipt
            </Button>
          </Link>
          <Link href="/admin/vehicles/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Vehicle
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/vehicles">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-0 bg-indigo-50 dark:bg-indigo-950/40">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Vehicles</span>
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/60 rounded-lg">
                  <Car className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">{vehicleCount ?? 0}</p>
              <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mt-1">in fleet</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/receipts">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-0 bg-emerald-50 dark:bg-emerald-950/40">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Spend (YTD)</span>
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/60 rounded-lg">
                  <Receipt className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{formatCurrency(totalReceipts)}</p>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">since Jan 1</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/vehicles">
          <Card className={`hover:shadow-md transition-shadow cursor-pointer border-0 ${
            alerts.length > 0
              ? "bg-amber-50 dark:bg-amber-950/40"
              : "bg-slate-50 dark:bg-slate-900/40"
          }`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm font-medium ${alerts.length > 0 ? "text-amber-700 dark:text-amber-300" : "text-slate-600 dark:text-slate-400"}`}>
                  Alerts
                </span>
                <div className={`p-2 rounded-lg ${alerts.length > 0 ? "bg-amber-100 dark:bg-amber-900/60" : "bg-slate-100 dark:bg-slate-800"}`}>
                  <AlertTriangle className={`h-4 w-4 ${alerts.length > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-400"}`} />
                </div>
              </div>
              <p className={`text-3xl font-bold ${alerts.length > 0 ? "text-amber-900 dark:text-amber-100" : "text-slate-700 dark:text-slate-300"}`}>
                {alerts.length}
              </p>
              <p className={`text-xs mt-1 ${alerts.length > 0 ? "text-amber-600/70 dark:text-amber-400/70" : "text-slate-500/70"}`}>
                {alerts.length === 0 ? "all clear" : "need attention"}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card className={`border-0 ${
          expiringInsurance.length > 0
            ? "bg-rose-50 dark:bg-rose-950/40"
            : "bg-slate-50 dark:bg-slate-900/40"
        }`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm font-medium ${expiringInsurance.length > 0 ? "text-rose-700 dark:text-rose-300" : "text-slate-600 dark:text-slate-400"}`}>
                Insurance
              </span>
              <div className={`p-2 rounded-lg ${expiringInsurance.length > 0 ? "bg-rose-100 dark:bg-rose-900/60" : "bg-slate-100 dark:bg-slate-800"}`}>
                <Shield className={`h-4 w-4 ${expiringInsurance.length > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-400"}`} />
              </div>
            </div>
            <p className={`text-3xl font-bold ${expiringInsurance.length > 0 ? "text-rose-900 dark:text-rose-100" : "text-slate-700 dark:text-slate-300"}`}>
              {expiringInsurance.length}
            </p>
            <p className={`text-xs mt-1 ${expiringInsurance.length > 0 ? "text-rose-600/70 dark:text-rose-400/70" : "text-slate-500/70"}`}>
              {expiringInsurance.length === 0 ? "all current" : "expiring in 90 days"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        <Link href="/admin/receipts/new">
          <Card className="hover:bg-accent/60 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                <Receipt className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">New Receipt</p>
                <p className="text-xs text-muted-foreground">Log an expense</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/exports">
          <Card className="hover:bg-accent/60 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                <FileDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Export</p>
                <p className="text-xs text-muted-foreground">QuickBooks / Excel</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/requests">
          <Card className="hover:bg-accent/60 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-violet-100 dark:bg-violet-900/40 rounded-lg">
                <ClipboardList className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Requests</p>
                <p className="text-xs text-muted-foreground">Review car requests</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Alerts & expiring + Recent receipts */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Shield className="h-4 w-4 text-rose-500" />
                Expiring Insurance
              </h2>
              <span className="text-xs text-muted-foreground">90 days</span>
            </div>
          </CardHeader>
          <CardContent>
            {expiringInsurance.length ? (
              <ul className="space-y-2">
                {expiringInsurance.map((i) => {
                  const v = i.vehicle as unknown as { id: string; make: string; model: string; year: number } | null;
                  return (
                    <li key={i.id}>
                      <Link
                        href={v ? `/admin/vehicles/${v.id}` : "#"}
                        className="flex justify-between items-center py-1.5 text-sm hover:bg-muted/50 rounded px-1 -mx-1 group"
                      >
                        <span className="text-foreground group-hover:underline truncate mr-2">
                          {v ? `${v.year} ${v.make} ${v.model}` : "Unknown vehicle"}
                        </span>
                        <span className="text-rose-600 dark:text-rose-400 text-xs whitespace-nowrap shrink-0 font-medium">
                          {formatDate(i.expiry_date)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="py-4 text-center">
                <Shield className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">All policies current</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Maintenance Alerts
            </h2>
          </CardHeader>
          <CardContent>
            {alerts.length ? (
              <ul className="space-y-2">
                {alerts.map((a) => {
                  const v = a.vehicle as unknown as { id: string; make: string; model: string; year: number } | null;
                  return (
                    <li key={a.id}>
                      <Link
                        href={v ? `/admin/vehicles/${v.id}/alerts` : "#"}
                        className="flex justify-between items-center py-1.5 text-sm hover:bg-muted/50 rounded px-1 -mx-1 group"
                      >
                        <span className="text-foreground group-hover:underline truncate mr-2">
                          {v ? `${v.year} ${v.make} ${v.model}` : "Unknown vehicle"}
                        </span>
                        <span className="text-amber-600 dark:text-amber-400 text-xs whitespace-nowrap shrink-0 font-medium">
                          {a.due_date ? formatDate(a.due_date) : a.alert_type}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="py-4 text-center">
                <AlertTriangle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No pending alerts</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Receipt className="h-4 w-4 text-emerald-500" />
                Recent Receipts
              </h2>
              <Link href="/admin/receipts" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentReceiptsRes.data?.length ? (
              <ul className="space-y-2">
                {recentReceiptsRes.data.map((r) => (
                  <li key={r.id} className="flex justify-between items-center py-1.5 text-sm">
                    <div>
                      <p className="text-foreground capitalize font-medium">
                        {r.category?.replace(/_/g, " ")}
                      </p>
                      {r.vendor && <p className="text-xs text-muted-foreground">{r.vendor}</p>}
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-foreground font-semibold">{formatCurrency(Number(r.amount))}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(r.date)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-4 text-center">
                <Receipt className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No receipts yet</p>
                <Link href="/admin/receipts/new" className="text-xs text-primary hover:underline mt-1 inline-block">
                  Add the first one →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analytics section */}
      <div className="flex items-center gap-3 pt-2">
        <h2 className="text-lg font-semibold text-foreground">Analytics</h2>
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">Year to date</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <h3 className="font-semibold text-foreground">Spend by Category</h3>
          </CardHeader>
          <CardContent>
            <SpendByCategoryChart data={categoryData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <h3 className="font-semibold text-foreground">Monthly Spend</h3>
          </CardHeader>
          <CardContent>
            <MonthlySpendChart data={monthlyData} />
          </CardContent>
        </Card>
      </div>

      {vehicleData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <h3 className="font-semibold text-foreground">Top Vehicles by Spend</h3>
          </CardHeader>
          <CardContent>
            <PerVehicleChart data={vehicleData} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
