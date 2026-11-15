-- ============================================================================
-- RENTGO MEDAN — ALL-IN-ONE SUPABASE SETUP & SEED SCRIPT
-- Project Ref: honhszsloegvpbmczkqf
-- Cara Pakai (1-Klik):
--   1. Buka Supabase SQL Editor:
--      https://supabase.com/dashboard/project/honhszsloegvpbmczkqf/sql/new
--   2. Salin & Tempel (Copy-Paste) seluruh isi file ini, lalu klik "Run".
--   3. Seluruh 7 Tabel, Constraint Anti Double-Booking, RLS, Storage Bucket,
--      dan 12 Armada Medan (dengan foto unit asli) langsung terbuat!
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

-- 3. Indexes
create index if not exists idx_bookings_user_id on public.bookings(user_id);
create index if not exists idx_bookings_vehicle_status on public.bookings(vehicle_id, status);
create index if not exists idx_bookings_status_start on public.bookings(status, start_date);
create index if not exists idx_vehicles_category_status on public.vehicles(category_id, status) where deleted_at is null;
create index if not exists idx_payments_booking_id on public.payments(booking_id);
create index if not exists idx_maintenance_vehicle_dates on public.maintenance_logs(vehicle_id, start_date, end_date);
create index if not exists idx_ai_logs_user_created on public.ai_recommendation_logs(user_id, created_at);

-- 4. Enable RLS (Server-Side Access via Service Role)
alter table public.users enable row level security;
alter table public.vehicle_categories enable row level security;
alter table public.vehicles enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.maintenance_logs enable row level security;
alter table public.ai_recommendation_logs enable row level security;

-- 5. Triggers & Functions
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

-- 6. Storage Buckets (vehicles & payment-proofs)
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

-- ============================================================================
-- 7. INITIAL SEED DATA (5 Kategori, 3 Pengguna, 12 Kendaraan Medan, 4 Booking)
-- ============================================================================

insert into public.vehicle_categories (id, name, slug, description) values
  ('11111111-1111-4111-8111-111111111101', 'Mobil City', 'mobil-city', 'Mobil kompak hemat bahan bakar untuk mobilitas dalam Kota Medan.'),
  ('11111111-1111-4111-8111-111111111102', 'MPV / Minibus', 'mpv-minibus', 'Kendaraan keluarga 7 penumpang untuk perjalanan grup dan antar-jemput Bandara Kualanamu.'),
  ('11111111-1111-4111-8111-111111111103', 'SUV', 'suv', 'Ground clearance tinggi dan mesin bertenaga untuk rute tanjakan Berastagi dan Danau Toba.'),
  ('11111111-1111-4111-8111-111111111104', 'Van / Hiace', 'van-hiace', 'Kapasitas besar 14-15 kursi untuk rombongan wisata dan kunjungan kerja.'),
  ('11111111-1111-4111-8111-111111111105', 'Motor', 'motor', 'Sepeda motor matik praktis untuk komuter harian di pusat Kota Medan.')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description;

insert into public.users (id, firebase_uid, email, full_name, avatar_url, phone, driver_license_no, role, is_active) values
  ('22222222-2222-4222-8222-222222222201', 'firebase-admin-akbar', 'akbarriansyah339@gmail.com', 'Akbar Riansyah', null, '081260009988', '1271091511040001', 'admin', true),
  ('22222222-2222-4222-8222-222222222202', 'firebase-cust-nadia', 'nadia.siregar@gmail.com', 'Nadia Siregar', null, '081370112233', '1271082405990002', 'customer', true),
  ('22222222-2222-4222-8222-222222222203', 'firebase-cust-rizky', 'rizky.nasution@gmail.com', 'Rizky Nasution', null, '082165448899', '1271031102970003', 'customer', true)
on conflict (email) do update set
  role = excluded.role,
  full_name = excluded.full_name;

insert into public.vehicles (
  id, category_id, plate_number, brand, model, year, color,
  transmission, fuel, seats, daily_price, status, description, image_url
) values
  (
    '33333333-3333-4333-8333-333333333301',
    '11111111-1111-4111-8111-111111111101',
    'BK 1124 AAB', 'Honda', 'Brio Satya RS', 2024, 'Putih Mutiara',
    'automatic', 'bensin', 5, 320000, 'active',
    'City car lincah dengan transmisi CVT halus, sensor parkir, dan head unit layar sentuh untuk jalanan pusat Kota Medan.',
    '/vehicles/Honda-Brio-Satya-RS.jfif'
  ),
  (
    '33333333-3333-4333-8333-333333333302',
    '11111111-1111-4111-8111-111111111101',
    'BK 1482 AAC', 'Toyota', 'Agya GR Sport', 2024, 'Kuning',
    'automatic', 'bensin', 5, 300000, 'active',
    'Hatchback irit BBM dengan kabin ergonomis, cocok untuk mobilitas harian maupun perjalanan singkat dari Stasiun Medan.',
    '/vehicles/Toyota-Agya-GR-Sport.jpg'
  ),
  (
    '33333333-3333-4333-8333-333333333303',
    '11111111-1111-4111-8111-111111111102',
    'BK 1750 AAD', 'Toyota', 'Avanza 1.5 G CVT', 2024, 'Hitam Metalik',
    'automatic', 'bensin', 7, 420000, 'active',
    'MPV 7 kursi dengan AC double blower dingin, ruang bagasi lega untuk koper Bandara Kualanamu, dan konsumsi BBM efisien.',
    '/vehicles/Toyota-Avanza-1.5-G-CVT.png'
  ),
  (
    '33333333-3333-4333-8333-333333333304',
    '11111111-1111-4111-8111-111111111102',
    'BK 1890 AAE', 'Mitsubishi', 'Xpander Ultimate', 2024, 'Abu-abu Metalik',
    'automatic', 'bensin', 7, 480000, 'active',
    'Suspensi nyaman khas Xpander dengan cruise control dan kabin senyap untuk perjalanan keluarga Medan - Parapat.',
    '/vehicles/mpv.svg'
  ),
  (
    '33333333-3333-4333-8333-333333333305',
    '11111111-1111-4111-8111-111111111102',
    'BK 1921 AAF', 'Toyota', 'Kijang Innova Zenix Hybrid', 2025, 'Hitam',
    'automatic', 'hybrid', 7, 750000, 'active',
    'MPV premium bermesin hybrid hemat bahan bakar dengan captain seat baris kedua untuk tamu bisnis dan keluarga.',
    '/vehicles/mpv.svg'
  ),
  (
    '33333333-3333-4333-8333-333333333306',
    '11111111-1111-4111-8111-111111111102',
    'BK 1310 AAG', 'Daihatsu', 'Xenia 1.3 R MT', 2023, 'Silver',
    'manual', 'bensin', 7, 360000, 'active',
    'Pilihan MPV manual ekonomis dengan daya angkut 7 penumpang dan biaya sewa harian paling terjangkau.',
    '/vehicles/Daihatsu-Xenia-1.3-R-MT.png'
  ),
  (
    '33333333-3333-4333-8333-333333333307',
    '11111111-1111-4111-8111-111111111103',
    'BK 1555 AAH', 'Toyota', 'Rush GR Sport', 2024, 'Putih',
    'automatic', 'bensin', 7, 500000, 'active',
    'SUV 7 penumpang berpenggerak roda belakang yang tangguh melewati jalur menanjak menuju Berastagi dan Tongging.',
    '/vehicles/suv.svg'
  ),
  (
    '33333333-3333-4333-8333-333333333308',
    '11111111-1111-4111-8111-111111111103',
    'BK 1008 AAJ', 'Mitsubishi', 'Pajero Sport Dakar 4x2', 2024, 'Hitam',
    'automatic', 'diesel', 7, 1150000, 'active',
    'SUV diesel turbo bertenaga besar dengan fitur keselamatan lengkap untuk perjalanan lintas Sumatera Utara.',
    '/vehicles/suv.svg'
  ),
  (
    '33333333-3333-4333-8333-333333333309',
    '11111111-1111-4111-8111-111111111104',
    'BK 7012 AAK', 'Toyota', 'Hiace Commuter', 2023, 'Putih',
    'manual', 'diesel', 15, 1250000, 'active',
    'Minibus 15 kursi berkapasitas besar untuk rombongan wisata keluarga besar atau instansi di Medan.',
    '/vehicles/van.svg'
  ),
  (
    '33333333-3333-4333-8333-333333333310',
    '11111111-1111-4111-8111-111111111104',
    'BK 7099 AAL', 'Toyota', 'Hiace Premio', 2024, 'Silver Metalik',
    'manual', 'diesel', 12, 1450000, 'maintenance',
    'Kabin ekstra lega dengan kursi reclining individual untuk perjalanan grup eksekutif.',
    '/vehicles/van.svg'
  ),
  (
    '33333333-3333-4333-8333-333333333311',
    '11111111-1111-4111-8111-111111111105',
    'BK 4112 AAM', 'Yamaha', 'NMAX 155 Connected', 2024, 'Biru Navy',
    'automatic', 'bensin', 2, 140000, 'active',
    'Skutik 155cc posisi duduk rileks, bagasi muat helm, lengkap dengan 2 helm SNI dan jas hujan.',
    '/vehicles/yamaha-nmax-155-connected.png'
  ),
  (
    '33333333-3333-4333-8333-333333333312',
    '11111111-1111-4111-8111-111111111105',
    'BK 4288 AAN', 'Honda', 'Vario 160 ABS', 2024, 'Hitam Doff',
    'automatic', 'bensin', 2, 120000, 'active',
    'Motor matik responsif dengan rem ABS dan soket pengisi daya USB untuk keliling kuliner Kota Medan.',
    '/vehicles/honda-vario-160-abs.jfif'
  )
on conflict (plate_number) do update set
  image_url = excluded.image_url,
  daily_price = excluded.daily_price,
  status = excluded.status;

insert into public.bookings (
  id, booking_code, user_id, vehicle_id, start_date, end_date,
  pickup_location, return_location, daily_price_snapshot, total_price,
  status, notes, admin_notes, expires_at
) values
  (
    '44444444-4444-4444-8444-444444444401',
    'RG-261010-A101',
    '22222222-2222-4222-8222-222222222202',
    '33333333-3333-4333-8333-333333333303',
    '2026-10-10', '2026-10-12',
    'Bandara Kualanamu', 'Bandara Kualanamu',
    420000, 1260000,
    'completed',
    'Jemput di pintu kedatangan domestik pukul 09.00 WIB.',
    'Unit dikembalikan tepat waktu dan kondisi bersih.',
    null
  ),
  (
    '44444444-4444-4444-8444-444444444402',
    'RG-261102-B202',
    '22222222-2222-4222-8222-222222222203',
    '33333333-3333-4333-8333-333333333305',
    '2026-11-02', '2026-11-04',
    'Stasiun Medan', 'Kantor RentGo Medan',
    750000, 2250000,
    'completed',
    'Perjalanan dinas tiga hari di Medan.',
    'Pembayaran QRIS sudah lunas.',
    null
  ),
  (
    '44444444-4444-4444-8444-444444444403',
    'RG-261114-C303',
    '22222222-2222-4222-8222-222222222202',
    '33333333-3333-4333-8333-333333333308',
    '2026-11-14', '2026-11-16',
    'Kantor RentGo Medan', 'Kantor RentGo Medan',
    1150000, 3450000,
    'ongoing',
    'Kunjungan keluarga ke Danau Toba.',
    'Serah terima unit dilakukan pukul 08.00 WIB.',
    null
  ),
  (
    '44444444-4444-4444-8444-444444444404',
    'RG-261115-D404',
    '22222222-2222-4222-8222-222222222203',
    '33333333-3333-4333-8333-333333333301',
    '2026-11-22', '2026-11-24',
    'Bandara Kualanamu', 'Stasiun Medan',
    320000, 960000,
    'pending',
    'Mohon unit siap pagi hari.',
    null,
    now() + interval '24 hours'
  )
on conflict (booking_code) do nothing;

insert into public.payments (
  id, booking_id, amount, method, status, proof_url, paid_at, verified_by, note
) values
  (
    '55555555-5555-4555-8555-555555555501',
    '44444444-4444-4444-8444-444444444401',
    1260000, 'qris', 'paid', '/vehicles/receipt-placeholder.svg',
    '2026-10-09 14:30:00+07', '22222222-2222-4222-8222-222222222201',
    'Lunas via QRIS Midtrans Sandbox (rentgo-test).'
  ),
  (
    '55555555-5555-4555-8555-555555555502',
    '44444444-4444-4444-8444-444444444402',
    2250000, 'qris', 'paid', '/vehicles/receipt-placeholder.svg',
    '2026-11-01 10:15:00+07', '22222222-2222-4222-8222-222222222201',
    'Lunas via QRIS Midtrans Sandbox (rentgo-test).'
  ),
  (
    '55555555-5555-4555-8555-555555555503',
    '44444444-4444-4444-8444-444444444403',
    3450000, 'qris', 'paid', '/vehicles/receipt-placeholder.svg',
    '2026-11-13 16:00:00+07', '22222222-2222-4222-8222-222222222201',
    'Lunas sebelum serah terima via QRIS.'
  ),
  (
    '55555555-5555-4555-8555-555555555504',
    '44444444-4444-4444-8444-444444444404',
    960000, 'qris', 'unpaid', null,
    null, null,
    'Menunggu pembayaran QRIS Midtrans Sandbox.'
  )
on conflict (id) do nothing;

insert into public.maintenance_logs (
  id, vehicle_id, title, description, start_date, end_date, cost, status
) values
  (
    '66666666-6666-4666-8666-666666666601',
    '33333333-3333-4333-8333-333333333310',
    'Servis Berkala 40.000 KM & Ganti Kampas Rem',
    'Pengecekan sistem pengereman, ganti oli mesin diesel, dan spooring di bengkel resmi Medan.',
    '2026-11-14', '2026-11-18',
    1850000, 'in_progress'
  )
on conflict (id) do nothing;
