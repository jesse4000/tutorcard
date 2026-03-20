-- ============================================================
-- TUTORCARD STAGING SETUP - Paste this entire script into
-- Supabase SQL Editor and click "Run"
-- ============================================================

-- 0. Base tutors table (must exist before migrations)
CREATE TABLE IF NOT EXISTS tutors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  title text,
  slug text UNIQUE NOT NULL,
  avatar_color text DEFAULT '#6366f1',
  email text,
  exams text[],
  subjects text[],
  locations text[],
  links jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;

-- Anyone can view tutor profiles (public pages)
CREATE POLICY "Anyone can view tutors"
  ON tutors FOR SELECT USING (true);

-- Authenticated users can create their own tutor profile
CREATE POLICY "Users can create own tutor"
  ON tutors FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own tutor"
  ON tutors FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Users can delete their own profile
CREATE POLICY "Users can delete own tutor"
  ON tutors FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 1. Profile enhancements
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS profile_image text;
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS business_name text;
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS years_in_business integer;
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS facebook text;
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS linkedin text;
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS instagram text;

-- 2. More profile fields
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS years_experience INTEGER;
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Storage bucket for profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload profile images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-images');

CREATE POLICY "Public can read profile images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-images');

CREATE POLICY "Users can update own profile images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-images');

CREATE POLICY "Users can delete own profile images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-images');

-- 3. Vouches
CREATE TABLE IF NOT EXISTS vouches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_tutor_id uuid NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  vouched_tutor_id uuid NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(voucher_tutor_id, vouched_tutor_id),
  CHECK (voucher_tutor_id != vouched_tutor_id)
);

CREATE INDEX IF NOT EXISTS idx_vouches_vouched ON vouches(vouched_tutor_id);
ALTER TABLE vouches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view vouches"
  ON vouches FOR SELECT USING (true);

CREATE POLICY "Tutor can vouch"
  ON vouches FOR INSERT
  WITH CHECK (voucher_tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()));

CREATE POLICY "Tutor can unvouch"
  ON vouches FOR DELETE
  USING (voucher_tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()));

-- 4. Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  reviewer_name text NOT NULL,
  reviewer_role text,
  exam text,
  score_before text,
  score_after text,
  months integer,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  quote text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_tutor ON reviews(tutor_id);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Anyone can submit a review"
  ON reviews FOR INSERT WITH CHECK (true);

CREATE POLICY "Tutor owner can update reviews"
  ON reviews FOR UPDATE
  USING (tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()));

CREATE POLICY "Tutor owner can delete reviews"
  ON reviews FOR DELETE
  USING (tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()));

-- 5. Badges
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  name text NOT NULL,
  organization text,
  badge_type text NOT NULL CHECK (badge_type IN ('certification', 'membership')),
  since_year integer,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_badges_tutor ON badges(tutor_id);
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges"
  ON badges FOR SELECT USING (true);

CREATE POLICY "Tutor owner can insert badges"
  ON badges FOR INSERT
  WITH CHECK (tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()));

CREATE POLICY "Tutor owner can update badges"
  ON badges FOR UPDATE
  USING (tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()));

CREATE POLICY "Tutor owner can delete badges"
  ON badges FOR DELETE
  USING (tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()));

-- 6. Inquiries
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  sender_name text NOT NULL,
  sender_email text NOT NULL,
  sender_phone text,
  exams_of_interest text[],
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_tutor ON inquiries(tutor_id);
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an inquiry"
  ON inquiries FOR INSERT WITH CHECK (true);

CREATE POLICY "Tutor owner can view their inquiries"
  ON inquiries FOR SELECT
  USING (tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()));

CREATE POLICY "Tutor owner can update their inquiries"
  ON inquiries FOR UPDATE
  USING (tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()));

-- 7. Invite codes
CREATE TABLE IF NOT EXISTS invite_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  claimed boolean DEFAULT false,
  claimed_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_name text,
  claimed_slug text,
  created_at timestamptz DEFAULT now(),
  claimed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_owner ON invite_codes(owner_id);
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own codes"
  ON invite_codes FOR SELECT
  USING (owner_id = auth.uid());

-- 8. Review extras
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewer_email text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS recommends boolean;

-- 9. Review reports
CREATE TABLE IF NOT EXISTS review_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  tutor_id uuid NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'responded', 'revoked', 'denied')),
  response_token uuid DEFAULT gen_random_uuid(),
  reviewer_response text,
  responded_at timestamptz,
  resolved_at timestamptz,
  resolved_by text,
  deadline_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_review_reports_review_id ON review_reports(review_id);
CREATE INDEX IF NOT EXISTS idx_review_reports_token ON review_reports(response_token);
CREATE INDEX IF NOT EXISTS idx_review_reports_status ON review_reports(status);
CREATE INDEX IF NOT EXISTS idx_review_reports_deadline ON review_reports(deadline_at) WHERE status = 'pending';

ALTER TABLE review_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutor can read own reports"
  ON review_reports FOR SELECT
  USING (tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()));

CREATE POLICY "Tutor can create report for own review"
  ON review_reports FOR INSERT
  WITH CHECK (tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()));

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_revoked boolean DEFAULT false;

-- 10. Backfill is_revoked
UPDATE reviews SET is_revoked = false WHERE is_revoked IS NULL;
ALTER TABLE reviews ALTER COLUMN is_revoked SET NOT NULL;

-- 11. Invite code generation function
CREATE OR REPLACE FUNCTION generate_invite_codes_for_user(target_user_id uuid)
RETURNS void AS $$
DECLARE
  codes_needed integer;
  new_code text;
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i integer;
  j integer;
BEGIN
  IF target_user_id IS NULL THEN
    RETURN;
  END IF;

  SELECT 5 - count(*) INTO codes_needed
    FROM invite_codes WHERE owner_id = target_user_id;

  FOR i IN 1..codes_needed LOOP
    LOOP
      new_code := 'TC-';
      FOR j IN 1..6 LOOP
        new_code := new_code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
      END LOOP;
      BEGIN
        INSERT INTO invite_codes (code, owner_id) VALUES (new_code, target_user_id);
        EXIT;
      EXCEPTION WHEN unique_violation THEN
        NULL;
      END;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Trigger for auto-generating invite codes
CREATE OR REPLACE FUNCTION trigger_generate_invite_codes()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM generate_invite_codes_for_user(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS auto_generate_invite_codes ON tutors;
CREATE TRIGGER auto_generate_invite_codes
  AFTER INSERT ON tutors
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_invite_codes();

-- 13. Pinned review
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false;

-- 14. Unique user_id on tutors
DELETE FROM tutors
WHERE id IN (
  SELECT t.id
  FROM tutors t
  INNER JOIN (
    SELECT user_id, MAX(created_at) AS max_created
    FROM tutors
    GROUP BY user_id
    HAVING COUNT(*) > 1
  ) dups ON t.user_id = dups.user_id AND t.created_at < dups.max_created
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tutors_user_id_unique'
  ) THEN
    ALTER TABLE tutors ADD CONSTRAINT tutors_user_id_unique UNIQUE (user_id);
  END IF;
END;
$$;

-- 15. Card views (visitor tracking)
CREATE TABLE IF NOT EXISTS card_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  visitor_hash text NOT NULL,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_card_views_tutor_id ON card_views(tutor_id);
CREATE INDEX IF NOT EXISTS idx_card_views_tutor_visitor ON card_views(tutor_id, visitor_hash, created_at DESC);

ALTER TABLE card_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutors can read own card views"
  ON card_views
  FOR SELECT
  USING (
    tutor_id IN (
      SELECT id FROM tutors WHERE user_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION get_card_view_stats(p_tutor_id uuid)
RETURNS TABLE(total_views bigint, unique_visitors bigint) AS $$
  SELECT
    COUNT(*)::bigint AS total_views,
    COUNT(DISTINCT visitor_hash)::bigint AS unique_visitors
  FROM card_views
  WHERE tutor_id = p_tutor_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;
