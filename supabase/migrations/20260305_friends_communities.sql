-- Communities: groups of tutors
create table if not exists communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  avatar_color text not null default '#0f172a',
  created_by uuid not null references tutors(id) on delete cascade,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Community members
create table if not exists community_members (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references communities(id) on delete cascade,
  tutor_id uuid not null references tutors(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  unique(community_id, tutor_id)
);

-- Indexes
create index if not exists idx_communities_created_by on communities(created_by);
create index if not exists idx_community_members_community_id on community_members(community_id);
create index if not exists idx_community_members_tutor_id on community_members(tutor_id);

-- RLS policies
alter table communities enable row level security;
alter table community_members enable row level security;

-- Communities policies
-- All public communities are visible (no recursion: only checks communities.is_public)
create policy "Anyone can view public communities"
  on communities for select
  using (is_public = true);

create policy "Tutor can create communities"
  on communities for insert
  with check (created_by in (select id from tutors where user_id = auth.uid()));

create policy "Owner can update community"
  on communities for update
  using (created_by in (select id from tutors where user_id = auth.uid()));

create policy "Owner can delete community"
  on communities for delete
  using (created_by in (select id from tutors where user_id = auth.uid()));

-- Community members policies
-- Anyone authenticated can view members (avoids recursion by not referencing communities table)
create policy "View community members"
  on community_members for select
  using (true);

create policy "Join public community"
  on community_members for insert
  with check (
    tutor_id in (select id from tutors where user_id = auth.uid())
  );

create policy "Leave community"
  on community_members for delete
  using (tutor_id in (select id from tutors where user_id = auth.uid()));
