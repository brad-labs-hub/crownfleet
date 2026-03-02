"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

const supabase = createClient();

const SEVERITY_STYLES: Record<string, string> = {
  low: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  high: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export default function VehicleAlertsPage() {
  const params = useParams();
  const vehicleId = params.id as string;
  const [alerts, setAlerts] = useState<
    {
      id: string;
      alert_type: string;
      due_date: string | null;
      due_miles: number | null;
      severity: string;
      dismissed: boolean;
    }[]
  >([]);
  const [alertType, setAlertType] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueMiles, setDueMiles] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("maintenance_alerts")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .order("due_date");
    setAlerts(data ?? []);
  }, [vehicleId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await supabase.from("maintenance_alerts").insert({
      vehicle_id: vehicleId,
      alert_type: alertType,
      due_date: dueDate || null,
      due_miles: dueMiles ? parseInt(dueMiles) : null,
      severity,
    });
    setAlertType("");
    setDueDate("");
    setDueMiles("");
    setLoading(false);
    router.refresh();
    await load();
  }

  async function toggleDismissed(id: string, dismissed: boolean) {
    await supabase
      .from("maintenance_alerts")
      .update({ dismissed: !dismissed })
      .eq("id", id);
    setAlerts((a) =>
      a.map((x) => (x.id === id ? { ...x, dismissed: !dismissed } : x))
    );
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this alert?")) return;
    setDeletingId(id);
    await supabase.from("maintenance_alerts").delete().eq("id", id);
    setAlerts((a) => a.filter((x) => x.id !== id));
    setDeletingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/vehicles/${vehicleId}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back
      </Link>
      <h1 className="text-2xl font-bold text-foreground">
        Maintenance Alerts
      </h1>
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-foreground">Add Alert</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <Label htmlFor="alertType">Alert Type</Label>
              <Input
                id="alertType"
                value={alertType}
                onChange={(e) => setAlertType(e.target.value)}
                placeholder="e.g. Oil change, Tire rotation"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dueMiles">Due Miles</Label>
                <Input
                  id="dueMiles"
                  type="number"
                  value={dueMiles}
                  onChange={(e) => setDueMiles(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="severity">Severity</Label>
              <select
                id="severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding…" : "Add Alert"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-foreground">Alerts</h2>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {alerts.map((a) => (
              <li
                key={a.id}
                className={`flex justify-between items-center py-2 border-b border-border last:border-0 ${
                  a.dismissed ? "opacity-50" : ""
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground">{a.alert_type}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                        SEVERITY_STYLES[a.severity] ?? SEVERITY_STYLES.medium
                      }`}
                    >
                      {a.severity}
                    </span>
                  </div>
                  <div className="flex gap-3 text-sm text-muted-foreground">
                    {a.due_date && <span>Due: {formatDate(a.due_date)}</span>}
                    {a.due_miles && <span>@ {a.due_miles.toLocaleString()} mi</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleDismissed(a.id, a.dismissed)}
                  >
                    {a.dismissed ? "Restore" : "Dismiss"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDelete(a.id)}
                    disabled={deletingId === a.id}
                  >
                    {deletingId === a.id ? "…" : "Delete"}
                  </Button>
                </div>
              </li>
            ))}
            {alerts.length === 0 && (
              <p className="text-muted-foreground">No alerts</p>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
