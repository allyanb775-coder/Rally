-- A small level gap is fine: players may join up to 0.25 outside a match's range.
create or replace function public.enforce_match_size() returns trigger
language plpgsql security definer set search_path = public as $$
declare m public.matches; lvl numeric;
begin
  select * into m from public.matches where id = new.match_id for update;
  if m.starts_at <= now() then raise exception 'match already started'; end if;
  if (select count(*) from public.match_players where match_id = new.match_id) >= 4 then
    raise exception 'match is full';
  end if;
  -- The host joins their own match right after creating it; their level defines the range.
  if new.player_id <> m.host_id then
    select level into lvl from public.profiles where id = new.player_id;
    if lvl < m.min_level - 0.25 or lvl > m.max_level + 0.25 then raise exception 'level out of range'; end if;
  end if;
  return new;
end $$;
