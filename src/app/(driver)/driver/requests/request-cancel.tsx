"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const supabase = createClient();

export function DriverRequestCancel({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!confirm("Cancel this request?")) return;
    setLoading(true);
    await supabase
      .from("car_requests")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", requestId);
    router.refresh();
    setLoading(false);
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      onClick={handleCancel}
      disabled={loading}
    >
      {loading ? "…" : "Cancel"}
    </Button>
  );
}
