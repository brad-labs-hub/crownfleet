-- Simple pre-trip inspection records (checklist: items as JSONB)
CREATE TABLE IF NOT EXISTS vehicle_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE POLICY "Vehicle inspections: admin full access" ON vehicle_inspections
  FOR ALL USING (is_admin_role());

CREATE POLICY "Vehicle inspections: drivers insert" ON vehicle_inspections
  FOR INSERT WITH CHECK (
    get_user_role() = 'driver' AND created_by = auth.uid()
    AND vehicle_id IN (SELECT id FROM vehicles WHERE location_id IS NULL OR driver_can_access_location(location_id))
  );

CREATE POLICY "Vehicle inspections: drivers read" ON vehicle_inspections
  FOR SELECT USING (
    get_user_role() = 'driver'
    AND vehicle_id IN (SELECT id FROM vehicles WHERE location_id IS NULL OR driver_can_access_location(location_id))
  );
