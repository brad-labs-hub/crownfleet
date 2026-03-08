"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const INSPECTION_ITEMS = [
  "Tires",
  "Lights",
  "Brakes",
  "Fluids",
  "Wipers",
  "Horn",
  "Mirrors",
];

const supabase = createClient();

export default function NewInspectionPage() {
  const params = useParams();
  const vehicleId = params.id as string;
  const [vehicleLabel, setVehicleLabel] = useState("");
  const [results, setResults] = useState<Record<string, boolean>>(
    INSPECTION_ITEMS.reduce((acc, name) => ({ ...acc, [name]: true }), {} as Record<string, boolean>)
  );
  const [notes, setNotes] = useState("");
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

      let photoUrl: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${vehicleId}/inspection-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("receipts")
          .upload(path, file, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(path);
        photoUrl = urlData.publicUrl;
      }

      const resultArray = INSPECTION_ITEMS.map((name) => ({ name, ok: results[name] ?? true }));
      const { error: insertError } = await supabase.from("vehicle_inspections").insert({
        vehicle_id: vehicleId,
        inspected_at: new Date().toISOString(),
        notes: notes || null,
        result: resultArray,
        photo_url: photoUrl,
        created_by: user.id,
      });
      if (insertError) throw insertError;
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
      <h1 className="text-2xl font-bold text-foreground">
        Pre-trip inspection{vehicleLabel ? ` — ${vehicleLabel}` : ""}
      </h1>
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-foreground">Checklist</h2>
          <p className="text-sm text-muted-foreground">Confirm each item is OK before driving.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <ul className="space-y-3">
              {INSPECTION_ITEMS.map((name) => (
                <li key={name} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`item-${name}`}
                    checked={results[name] ?? true}
                    onChange={(e) => setResults((r) => ({ ...r, [name]: e.target.checked }))}
                    className="rounded border-input h-4 w-4"
                  />
                  <Label htmlFor={`item-${name}`} className="font-normal cursor-pointer">
                    {name}
                  </Label>
                </li>
              ))}
            </ul>
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any issues or comments"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="photo">Photo (optional)</Label>
              <Input
                id="photo"
                type="file"
                accept="image/*,.pdf"
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
                {loading ? "Saving…" : "Submit inspection"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
