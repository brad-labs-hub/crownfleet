import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BulkImportForm } from "./bulk-import-form";

export default async function ImportDocumentsPage() {
  const supabase = await createClient();
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, make, model, year")
    .order("make")
    .order("model");

  return (
    <div className="space-y-6">
      <Link
        href="/admin/vehicles"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to vehicles
      </Link>
      <h1 className="text-2xl font-bold text-foreground">Bulk import documents</h1>
      <p className="text-muted-foreground">
        Select a vehicle and document type, then upload multiple PDFs or images. For insurance and registration, you can set metadata once and apply to all files.
      </p>
      <BulkImportForm vehicles={vehicles ?? []} />
    </div>
  );
}
