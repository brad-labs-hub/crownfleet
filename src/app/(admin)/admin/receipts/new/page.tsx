"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RECEIPT_CATEGORIES, type ReceiptCategory } from "@/types/database";
import { Upload, FileText, X } from "lucide-react";

export default function NewReceiptPage() {
  const [category, setCategory] = useState<ReceiptCategory>("gas");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [vendor, setVendor] = useState("");
  const [notes, setNotes] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [vehicles, setVehicles] = useState<{ id: string; make: string; model: string; year: number }[]>([]);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const [vRes, lRes] = await Promise.all([
        supabase.from("vehicles").select("id, make, model, year").order("make"),
        supabase.from("locations").select("id, name").order("name"),
      ]);
      setVehicles(vRes.data ?? []);
      setLocations(lRes.data ?? []);
    }
    load();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let documentUrl: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() ?? "pdf";
        const path = `receipts/${crypto.randomUUID()}-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("receipts")
          .upload(path, file, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(path);
        documentUrl = urlData.publicUrl;
      }
      const { error } = await supabase.from("receipts").insert({
        category,
        amount: parseFloat(amount),
        date,
        vendor: vendor || null,
        notes: notes || null,
        vehicle_id: vehicleId || null,
        location_id: locationId || null,
        document_url: documentUrl,
      });
      if (error) throw error;
      router.push("/admin/receipts");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/admin/receipts" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Receipts
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-foreground">Add Receipt</h1>
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-foreground">Receipt Details</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image upload first — prominent button */}
            <div className="space-y-2">
              <Label className="text-foreground">Receipt image or document</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              {!file ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 py-10 px-4 rounded-xl border-2 border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 hover:border-primary transition-colors text-foreground"
                >
                  <Upload className="w-10 h-10 text-primary" />
                  <span className="font-medium">Click to upload receipt</span>
                  <span className="text-sm text-muted-foreground">PDF, JPG or PNG</span>
                </button>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/30">
                  <FileText className="w-8 h-8 text-primary shrink-0" />
                  <span className="flex-1 truncate text-sm text-foreground font-medium">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setFile(null)}
                    className="shrink-0"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Tag to vehicle or location */}
            <div className="space-y-2">
              <Label className="text-foreground">Tag to vehicle or location</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vehicle" className="text-muted-foreground text-xs">Vehicle (optional)</Label>
                  <select
                    id="vehicle"
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="w-full mt-1 px-4 py-2 border border-input rounded-md bg-background text-foreground"
                  >
                    <option value="">— None —</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.year} {v.make} {v.model}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="location" className="text-muted-foreground text-xs">Location (optional)</Label>
                  <select
                    id="location"
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    className="w-full mt-1 px-4 py-2 border border-input rounded-md bg-background text-foreground"
                  >
                    <option value="">— None —</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ReceiptCategory)}
                className="w-full mt-1 px-4 py-2 border border-input rounded-md bg-background text-foreground"
              >
                {RECEIPT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
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
            </div>
            <div>
              <Label htmlFor="vendor">Vendor</Label>
              <Input
                id="vendor"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="e.g. Shell, Mobil"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving…" : "Save Receipt"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
