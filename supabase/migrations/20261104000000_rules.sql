-- Server-side rules so the app can't be bypassed by a modified client.

-- Joining a match: not full, not started, player's level within range.
create or replace function public.enforce_match_size() returns trigger
language plpgsql security definer set search_path = public as $$
declare m public.matches; lvl numeric;
begin
  select * into m from public.matches where id = new.match_id for update;
  if m.starts_at <= now() then raise exception 'match already started'; end if;
  if (select count(*) from public.match_players where match_id = new.match_id) >= 4 then
    raise exception 'match is full';
  end if;
  select level into lvl from public.profiles where id = new.player_id;
  if lvl < m.min_level or lvl > m.max_level then raise exception 'level out of range'; end if;
  return new;
end $$;

-- The host can't leave their own match (they delete it instead).
create or replace function public.prevent_host_leave() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.matches where id = old.match_id and host_id = old.player_id)
     and auth.role() = 'authenticated' then
    raise exception 'host cannot leave';
  end if;
  return old;
end $$;
drop trigger if exists host_leave on public.match_players;
create trigger host_leave before delete on public.match_players
  for each row execute function public.prevent_host_leave();

-- Tournament entry: capacity and level.
create or replace function public.enforce_tournament_entry() returns trigger
language plpgsql security definer set search_path = public as $$
declare t public.tournaments; lvl numeric;
begin
  select * into t from public.tournaments where id = new.tournament_id for update;
  if (select count(*) from public.tournament_entries where tournament_id = new.tournament_id) >= t.capacity then
    raise exception 'tournament is full';
  end if;
  select level into lvl from public.profiles where id = new.player_id;
  if lvl < t.min_level or lvl > t.max_level then raise exception 'level out of range'; end if;
  return new;
end $$;
drop trigger if exists tournament_entry on public.tournament_entries;
create trigger tournament_entry before insert on public.tournament_entries
  for each row execute function public.enforce_tournament_entry();

-- Players may edit their name/city, and set their level only before their first
-- competitive match. Stats and later level changes come from server-side result processing.
create or replace function public.guard_profile_update() returns trigger
language plpgsql as $$
begin
  if auth.role() = 'authenticated' then
    if new.matches_played <> old.matches_played or new.wins <> old.wins or new.phone is distinct from old.phone or new.id <> old.id then
      raise exception 'read-only field';
    end if;
    if new.level <> old.level and old.matches_played > 0 then
      raise exception 'level locked';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists profile_guard on public.profiles;
create trigger profile_guard before update on public.profiles
  for each row execute function public.guard_profile_update();

-- New profiles start clean regardless of what the client sends.
create or replace function public.guard_profile_insert() returns trigger
language plpgsql as $$
begin
  if auth.role() = 'authenticated' then
    new.matches_played := 0; new.wins := 0;
    new.phone := nullif(auth.jwt() ->> 'phone', '');
  end if;
  return new;
end $$;
drop trigger if exists profile_insert_guard on public.profiles;
create trigger profile_insert_guard before insert on public.profiles
  for each row execute function public.guard_profile_insert();

-- Live updates for open matches.
do $$ begin
  alter publication supabase_realtime add table public.matches, public.match_players;
exception when duplicate_object then null;
end $$;
