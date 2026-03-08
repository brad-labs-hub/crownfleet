-- Fleetio updates only: run this in Supabase Dashboard → SQL Editor
-- (Odometer, driver assignments, vehicle inspections, maintenance status)

-- 1. Vehicle odometer
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS current_odometer INTEGER;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS odometer_updated_at TIMESTAMPTZ;

-- 2. Driver-vehicle assignments
CREATE TABLE IF NOT EXISTS driver_assignments (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, vehicle_id)
);
CREATE INDEX IF NOT EXISTS idx_driver_assignments_user ON driver_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_driver_assignments_vehicle ON driver_assignments(vehicle_id);
ALTER TABLE driver_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Driver assignments: admin full access" ON driver_assignments;
CREATE POLICY "Driver assignments: admin full access" ON driver_assignments FOR ALL USING (is_admin_role());
DROP POLICY IF EXISTS "Driver assignments: drivers read own" ON driver_assignments;
CREATE POLICY "Driver assignments: drivers read own" ON driver_assignments FOR SELECT USING (auth.uid() = user_id);

-- 3. Vehicle inspections
CREATE TABLE IF NOT EXISTS vehicle_inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  inspected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  result JSONB NOT NULL DEFAULT '[]',
  photo_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_vehicle ON vehicle_inspections(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_inspected_at ON vehicle_inspections(inspected_at DESC);
ALTER TABLE vehicle_inspections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Vehicle inspections: admin full access" ON vehicle_inspections;
CREATE POLICY "Vehicle inspections: admin full access" ON vehicle_inspections FOR ALL USING (is_admin_role());
DROP POLICY IF EXISTS "Vehicle inspections: drivers insert" ON vehicle_inspections;
CREATE POLICY "Vehicle inspections: drivers insert" ON vehicle_inspections FOR INSERT WITH CHECK (
  get_user_role() = 'driver' AND created_by = auth.uid()
  AND vehicle_id IN (SELECT id FROM vehicles WHERE location_id IS NULL OR driver_can_access_location(location_id))
);
DROP POLICY IF EXISTS "Vehicle inspections: drivers read" ON vehicle_inspections;
CREATE POLICY "Vehicle inspections: drivers read" ON vehicle_inspections FOR SELECT USING (
  get_user_role() = 'driver'
  AND vehicle_id IN (SELECT id FROM vehicles WHERE location_id IS NULL OR driver_can_access_location(location_id))
);

-- 4. Maintenance status + scheduled_date
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'maintenance_records' AND column_name = 'status'
  ) THEN
    ALTER TABLE maintenance_records ADD COLUMN status TEXT DEFAULT 'completed';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'maintenance_records' AND column_name = 'scheduled_date'
  ) THEN
    ALTER TABLE maintenance_records ADD COLUMN scheduled_date DATE;
  END IF;
END $$;
UPDATE maintenance_records SET status = 'completed' WHERE status IS NULL;
