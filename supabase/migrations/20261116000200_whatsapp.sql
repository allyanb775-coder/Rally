-- Fees are paid outside the app: the player transfers to the organizer's IBAN and uploads the receipt.
-- An entry stays unpaid until the organizer confirms the transfer.
alter table public.tournaments
  add column whatsapp text check (whatsapp is null or whatsapp ~ '^\+?9665[0-9]{8}$|^05[0-9]{8}$'),
  add column iban text check (iban is null or iban ~ '^SA[0-9]{22}$'),
  add column iban_name text,
  add column organizer_id uuid references public.profiles on delete set null;
alter table public.communities add column whatsapp text check (whatsapp is null or whatsapp ~ '^\+?9665[0-9]{8}$|^05[0-9]{8}$');
alter table public.tournament_entries
  add column paid boolean not null default false,
  add column receipt_path text;

-- Players can't mark themselves paid; only the organizer can.
drop policy "enter self" on public.tournament_entries;
create policy "enter self" on public.tournament_entries for insert to authenticated
  with check (player_id = auth.uid() and paid = false);
create policy "organizer confirms" on public.tournament_entries for update to authenticated
  using (exists (select 1 from public.tournaments t where t.id = tournament_id and t.organizer_id = auth.uid()))
  with check (exists (select 1 from public.tournaments t where t.id = tournament_id and t.organizer_id = auth.uid()));

-- Receipts are private: path is <tournament_id>/<player_id>.<ext>.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('receipts', 'receipts', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do nothing;

create policy "receipts upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'receipts' and split_part(storage.filename(name), '.', 1) = auth.uid()::text);
create policy "receipts replace own" on storage.objects for update to authenticated
  using (bucket_id = 'receipts' and split_part(storage.filename(name), '.', 1) = auth.uid()::text)
  with check (bucket_id = 'receipts' and split_part(storage.filename(name), '.', 1) = auth.uid()::text);
create policy "receipts read" on storage.objects for select to authenticated
  using (bucket_id = 'receipts' and (
    split_part(storage.filename(name), '.', 1) = auth.uid()::text
    or exists (select 1 from public.tournaments t
               where t.id::text = (storage.foldername(objects.name))[1] and t.organizer_id = auth.uid())));
