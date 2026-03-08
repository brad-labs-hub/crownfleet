-- Work order lite: status and scheduled date on maintenance
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
