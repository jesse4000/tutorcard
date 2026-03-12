-- Backfill any NULL is_revoked values to false
UPDATE reviews SET is_revoked = false WHERE is_revoked IS NULL;

-- Add NOT NULL constraint to prevent future NULLs
ALTER TABLE reviews ALTER COLUMN is_revoked SET NOT NULL;
