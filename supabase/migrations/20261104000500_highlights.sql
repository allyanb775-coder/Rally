-- Gameplay clips on player profiles. Videos live in the public "highlights" storage
-- bucket under <player id>/<file>; each player can add (up to 30) and delete only their own.

create table public.highlights (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null default auth.uid() references public.profiles on delete cascade,
  path text not null unique,
  caption text not null default '' check (char_length(caption) <= 120),
  created_at timestamptz not null default now()
);
create index highlights_player_idx on public.highlights (player_id, created_at desc);

alter table public.highlights enable row level security;
create policy "read" on public.highlights for select to authenticated using (true);
create policy "add own" on public.highlights for insert to authenticated
  with check (
    player_id = auth.uid()
    and split_part(path, '/', 1) = auth.uid()::text
    and (select count(*) from public.highlights h where h.player_id = auth.uid()) < 30
  );
create policy "delete own" on public.highlights for delete to authenticated using (player_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('highlights', 'highlights', true, 52428800, array['video/mp4', 'video/quicktime', 'video/webm', 'video/3gpp'])
on conflict (id) do nothing;

create policy "highlights: upload to own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'highlights' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "highlights: delete own files" on storage.objects for delete to authenticated
  using (bucket_id = 'highlights' and (storage.foldername(name))[1] = auth.uid()::text);
