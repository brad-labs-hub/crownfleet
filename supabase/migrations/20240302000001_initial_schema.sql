-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles enum
CREATE TYPE user_role AS ENUM ('driver', 'employee', 'controller');

-- Receipt categories
CREATE TYPE receipt_category AS ENUM (
  'gas', 'detailing', 'parking', 'food', 'miscellaneous',
  'ez_pass', 'auto_supplies', 'maintenance'
);

-- Maintenance types
CREATE TYPE maintenance_type AS ENUM (
  'oil', 'tire_rotation', 'brakes', 'battery', 'inspection',
  'general', 'other'
);

-- Key types
CREATE TYPE key_type AS ENUM ('primary', 'spare', 'valet');

-- Tire types
CREATE TYPE tire_type AS ENUM ('summer', 'winter', 'all_season');

-- Car request status
CREATE TYPE car_request_status AS ENUM ('pending', 'approved', 'denied', 'completed');

-- Locations
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles (extends auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role user_role NOT NULL DEFAULT 'driver',
  assigned_location_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Driver location assignments (for RLS)
CREATE TABLE driver_locations (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, location_id)
);

-- Vehicles
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

-- Vehicle apps
CREATE TABLE vehicle_apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  app_name TEXT NOT NULL,
  credentials_encrypted TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance records
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

-- Insurance
CREATE TABLE insurance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  policy_number TEXT,
  expiry_date DATE NOT NULL,
  document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registrations
CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  state TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Keys
CREATE TABLE keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  key_type key_type NOT NULL,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tire records
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

-- Fluid checks
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

-- Maintenance alerts
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

-- Car requests
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

-- Receipts
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

-- Indexes for common queries
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
CREATE INDEX idx_car_requests_status ON car_requests(status);
CREATE INDEX idx_car_requests_date ON car_requests(date);

-- Function to create user profile on signup
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

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
