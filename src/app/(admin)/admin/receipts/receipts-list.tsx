"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, formatCurrency } from "@/lib/utils";

type ReceiptRow = {
  id: string;
  category: string;
  amount: number;
  date: string;
  vendor: string | null;
  document_url: string | null;
  vehicle_id: string | null;
  location_id: string | null;
  vehicle?: { id: string; make: string; model: string; year: number } | { id: string; make: string; model: string; year: number }[] | null;
  location?: { id: string; name: string } | { id: string; name: string }[] | null;
};

export type { ReceiptRow };

type VehicleRow = { id: string; make: string; model: string; year: number };

export function ReceiptsList({
  receipts,
  vehicles,
}: {
  receipts: ReceiptRow[];
  vehicles: VehicleRow[];
}) {
  const router = useRouter();
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return receipts.filter((r) => {
      if (vehicleFilter && r.vehicle_id !== vehicleFilter) return false;
      if (categoryFilter && r.category !== categoryFilter) return false;
      if (dateFrom && r.date < dateFrom) return false;
      if (dateTo && r.date > dateTo) return false;
      return true;
    });
  }, [receipts, vehicleFilter, categoryFilter, dateFrom, dateTo]);

  async function handleDelete(r: ReceiptRow) {
    if (!confirm(`Delete this receipt (${formatCurrency(Number(r.amount))} on ${formatDate(r.date)})?`)) return;
    setDeletingId(r.id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("receipts").delete().eq("id", r.id);
      if (error) throw error;
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  const categories = Array.from(new Set(receipts.map((r) => r.category))).sort();

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="filter-vehicle" className="text-xs text-muted-foreground">Vehicle</Label>
              <select
                id="filter-vehicle"
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground"
              >
                <option value="">All</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.year} {v.make} {v.model}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="filter-category" className="text-xs text-muted-foreground">Category</Label>
              <select
                id="filter-category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground"
              >
                <option value="">All</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="filter-from" className="text-xs text-muted-foreground">Date from</Label>
              <Input
                id="filter-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="filter-to" className="text-xs text-muted-foreground">Date to</Label>
              <Input
                id="filter-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {filtered.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-4 flex flex-wrap justify-between items-center gap-4">
              <div>
                <p className="font-medium text-foreground capitalize">
                  {r.category?.replace("_", " ")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(r.date)} — {r.vendor ?? "—"}
                </p>
                {(r.vehicle || r.location) && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {r.vehicle && (
                      <span>
                        {Array.isArray(r.vehicle)
                          ? (r.vehicle[0] && `${r.vehicle[0].year} ${r.vehicle[0].make} ${r.vehicle[0].model}`)
                          : `${r.vehicle.year} ${r.vehicle.make} ${r.vehicle.model}`}
                      </span>
                    )}
                    {r.vehicle && r.location && " · "}
                    {r.location && (
                      <span>
                        {Array.isArray(r.location) ? r.location[0]?.name : r.location.name}
                      </span>
                    )}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  {formatCurrency(Number(r.amount))}
                </span>
                {r.document_url && (
                  <a
                    href={r.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    View doc
                  </a>
                )}
                <Link href={`/admin/receipts/${r.id}/edit`}>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDelete(r)}
                  disabled={deletingId === r.id}
                >
                  {deletingId === r.id ? "Deleting…" : "Delete"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-muted-foreground text-center py-8">No receipts match the filters.</p>
        )}
      </div>
    </div>
  );
}
