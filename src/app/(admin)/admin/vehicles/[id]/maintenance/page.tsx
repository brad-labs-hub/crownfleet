import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDate, formatCurrency } from "@/lib/utils";
import { FileText, ExternalLink } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  completed:   "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  scheduled:   "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
};

const STATUS_LABELS: Record<string, string> = {
  completed:   "Completed",
  scheduled:   "Scheduled",
  in_progress: "In Progress",
};

type MaintenanceRecord = {
  id: string;
  type: string;
  description: string | null;
  date: string;
  cost: number | null;
  odometer: number | null;
  vendor: string | null;
  status: string | null;
  scheduled_date: string | null;
  next_due_date: string | null;
  next_due_miles: number | null;
  receipt_url: string | null;
};

export default async function MaintenanceListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [vehicleRes, recordsRes] = await Promise.all([
    supabase.from("vehicles").select("id, year, make, model").eq("id", id).single(),
    supabase
      .from("maintenance_records")
      .select("id, type, description, date, cost, odometer, vendor, status, scheduled_date, next_due_date, next_due_miles, receipt_url")
      .eq("vehicle_id", id)
      .order("date", { ascending: false }),
  ]);

  if (vehicleRes.error || !vehicleRes.data) notFound();

  const vehicle = vehicleRes.data;
  const records: MaintenanceRecord[] = recordsRes.data ?? [];

  const totalCost = records.reduce((sum, r) => sum + Number(r.cost ?? 0), 0);
  const withDocs = records.filter((r) => r.receipt_url).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link
            href={`/admin/vehicles/${id}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← {vehicle.year} {vehicle.make} {vehicle.model}
          </Link>
          <h1 className="text-2xl font-bold text-foreground mt-1">Maintenance records</h1>
        </div>
        <Link href={`/admin/vehicles/${id}/maintenance/new`}>
          <Button>Add maintenance</Button>
        </Link>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total records</p>
            <p className="text-2xl font-bold text-foreground">{records.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total cost</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalCost)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">With documents</p>
            <p className="text-2xl font-bold text-foreground">{withDocs}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-foreground">All records</h2>
        </CardHeader>
        <CardContent className="p-0">
          {records.length === 0 ? (
            <p className="text-muted-foreground text-sm px-6 py-4">No maintenance records yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {records.map((m) => {
                const status = m.status ?? "completed";
                return (
                  <li key={m.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      {/* Type + status badge */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground capitalize text-sm">
                          {m.type.replace(/_/g, " ")}
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[status] ?? ""}`}>
                          {STATUS_LABELS[status] ?? status}
                        </span>
                      </div>

                      {/* Date + vendor */}
                      <p className="text-sm text-muted-foreground">
                        {formatDate(m.date)}
                        {m.vendor && <span> · {m.vendor}</span>}
                        {m.odometer && <span> · {m.odometer.toLocaleString()} mi</span>}
                      </p>

                      {/* Description */}
                      {m.description && (
                        <p className="text-sm text-foreground">{m.description}</p>
                      )}

                      {/* Scheduled date */}
                      {m.scheduled_date && status !== "completed" && (
                        <p className="text-xs text-muted-foreground">
                          Scheduled: {formatDate(m.scheduled_date)}
                        </p>
                      )}

                      {/* Next due */}
                      {(m.next_due_date || m.next_due_miles) && (
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          Next due
                          {m.next_due_date && `: ${formatDate(m.next_due_date)}`}
                          {m.next_due_miles && ` · ${m.next_due_miles.toLocaleString()} mi`}
                        </p>
                      )}
                    </div>

                    {/* Right side: cost + doc link */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 shrink-0">
                      <span className="text-sm font-medium text-foreground">
                        {m.cost != null ? formatCurrency(m.cost) : <span className="text-muted-foreground">—</span>}
                      </span>
                      {m.receipt_url ? (
                        <a
                          href={m.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          <FileText className="w-3 h-3" />
                          View document
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">No document</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
