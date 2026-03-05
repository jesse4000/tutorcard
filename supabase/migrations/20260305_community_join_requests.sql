-- Community join requests: pending applications to join a community
create table if not exists community_join_requests (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references communities(id) on delete cascade,
  tutor_id uuid not null references tutors(id) on delete cascade,
  message text default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  reviewed_by uuid references tutors(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(community_id, tutor_id)
);

-- Add community_id to referrals so referrals can be associated with communities
alter table referrals add column if not exists community_id uuid references communities(id) on delete set null;

-- Indexes
create index if not exists idx_community_join_requests_community on community_join_requests(community_id);
create index if not exists idx_community_join_requests_tutor on community_join_requests(tutor_id);
create index if not exists idx_community_join_requests_status on community_join_requests(status);
create index if not exists idx_referrals_community_id on referrals(community_id);

-- RLS
alter table community_join_requests enable row level security;

-- Anyone can view their own requests
create policy "View own join requests"
  on community_join_requests for select
  using (tutor_id in (select id from tutors where user_id = auth.uid()));

-- Community owners/admins can view all requests for their community
create policy "Owners view community requests"
  on community_join_requests for select
  using (
    community_id in (
      select cm.community_id from community_members cm
      join tutors t on t.id = cm.tutor_id
      where t.user_id = auth.uid() and cm.role in ('owner', 'admin')
    )
  );

-- Any tutor can submit a join request
create policy "Submit join request"
  on community_join_requests for insert
  with check (tutor_id in (select id from tutors where user_id = auth.uid()));

-- Owners/admins can update (approve/decline) requests
create policy "Review join requests"
  on community_join_requests for update
  using (
    community_id in (
      select cm.community_id from community_members cm
      join tutors t on t.id = cm.tutor_id
      where t.user_id = auth.uid() and cm.role in ('owner', 'admin')
    )
  );
