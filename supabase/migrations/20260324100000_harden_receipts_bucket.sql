-- Harden receipts bucket visibility for production.
-- Existing authenticated SELECT policy remains in place.
UPDATE storage.buckets
SET public = false
WHERE id = 'receipts';
