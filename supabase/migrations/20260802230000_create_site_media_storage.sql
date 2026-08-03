-- Public media bucket used for book covers and site-managed images/videos.
insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do update set public = excluded.public;

-- Public read access.
drop policy if exists "Public read site media" on storage.objects;
create policy "Public read site media"
on storage.objects for select
to public
using (bucket_id = 'site-media');

-- The current site uses its own admin password rather than Supabase Auth.
-- Keep uploads available to the browser admin panel, matching the existing app model.
drop policy if exists "Public insert site media" on storage.objects;
create policy "Public insert site media"
on storage.objects for insert
to public
with check (bucket_id = 'site-media');

drop policy if exists "Public update site media" on storage.objects;
create policy "Public update site media"
on storage.objects for update
to public
using (bucket_id = 'site-media')
with check (bucket_id = 'site-media');

drop policy if exists "Public delete site media" on storage.objects;
create policy "Public delete site media"
on storage.objects for delete
to public
using (bucket_id = 'site-media');
