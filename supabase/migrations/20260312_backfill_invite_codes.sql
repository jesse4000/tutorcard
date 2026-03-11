-- Function to generate invite codes for a user (idempotent, fills up to 5)
CREATE OR REPLACE FUNCTION generate_invite_codes_for_user(target_user_id uuid)
RETURNS void AS $$
DECLARE
  codes_needed integer;
  new_code text;
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i integer;
  j integer;
BEGIN
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
$$ LANGUAGE plpgsql;

-- Backfill: generate codes for every existing tutor who has < 5
DO $$
DECLARE
  tutor_row record;
BEGIN
  FOR tutor_row IN SELECT user_id FROM tutors LOOP
    PERFORM generate_invite_codes_for_user(tutor_row.user_id);
  END LOOP;
END;
$$;

-- Trigger: auto-generate codes when a new tutor is created
CREATE OR REPLACE FUNCTION trigger_generate_invite_codes()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM generate_invite_codes_for_user(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_invite_codes
  AFTER INSERT ON tutors
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_invite_codes();
