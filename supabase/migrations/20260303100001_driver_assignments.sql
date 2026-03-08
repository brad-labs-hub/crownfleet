-- Driver-vehicle assignments: optional "my vehicles" for drivers
CREATE TABLE IF NOT EXISTS driver_assignments (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, vehicle_id)
);

CREATE INDEX IF NOT EXISTS idx_driver_assignments_user ON driver_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_driver_assignments_vehicle ON driver_assignments(vehicle_id);

ALTER TABLE driver_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Driver assignments: admin full access" ON driver_assignments
  FOR ALL USING (is_admin_role());

CREATE POLICY "Driver assignments: drivers read own" ON driver_assignments
  FOR SELECT USING (auth.uid() = user_id);
