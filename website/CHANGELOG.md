# Changelog - RentGo Medan

Seluruh perubahan penting pada proyek **RentGo (Sistem Manajemen Penyewaan Kendaraan)** didokumentasikan pada berkas ini mengikuti siklus **SDLC Incremental**.

## [v1.0.0] - 2026-11-15 (Increment 4: Hardening, Testing, Docs & Slidev Release)
### Added
- Rangkaian pengujian End-to-End (E2E) menggunakan Playwright (`tests/e2e/rentgo.spec.ts`) yang memverifikasi 8 skenario kritis lintas peran Customer dan Admin.
- Skrip otomatisasi tangkapan layar dokumentasi (`scripts/capture-screenshots.mjs`) untuk menghasilkan bukti visual nyata pada `docs/screenshots/`.
- Dokumentasi pengujian (`docs/04-pengujian.md`), panduan deployment (`docs/05-deployment.md`), dan naskah presentasi UTS beserta jawaban tanya-jawab (`docs/06-presentasi.md`).
- Dek presentasi akademik **Slidev** (`../slidev/slides.md`) 12 slide dengan tema warna resmi RentGo dan ekspor PDF (`../slidev/dist/RentGo-UTS.pdf`).

## [v0.4.0] - 2026-11-15 (Increment 3: Landing Surface, AI Recommendation & Reporting)
### Added
- Halaman pemasaran utama `rentgo.my.id` (`src/app/site/landing/page.tsx`) dengan Hero pencarian cepat, katalog armada nyata dari database, tabel transparansi harga, FAQ Medan, dan metadata JSON-LD `AutoRental`.
- Fitur **Rekomendasi Kendaraan Cerdas ("Bantu Saya Pilih")** (`POST /api/ai/recommend` & `src/lib/ai.ts`) menggunakan Google Gemini SDK (`@google/genai`) dengan validasi ketat terhadap daftar unit yang tersedia dan fallback deterministik otomatis.
- Dasbor analitik Admin (`src/app/site/admin/page.tsx`) dengan 6 kartu KPI, grafik pendapatan 6 bulan, top 5 unit terlaris, kalender ketersediaan 7 hari, serta fitur ekspor laporan transaksi ke CSV (`GET /api/bookings?format=csv`).
- Endpoint cron harian (`GET /api/cron/housekeeping`) untuk kedaluwarsa otomatis pesanan `pending` lewat 24 jam.

## [v0.3.0] - 2026-11-15 (Increment 2: Customer Booking Engine & Anti Double-Booking)
### Added
- Aplikasi penyewaan pelanggan `book.rentgo.my.id` (`src/app/site/book/page.tsx`) dengan filter ketersediaan tanggal WIB (`Asia/Jakarta`), kategori, transmisi, dan kapasitas kursi.
- Mesin pencegah bentrok jadwal (`src/lib/availability.ts` & transaksi repositori) terhadap pesanan aktif (`pending`, `confirmed`, `ongoing`) dan jadwal perawatan (`scheduled`, `in_progress`).
- Halaman detail kendaraan & checkout (`src/app/site/book/vehicles/[id]/page.tsx`) dengan kalkulasi harga server-side dan 3 titik pengambilan di Medan (`Bandara Kualanamu`, `Stasiun Medan`, `Kantor RentGo Medan`).
- Halaman "Pesanan Saya" (`/bookings` & `/bookings/[id]`) dengan fitur unggah bukti pembayaran, pembatalan pesanan `pending`, dan konfirmasi WhatsApp (`wa.me`).
- Modul manajemen pesanan & verifikasi pembayaran di panel Admin (`/bookings`).

## [v0.2.0] - 2026-11-15 (Increment 1: Core Inventory & Admin Panel)
### Added
- Kerangka operasional `admin.rentgo.my.id` (`AdminShell`) dengan proteksi RBAC (`HTTP 403` bagi pengguna non-admin).
- Modul CRUD Kategori Kendaraan (`/categories`) dengan proteksi penghapusan kategori aktif.
- Modul CRUD Armada Kendaraan (`/vehicles`) dengan pencarian, filter, paginasi, unggah foto (`/api/upload`), dan soft delete (`deleted_at`).
- Modul CRUD Jadwal Perawatan & Servis (`/maintenance`) yang terhubung langsung ke perhitungan ketersediaan armada.
- Modul Manajemen Pelanggan (`/customers`) untuk pengaturan peran (`customer`/`admin`) dan status aktif akun.

## [v0.1.0] - 2026-11-15 (Increment 0: Foundation, Multi-Subdomain Routing & Auth)
### Added
- Struktur proyek Next.js 15 (App Router, TypeScript strict) dengan sistem token desain terkunci (`src/styles/tokens.css`).
- Middleware routing berbasis `Host` header (`src/middleware.ts`) untuk memetakan `rentgo.my.id`, `book.rentgo.my.id`, dan `admin.rentgo.my.id` dari satu deployment tunggal.
- Skema migrasi Supabase PostgreSQL (`supabase/migrations/0001_init.sql`) dan data awal (`supabase/seed.sql`) berisi armada kendaraan plat BK Sumatera Utara.
- Integrasi autentikasi Firebase Google Sign-In dengan cookie sesi HTTP-only `__session` lintas subdomain dan dukungan emulator lokal.
