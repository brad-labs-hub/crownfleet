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

const TIRE_TYPES = ["summer", "winter", "all_season"];

export default function VehicleTiresPage() {
  const params = useParams();
  const vehicleId = params.id as string;
  const [records, setRecords] = useState<
    {
      id: string;
      type: string;
      pressure_front: number | null;
      pressure_rear: number | null;
      last_swap_date: string | null;
      next_swap_date: string | null;
    }[]
  >([]);
  const [type, setType] = useState("all_season");
  const [pressureFront, setPressureFront] = useState("");
  const [pressureRear, setPressureRear] = useState("");
  const [lastSwapDate, setLastSwapDate] = useState("");
  const [nextSwapDate, setNextSwapDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("tire_records")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .order("last_swap_date", { ascending: false });
    setRecords(data ?? []);
  }, [vehicleId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await supabase.from("tire_records").insert({
      vehicle_id: vehicleId,
      type,
      pressure_front: pressureFront ? parseInt(pressureFront) : null,
      pressure_rear: pressureRear ? parseInt(pressureRear) : null,
      last_swap_date: lastSwapDate || null,
      next_swap_date: nextSwapDate || null,
    });
    setPressureFront("");
    setPressureRear("");
    setLastSwapDate("");
    setNextSwapDate("");
    setLoading(false);
    router.refresh();
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this tire record?")) return;
    setDeletingId(id);
    await supabase.from("tire_records").delete().eq("id", id);
    setRecords((r) => r.filter((x) => x.id !== id));
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
        Tire Pressure / Seasonal Swaps
      </h1>
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-foreground">Add Tire Record</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <Label htmlFor="type">Tire Type</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-input rounded-md bg-background text-foreground"
              >
                {TIRE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pressureFront">Pressure Front (psi)</Label>
                <Input
                  id="pressureFront"
                  type="number"
                  value={pressureFront}
                  onChange={(e) => setPressureFront(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="pressureRear">Pressure Rear (psi)</Label>
                <Input
                  id="pressureRear"
                  type="number"
                  value={pressureRear}
                  onChange={(e) => setPressureRear(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lastSwapDate">Last Swap Date</Label>
                <Input
                  id="lastSwapDate"
                  type="date"
                  value={lastSwapDate}
                  onChange={(e) => setLastSwapDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="nextSwapDate">Next Swap Date</Label>
                <Input
                  id="nextSwapDate"
                  type="date"
                  value={nextSwapDate}
                  onChange={(e) => setNextSwapDate(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding…" : "Add Record"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-foreground">Tire Records</h2>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {records.map((r) => (
              <li
                key={r.id}
                className="flex justify-between items-center py-2 border-b border-border last:border-0"
              >
                <div className="space-y-1">
                  <span className="font-medium text-foreground capitalize">{r.type.replace("_", " ")}</span>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {r.pressure_front && <span>Front: {r.pressure_front} psi</span>}
                    {r.pressure_rear && <span>Rear: {r.pressure_rear} psi</span>}
                    {r.last_swap_date && <span>Last swap: {formatDate(r.last_swap_date)}</span>}
                    {r.next_swap_date && (
                      <span className="text-amber-600 dark:text-amber-400">
                        Next swap: {formatDate(r.next_swap_date)}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                  onClick={() => handleDelete(r.id)}
                  disabled={deletingId === r.id}
                >
                  {deletingId === r.id ? "…" : "Delete"}
                </Button>
              </li>
            ))}
            {records.length === 0 && (
              <p className="text-muted-foreground">No tire records</p>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
