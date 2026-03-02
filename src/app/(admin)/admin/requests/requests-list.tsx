"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { CarRequestActions } from "./request-actions";

type Request = {
  id: string;
  date: string;
  status: string;
  requested_for: string | null;
  notes: string | null;
  vehicle: { make: string; model: string; year: number } | null;
};

const STATUS_TABS = ["all", "pending", "approved", "denied", "completed"] as const;

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  denied: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  completed: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
};

export function RequestsList({ requests }: { requests: Request[] }) {
  const [filter, setFilter] = useState<(typeof STATUS_TABS)[number]>("all");

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);
  const counts = STATUS_TABS.reduce((acc, s) => {
    acc[s] = s === "all" ? requests.length : requests.filter((r) => r.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
              filter === tab
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {tab} {counts[tab] > 0 && <span className="ml-1 opacity-70">({counts[tab]})</span>}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((r) => {
          const v = r.vehicle;
          return (
            <Card key={r.id}>
              <CardContent className="p-4 flex justify-between items-center flex-wrap gap-3">
                <div>
                  {v ? (
                    <p className="font-medium text-foreground">
                      {v.year} {v.make} {v.model}
                    </p>
                  ) : (
                    <p className="font-medium text-foreground">No vehicle specified</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {formatDate(r.date)}{r.requested_for ? ` — ${r.requested_for}` : ""}
                  </p>
                  {r.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{r.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_STYLES[r.status] ?? ""}`}>
                    {r.status}
                  </span>
                  <CarRequestActions requestId={r.id} status={r.status} />
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            No {filter === "all" ? "" : filter} requests
          </p>
        )}
      </div>
    </div>
  );
}
