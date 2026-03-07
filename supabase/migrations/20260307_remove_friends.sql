-- Remove friends feature
DROP TABLE IF EXISTS friends CASCADE;
ALTER TABLE referrals DROP COLUMN IF EXISTS shared_with_friends;
