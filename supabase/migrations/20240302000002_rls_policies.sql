-- Enable RLS on all tables
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE tire_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE fluid_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM user_profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: is user controller?
CREATE OR REPLACE FUNCTION is_controller()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() = 'controller'
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: is user employee or controller?
CREATE OR REPLACE FUNCTION is_admin_role()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() IN ('employee', 'controller')
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: can driver access location?
CREATE OR REPLACE FUNCTION driver_can_access_location(loc_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM driver_locations
    WHERE user_id = auth.uid() AND location_id = loc_id
  ) OR get_user_role() IN ('employee', 'controller')
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- LOCATIONS: Controllers/employees see all; drivers see assigned
CREATE POLICY "Locations: admin full access" ON locations
  FOR ALL USING (is_admin_role());

CREATE POLICY "Locations: drivers see assigned" ON locations
  FOR SELECT USING (
    get_user_role() = 'driver' AND
    id IN (SELECT location_id FROM driver_locations WHERE user_id = auth.uid())
  );

-- USER_PROFILES: Users can read own; controllers can manage
CREATE POLICY "User profiles: read own" ON user_profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "User profiles: controller manage" ON user_profiles
  FOR ALL USING (is_controller());

-- DRIVER_LOCATIONS: Controllers manage
CREATE POLICY "Driver locations: controller manage" ON driver_locations
  FOR ALL USING (is_controller());

CREATE POLICY "Driver locations: read own" ON driver_locations
  FOR SELECT USING (user_id = auth.uid());

-- VEHICLES: Admin full; drivers read/write at assigned locations
CREATE POLICY "Vehicles: admin full access" ON vehicles
  FOR ALL USING (is_admin_role());

CREATE POLICY "Vehicles: drivers at assigned locations" ON vehicles
  FOR ALL USING (
    get_user_role() = 'driver' AND
    (location_id IS NULL OR driver_can_access_location(location_id))
  );

-- Vehicle-related tables: same pattern - admin full, drivers via vehicle access
CREATE POLICY "Vehicle apps: admin" ON vehicle_apps FOR ALL USING (is_admin_role());
CREATE POLICY "Vehicle apps: drivers" ON vehicle_apps FOR ALL USING (
  get_user_role() = 'driver' AND
  vehicle_id IN (
    SELECT id FROM vehicles WHERE location_id IS NULL OR driver_can_access_location(location_id)
  )
);

CREATE POLICY "Maintenance records: admin" ON maintenance_records FOR ALL USING (is_admin_role());
CREATE POLICY "Maintenance records: drivers" ON maintenance_records FOR ALL USING (
  get_user_role() = 'driver' AND
  vehicle_id IN (
    SELECT id FROM vehicles WHERE location_id IS NULL OR driver_can_access_location(location_id)
  )
);

CREATE POLICY "Insurance: admin" ON insurance FOR ALL USING (is_admin_role());
CREATE POLICY "Insurance: drivers read" ON insurance FOR SELECT USING (
  get_user_role() = 'driver' AND
  vehicle_id IN (
    SELECT id FROM vehicles WHERE location_id IS NULL OR driver_can_access_location(location_id)
  )
);

CREATE POLICY "Registrations: admin" ON registrations FOR ALL USING (is_admin_role());
CREATE POLICY "Registrations: drivers read" ON registrations FOR SELECT USING (
  get_user_role() = 'driver' AND
  vehicle_id IN (
    SELECT id FROM vehicles WHERE location_id IS NULL OR driver_can_access_location(location_id)
  )
);

CREATE POLICY "Keys: admin" ON keys FOR ALL USING (is_admin_role());
CREATE POLICY "Keys: drivers read" ON keys FOR SELECT USING (
  get_user_role() = 'driver' AND
  vehicle_id IN (
    SELECT id FROM vehicles WHERE location_id IS NULL OR driver_can_access_location(location_id)
  )
);

CREATE POLICY "Tire records: admin" ON tire_records FOR ALL USING (is_admin_role());
CREATE POLICY "Tire records: drivers" ON tire_records FOR ALL USING (
  get_user_role() = 'driver' AND
  vehicle_id IN (
    SELECT id FROM vehicles WHERE location_id IS NULL OR driver_can_access_location(location_id)
  )
);

CREATE POLICY "Fluid checks: admin" ON fluid_checks FOR ALL USING (is_admin_role());
CREATE POLICY "Fluid checks: drivers" ON fluid_checks FOR ALL USING (
  get_user_role() = 'driver' AND
  vehicle_id IN (
    SELECT id FROM vehicles WHERE location_id IS NULL OR driver_can_access_location(location_id)
  )
);

CREATE POLICY "Maintenance alerts: admin" ON maintenance_alerts FOR ALL USING (is_admin_role());
CREATE POLICY "Maintenance alerts: drivers read" ON maintenance_alerts FOR SELECT USING (
  get_user_role() = 'driver' AND
  vehicle_id IN (
    SELECT id FROM vehicles WHERE location_id IS NULL OR driver_can_access_location(location_id)
  )
);

-- Car requests: drivers create/read own; employees approve
CREATE POLICY "Car requests: admin" ON car_requests FOR ALL USING (is_admin_role());
CREATE POLICY "Car requests: drivers create" ON car_requests FOR INSERT WITH CHECK (
  get_user_role() = 'driver' AND requested_by = auth.uid()
);
CREATE POLICY "Car requests: drivers read own" ON car_requests FOR SELECT USING (
  get_user_role() = 'driver' AND requested_by = auth.uid()
);

-- Receipts: drivers create; admin full
CREATE POLICY "Receipts: admin" ON receipts FOR ALL USING (is_admin_role());
CREATE POLICY "Receipts: drivers create" ON receipts FOR INSERT WITH CHECK (
  get_user_role() = 'driver' AND created_by = auth.uid()
);
CREATE POLICY "Receipts: drivers read own" ON receipts FOR SELECT USING (
  get_user_role() = 'driver' AND created_by = auth.uid()
);
