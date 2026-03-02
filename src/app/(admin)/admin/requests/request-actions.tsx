"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const supabase = createClient();

export function CarRequestActions({ requestId, status }: { requestId: string; status: string }) {
  const router = useRouter();

  async function updateStatus(newStatus: string) {
    await supabase
      .from("car_requests")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", requestId);
    router.refresh();
  }

  return (
    <div className="flex gap-1 flex-wrap">
      {status === "pending" && (
        <>
          <Button size="sm" onClick={() => updateStatus("approved")}>Approve</Button>
          <Button size="sm" variant="outline" onClick={() => updateStatus("denied")}>Deny</Button>
        </>
      )}
      {(status === "pending" || status === "approved") && (
        <Button size="sm" variant="outline" onClick={() => updateStatus("completed")}>
          Complete
        </Button>
      )}
    </div>
  );
}
