
-- 1. Create a storage bucket for company logos (publicly readable)
insert into storage.buckets (id, name, public)
values ('company-logos', 'company-logos', true)
on conflict (id) do nothing;

-- 2. Allow upload/list/delete/update for authenticated users (admins will use this)
-- (You may relax these policies if you want anybody to upload, but this is a simple secure option.)
create policy "Allow logo management for authenticated users"
on storage.objects for all
to authenticated
using (
  bucket_id = 'company-logos'
);

-- 3. Allow all users to view images in the bucket
create policy "Allow logo download to any"
on storage.objects for select
using (
  bucket_id = 'company-logos'
);
