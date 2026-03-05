-- New profile fields
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS years_experience INTEGER;
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Storage bucket for profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT DO NOTHING;

-- Allow authenticated users to upload profile images
CREATE POLICY "Users can upload profile images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-images');

-- Allow public read access
CREATE POLICY "Public can read profile images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- Allow users to update their own profile images
CREATE POLICY "Users can update own profile images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-images');

-- Allow users to delete their own profile images
CREATE POLICY "Users can delete own profile images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-images');
