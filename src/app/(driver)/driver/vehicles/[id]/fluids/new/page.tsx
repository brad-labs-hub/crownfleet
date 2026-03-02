"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const FLUID_TYPES = ["oil", "coolant", "brake", "washer", "transmission", "power_steering", "other"];

export default function NewFluidCheckPage() {
  const params = useParams();
  const vehicleId = params.id as string;
  const [fluidType, setFluidType] = useState("oil");
  const [level, setLevel] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("fluid_checks").insert({
        vehicle_id: vehicleId,
        fluid_type: fluidType,
        level: level || null,
        last_check_date: date,
        notes: notes || null,
        created_by: user.id,
      });
      if (error) throw error;
      router.push(`/driver/vehicles/${vehicleId}`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Add Fluid Check</h1>
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Fluid Check Details</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fluidType">Fluid Type</Label>
              <select
                id="fluidType"
                value={fluidType}
                onChange={(e) => setFluidType(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-neutral-300 rounded-lg text-neutral-900 bg-white"
              >
                {FLUID_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="level">Level</Label>
              <Input
                id="level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder="e.g. Full, Low, OK"
              />
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
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
