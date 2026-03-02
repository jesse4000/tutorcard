-- Referrals table: a tutor lists a referral for a student they can't serve
create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references tutors(id) on delete cascade,
  subject text not null,
  location text not null default 'Online',
  grade_level text not null default '',
  notes text default '',
  status text not null default 'active' check (status in ('active', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Referral applications: another tutor applies to a referral
create table if not exists referral_applications (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null references referrals(id) on delete cascade,
  applicant_tutor_id uuid not null references tutors(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  bought_coffee boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(referral_id, applicant_tutor_id)
);

-- Indexes
create index if not exists idx_referrals_tutor_id on referrals(tutor_id);
create index if not exists idx_referrals_status on referrals(status);
create index if not exists idx_referral_applications_referral_id on referral_applications(referral_id);
create index if not exists idx_referral_applications_applicant on referral_applications(applicant_tutor_id);

-- RLS policies
alter table referrals enable row level security;
alter table referral_applications enable row level security;

-- Anyone can read active referrals
create policy "Anyone can view active referrals"
  on referrals for select
  using (status = 'active');

-- Tutor can view all their own referrals (including closed)
create policy "Tutor can view own referrals"
  on referrals for select
  using (tutor_id in (select id from tutors where user_id = auth.uid()));

-- Tutor can insert their own referrals
create policy "Tutor can create referrals"
  on referrals for insert
  with check (tutor_id in (select id from tutors where user_id = auth.uid()));

-- Tutor can update their own referrals
create policy "Tutor can update own referrals"
  on referrals for update
  using (tutor_id in (select id from tutors where user_id = auth.uid()));

-- Tutor can delete their own referrals
create policy "Tutor can delete own referrals"
  on referrals for delete
  using (tutor_id in (select id from tutors where user_id = auth.uid()));

-- Anyone can view applications on referrals they own or applied to
create policy "View applications on own referrals"
  on referral_applications for select
  using (
    referral_id in (select id from referrals where tutor_id in (select id from tutors where user_id = auth.uid()))
    or applicant_tutor_id in (select id from tutors where user_id = auth.uid())
  );

-- Tutor can apply (insert) to referrals
create policy "Tutor can apply to referrals"
  on referral_applications for insert
  with check (applicant_tutor_id in (select id from tutors where user_id = auth.uid()));

-- Referral owner can update applications (accept/decline)
create policy "Referral owner can update applications"
  on referral_applications for update
  using (
    referral_id in (select id from referrals where tutor_id in (select id from tutors where user_id = auth.uid()))
  );
