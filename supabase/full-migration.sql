-- Fleet Manager - Full Database Setup
-- Run this in Supabase Dashboard → SQL Editor → New Query

-- 1. Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('driver', 'employee', 'controller');
CREATE TYPE receipt_category AS ENUM (
  'gas', 'detailing', 'parking', 'food', 'miscellaneous',
  'ez_pass', 'auto_supplies', 'maintenance'
);
CREATE TYPE maintenance_type AS ENUM (
  'oil', 'tire_rotation', 'brakes', 'battery', 'inspection',
  'general', 'other'
);
CREATE TYPE key_type AS ENUM ('primary', 'spare', 'valet');
CREATE TYPE tire_type AS ENUM ('summer', 'winter', 'all_season');
CREATE TYPE car_request_status AS ENUM ('pending', 'approved', 'denied', 'completed');

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role user_role NOT NULL DEFAULT 'driver',
  assigned_location_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE driver_locations (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, location_id)
);

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  vin TEXT,
  license_plate TEXT,
  color TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vehicle_apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  app_name TEXT NOT NULL,
  credentials_encrypted TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE maintenance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  type maintenance_type NOT NULL,
  description TEXT,
  odometer INTEGER,
  cost DECIMAL(12, 2),
  date DATE NOT NULL,
  vendor TEXT,
  receipt_url TEXT,
  next_due_miles INTEGER,
  next_due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE insurance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  policy_number TEXT,
  expiry_date DATE NOT NULL,
  document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  state TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  key_type key_type NOT NULL,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tire_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  type tire_type NOT NULL,
  pressure_front INTEGER,
  pressure_rear INTEGER,
  last_swap_date DATE,
  next_swap_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fluid_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  fluid_type TEXT NOT NULL,
  level TEXT,
  last_check_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE maintenance_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  due_date DATE,
  due_miles INTEGER,
  severity TEXT DEFAULT 'medium',
  dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE car_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  requested_for TEXT,
  date DATE NOT NULL,
  status car_request_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  category receipt_category NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  date DATE NOT NULL,
  vendor TEXT,
  notes TEXT,
  document_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vehicle_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  title TEXT NOT NULL,
  document_url TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vehicles_location ON vehicles(location_id);
CREATE INDEX idx_maintenance_records_vehicle ON maintenance_records(vehicle_id);
CREATE INDEX idx_maintenance_records_date ON maintenance_records(date);
CREATE INDEX idx_receipts_vehicle ON receipts(vehicle_id);
CREATE INDEX idx_receipts_date ON receipts(date);
CREATE INDEX idx_receipts_category ON receipts(category);
CREATE INDEX idx_insurance_vehicle ON insurance(vehicle_id);
CREATE INDEX idx_insurance_expiry ON insurance(expiry_date);
CREATE INDEX idx_registrations_vehicle ON registrations(vehicle_id);
CREATE INDEX idx_registrations_expiry ON registrations(expiry_date);
CREATE INDEX idx_vehicle_documents_vehicle ON vehicle_documents(vehicle_id);
CREATE INDEX idx_car_requests_status ON car_requests(status);
CREATE INDEX idx_car_requests_date ON car_requests(date);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'driver'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. RLS
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
ALTER TABLE vehicle_documents ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM user_profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_controller()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() = 'controller'
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin_role()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() IN ('employee', 'controller')
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION driver_can_access_location(loc_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM driver_locations
    WHERE user_id = auth.uid() AND location_id = loc_id
  ) OR get_user_role() IN ('employee', 'controller')
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE POLICY "Locations: admin full access" ON locations FOR ALL USING (is_admin_role());
CREATE POLICY "Locations: drivers see assigned" ON locations FOR SELECT USING (
  get_user_role() = 'driver' AND
  id IN (SELECT location_id FROM driver_locations WHERE user_id = auth.uid())
);

CREATE POLICY "User profiles: read own" ON user_profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "User profiles: controller manage" ON user_profiles FOR ALL USING (is_controller());

CREATE POLICY "Driver locations: controller manage" ON driver_locations FOR ALL USING (is_controller());
CREATE POLICY "Driver locations: read own" ON driver_locations FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Vehicles: admin full access" ON vehicles FOR ALL USING (is_admin_role());
CREATE POLICY "Vehicles: drivers at assigned locations" ON vehicles FOR ALL USING (
  get_user_role() = 'driver' AND
  (location_id IS NULL OR driver_can_access_location(location_id))
);

CREATE POLICY "Vehicle apps: admin" ON vehicle_apps FOR ALL USING (is_admin_role());
CREATE POLICY "Vehicle apps: drivers" ON vehicle_apps FOR ALL USING (
  get_user_role() = 'driver' AND
  vehicle_id IN (SELECT id FROM vehicles WHERE location_id IS NULL OR driver_can_access_location(location_id))
);

CREATE POLICY "Maintenance records: admin" ON maintenance_records FOR ALL USING (is_admin_role());
CREATE POLICY "Maintenance records: drivers" ON maintenance_records FOR ALL USING (
  get_user_role() = 'driver' AND
  vehicle_id IN (SELECT id FROM vehicles WHERE location_id IS NULL OR driver_can_access_location(location_id))
);

CREATE POLICY "Insurance: admin" ON insurance FOR ALL USING (is_admin_role());
CREATE POLICY "Insurance: drivers read" ON insurance FOR SELECT USING (
  get_user_role() = 'driver' AND
  vehicle_id IN (SELECT id FROM vehicles WHERE location_id IS NULL OR driver_can_access_location(location_id))
);

CREATE POLICY "Registrations: admin" ON registrations FOR ALL USING (is_admin_role());
CREATE POLICY "Registrations: drivers read" ON registrations FOR SELECT USING (
  get_user_role() = 'driver' AND
  vehicle_id IN (SELECT id FROM vehicles WHERE location_id IS NULL OR driver_can_access_location(location_id))
);

CREATE POLICY "Keys: admin" ON keys FOR ALL USING (is_admin_role());
CREATE POLICY "Keys: drivers read" ON keys FOR SELECT USING (
  get_user_role() = 'driver' AND
  vehicle_id IN (SELECT id FROM vehicles WHERE location_id IS NULL OR driver_can_access_location(location_id))
);

CREATE POLICY "Tire records: admin" ON tire_records FOR ALL USING (is_admin_role());
CREATE POLICY "Tire records: drivers" ON tire_records FOR ALL USING (
  get_user_role() = 'driver' AND
  vehicle_id IN (SELECT id FROM vehicles WHERE location_id IS NULL OR driver_can_access_location(location_id))
);

CREATE POLICY "Fluid checks: admin" ON fluid_checks FOR ALL USING (is_admin_role());
CREATE POLICY "Fluid checks: drivers" ON fluid_checks FOR ALL USING (
  get_user_role() = 'driver' AND
  vehicle_id IN (SELECT id FROM vehicles WHERE location_id IS NULL OR driver_can_access_location(location_id))
);

CREATE POLICY "Maintenance alerts: admin" ON maintenance_alerts FOR ALL USING (is_admin_role());
CREATE POLICY "Maintenance alerts: drivers read" ON maintenance_alerts FOR SELECT USING (
  get_user_role() = 'driver' AND
  vehicle_id IN (SELECT id FROM vehicles WHERE location_id IS NULL OR driver_can_access_location(location_id))
);

CREATE POLICY "Car requests: admin" ON car_requests FOR ALL USING (is_admin_role());
CREATE POLICY "Car requests: drivers create" ON car_requests FOR INSERT WITH CHECK (
  get_user_role() = 'driver' AND requested_by = auth.uid()
);
CREATE POLICY "Car requests: drivers read own" ON car_requests FOR SELECT USING (
  get_user_role() = 'driver' AND requested_by = auth.uid()
);

CREATE POLICY "Receipts: admin" ON receipts FOR ALL USING (is_admin_role());
CREATE POLICY "Receipts: drivers create" ON receipts FOR INSERT WITH CHECK (
  get_user_role() = 'driver' AND created_by = auth.uid()
);
CREATE POLICY "Receipts: drivers read own" ON receipts FOR SELECT USING (
  get_user_role() = 'driver' AND created_by = auth.uid()
);

CREATE POLICY "Vehicle documents: admin" ON vehicle_documents FOR ALL USING (is_admin_role());
CREATE POLICY "Vehicle documents: drivers read" ON vehicle_documents FOR SELECT USING (
  get_user_role() = 'driver' AND
  vehicle_id IN (SELECT id FROM vehicles WHERE location_id IS NULL OR driver_can_access_location(location_id))
);

-- Car requests: drivers need UPDATE for their own? No - only admin approves. But we need drivers to read - we have "read own". Good.
-- Receipts: drivers need to read receipts they created - we have that. But wait - drivers also need to read receipts for vehicles they have access to? The policy says "read own" - so they only see receipts they created. That might be intentional.

-- 3. Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated upload" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Authenticated read" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'receipts');

-- 4. Seed
INSERT INTO locations (code, name, address) VALUES
  ('858', 'New Canaan, CT', 'New Canaan, CT'),
  ('432', '432 Park Avenue', '432 Park Ave, NYC'),
  ('Four Chaise', 'Four Chaise', '163 S Main St, Southampton, NY'),
  ('Pink Chimneys', 'Pink Chimneys', 'Bermuda'),
  ('Chipper', 'Chipper', 'New Canaan, CT')
ON CONFLICT (code) DO NOTHING;
