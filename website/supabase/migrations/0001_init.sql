-- ============================================================================
-- RentGo Medan — Database Migration 0001_init.sql
-- Supabase PostgreSQL Project: honhszsloegvpbmczkqf
-- Includes:
--   1. Extensions (btree_gist, pgcrypto)
--   2. Custom ENUM Types (8 enums)
--   3. Core Relational Tables (7 tables: users, vehicle_categories, vehicles,
--      bookings, payments, maintenance_logs, ai_recommendation_logs)
--   4. Anti Double-Booking GiST Exclusion Constraint + Indexes
--   5. Row Level Security (RLS Enabled, Server-Only / Deny-All for Browser)
--   6. Triggers & SQL Functions (set_updated_at, get_available_vehicles, create_booking)
--   7. Supabase Storage Buckets (vehicles, payment-proofs)
-- ============================================================================

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

-- 1. Custom ENUM Types (Idempotent)
do $$ begin
  create type public.user_role as enum ('customer', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.vehicle_status as enum ('active', 'maintenance', 'inactive');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.transmission_type as enum ('manual', 'automatic');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.fuel_type as enum ('bensin', 'diesel', 'listrik', 'hybrid');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.booking_status as enum ('pending', 'confirmed', 'ongoing', 'completed', 'cancelled', 'rejected', 'expired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_method as enum ('cash', 'transfer', 'qris');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('unpaid', 'paid', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.maintenance_status as enum ('scheduled', 'in_progress', 'done');
exception when duplicate_object then null; end $$;

-- 2. Tables (7 Core Tables)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text not null unique,
  email text not null unique,
  full_name text not null,
  avatar_url text,
  phone text,
  driver_license_no text,
  role public.user_role not null default 'customer',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicle_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.vehicle_categories(id) on delete restrict,
  plate_number text not null unique,
  brand text not null,
  model text not null,
  year smallint not null check (year between 1990 and 2100),
  color text,
  transmission public.transmission_type not null,
  fuel public.fuel_type not null,
  seats smallint not null check (seats between 1 and 60),
  daily_price numeric(12,0) not null check (daily_price > 0),
  status public.vehicle_status not null default 'active',
  description text,
  image_url text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text not null unique,
  user_id uuid not null references public.users(id) on delete restrict,
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  start_date date not null,
  end_date date not null,
  total_days int generated always as (end_date - start_date + 1) stored,
  pickup_location text not null,
  return_location text not null,
  daily_price_snapshot numeric(12,0) not null,
  total_price numeric(12,0) not null,
  status public.booking_status not null default 'pending',
  notes text,
  admin_notes text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_booking_dates check (end_date >= start_date),
  constraint no_double_booking exclude using gist (
    vehicle_id with =,
    daterange(start_date, end_date, '[]') with &&
  ) where (status in ('pending', 'confirmed', 'ongoing'))
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  amount numeric(12,0) not null check (amount >= 0),
  method public.payment_method not null default 'qris',
  status public.payment_status not null default 'unpaid',
  proof_url text,
  paid_at timestamptz,
  verified_by uuid references public.users(id),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.maintenance_logs (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  title text not null,
  description text,
  start_date date not null,
  end_date date not null,
  cost numeric(12,0) default 0,
  status public.maintenance_status not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_maint_dates check (end_date >= start_date)
);

create table if not exists public.ai_recommendation_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  query_text text not null,
  params jsonb not null default '{}',
  recommended_vehicle_ids uuid[] not null default '{}',
  model text,
  used_fallback boolean not null default false,
  latency_ms int,
  created_at timestamptz not null default now()
);

-- 3. Performance Indexes
create index if not exists idx_bookings_user_id on public.bookings(user_id);
create index if not exists idx_bookings_vehicle_status on public.bookings(vehicle_id, status);
create index if not exists idx_bookings_status_start on public.bookings(status, start_date);
create index if not exists idx_vehicles_category_status on public.vehicles(category_id, status) where deleted_at is null;
create index if not exists idx_payments_booking_id on public.payments(booking_id);
create index if not exists idx_maintenance_vehicle_dates on public.maintenance_logs(vehicle_id, start_date, end_date);
create index if not exists idx_ai_logs_user_created on public.ai_recommendation_logs(user_id, created_at);

-- 4. Row Level Security (Deny-all for direct browser access; server accesses via service_role)
alter table public.users enable row level security;
alter table public.vehicle_categories enable row level security;
alter table public.vehicles enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.maintenance_logs enable row level security;
alter table public.ai_recommendation_logs enable row level security;

-- 5. Generic updated_at Trigger Function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists trg_categories_updated_at on public.vehicle_categories;
create trigger trg_categories_updated_at before update on public.vehicle_categories
for each row execute function public.set_updated_at();

drop trigger if exists trg_vehicles_updated_at on public.vehicles;
create trigger trg_vehicles_updated_at before update on public.vehicles
for each row execute function public.set_updated_at();

drop trigger if exists trg_bookings_updated_at on public.bookings;
create trigger trg_bookings_updated_at before update on public.bookings
for each row execute function public.set_updated_at();

drop trigger if exists trg_payments_updated_at on public.payments;
create trigger trg_payments_updated_at before update on public.payments
for each row execute function public.set_updated_at();

drop trigger if exists trg_maintenance_updated_at on public.maintenance_logs;
create trigger trg_maintenance_updated_at before update on public.maintenance_logs
for each row execute function public.set_updated_at();

-- 6. Function: get_available_vehicles(p_start date, p_end date)
create or replace function public.get_available_vehicles(p_start date, p_end date)
returns setof public.vehicles
language sql
stable
as $$
  select v.*
  from public.vehicles v
  where v.deleted_at is null
    and v.status = 'active'
    and not exists (
      select 1
      from public.bookings b
      where b.vehicle_id = v.id
        and b.status in ('pending', 'confirmed', 'ongoing')
        and daterange(b.start_date, b.end_date, '[]') && daterange(p_start, p_end, '[]')
    )
    and not exists (
      select 1
      from public.maintenance_logs m
      where m.vehicle_id = v.id
        and m.status in ('scheduled', 'in_progress')
        and daterange(m.start_date, m.end_date, '[]') && daterange(p_start, p_end, '[]')
    )
  order by v.daily_price asc;
$$;

-- 7. Function: create_booking(...) Atomic Server-Side Price & Anti Double-Booking RPC
create or replace function public.create_booking(
  p_user_id uuid,
  p_vehicle_id uuid,
  p_start_date date,
  p_end_date date,
  p_pickup_location text,
  p_return_location text,
  p_payment_method public.payment_method default 'qris',
  p_notes text default null
)
returns public.bookings
language plpgsql
security definer
as $$
declare
  v_vehicle public.vehicles;
  v_days int;
  v_total numeric(12,0);
  v_code text;
  v_booking public.bookings;
begin
  if p_end_date < p_start_date then
    raise exception 'Tanggal kembali tidak boleh sebelum tanggal ambil.';
  end if;

  -- Lock vehicle row to serialize concurrent booking requests
  select * into v_vehicle
  from public.vehicles
  where id = p_vehicle_id
    and deleted_at is null
  for update;

  if not found or v_vehicle.status <> 'active' then
    raise exception 'Kendaraan tidak aktif atau sedang dalam perawatan.';
  end if;

  if exists (
    select 1 from public.maintenance_logs m
    where m.vehicle_id = p_vehicle_id
      and m.status in ('scheduled', 'in_progress')
      and daterange(m.start_date, m.end_date, '[]') && daterange(p_start_date, p_end_date, '[]')
  ) then
    raise exception 'Kendaraan sedang dijadwalkan servis pada tanggal tersebut.';
  end if;

  v_days := (p_end_date - p_start_date) + 1;
  v_total := v_vehicle.daily_price * v_days;
  v_code := 'RG-' || to_char(now() at time zone 'Asia/Jakarta', 'YYMMDD') || '-' || upper(substr(md5(random()::text), 1, 4));

  begin
    insert into public.bookings (
      booking_code, user_id, vehicle_id, start_date, end_date,
      pickup_location, return_location, daily_price_snapshot, total_price,
      status, notes, expires_at
    ) values (
      v_code, p_user_id, p_vehicle_id, p_start_date, p_end_date,
      p_pickup_location, p_return_location, v_vehicle.daily_price, v_total,
      'pending', p_notes, now() + interval '24 hours'
    )
    returning * into v_booking;
  exception when exclusion_violation then
    raise exception 'Kendaraan sudah dipesan pada tanggal tersebut.';
  end;

  insert into public.payments (
    booking_id, amount, method, status, note
  ) values (
    v_booking.id, v_total, p_payment_method, 'unpaid', 'Tagihan QRIS Midtrans Sandbox (rentgo-test)'
  );

  return v_booking;
end;
$$;

-- 8. Supabase Storage Buckets (vehicles & payment-proofs)
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'storage' and table_name = 'buckets') then
    insert into storage.buckets (id, name, public)
    values
      ('vehicles', 'vehicles', true),
      ('payment-proofs', 'payment-proofs', true)
    on conflict (id) do nothing;
  end if;
end $$;
