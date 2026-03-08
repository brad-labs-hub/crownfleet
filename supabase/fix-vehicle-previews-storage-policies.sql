-- Fix: allow authenticated users to upload/read/update/delete vehicle preview images
-- Run this in Supabase Dashboard → SQL Editor if you get "new row violates row-level security policy"
-- when uploading a vehicle preview photo.

-- Ensure bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-previews', 'vehicle-previews', true)
ON CONFLICT (id) DO NOTHING;

-- Remove existing policies so we can recreate (avoids duplicate policy errors)
DROP POLICY IF EXISTS "Authenticated upload vehicle-previews" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated read vehicle-previews" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update vehicle-previews" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete vehicle-previews" ON storage.objects;

-- Allow authenticated users to upload to vehicle-previews
CREATE POLICY "Authenticated upload vehicle-previews" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'vehicle-previews');

-- Allow authenticated users to read
CREATE POLICY "Authenticated read vehicle-previews" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'vehicle-previews');

-- Allow authenticated users to update (e.g. replace preview)
CREATE POLICY "Authenticated update vehicle-previews" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'vehicle-previews');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated delete vehicle-previews" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'vehicle-previews');
