import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

// Temporary diagnostic endpoint — delete after debugging.
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "not authenticated" }, { status: 401 });

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const [profileRes, daRes, dlRes, vehiclesRes] = await Promise.all([
    admin.from("user_profiles").select("role").eq("id", user.id).single(),
    admin.from("driver_assignments").select("vehicle_id").eq("user_id", user.id),
    admin.from("driver_locations").select("location_id").eq("user_id", user.id),
    admin.from("vehicles").select("id, make, model, year, location_id"),
  ]);

  const role = profileRes.data?.role ?? null;
  const driverAssignments = daRes.data ?? [];
  const driverLocations = dlRes.data ?? [];
  const allVehicles = vehiclesRes.data ?? [];

  const assignedVehicleIds = new Set(driverAssignments.map((r) => r.vehicle_id));
  const assignedLocationIds = new Set(driverLocations.map((r) => r.location_id));

  const vehiclesVisibleByAssignment = allVehicles.filter((v) => assignedVehicleIds.has(v.id));
  const vehiclesVisibleByLocation = allVehicles.filter(
    (v) => v.location_id && assignedLocationIds.has(v.location_id)
  );
  const vehiclesWithNoLocation = allVehicles.filter((v) => !v.location_id);

  return NextResponse.json({
    user_id: user.id,
    email: user.email,
    role,
    profile_exists: !!profileRes.data,
    driver_assignments: driverAssignments.length,
    driver_locations: driverLocations.length,
    total_vehicles: allVehicles.length,
    vehicles_with_no_location: vehiclesWithNoLocation.length,
    vehicles_visible_by_assignment: vehiclesVisibleByAssignment.map((v) => `${v.year} ${v.make} ${v.model}`),
    vehicles_visible_by_location: vehiclesVisibleByLocation.map((v) => `${v.year} ${v.make} ${v.model}`),
    fix_needed: role !== "driver"
      ? `role is '${role}' not 'driver'`
      : driverAssignments.length === 0 && driverLocations.length === 0
        ? "no assignments — assign vehicles to this driver in the admin panel"
        : "assignments exist — check RLS migration applied correctly",
  });
}
