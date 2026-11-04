-- You only play with people at your level: a match spans at most one level
-- (the host's level ± 0.5), and joining already requires being inside that span.
alter table public.matches add constraint matches_level_window check (max_level - min_level <= 1.0);

create or replace function public.enforce_match_host_level() returns trigger
language plpgsql security definer set search_path = public as $$
declare lvl numeric;
begin
  if auth.role() <> 'authenticated' then return new; end if;
  select level into lvl from public.profiles where id = new.host_id;
  if lvl is null
     or abs(new.min_level - greatest(lvl - 0.5, 0)) > 0.001
     or abs(new.max_level - least(lvl + 0.5, 7)) > 0.001 then
    raise exception 'level out of range';
  end if;
  return new;
end $$;
create trigger match_host_level before insert or update of min_level, max_level, host_id on public.matches
  for each row execute function public.enforce_match_host_level();
revoke execute on function public.enforce_match_host_level() from public, anon, authenticated;
