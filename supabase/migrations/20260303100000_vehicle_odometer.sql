-- Current odometer and last updated for mileage tracking
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS current_odometer INTEGER;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS odometer_updated_at TIMESTAMPTZ;
