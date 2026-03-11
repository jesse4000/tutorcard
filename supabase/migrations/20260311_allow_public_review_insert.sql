-- Allow anyone to submit a review (like inquiries).
-- The existing policy restricts inserts to tutor owners, but reviews
-- are submitted by parents/students who are not authenticated.

drop policy if exists "Tutor owner can insert reviews" on reviews;

create policy "Anyone can submit a review"
  on reviews for insert
  with check (true);
