-- Review reports table for moderation flow
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

-- Indexes
CREATE INDEX idx_review_reports_review_id ON review_reports(review_id);
CREATE INDEX idx_review_reports_token ON review_reports(response_token);
CREATE INDEX idx_review_reports_status ON review_reports(status);
CREATE INDEX idx_review_reports_deadline ON review_reports(deadline_at) WHERE status = 'pending';

-- RLS
ALTER TABLE review_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutor can read own reports"
  ON review_reports FOR SELECT
  USING (tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()));

CREATE POLICY "Tutor can create report for own review"
  ON review_reports FOR INSERT
  WITH CHECK (tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()));

-- Add is_revoked flag to reviews for easy filtering on public pages
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_revoked boolean DEFAULT false;
