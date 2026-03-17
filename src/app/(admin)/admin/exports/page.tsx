import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ExportButtons } from "./export-buttons";

export default async function ExportsPage() {
  const supabase = await createClient();
  const { data: receipts } = await supabase
    .from("receipts")
    .select("*, vehicle:vehicles(make, model, year)")
    .order("date", { ascending: false });
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, make, model, year");
  const { data: maintenance } = await supabase
    .from("maintenance_records")
    .select("*, vehicle:vehicles(make, model, year)");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Export Data</h1>
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-foreground">Accounting Exports</h2>
          <p className="text-sm text-muted-foreground">
            Export receipts and maintenance records. Use transactions + attachments for a ZIP with Excel and receipt PDFs named $[amount] [vendor].pdf.
          </p>
        </CardHeader>
        <CardContent>
          <ExportButtons
            receipts={receipts ?? []}
            vehicles={vehicles ?? []}
            maintenance={maintenance ?? []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
