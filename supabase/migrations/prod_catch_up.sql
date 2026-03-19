-- =============================================================
-- PRODUCTION CATCH-UP MIGRATION
-- Safe to run against prod Supabase — all statements are
-- idempotent (IF NOT EXISTS / IF EXISTS / OR REPLACE guards).
-- Paste this entire script into the Supabase SQL Editor.
-- =============================================================

-- ─── 1. TUTOR PROFILE ENHANCEMENTS (2026-03-05) ─────────────
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS profile_image text;
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS business_name text;
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS years_in_business integer;
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS facebook text;
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS linkedin text;
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS instagram text;

-- ─── 2. PROFILE FIELDS + STORAGE (2026-03-06) ───────────────
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS years_experience INTEGER;
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can upload profile images') THEN
    CREATE POLICY "Users can upload profile images"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'profile-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public can read profile images') THEN
    CREATE POLICY "Public can read profile images"
      ON storage.objects FOR SELECT TO public
      USING (bucket_id = 'profile-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can update own profile images') THEN
    CREATE POLICY "Users can update own profile images"
      ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'profile-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can delete own profile images') THEN
    CREATE POLICY "Users can delete own profile images"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'profile-images');
  END IF;
END;
$$;

-- ─── 3. VOUCHES (2026-03-06) ────────────────────────────────
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

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vouches' AND policyname = 'Anyone can view vouches') THEN
    CREATE POLICY "Anyone can view vouches" ON vouches FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vouches' AND policyname = 'Tutor can vouch') THEN
    CREATE POLICY "Tutor can vouch" ON vouches FOR INSERT
      WITH CHECK (voucher_tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vouches' AND policyname = 'Tutor can unvouch') THEN
    CREATE POLICY "Tutor can unvouch" ON vouches FOR DELETE
      USING (voucher_tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()));
  END IF;
END;
$$;

-- ─── 4. RICH PROFILE: REVIEWS, BADGES, INQUIRIES (2026-03-09) ─
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

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Anyone can view reviews') THEN
    CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Tutor owner can update reviews') THEN
    CREATE POLICY "Tutor owner can update reviews" ON reviews FOR UPDATE
      USING (tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Tutor owner can delete reviews') THEN
    CREATE POLICY "Tutor owner can delete reviews" ON reviews FOR DELETE
      USING (tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()));
  END IF;
END;
$$;

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

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'badges' AND policyname = 'Anyone can view badges') THEN
    CREATE POLICY "Anyone can view badges" ON badges FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'badges' AND policyname = 'Tutor owner can insert badges') THEN
    CREATE POLICY "Tutor owner can insert badges" ON badges FOR INSERT
      WITH CHECK (tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'badges' AND policyname = 'Tutor owner can update badges') THEN
    CREATE POLICY "Tutor owner can update badges" ON badges FOR UPDATE
      USING (tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'badges' AND policyname = 'Tutor owner can delete badges') THEN
    CREATE POLICY "Tutor owner can delete badges" ON badges FOR DELETE
      USING (tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()));
  END IF;
END;
$$;

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

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inquiries' AND policyname = 'Anyone can submit an inquiry') THEN
    CREATE POLICY "Anyone can submit an inquiry" ON inquiries FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inquiries' AND policyname = 'Tutor owner can view their inquiries') THEN
    CREATE POLICY "Tutor owner can view their inquiries" ON inquiries FOR SELECT
      USING (tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inquiries' AND policyname = 'Tutor owner can update their inquiries') THEN
    CREATE POLICY "Tutor owner can update their inquiries" ON inquiries FOR UPDATE
      USING (tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()));
  END IF;
END;
$$;

-- ─── 5. ALLOW PUBLIC REVIEW INSERT (2026-03-11) ─────────────
DROP POLICY IF EXISTS "Tutor owner can insert reviews" ON reviews;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Anyone can submit a review') THEN
    CREATE POLICY "Anyone can submit a review" ON reviews FOR INSERT WITH CHECK (true);
  END IF;
END;
$$;

-- ─── 6. REVIEW EMAIL + RECOMMEND FIELDS (2026-03-11) ────────
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewer_email text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS recommends boolean;

-- ─── 7. REVIEW REPORTS (2026-03-11) ─────────────────────────
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

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'review_reports' AND policyname = 'Tutor can read own reports') THEN
    CREATE POLICY "Tutor can read own reports" ON review_reports FOR SELECT
      USING (tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'review_reports' AND policyname = 'Tutor can create report for own review') THEN
    CREATE POLICY "Tutor can create report for own review" ON review_reports FOR INSERT
      WITH CHECK (tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()));
  END IF;
END;
$$;

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_revoked boolean DEFAULT false;

-- ─── 8. INVITE CODES (2026-03-11 + 2026-03-12 consolidated) ─
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

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invite_codes' AND policyname = 'Users can view own codes') THEN
    CREATE POLICY "Users can view own codes" ON invite_codes FOR SELECT
      USING (owner_id = auth.uid());
  END IF;
END;
$$;

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

-- Backfill invite codes for existing tutors
DO $$
DECLARE
  tutor_row record;
BEGIN
  FOR tutor_row IN SELECT user_id FROM tutors WHERE user_id IS NOT NULL LOOP
    PERFORM generate_invite_codes_for_user(tutor_row.user_id);
  END LOOP;
END;
$$;

-- ─── 9. BACKFILL is_revoked (2026-03-12) ────────────────────
UPDATE reviews SET is_revoked = false WHERE is_revoked IS NULL;
ALTER TABLE reviews ALTER COLUMN is_revoked SET NOT NULL;

-- ─── 10. PINNED REVIEW (2026-03-12) ─────────────────────────
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false;

-- ─── 11. UNIQUE USER_ID ON TUTORS (2026-03-14) ──────────────
-- Clean up duplicate tutor profiles (keep most recent per user_id)
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

-- Add unique constraint (safe if it already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tutors_user_id_unique'
  ) THEN
    ALTER TABLE tutors ADD CONSTRAINT tutors_user_id_unique UNIQUE (user_id);
  END IF;
END;
$$;

-- =============================================================
-- DONE! All migrations applied.
-- =============================================================
