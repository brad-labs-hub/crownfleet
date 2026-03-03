-- Vehicle preview photo: column + storage bucket
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS preview_image_path TEXT;

INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-previews', 'vehicle-previews', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated upload vehicle-previews" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'vehicle-previews');

CREATE POLICY "Authenticated read vehicle-previews" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'vehicle-previews');

CREATE POLICY "Authenticated update vehicle-previews" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'vehicle-previews');

CREATE POLICY "Authenticated delete vehicle-previews" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'vehicle-previews');
