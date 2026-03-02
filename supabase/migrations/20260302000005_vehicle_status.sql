-- Add status column to vehicles table
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'out_of_service', 'in_repair'));
