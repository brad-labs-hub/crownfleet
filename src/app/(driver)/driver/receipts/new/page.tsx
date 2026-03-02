"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RECEIPT_CATEGORIES, type ReceiptCategory } from "@/types/database";

export default function NewReceiptPage() {
  const [category, setCategory] = useState<ReceiptCategory>("gas");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [vendor, setVendor] = useState("");
  const [notes, setNotes] = useState("");
  const [vehicleId, setVehicleId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
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
        document_url: documentUrl,
        created_by: user.id,
      });
      if (error) throw error;
      router.push("/driver/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Add Receipt</h1>
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Receipt Details</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ReceiptCategory)}
                className="w-full mt-1 px-4 py-2 border border-neutral-300 rounded-lg text-neutral-900 bg-white"
              >
                {RECEIPT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
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
              <Label htmlFor="vehicle">Vehicle (optional)</Label>
              <select
                id="vehicle"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-neutral-300 rounded-lg text-neutral-900 bg-white"
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
              <Label htmlFor="file">Document (optional)</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="mt-1"
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
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : "Save Receipt"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
