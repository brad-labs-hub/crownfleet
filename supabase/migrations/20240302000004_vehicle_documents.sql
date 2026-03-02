-- Vehicle documents (maintenance, misc, inspection, title) - flexible docs per vehicle
CREATE TABLE vehicle_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  title TEXT NOT NULL,
  document_url TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vehicle_documents_vehicle ON vehicle_documents(vehicle_id);

ALTER TABLE vehicle_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vehicle documents: admin" ON vehicle_documents FOR ALL USING (is_admin_role());
CREATE POLICY "Vehicle documents: drivers read" ON vehicle_documents FOR SELECT USING (
  get_user_role() = 'driver' AND
  vehicle_id IN (SELECT id FROM vehicles WHERE location_id IS NULL OR driver_can_access_location(location_id))
);
