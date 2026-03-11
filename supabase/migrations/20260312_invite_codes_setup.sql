-- Consolidated invite codes setup script (idempotent — safe to run multiple times)
-- Run this in the Supabase SQL Editor to set up the invite codes system.

-- 1. Create the invite_codes table
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

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_owner ON invite_codes(owner_id);

-- 3. Enable RLS (idempotent)
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

-- 4. RLS SELECT policy (users can view their own codes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'invite_codes' AND policyname = 'Users can view own codes'
  ) THEN
    CREATE POLICY "Users can view own codes"
      ON invite_codes FOR SELECT
      USING (owner_id = auth.uid());
  END IF;
END;
$$;

-- 5. Function to generate invite codes for a user (idempotent, fills up to 5)
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
        EXIT; -- success, break retry loop
      EXCEPTION WHEN unique_violation THEN
        NULL; -- retry with a new code
      END;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger function for auto-generating codes on tutor creation
CREATE OR REPLACE FUNCTION trigger_generate_invite_codes()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM generate_invite_codes_for_user(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger (recreate to ensure it exists)
DROP TRIGGER IF EXISTS auto_generate_invite_codes ON tutors;
CREATE TRIGGER auto_generate_invite_codes
  AFTER INSERT ON tutors
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_invite_codes();

-- 8. Backfill: generate codes for every existing tutor who has a user_id
DO $$
DECLARE
  tutor_row record;
BEGIN
  FOR tutor_row IN SELECT user_id FROM tutors WHERE user_id IS NOT NULL LOOP
    PERFORM generate_invite_codes_for_user(tutor_row.user_id);
  END LOOP;
END;
$$;
