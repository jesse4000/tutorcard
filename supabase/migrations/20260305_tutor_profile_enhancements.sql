-- Add profile image, business info, phone, and social media fields to tutors table
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS profile_image text;
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS business_name text;
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS years_in_business integer;
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS facebook text;
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS linkedin text;
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS instagram text;
