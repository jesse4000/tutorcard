-- Invite codes table: each user gets unique invite codes to share
CREATE TABLE invite_codes (
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

CREATE INDEX idx_invite_codes_code ON invite_codes(code);
CREATE INDEX idx_invite_codes_owner ON invite_codes(owner_id);

ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

-- Users can view their own codes on the dashboard
CREATE POLICY "Users can view own codes"
  ON invite_codes FOR SELECT
  USING (owner_id = auth.uid());
