import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Plus } from "lucide-react";

export default async function DriverReceiptsPage() {
  const supabase = await createClient();
  const { data: receipts } = await supabase
    .from("receipts")
    .select("id, amount, date, category, vendor, vehicle:vehicles(make, model, year)")
    .order("date", { ascending: false })
    .limit(100);

  const total = receipts?.reduce((s, r) => s + Number(r.amount), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">My Receipts</h1>
        <Link href="/driver/receipts/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Receipt
          </Button>
        </Link>
      </div>

      {receipts && receipts.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground">
            {receipts.length} receipt{receipts.length !== 1 ? "s" : ""} · Total: {formatCurrency(total)}
          </p>
          <div className="space-y-2">
            {receipts.map((r) => {
              const v = r.vehicle as unknown as { year: number; make: string; model: string } | null;
              return (
                <Link key={r.id} href={`/driver/receipts/${r.id}`}>
                  <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <p className="font-medium text-foreground capitalize">
                            {r.category?.replace(/_/g, " ")}
                          </p>
                          {r.vendor && (
                            <p className="text-sm text-muted-foreground">{r.vendor}</p>
                          )}
                          {v && (
                            <p className="text-xs text-muted-foreground">
                              {v.year} {v.make} {v.model}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="font-semibold text-foreground">{formatCurrency(Number(r.amount))}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{formatDate(r.date)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No receipts yet</p>
          <Link href="/driver/receipts/new">
            <Button>Add your first receipt</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
