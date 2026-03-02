"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const supabase = createClient();

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "out_of_service", label: "Out of Service" },
  { value: "in_repair", label: "In Repair" },
];

export default function NewVehiclePage() {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [vin, setVin] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [color, setColor] = useState("");
  const [notes, setNotes] = useState("");
  const [locationId, setLocationId] = useState("");
  const [status, setStatus] = useState("active");
  const [locations, setLocations] = useState<{ id: string; name: string; code: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadLocations = useCallback(async () => {
    const { data } = await supabase.from("locations").select("id, name, code").order("name");
    setLocations(data ?? []);
  }, []);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.from("vehicles").insert({
        make,
        model,
        year: parseInt(year),
        vin: vin || null,
        license_plate: licensePlate || null,
        color: color || null,
        notes: notes || null,
        location_id: locationId || null,
        status,
      });
      if (error) throw error;
      router.push("/admin/vehicles");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Add Vehicle</h1>
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-foreground">Vehicle Details</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="make">Make</Label>
                <Input id="make" value={make} onChange={(e) => setMake(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="model">Model</Label>
                <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} required />
              </div>
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                min="1900"
                max="2030"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-input rounded-md bg-background text-foreground"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <select
                id="location"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="">— None —</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vin">VIN</Label>
                <Input id="vin" value={vin} onChange={(e) => setVin(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="licensePlate">License Plate</Label>
                <Input id="licensePlate" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Input id="color" value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save Vehicle"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
