"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MAINTENANCE_TYPES, type MaintenanceType } from "@/types/database";

const supabase = createClient();

export default function AdminNewMaintenancePage() {
  const params = useParams();
  const vehicleId = params.id as string;
  const [vehicleLabel, setVehicleLabel] = useState("");
  const [type, setType] = useState<MaintenanceType>("oil");
  const [description, setDescription] = useState("");
  const [odometer, setOdometer] = useState("");
  const [cost, setCost] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [vendor, setVendor] = useState("");
  const [nextDueMiles, setNextDueMiles] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const [createFollowUpAlert, setCreateFollowUpAlert] = useState(true);
  const [status, setStatus] = useState<"scheduled" | "in_progress" | "completed">("completed");
  const [scheduledDate, setScheduledDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase
      .from("vehicles")
      .select("year, make, model")
      .eq("id", vehicleId)
      .single()
      .then(({ data }) => {
        if (data) setVehicleLabel(`${data.year} ${data.make} ${data.model}`);
      });
  }, [vehicleId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let receiptUrl: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() ?? "pdf";
        const path = `${vehicleId}/maintenance-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("receipts")
          .upload(path, file, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(path);
        receiptUrl = urlData.publicUrl;
      }

      const { error: insertError } = await supabase.from("maintenance_records").insert({
        vehicle_id: vehicleId,
        type,
        description: description || null,
        odometer: odometer ? parseInt(odometer) : null,
        cost: cost ? parseFloat(cost) : null,
        date,
        vendor: vendor || null,
        receipt_url: receiptUrl,
        next_due_miles: nextDueMiles ? parseInt(nextDueMiles) : null,
        next_due_date: nextDueDate || null,
        status,
        scheduled_date: scheduledDate || null,
        created_by: user.id,
      });
      if (insertError) throw insertError;

      if (createFollowUpAlert && (nextDueDate || nextDueMiles)) {
        await supabase.from("maintenance_alerts").insert({
          vehicle_id: vehicleId,
          alert_type: type.replace(/_/g, " ") + " (next due)",
          due_date: nextDueDate || null,
          due_miles: nextDueMiles ? parseInt(nextDueMiles) : null,
          severity: "medium",
        });
      }

      router.push(`/admin/vehicles/${vehicleId}`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
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
        Log Maintenance{vehicleLabel ? ` — ${vehicleLabel}` : ""}
      </h1>
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-foreground">Maintenance Details</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as MaintenanceType)}
                className="w-full mt-1 px-4 py-2 border border-input rounded-md bg-background text-foreground"
              >
                {MAINTENANCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Oil change, filter replacement"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="odometer">Odometer</Label>
                <Input
                  id="odometer"
                  type="number"
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cost">Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as "scheduled" | "in_progress" | "completed")}
                className="w-full mt-1 px-4 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="completed">Completed</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In progress</option>
              </select>
            </div>
            {(status === "scheduled" || status === "in_progress") && (
              <div>
                <Label htmlFor="scheduledDate">Scheduled date</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>
            )}
            <div>
              <Label htmlFor="vendor">Vendor</Label>
              <Input
                id="vendor"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="e.g. Jiffy Lube"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nextDueMiles">Next Due (miles)</Label>
                <Input
                  id="nextDueMiles"
                  type="number"
                  value={nextDueMiles}
                  onChange={(e) => setNextDueMiles(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="nextDueDate">Next Due (date)</Label>
                <Input
                  id="nextDueDate"
                  type="date"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                />
              </div>
            </div>
            {(nextDueDate || nextDueMiles) && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="createFollowUpAlert"
                  checked={createFollowUpAlert}
                  onChange={(e) => setCreateFollowUpAlert(e.target.checked)}
                  className="rounded border-input"
                />
                <Label htmlFor="createFollowUpAlert" className="font-normal text-sm text-muted-foreground">
                  Create follow-up maintenance alert from next due date/miles
                </Label>
              </div>
            )}
            <div>
              <Label htmlFor="receiptFile">Receipt / document (optional)</Label>
              <Input
                id="receiptFile"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="mt-1"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving…" : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
