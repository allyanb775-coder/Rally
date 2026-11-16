-- Paid club matches: the host sets a fee and IBAN; every other player joins with a transfer receipt.
-- The spot is held while the host checks the transfer, then the host marks it paid.
alter table public.matches
  add column fee_sar int not null default 0 check (fee_sar >= 0),
  add column iban text check (iban is null or iban ~ '^SA[0-9]{22}$'),
  add column iban_name text;
alter table public.communities
  add column iban text check (iban is null or iban ~ '^SA[0-9]{22}$'),
  add column iban_name text;
alter table public.match_players
  add column paid boolean not null default false,
  add column receipt_path text;

-- A paid match needs an IBAN to pay into.
alter table public.matches add constraint paid_match_iban check (fee_sar = 0 or iban is not null);

-- Joining a paid match (other than as its host) needs a receipt in your own folder for that match.
create or replace function public.enforce_match_payment() returns trigger
language plpgsql set search_path = '' as $$
declare m record;
begin
  select host_id, fee_sar into m from public.matches where id = new.match_id;
  if m.fee_sar > 0 and new.player_id <> m.host_id then
    if new.receipt_path is null or new.receipt_path not like 'm/' || new.match_id || '/' || new.player_id || '.%' then
      raise exception 'receipt required';
    end if;
  end if;
  return new;
end $$;
create trigger match_payment before insert on public.match_players
  for each row execute function public.enforce_match_payment();

-- Players can't mark themselves paid; only the host can, and only the paid flag.
drop policy "join self" on public.match_players;
create policy "join self" on public.match_players for insert to authenticated
  with check (player_id = auth.uid() and paid = false);
create policy "host confirms payment" on public.match_players for update to authenticated
  using (exists (select 1 from public.matches m where m.id = match_id and m.host_id = auth.uid()))
  with check (exists (select 1 from public.matches m where m.id = match_id and m.host_id = auth.uid()));
revoke update on public.match_players from authenticated;
grant update (paid) on public.match_players to authenticated;

-- The host of a paid match can open its receipts (path m/<match_id>/<player_id>.<ext>).
create policy "receipts read match host" on storage.objects for select to authenticated
  using (bucket_id = 'receipts' and (storage.foldername(objects.name))[1] = 'm' and exists (
    select 1 from public.matches mt where mt.id::text = (storage.foldername(objects.name))[2] and mt.host_id = auth.uid()));

-- Same for tournaments: the organizer may only flip the paid flag.
revoke update on public.tournament_entries from authenticated;
grant update (paid) on public.tournament_entries to authenticated;
