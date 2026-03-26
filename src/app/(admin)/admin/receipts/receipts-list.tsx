"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
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
            <CardContent className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div className="min-w-0 flex-1">
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6 sm:shrink-0 sm:border-l sm:border-border sm:pl-6">
                <p className="font-semibold text-foreground tabular-nums text-right text-lg sm:text-base sm:min-w-[6.5rem] sm:pt-0">
                  {formatCurrency(Number(r.amount))}
                </p>
                <div
                  className="flex flex-wrap items-center justify-end gap-2 sm:justify-start"
                  role="group"
                  aria-label="Receipt actions"
                >
                  {r.document_url && (
                    <Button variant="outline" size="sm" className="gap-1.5" asChild>
                      <a href={r.document_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        Document
                      </a>
                    </Button>
                  )}
                  <Link href={`/admin/receipts/${r.id}/edit`} className="cursor-pointer">
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
