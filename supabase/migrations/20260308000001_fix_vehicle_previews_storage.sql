-- Fix: ensure vehicle-previews bucket and all required storage RLS policies exist
-- Policies created in migration 20260302100000 may not have applied to the remote database.

INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-previews', 'vehicle-previews', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated upload vehicle-previews" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated read vehicle-previews" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update vehicle-previews" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete vehicle-previews" ON storage.objects;

CREATE POLICY "Authenticated upload vehicle-previews" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'vehicle-previews');

CREATE POLICY "Authenticated read vehicle-previews" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'vehicle-previews');

CREATE POLICY "Authenticated update vehicle-previews" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'vehicle-previews');

CREATE POLICY "Authenticated delete vehicle-previews" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'vehicle-previews');
