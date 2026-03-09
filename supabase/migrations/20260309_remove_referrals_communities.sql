-- Remove referrals and communities features
-- Drop tables in dependency order (children first)

DROP TABLE IF EXISTS referral_community_shares CASCADE;
DROP TABLE IF EXISTS referral_applications CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS community_join_requests CASCADE;
DROP TABLE IF EXISTS community_members CASCADE;
DROP TABLE IF EXISTS communities CASCADE;

-- Remove the open_to_referrals column from tutors
ALTER TABLE tutors DROP COLUMN IF EXISTS open_to_referrals;
