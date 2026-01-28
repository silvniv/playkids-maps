-- Supabase SQL: tabelas essenciais do MVP (places, reviews, favorites, reports)

-- Extensões
create extension if not exists pgcrypto;

-- ENUMS
do $$ begin
  create type place_status as enum ('pending','verified','rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type conservation as enum ('poor','ok','good');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_type as enum ('broken_toy','risk','no_maintenance','dirty','bad_lighting','other');
exception when duplicate_object then null; end $$;

-- PLACES
create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  description text default '',
  lat numeric not null,
  lng numeric not null,
  address_approx text default '',
  neighborhood text default '',
  age_range text default 'mixed',
  accessibility boolean default false,
  infra_bathroom boolean default false,
  infra_changing_table boolean default false,
  infra_shade boolean default false,
  infra_water_fountain boolean default false,
  infra_fenced boolean default false,
  infra_toys boolean default false,
  safety_lighting boolean default false,
  safety_movement boolean default false,
  safety_conservation conservation default 'ok',
  status place_status default 'pending',
  created_by uuid not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- REVIEWS
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  place_id uuid references public.places(id) on delete cascade,
  user_id uuid not null,
  safety_rating int not null check (safety_rating between 1 and 5),
  infra_rating int not null check (infra_rating between 1 and 5),
  age_range text default 'mixed',
  comment text default '' check (char_length(comment) <= 240),
  visited_at date not null,
  created_at timestamptz default now()
);

-- FAVORITES
create table if not exists public.favorites (
  user_id uuid not null,
  place_id uuid references public.places(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, place_id)
);

-- REPORTS
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  place_id uuid references public.places(id) on delete cascade,
  user_id uuid not null,
  type report_type not null,
  description text not null,
  photo_path text,
  status text default 'open',
  created_at timestamptz default now()
);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_places_updated
before update on public.places
for each row execute function public.set_updated_at();

-- RLS
alter table public.places enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;
alter table public.reports enable row level security;

-- PLACES policies
-- Select: verified + pending (público)
create policy if not exists "places_select_public" on public.places
for select
using (status in ('verified','pending'));

-- Insert: autenticado (simplificado para evitar problemas com created_by)
create policy if not exists "places_insert_auth" on public.places
for insert
with check (auth.uid() is not null);

-- Update: apenas autor (simples)
create policy if not exists "places_update_owner" on public.places
for update
using (created_by = auth.uid())
with check (created_by = auth.uid());

-- REVIEWS policies
create policy if not exists "reviews_select_public" on public.reviews
for select
using (true);

create policy if not exists "reviews_insert_auth" on public.reviews
for insert
with check (auth.uid() is not null and user_id = auth.uid());

-- FAVORITES policies
create policy if not exists "favorites_select_owner" on public.favorites
for select
using (user_id = auth.uid());

create policy if not exists "favorites_insert_owner" on public.favorites
for insert
with check (user_id = auth.uid());

create policy if not exists "favorites_delete_owner" on public.favorites
for delete
using (user_id = auth.uid());

-- REPORTS policies (somente inserir como autenticado; leitura pode ficar restrita a service role)
create policy if not exists "reports_insert_auth" on public.reports
for insert
with check (auth.uid() is not null and user_id = auth.uid());
