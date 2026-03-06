-- Vouches: tutors can vouch for other tutors as social proof
create table if not exists vouches (
  id uuid primary key default gen_random_uuid(),
  voucher_tutor_id uuid not null references tutors(id) on delete cascade,
  vouched_tutor_id uuid not null references tutors(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(voucher_tutor_id, vouched_tutor_id),
  check (voucher_tutor_id != vouched_tutor_id)
);

create index if not exists idx_vouches_vouched on vouches(vouched_tutor_id);

alter table vouches enable row level security;

create policy "Anyone can view vouches"
  on vouches for select
  using (true);

create policy "Tutor can vouch"
  on vouches for insert
  with check (voucher_tutor_id in (select id from tutors where user_id = auth.uid()));

create policy "Tutor can unvouch"
  on vouches for delete
  using (voucher_tutor_id in (select id from tutors where user_id = auth.uid()));
