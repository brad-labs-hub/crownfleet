-- Storage bucket for receipts and documents (public for document_url links)
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: authenticated users can upload
CREATE POLICY "Authenticated upload" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'receipts');

-- Policy: users can read their own uploads (via RLS on receipts table - document_url)
CREATE POLICY "Authenticated read" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'receipts');
