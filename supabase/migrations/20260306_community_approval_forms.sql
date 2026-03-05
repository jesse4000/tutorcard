-- Add approval requirement and custom application questions to communities
alter table communities add column if not exists require_approval boolean not null default true;
alter table communities add column if not exists application_questions jsonb default null;

-- Add answers storage to join requests
alter table community_join_requests add column if not exists answers jsonb default null;
