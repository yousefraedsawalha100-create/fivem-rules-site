-- Public media bucket used by the site content-management screens.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  104857600,
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- The current application uses its own dashboard password rather than Supabase Auth.
-- These policies therefore allow the anon client to manage this dedicated bucket.
drop policy if exists "Public can view site media" on storage.objects;
create policy "Public can view site media"
on storage.objects for select
using (bucket_id = 'site-media');

drop policy if exists "Dashboard can upload site media" on storage.objects;
create policy "Dashboard can upload site media"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'site-media');

drop policy if exists "Dashboard can update site media" on storage.objects;
create policy "Dashboard can update site media"
on storage.objects for update
to anon, authenticated
using (bucket_id = 'site-media')
with check (bucket_id = 'site-media');

drop policy if exists "Dashboard can delete site media" on storage.objects;
create policy "Dashboard can delete site media"
on storage.objects for delete
to anon, authenticated
using (bucket_id = 'site-media');
