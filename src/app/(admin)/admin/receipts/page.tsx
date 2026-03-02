import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ReceiptsList, type ReceiptRow } from "./receipts-list";

export default async function AdminReceiptsPage() {
  const supabase = await createClient();
  const [receiptsRes, vehiclesRes] = await Promise.all([
    supabase
      .from("receipts")
      .select("id, category, amount, date, vendor, document_url, vehicle_id, location_id, vehicle:vehicles(id, make, model, year), location:locations(id, name)")
      .order("date", { ascending: false })
      .limit(200),
    supabase.from("vehicles").select("id, make, model, year").order("make"),
  ]);
  const receipts = (receiptsRes.data ?? []) as ReceiptRow[];
  const vehicles = vehiclesRes.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Receipts</h1>
        <Link href="/admin/receipts/new">
          <Button>Add Receipt</Button>
        </Link>
      </div>
      <ReceiptsList
        receipts={receipts}
        vehicles={vehicles}
      />
    </div>
  );
}
