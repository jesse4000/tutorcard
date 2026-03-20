-- Track total and unique visitors per tutorcard
CREATE TABLE card_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  visitor_hash text NOT NULL,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_card_views_tutor_id ON card_views(tutor_id);
CREATE INDEX idx_card_views_tutor_visitor ON card_views(tutor_id, visitor_hash, created_at DESC);

ALTER TABLE card_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutors can read own card views"
  ON card_views
  FOR SELECT
  USING (
    tutor_id IN (
      SELECT id FROM tutors WHERE user_id = auth.uid()
    )
  );

-- RPC function for dashboard: returns total views and unique visitors for a tutor
CREATE OR REPLACE FUNCTION get_card_view_stats(p_tutor_id uuid)
RETURNS TABLE(total_views bigint, unique_visitors bigint) AS $$
  SELECT
    COUNT(*)::bigint AS total_views,
    COUNT(DISTINCT visitor_hash)::bigint AS unique_visitors
  FROM card_views
  WHERE tutor_id = p_tutor_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;
