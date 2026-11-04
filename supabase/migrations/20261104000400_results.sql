-- Match results: a player reports, a player from the other team confirms, then every
-- player's level, matches_played and wins update on the server. Clients can't write
-- match_results or stats directly (RLS + guard_profile_update).

alter table public.match_results add column status text not null default 'pending' check (status in ('pending', 'confirmed'));
alter table public.match_results add column confirmed_by uuid references public.profiles;

-- Let server-side result processing through the profile guard.
create or replace function public.guard_profile_update() returns trigger
language plpgsql set search_path = public as $$
begin
  if current_setting('rally.system', true) = 'on' then return new; end if;
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

create or replace function public.report_result(p_match uuid, p_winning_team smallint, p_score text)
returns void language plpgsql security definer set search_path = public as $$
declare m public.matches; n int;
begin
  select * into m from public.matches where id = p_match for update;
  if m.id is null then raise exception 'match not found'; end if;
  if m.kind <> 'competitive' then raise exception 'not competitive'; end if;
  if m.starts_at > now() then raise exception 'match not started'; end if;
  if not exists (select 1 from public.match_players where match_id = p_match and player_id = auth.uid()) then
    raise exception 'not in match';
  end if;
  select count(*) into n from public.match_players where match_id = p_match;
  if n <> 4 then raise exception 'match not full'; end if;
  if p_winning_team not in (1, 2) then raise exception 'bad team'; end if;
  if exists (select 1 from public.match_results where match_id = p_match) then raise exception 'result exists'; end if;

  -- Teams as drawn on the court: by join order, 1st + 3rd vs 2nd + 4th.
  update public.match_players mp set team = case when r.rn % 2 = 1 then 1 else 2 end
  from (select player_id, row_number() over (order by joined_at, player_id) rn from public.match_players where match_id = p_match) r
  where mp.match_id = p_match and mp.player_id = r.player_id;

  insert into public.match_results (match_id, winning_team, score, reported_by, status)
  values (p_match, p_winning_team, left(coalesce(p_score, ''), 40), auth.uid(), 'pending');
end $$;

create or replace function public.confirm_result(p_match uuid, p_accept boolean)
returns void language plpgsql security definer set search_path = public as $$
declare
  r public.match_results;
  my_team smallint; rep_team smallint;
  avg1 numeric; avg2 numeric;
  p record; mine numeric; theirs numeric; expected numeric; k numeric; won boolean;
begin
  select * into r from public.match_results where match_id = p_match for update;
  if r.match_id is null or r.status <> 'pending' then raise exception 'nothing to confirm'; end if;
  select team into my_team from public.match_players where match_id = p_match and player_id = auth.uid();
  select team into rep_team from public.match_players where match_id = p_match and player_id = r.reported_by;
  if my_team is null or my_team = rep_team then raise exception 'opponent must confirm'; end if;

  if not p_accept then
    delete from public.match_results where match_id = p_match; -- disputed: report again
    return;
  end if;

  select avg(pr.level) into avg1 from public.match_players mp join public.profiles pr on pr.id = mp.player_id where mp.match_id = p_match and mp.team = 1;
  select avg(pr.level) into avg2 from public.match_players mp join public.profiles pr on pr.id = mp.player_id where mp.match_id = p_match and mp.team = 2;

  perform set_config('rally.system', 'on', true);
  for p in
    select pr.id, pr.level, pr.matches_played, mp.team
    from public.match_players mp join public.profiles pr on pr.id = mp.player_id
    where mp.match_id = p_match
  loop
    -- Same Elo-style rule as lib/level.ts updatedLevel: 1 level gap ≈ 76% win chance.
    won := p.team = r.winning_team;
    mine := case when p.team = 1 then avg1 else avg2 end;
    theirs := case when p.team = 1 then avg2 else avg1 end;
    expected := 1 / (1 + power(10, (theirs - mine) / 2));
    k := case when p.matches_played < 10 then 0.3 when p.matches_played < 30 then 0.2 else 0.12 end;
    update public.profiles
      set level = round(least(7, greatest(0, p.level + k * ((case when won then 1 else 0 end) - expected)))::numeric, 2),
          matches_played = matches_played + 1,
          wins = wins + case when won then 1 else 0 end
      where id = p.id;
  end loop;
  perform set_config('rally.system', 'off', true);

  update public.match_results set status = 'confirmed', confirmed_by = auth.uid() where match_id = p_match;
end $$;

revoke execute on function public.report_result(uuid, smallint, text), public.confirm_result(uuid, boolean) from public, anon;
grant execute on function public.report_result(uuid, smallint, text), public.confirm_result(uuid, boolean) to authenticated;

do $$ begin
  alter publication supabase_realtime add table public.match_results;
exception when duplicate_object then null;
end $$;
