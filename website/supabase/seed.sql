-- ============================================================================
-- RentGo Initial Seed Data (seed.sql)
-- 5 Kategori, 12 Kendaraan Realistis Pasar Medan, 2 Pengguna (Admin + Customer),
-- Contoh Booking Berbagai Status, dan 1 Jadwal Perawatan.
-- ============================================================================

-- 1. Seed Categories (5 Kategori)
insert into public.vehicle_categories (id, name, slug, description) values
  ('11111111-1111-4111-8111-111111111101', 'Mobil City', 'mobil-city', 'Mobil kompak hemat bahan bakar untuk mobilitas dalam Kota Medan.'),
  ('11111111-1111-4111-8111-111111111102', 'MPV / Minibus', 'mpv-minibus', 'Kendaraan keluarga 7 penumpang untuk perjalanan grup dan antar-jemput Bandara Kualanamu.'),
  ('11111111-1111-4111-8111-111111111103', 'SUV', 'suv', 'Ground clearance tinggi dan mesin bertenaga untuk rute tanjakan Berastagi dan Danau Toba.'),
  ('11111111-1111-4111-8111-111111111104', 'Van / Hiace', 'van-hiace', 'Kapasitas besar 14-15 kursi untuk rombongan wisata dan kunjungan kerja.'),
  ('11111111-1111-4111-8111-111111111105', 'Motor', 'motor', 'Sepeda motor matik praktis untuk komuter harian di pusat Kota Medan.')
on conflict (slug) do nothing;

-- 2. Seed Users (Admin dari ADMIN_EMAILS & Contoh Customer)
insert into public.users (id, firebase_uid, email, full_name, avatar_url, phone, driver_license_no, role, is_active) values
  ('22222222-2222-4222-8222-222222222201', 'firebase-admin-akbar', 'akbarriansyah339@gmail.com', 'Akbar Riansyah', null, '081260009988', '1271091511040001', 'admin', true),
  ('22222222-2222-4222-8222-222222222202', 'firebase-cust-nadia', 'nadia.siregar@gmail.com', 'Nadia Siregar', null, '081370112233', '1271082405990002', 'customer', true),
  ('22222222-2222-4222-8222-222222222203', 'firebase-cust-rizky', 'rizky.nasution@gmail.com', 'Rizky Nasution', null, '082165448899', '1271031102970003', 'customer', true)
on conflict (email) do nothing;

-- 3. Seed Vehicles (12 Kendaraan Realistis Pasar Medan)
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
    '/vehicles/city-car.svg'
  ),
  (
    '33333333-3333-4333-8333-333333333302',
    '11111111-1111-4111-8111-111111111101',
    'BK 1482 AAC', 'Toyota', 'Agya GR Sport', 2024, 'Kuning',
    'automatic', 'bensin', 5, 300000, 'active',
    'Hatchback irit BBM dengan kabin ergonomis, cocok untuk mobilitas harian maupun perjalanan singkat dari Stasiun Medan.',
    '/vehicles/city-car.svg'
  ),
  (
    '33333333-3333-4333-8333-333333333303',
    '11111111-1111-4111-8111-111111111102',
    'BK 1750 AAD', 'Toyota', 'Avanza 1.5 G CVT', 2024, 'Hitam Metalik',
    'automatic', 'bensin', 7, 420000, 'active',
    'MPV 7 kursi dengan AC double blower dingin, ruang bagasi lega untuk koper Bandara Kualanamu, dan konsumsi BBM efisien.',
    '/vehicles/mpv.svg'
  ),
  (
    '33333333-3333-4333-8333-333333333304',
    '11111111-1111-4111-8333-333333333304',
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
    '/vehicles/mpv.svg'
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
    '/vehicles/scooter.svg'
  ),
  (
    '33333333-3333-4333-8333-333333333312',
    '11111111-1111-4111-8111-111111111105',
    'BK 4288 AAN', 'Honda', 'Vario 160 ABS', 2024, 'Hitam Doff',
    'automatic', 'bensin', 2, 120000, 'active',
    'Motor matik responsif dengan rem ABS dan soket pengisi daya USB untuk keliling kuliner Kota Medan.',
    '/vehicles/scooter.svg'
  )
on conflict (plate_number) do nothing;

-- Fix foreign key on vehicle 4 if needed
update public.vehicles
set category_id = '11111111-1111-4111-8111-111111111102'
where id = '33333333-3333-4333-8333-333333333304';

-- 4. Seed Bookings (Contoh Berbagai Status)
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
    'Pembayaran transfer Mandiri sudah lunas.',
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

-- 5. Seed Payments
insert into public.payments (
  id, booking_id, amount, method, status, proof_url, paid_at, verified_by, note
) values
  (
    '55555555-5555-4555-8555-555555555501',
    '44444444-4444-4444-8444-444444444401',
    1260000, 'transfer', 'paid', '/vehicles/receipt-placeholder.svg',
    '2026-10-09 14:30:00+07', '22222222-2222-4222-8222-222222222201',
    'Transfer Bank Mandiri terverifikasi.'
  ),
  (
    '55555555-5555-4555-8555-555555555502',
    '44444444-4444-4444-8444-444444444402',
    2250000, 'qris', 'paid', '/vehicles/receipt-placeholder.svg',
    '2026-11-01 10:15:00+07', '22222222-2222-4222-8222-222222222201',
    'Lunas via QRIS.'
  ),
  (
    '55555555-5555-4555-8555-555555555503',
    '44444444-4444-4444-8444-444444444403',
    3450000, 'transfer', 'paid', '/vehicles/receipt-placeholder.svg',
    '2026-11-13 16:00:00+07', '22222222-2222-4222-8222-222222222201',
    'Lunas sebelum serah terima.'
  ),
  (
    '55555555-5555-4555-8555-555555555504',
    '44444444-4444-4444-8444-444444444404',
    960000, 'transfer', 'unpaid', null,
    null, null,
    'Menunggu unggahan bukti pembayaran pelanggan.'
  )
on conflict (id) do nothing;

-- 6. Seed Maintenance Schedule (1 Jadwal Perawatan Aktif)
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
