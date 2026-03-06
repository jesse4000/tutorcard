-- Add message field to referrals: private info shared only with the accepted applicant
alter table referrals add column if not exists message text default '';
