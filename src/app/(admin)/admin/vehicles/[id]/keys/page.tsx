"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const supabase = createClient();

const KEY_TYPES = ["primary", "spare", "valet"];

export default function VehicleKeysPage() {
  const params = useParams();
  const vehicleId = params.id as string;
  const [keys, setKeys] = useState<{ id: string; key_type: string; location: string | null; notes: string | null }[]>([]);
  const [keyType, setKeyType] = useState("primary");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("keys")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .order("key_type");
    setKeys(data ?? []);
  }, [vehicleId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await supabase.from("keys").insert({
      vehicle_id: vehicleId,
      key_type: keyType,
      location: location || null,
      notes: notes || null,
    });
    setLocation("");
    setNotes("");
    setLoading(false);
    router.refresh();
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this key record?")) return;
    setDeletingId(id);
    await supabase.from("keys").delete().eq("id", id);
    setKeys((k) => k.filter((x) => x.id !== id));
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
      <h1 className="text-2xl font-bold text-foreground">Key Inventory</h1>
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-foreground">Add Key</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <Label htmlFor="keyType">Key Type</Label>
              <select
                id="keyType"
                value={keyType}
                onChange={(e) => setKeyType(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-input rounded-md bg-background text-foreground"
              >
                {KEY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Key box at 858"
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
            <Button type="submit" disabled={loading}>
              {loading ? "Adding…" : "Add Key"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-foreground">Keys</h2>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {keys.map((k) => (
              <li
                key={k.id}
                className="flex justify-between items-center py-2 border-b border-border last:border-0"
              >
                <div>
                  <span className="font-medium text-foreground capitalize">{k.key_type}</span>
                  {k.location && (
                    <span className="text-muted-foreground ml-2">— {k.location}</span>
                  )}
                  {k.notes && (
                    <p className="text-xs text-muted-foreground mt-0.5">{k.notes}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDelete(k.id)}
                  disabled={deletingId === k.id}
                >
                  {deletingId === k.id ? "…" : "Remove"}
                </Button>
              </li>
            ))}
            {keys.length === 0 && (
              <p className="text-muted-foreground">No keys recorded</p>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
