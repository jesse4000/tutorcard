-- Prevent duplicate tutor profiles for the same user
-- First, clean up any existing duplicates (keep the most recent per user_id)
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

-- Add unique constraint on user_id
ALTER TABLE tutors ADD CONSTRAINT tutors_user_id_unique UNIQUE (user_id);
