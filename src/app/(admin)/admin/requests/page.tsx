import { createClient } from "@/lib/supabase/server";
import { RequestsList } from "./requests-list";

export default async function AdminRequestsPage() {
  const supabase = await createClient();
  const { data: requests } = await supabase
    .from("car_requests")
    .select("id, date, status, requested_for, notes, vehicle:vehicles(make, model, year)")
    .order("date", { ascending: false })
    .limit(200);

  type VehicleShape = { make: string; model: string; year: number };
  const normalized = (requests ?? []).map((r) => ({
    ...r,
    vehicle: Array.isArray(r.vehicle)
      ? (r.vehicle[0] as VehicleShape | null) ?? null
      : (r.vehicle as VehicleShape | null),
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Car Requests</h1>
      </div>
      <RequestsList requests={normalized} />
    </div>
  );
}
