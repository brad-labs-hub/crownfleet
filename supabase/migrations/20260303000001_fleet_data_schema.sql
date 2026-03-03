-- Fleet data enrichment schema
-- Adds trim column, expands status values, and creates vehicle_taxes table

-- 1. Add trim column to vehicles
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS trim TEXT;

-- 2. Expand status CHECK constraint to include archived and sold
--    Drop the old constraint and recreate with the full set of values
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_status_check;
ALTER TABLE vehicles ADD CONSTRAINT vehicles_status_check
  CHECK (status IN ('active', 'out_of_service', 'in_repair', 'archived', 'sold'));

-- 3. Annual vehicle tax payment history
CREATE TABLE IF NOT EXISTS vehicle_taxes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,
  amount DECIMAL(12,2),
  paid_date DATE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_taxes_vehicle ON vehicle_taxes(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_taxes_year ON vehicle_taxes(tax_year);

-- RLS
ALTER TABLE vehicle_taxes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vehicle taxes: admin full access" ON vehicle_taxes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('controller', 'employee')
    )
  );
