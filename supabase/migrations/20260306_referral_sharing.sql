-- Create referral_community_shares join table for multi-community sharing
create table if not exists referral_community_shares (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null references referrals(id) on delete cascade,
  community_id uuid not null references communities(id) on delete cascade,
  created_at timestamptz default now(),
  unique(referral_id, community_id)
);

create index if not exists idx_referral_community_shares_referral on referral_community_shares(referral_id);
create index if not exists idx_referral_community_shares_community on referral_community_shares(community_id);

-- RLS policies
alter table referral_community_shares enable row level security;

-- Anyone can view shares (needed to filter opportunities)
create policy "referral_community_shares_select"
  on referral_community_shares for select
  using (true);

-- Only the referral owner can insert shares
create policy "referral_community_shares_insert"
  on referral_community_shares for insert
  with check (
    referral_id in (
      select r.id from referrals r
      join tutors t on r.tutor_id = t.id
      where t.user_id = auth.uid()
    )
  );

-- Only the referral owner can delete shares
create policy "referral_community_shares_delete"
  on referral_community_shares for delete
  using (
    referral_id in (
      select r.id from referrals r
      join tutors t on r.tutor_id = t.id
      where t.user_id = auth.uid()
    )
  );
