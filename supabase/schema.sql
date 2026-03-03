-- =====================================================
-- SAS — Stampede Avoidance System
-- Supabase Schema  (drop-and-recreate, always clean)
-- =====================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------
-- DROP EVERYTHING FIRST (reverse FK order)
-- -----------------------------------------------
drop table if exists public.broadcasts cascade;
drop table if exists public.incidents  cascade;
drop table if exists public.tasks      cascade;
drop table if exists public.alerts     cascade;
drop table if exists public.profiles   cascade;
drop table if exists public.zones      cascade;

drop function if exists public.update_updated_at cascade;

-- -----------------------------------------------
-- ZONES
-- -----------------------------------------------
create table public.zones (
  id              uuid        primary key default gen_random_uuid(),
  name            text        not null,
  status          text        not null check (status in ('green','yellow','red')) default 'green',
  density_percent float       not null default 0 check (density_percent >= 0 and density_percent <= 100),
  capacity        int         not null default 500,
  current_count   int         not null default 0,
  lat             float       not null,
  lng             float       not null,
  radius          int         not null default 200,
  updated_at      timestamptz not null default now()
);

create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger zones_updated_at
  before update on public.zones
  for each row execute function public.update_updated_at();

-- -----------------------------------------------
-- PROFILES
-- -----------------------------------------------
create table public.profiles (
  id         uuid        primary key references auth.users(id) on delete cascade,
  name       text        not null default '',
  email      text        not null default '',
  role       text        not null check (role in ('user','admin','superadmin')) default 'user',
  zone_id    uuid        references public.zones(id) on delete set null,
  gps_lat    float,
  gps_lng    float,
  online     boolean     not null default false,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------
-- ALERTS
-- -----------------------------------------------
create table public.alerts (
  id         uuid        primary key default gen_random_uuid(),
  type       text        not null check (type in ('red_zone','stampede_risk','evacuation','lost_child','medical_emergency')),
  zone_id    uuid        references public.zones(id) on delete set null,
  zone_name  text        not null,
  message    text        not null,
  severity   text        not null check (severity in ('low','medium','high','critical')) default 'medium',
  resolved   boolean     not null default false,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------
-- TASKS
-- -----------------------------------------------
create table public.tasks (
  id           uuid        primary key default gen_random_uuid(),
  instruction  text        not null,
  zone_id      uuid        references public.zones(id)    on delete cascade,
  zone_name    text        not null,
  assigned_to  uuid        references public.profiles(id) on delete cascade,
  assigned_by  uuid        references public.profiles(id),
  status       text        not null check (status in ('pending','accepted','rejected','completed')) default 'pending',
  created_at   timestamptz not null default now(),
  responded_at timestamptz
);

-- -----------------------------------------------
-- INCIDENTS
-- -----------------------------------------------
create table public.incidents (
  id          uuid        primary key default gen_random_uuid(),
  zone_id     uuid        references public.zones(id)    on delete set null,
  zone_name   text        not null,
  description text        not null,
  severity    text        not null check (severity in ('low','medium','high','critical')),
  reported_by uuid        references public.profiles(id),
  created_at  timestamptz not null default now()
);

-- -----------------------------------------------
-- BROADCASTS
-- -----------------------------------------------
create table public.broadcasts (
  id         uuid        primary key default gen_random_uuid(),
  type       text        not null check (type in ('text','audio','video')),
  content    text        not null,
  target     text        not null default 'all',
  sent_by    uuid        references public.profiles(id),
  created_at timestamptz not null default now()
);

-- -----------------------------------------------
-- ROW LEVEL SECURITY
-- -----------------------------------------------
alter table public.zones       enable row level security;
alter table public.profiles    enable row level security;
alter table public.alerts      enable row level security;
alter table public.tasks       enable row level security;
alter table public.incidents   enable row level security;
alter table public.broadcasts  enable row level security;

-- zones
create policy "zones_select_all"    on public.zones for select using (true);
create policy "zones_update_admins" on public.zones for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','superadmin'))
);
create policy "zones_insert_super"  on public.zones for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'superadmin')
);

-- profiles
create policy "profiles_select_all"    on public.profiles for select using (true);
create policy "profiles_update_own"    on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own"    on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_admins" on public.profiles for update using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','superadmin'))
);

-- alerts
create policy "alerts_select_all"     on public.alerts for select using (true);
create policy "alerts_insert_admins"  on public.alerts for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','superadmin'))
);
create policy "alerts_update_admins"  on public.alerts for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','superadmin'))
);

-- tasks
create policy "tasks_select"          on public.tasks for select using (
  assigned_to = auth.uid() or
  exists (select 1 from public.profiles where id = auth.uid() and role = 'superadmin')
);
create policy "tasks_insert_super"    on public.tasks for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'superadmin')
);
create policy "tasks_update_assigned" on public.tasks for update using (assigned_to = auth.uid());

-- incidents
create policy "incidents_select_admins" on public.incidents for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','superadmin'))
);
create policy "incidents_insert_admins" on public.incidents for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','superadmin'))
);

-- broadcasts
create policy "broadcasts_select_all"  on public.broadcasts for select using (true);
create policy "broadcasts_insert_super" on public.broadcasts for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'superadmin')
);

-- -----------------------------------------------
-- REALTIME
-- -----------------------------------------------
do $$ begin alter publication supabase_realtime add table public.zones;      exception when others then null; end $$;
do $$ begin alter publication supabase_realtime add table public.alerts;     exception when others then null; end $$;
do $$ begin alter publication supabase_realtime add table public.tasks;      exception when others then null; end $$;
do $$ begin alter publication supabase_realtime add table public.broadcasts; exception when others then null; end $$;

-- -----------------------------------------------
-- AUTO-CREATE PROFILE ON SIGNUP
-- -----------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------
-- SEED DATA
-- -----------------------------------------------
insert into public.zones (name, status, density_percent, capacity, current_count, lat, lng, radius) values
  ('Main Gate A',   'red',    91, 500, 455, 28.6139, 77.2090, 200),
  ('Central Plaza', 'yellow', 67, 800, 536, 28.6160, 77.2110, 300),
  ('East Corridor', 'green',  30, 400, 120, 28.6120, 77.2140, 180),
  ('West Exit',     'green',  22, 300,  66, 28.6145, 77.2060, 150),
  ('Food Court',    'yellow', 59, 600, 354, 28.6170, 77.2075, 220);

insert into public.alerts (type, zone_name, message, severity) values
  ('stampede_risk',    'Main Gate A',   'Crowd density exceeded 90%. Risk of stampede. Redirect crowd immediately.', 'critical'),
  ('red_zone',         'Main Gate A',   'Zone classified RED. Restrict further entry.',                              'high'),
  ('medical_emergency','Central Plaza', 'Medical emergency near fountain. Medical team deployed.',                   'high'),
  ('lost_child',       'East Corridor', 'Lost child — Age 7, red shirt. Last seen East Corridor.',                  'medium');

