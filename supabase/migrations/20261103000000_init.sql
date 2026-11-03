-- Rally: initial schema. Not yet applied to any project.

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null,
  phone text unique,
  city text not null default 'عنيزة',
  level numeric(3,2) not null default 0 check (level between 0 and 7),
  matches_played int not null default 0,
  wins int not null default 0,
  created_at timestamptz not null default now()
);

create type match_kind as enum ('friendly', 'competitive');

create table public.courts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null default 'عنيزة',
  lat double precision,
  lng double precision
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles on delete cascade,
  court_id uuid not null references public.courts,
  starts_at timestamptz not null,
  kind match_kind not null default 'friendly',
  min_level numeric(3,2) not null check (min_level between 0 and 7),
  max_level numeric(3,2) not null check (max_level between min_level and 7),
  created_at timestamptz not null default now()
);
create index matches_starts_at_idx on public.matches (starts_at);

create table public.match_players (
  match_id uuid references public.matches on delete cascade,
  player_id uuid references public.profiles on delete cascade,
  team smallint check (team in (1, 2)),
  joined_at timestamptz not null default now(),
  primary key (match_id, player_id)
);

-- Max 4 players per match.
create function public.enforce_match_size() returns trigger language plpgsql as $$
begin
  if (select count(*) from public.match_players where match_id = new.match_id) >= 4 then
    raise exception 'match is full';
  end if;
  return new;
end $$;
create trigger match_size before insert on public.match_players
  for each row execute function public.enforce_match_size();

create table public.match_results (
  match_id uuid primary key references public.matches on delete cascade,
  winning_team smallint not null check (winning_team in (1, 2)),
  score text,
  reported_by uuid references public.profiles,
  created_at timestamptz not null default now()
);

create type tournament_format as enum ('knockout16', 'americano');

create table public.tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  format tournament_format not null,
  court_id uuid references public.courts,
  starts_at timestamptz not null,
  min_level numeric(3,2) not null default 0,
  max_level numeric(3,2) not null default 7,
  capacity int not null,
  fee_sar int not null default 0
);

create table public.tournament_entries (
  tournament_id uuid references public.tournaments on delete cascade,
  player_id uuid references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (tournament_id, player_id)
);

-- Row level security
alter table public.profiles enable row level security;
alter table public.courts enable row level security;
alter table public.matches enable row level security;
alter table public.match_players enable row level security;
alter table public.match_results enable row level security;
alter table public.tournaments enable row level security;
alter table public.tournament_entries enable row level security;

create policy "read all" on public.profiles for select to authenticated using (true);
create policy "own profile" on public.profiles for update to authenticated using (id = auth.uid());
create policy "create own profile" on public.profiles for insert to authenticated with check (id = auth.uid());

create policy "read" on public.courts for select to authenticated using (true);
create policy "read" on public.tournaments for select to authenticated using (true);

create policy "read" on public.matches for select to authenticated using (true);
create policy "host creates" on public.matches for insert to authenticated with check (host_id = auth.uid());
create policy "host edits" on public.matches for update to authenticated using (host_id = auth.uid());
create policy "host deletes" on public.matches for delete to authenticated using (host_id = auth.uid());

create policy "read" on public.match_players for select to authenticated using (true);
create policy "join self" on public.match_players for insert to authenticated with check (player_id = auth.uid());
create policy "leave self" on public.match_players for delete to authenticated using (player_id = auth.uid());

-- Results (and the level updates they trigger) are written by a server-side function, not clients.
create policy "read" on public.match_results for select to authenticated using (true);

create policy "read" on public.tournament_entries for select to authenticated using (true);
create policy "enter self" on public.tournament_entries for insert to authenticated with check (player_id = auth.uid());
create policy "withdraw self" on public.tournament_entries for delete to authenticated using (player_id = auth.uid());
