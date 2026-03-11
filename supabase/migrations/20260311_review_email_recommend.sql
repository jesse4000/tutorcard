ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewer_email text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS recommends boolean;
