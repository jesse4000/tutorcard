-- Rich profile: reviews, badges, and inquiries tables

-- ── REVIEWS ─────────────────────────────────────────────
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references tutors(id) on delete cascade,
  reviewer_name text not null,
  reviewer_role text,
  exam text,
  score_before text,
  score_after text,
  months integer,
  rating integer not null check (rating between 1 and 5),
  quote text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_reviews_tutor on reviews(tutor_id);

alter table reviews enable row level security;

create policy "Anyone can view reviews"
  on reviews for select
  using (true);

create policy "Tutor owner can insert reviews"
  on reviews for insert
  with check (tutor_id in (select id from tutors where user_id = auth.uid()));

create policy "Tutor owner can update reviews"
  on reviews for update
  using (tutor_id in (select id from tutors where user_id = auth.uid()));

create policy "Tutor owner can delete reviews"
  on reviews for delete
  using (tutor_id in (select id from tutors where user_id = auth.uid()));

-- ── BADGES ──────────────────────────────────────────────
create table if not exists badges (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references tutors(id) on delete cascade,
  name text not null,
  organization text,
  badge_type text not null check (badge_type in ('certification', 'membership')),
  since_year integer,
  description text,
  created_at timestamptz not null default now()
);

create index if not exists idx_badges_tutor on badges(tutor_id);

alter table badges enable row level security;

create policy "Anyone can view badges"
  on badges for select
  using (true);

create policy "Tutor owner can insert badges"
  on badges for insert
  with check (tutor_id in (select id from tutors where user_id = auth.uid()));

create policy "Tutor owner can update badges"
  on badges for update
  using (tutor_id in (select id from tutors where user_id = auth.uid()));

create policy "Tutor owner can delete badges"
  on badges for delete
  using (tutor_id in (select id from tutors where user_id = auth.uid()));

-- ── INQUIRIES ───────────────────────────────────────────
create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references tutors(id) on delete cascade,
  sender_name text not null,
  sender_email text not null,
  sender_phone text,
  exams_of_interest text[],
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_inquiries_tutor on inquiries(tutor_id);

alter table inquiries enable row level security;

create policy "Anyone can submit an inquiry"
  on inquiries for insert
  with check (true);

create policy "Tutor owner can view their inquiries"
  on inquiries for select
  using (tutor_id in (select id from tutors where user_id = auth.uid()));

create policy "Tutor owner can update their inquiries"
  on inquiries for update
  using (tutor_id in (select id from tutors where user_id = auth.uid()));
