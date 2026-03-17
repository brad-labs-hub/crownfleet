"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ExportButtonsProps {
  receipts: {
    id: string;
    category: string;
    amount: number;
    date: string;
    vendor: string | null;
    notes: string | null;
    document_url: string | null;
    vehicle: { make: string; model: string; year: number } | null;
  }[];
  vehicles: { id: string; make: string; model: string; year: number }[];
  maintenance: {
    id: string;
    type: string;
    cost: number | null;
    date: string;
    vehicle: { make: string; model: string; year: number } | null;
  }[];
}

export function ExportButtons({
  receipts,
  vehicles,
  maintenance,
}: ExportButtonsProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState<"excel" | "qb" | "accountant" | null>(null);

  const filteredReceipts = receipts.filter((r) => {
    if (!startDate && !endDate) return true;
    const d = r.date;
    if (startDate && d < startDate) return false;
    if (endDate && d > endDate) return false;
    return true;
  });

  async function exportExcel() {
    setLoading("excel");
    try {
      const res = await fetch("/api/export/excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receipts: filteredReceipts,
          vehicles,
          maintenance,
        }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fleet-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Export failed");
    } finally {
      setLoading(null);
    }
  }

  async function exportQuickBooks() {
    setLoading("qb");
    try {
      const res = await fetch("/api/export/quickbooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receipts: filteredReceipts }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fleet-quickbooks-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Export failed");
    } finally {
      setLoading(null);
    }
  }

  async function exportAccountant() {
    setLoading("accountant");
    try {
      const res = await fetch("/api/export/accountant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `accountant-export-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Export failed");
    } finally {
      setLoading(null);
    }
  }

  const withAttachments = filteredReceipts.filter((r) => r.document_url).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        {filteredReceipts.length} receipts in date range
        {withAttachments > 0 && `, ${withAttachments} with attachments`}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={exportExcel}
          disabled={loading !== null}
        >
          {loading === "excel" ? "Exporting..." : "Export to Excel"}
        </Button>
        <Button
          variant="outline"
          onClick={exportQuickBooks}
          disabled={loading !== null}
        >
          {loading === "qb" ? "Exporting..." : "Export to QuickBooks CSV"}
        </Button>
        <Button
          variant="outline"
          onClick={exportAccountant}
          disabled={loading !== null}
        >
          {loading === "accountant"
            ? "Exporting..."
            : "Export transactions + attachments (ZIP)"}
        </Button>
      </div>
    </div>
  );
}
