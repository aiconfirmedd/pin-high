-- Pin High Â· Supabase Schema
-- Paste this entire file into: Supabase Dashboard â SQL Editor â New query â Run

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  display_name text,
  created_at timestamptz default now(),
  last_seen timestamptz default now()
);

create table if not exists public.login_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  email text,
  logged_in_at timestamptz default now()
);

create table if not exists public.rounds (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  course_name text,
  tee_name text,
  date text,
  player_name text,
  holes jsonb,
  imported boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.feature_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  email text,
  content text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.login_events enable row level security;
alter table public.rounds enable row level security;
alter table public.feature_requests enable row level security;

-- Profiles
create policy "Users view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles
  for insert with check (auth.uid() = id);
create policy "Owner views all profiles" on public.profiles
  for select using ((auth.jwt() ->> 'email') = 'aiconfirmedd@gmail.com');

-- Login events
create policy "Users insert own login events" on public.login_events
  for insert with check (auth.uid() = user_id);
create policy "Owner views all login events" on public.login_events
  for select using ((auth.jwt() ->> 'email') = 'aiconfirmedd@gmail.com');

-- Rounds
create policy "Users manage own rounds" on public.rounds
  for all using (auth.uid() = user_id);
create policy "Owner views all rounds" on public.rounds
  for select using ((auth.jwt() ->> 'email') = 'aiconfirmedd@gmail.com');

-- Feature requests
create policy "Users submit feature requests" on public.feature_requests
  for insert with check (auth.uid() = user_id);
create policy "Owner views all feature requests" on public.feature_requests
  for select using ((auth.jwt() ->> 'email') = 'aiconfirmedd@gmail.com');

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update last_seen on login event
create or replace function public.handle_user_login()
returns trigger as $$
begin
  update public.profiles set last_seen = now() where id = new.user_id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_login_event on public.login_events;
create trigger on_login_event
  after insert on public.login_events
  for each row execute procedure public.handle_user_login();

-- ============================================================
-- CLUBS (added for club bag per-user storage)
-- ============================================================

create table if not exists public.clubs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  club_id text not null,   -- client-generated ID (e.g. "club-0")
  name text not null,       -- e.g. "Driver", "7 Iron", "SW (54 deg)"
  spec text,                -- e.g. "TaylorMade P790"
  status text default 'normal',
  main_miss text,
  approach_dist numeric,
  carry_dist numeric,
  total_dist numeric,
  stock_dist numeric,
  partial_dist numeric,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, club_id)
);

alter table public.clubs enable row level security;

create policy "Users manage own clubs" on public.clubs
  for all using (auth.uid() = user_id);

-- Trigger to auto-update updated_at on clubs
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger clubs_updated_at
  before update on public.clubs
  for each row execute function public.set_updated_at();
