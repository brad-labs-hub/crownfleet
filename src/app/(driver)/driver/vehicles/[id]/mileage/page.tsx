"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LogMileagePage() {
  const params = useParams();
  const vehicleId = params.id as string;
  const [odometer, setOdometer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const miles = odometer.trim() ? parseInt(odometer, 10) : null;
    if (miles == null || isNaN(miles) || miles < 0) {
      setError("Enter a valid odometer reading (miles).");
      return;
    }
    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from("vehicles")
        .update({
          current_odometer: miles,
          odometer_updated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", vehicleId);
      if (updateError) throw updateError;
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
      <Link href={`/driver/vehicles/${vehicleId}`} className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to vehicle
      </Link>
      <h1 className="text-2xl font-bold text-foreground">Log mileage</h1>
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-foreground">Current odometer</h2>
          <p className="text-sm text-muted-foreground">Enter the current mileage reading from the vehicle.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="odometer">Odometer (miles)</Label>
              <Input
                id="odometer"
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 45230"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
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
