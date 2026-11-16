-- Communities, courts and academies anyone can add; players join them; matches can belong to one.

create table public.communities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles on delete cascade,
  name text not null check (char_length(name) between 2 and 40),
  kind text not null default 'community' check (kind in ('community', 'court', 'academy')),
  city text not null,
  description text not null default '' check (char_length(description) <= 200),
  logo_path text,
  created_at timestamptz not null default now()
);

create table public.community_members (
  community_id uuid references public.communities on delete cascade,
  player_id uuid references public.profiles on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (community_id, player_id)
);

alter table public.matches add column community_id uuid references public.communities on delete set null;

alter table public.communities enable row level security;
alter table public.community_members enable row level security;

create policy "read" on public.communities for select to authenticated using (true);
-- A player can own up to 5 communities.
create policy "create own" on public.communities for insert to authenticated
  with check (owner_id = auth.uid() and (select count(*) from public.communities c where c.owner_id = auth.uid()) < 5);
create policy "owner edits" on public.communities for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "owner deletes" on public.communities for delete to authenticated using (owner_id = auth.uid());

create policy "read" on public.community_members for select to authenticated using (true);
-- Join yourself as a member; only the owner of the community can add the 'owner' row for themselves.
create policy "join self" on public.community_members for insert to authenticated
  with check (
    player_id = auth.uid()
    and (role = 'member' or exists (select 1 from public.communities c where c.id = community_id and c.owner_id = auth.uid()))
  );
-- Leave yourself; the owner stays (they delete the community instead).
create policy "leave self" on public.community_members for delete to authenticated
  using (player_id = auth.uid() and role = 'member');

-- Only members can open a match inside a community.
create or replace function public.enforce_match_community() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.community_id is not null and auth.role() = 'authenticated'
     and not exists (select 1 from public.community_members where community_id = new.community_id and player_id = new.host_id) then
    raise exception 'not a member';
  end if;
  return new;
end $$;
create trigger match_community before insert or update of community_id on public.matches
  for each row execute function public.enforce_match_community();
revoke execute on function public.enforce_match_community() from public, anon, authenticated;
