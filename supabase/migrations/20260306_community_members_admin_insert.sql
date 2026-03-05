-- Allow community owners/admins to add members (e.g. when approving join requests)
create policy "Admins add community members"
  on community_members for insert
  with check (
    community_id in (
      select cm.community_id from community_members cm
      join tutors t on t.id = cm.tutor_id
      where t.user_id = auth.uid() and cm.role in ('owner', 'admin')
    )
  );
