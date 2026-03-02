"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function NewCarRequestPage() {
  const [vehicleId, setVehicleId] = useState("");
  const [date, setDate] = useState("");
  const [requestedFor, setRequestedFor] = useState("");
  const [notes, setNotes] = useState("");
  const [vehicles, setVehicles] = useState<{ id: string; make: string; model: string; year: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("vehicles")
        .select("id, make, model, year")
        .order("make");
      setVehicles(data ?? []);
    }
    load();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("car_requests").insert({
        vehicle_id: vehicleId,
        requested_by: user.id,
        requested_for: requestedFor || null,
        date,
        notes: notes || null,
        status: "pending",
      });
      if (error) throw error;
      router.push("/driver/requests");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Request a Car</h1>
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Request Details</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="vehicle">Vehicle</Label>
              <select
                id="vehicle"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                required
                className="w-full mt-1 px-4 py-2 border border-neutral-300 rounded-lg text-neutral-900 bg-white"
              >
                <option value="">Select vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.year} {v.make} {v.model}
                  </option>
                ))}
              </select>
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
              <Label htmlFor="requestedFor">Requested For</Label>
              <Input
                id="requestedFor"
                value={requestedFor}
                onChange={(e) => setRequestedFor(e.target.value)}
                placeholder="Name or purpose"
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
                {loading ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
