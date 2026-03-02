"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

type InsuranceRow = { id: string; provider: string; policy_number: string | null; expiry_date: string; document_url: string | null };
type RegistrationRow = { id: string; state: string; expiry_date: string; document_url: string | null };
type VehicleDocRow = { id: string; doc_type: string; title: string; document_url: string; notes: string | null; created_at: string };

export function InsuranceList({ items }: { items: InsuranceRow[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this insurance record?")) return;
    setDeletingId(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("insurance").delete().eq("id", id);
      if (error) throw error;
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <ul className="space-y-2 text-sm">
      {items.map((i) => (
        <li key={i.id} className="flex items-center justify-between gap-2">
          <span className="text-foreground">
            {i.provider}
            {i.policy_number && ` — ${i.policy_number}`}
            <span className="text-muted-foreground ml-1">(expires {formatDate(i.expiry_date)})</span>
          </span>
          <span className="flex items-center gap-2">
            {i.document_url && (
              <a href={i.document_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground underline">
                View
              </a>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => handleDelete(i.id)}
              disabled={deletingId === i.id}
            >
              {deletingId === i.id ? "…" : "Delete"}
            </Button>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function RegistrationsList({ items }: { items: RegistrationRow[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this registration record?")) return;
    setDeletingId(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("registrations").delete().eq("id", id);
      if (error) throw error;
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <ul className="space-y-2 text-sm">
      {items.map((r) => (
        <li key={r.id} className="flex items-center justify-between gap-2">
          <span className="text-foreground">
            {r.state} <span className="text-muted-foreground">(expires {formatDate(r.expiry_date)})</span>
          </span>
          <span className="flex items-center gap-2">
            {r.document_url && (
              <a href={r.document_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground underline">
                View
              </a>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => handleDelete(r.id)}
              disabled={deletingId === r.id}
            >
              {deletingId === r.id ? "…" : "Delete"}
            </Button>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function VehicleDocumentsList({ items }: { items: VehicleDocRow[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this document?")) return;
    setDeletingId(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("vehicle_documents").delete().eq("id", id);
      if (error) throw error;
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <ul className="space-y-2 text-sm">
      {items.map((d) => (
        <li key={d.id} className="flex items-center justify-between gap-2">
          <span className="text-foreground">
            {d.title}
            <span className="text-muted-foreground ml-1 capitalize">({d.doc_type})</span>
          </span>
          <span className="flex items-center gap-2">
            <a href={d.document_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground underline">
              View
            </a>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => handleDelete(d.id)}
              disabled={deletingId === d.id}
            >
              {deletingId === d.id ? "…" : "Delete"}
            </Button>
          </span>
        </li>
      ))}
    </ul>
  );
}
