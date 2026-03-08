"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const supabase = createClient();

type Assigned = { user_id: string; name: string | null; email: string }[];
type Driver = { id: string; name: string | null; email: string }[];

export function VehicleDriverAssignments({
  vehicleId,
  assigned,
  drivers,
}: {
  vehicleId: string;
  assigned: Assigned;
  drivers: Driver;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const assignedIds = new Set(assigned.map((a) => a.user_id));
  const availableDrivers = drivers.filter((d) => !assignedIds.has(d.id));

  async function handleAdd() {
    if (!selectedId) return;
    setLoading(true);
    await supabase.from("driver_assignments").insert({ vehicle_id: vehicleId, user_id: selectedId });
    setSelectedId("");
    router.refresh();
    setLoading(false);
  }

  async function handleRemove(userId: string) {
    setLoading(true);
    await supabase.from("driver_assignments").delete().eq("vehicle_id", vehicleId).eq("user_id", userId);
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-1 text-sm">
        {assigned.map((a) => (
          <li key={a.user_id} className="flex justify-between items-center gap-2">
            <span className="text-foreground">
              {a.name || a.email}
              {a.name && <span className="text-muted-foreground"> ({a.email})</span>}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => handleRemove(a.user_id)}
              disabled={loading}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
      {availableDrivers.length > 0 && (
        <div className="flex flex-wrap items-end gap-2 pt-2 border-t border-border">
          <div className="min-w-[180px]">
            <Label htmlFor="assign-driver" className="text-xs text-muted-foreground">Assign driver</Label>
            <select
              id="assign-driver"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm"
            >
              <option value="">Select driver</option>
              {availableDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name || d.email}
                </option>
              ))}
            </select>
          </div>
          <Button type="button" size="sm" onClick={handleAdd} disabled={!selectedId || loading}>
            Add
          </Button>
        </div>
      )}
      {assigned.length === 0 && availableDrivers.length === 0 && (
        <p className="text-sm text-muted-foreground">No drivers to assign. Add drivers from Users.</p>
      )}
    </div>
  );
}
