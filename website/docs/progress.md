# Log Kemajuan Pengembangan (Progress Log) - RentGo Medan

Dokumen ini mencatat riwayat iterasi pengembangan **RentGo Medan** mengikuti metodologi **SDLC Incremental** dari Increment 0 hingga Increment 4, dilanjutkan dengan **Pembaruan Integrasi Kredensial Cloud, UI/UX Triadik, QRIS Midtrans Sandbox, & Dokumentasi Arsitektur (`v1.1.0`)**.

## Ringkasan Status Increment

| Increment | Branch Git | Tag Rilis | Fokus Utama | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Increment 0** | `inc-0-foundation` | `v0.1.0` | Fondasi monorepo, routing multi-subdomain (`middleware.ts`), skema database Supabase + seed data Medan, dan sistem autentikasi Firebase + RBAC | Selesai |
| **Increment 1** | `inc-1-core-admin` | `v0.2.0` | Panel Admin (`admin.rentgo.my.id`), CRUD Kategori & Kendaraan + upload foto + soft delete, CRUD Jadwal Perawatan, dan Manajemen Pelanggan | Selesai |
| **Increment 2** | `inc-2-booking-engine` | `v0.3.0` | Aplikasi Booking (`book.rentgo.my.id`), mesin anti double-booking inklusif WIB, kalkulator harga server-side, state machine booking, pembayaran QRIS, dan konfirmasi WhatsApp | Selesai |
| **Increment 3** | `inc-3-landing-ai` | `v0.4.0` | Halaman Landing (`rentgo.my.id`) 10 bagian, asisten rekomendasi AI ("Bantu Saya Pilih") berbasis Gemini + fallback deterministik, Dasbor Admin + grafik + ekspor CSV, dan cron housekeeping | Selesai |
| **Increment 4** | `inc-4-hardening-release` | `v1.0.0` | Pengujian unit (Vitest) & E2E (Playwright), tangkapan layar otomatis (`docs/screenshots/`), dokumentasi akademik lengkap (`01`..`06`), dan dek presentasi Slidev + PDF | Selesai |
| **Cloud & UI Upgrade** | `main` | `v1.1.0` | Integrasi kredensial Firebase (`rentgo-medan`), Supabase (`honhszsloegvpbmczkqf`), Gemini Flash Latest (limit 10/menit), Midtrans Sandbox QRIS (`rentgo-test`) + tombol "Sudah Bayar", Teori Warna Triadik, Logo baru, foto kendaraan asli `public/vehicles/`, perbaikan responsivitas Sidebar/Navbar/Action Admin, serta perluasan Slidev (ERD, Flowchart, Arsitektur, Cara Tes Black-Box) | Selesai |

---

## Rincian Riwayat Setiap Increment & Pembaruan

### Increment 0 - Foundation (`v0.1.0`)
- Inisialisasi struktur monorepo `website/` dan `slidev/` beserta workflow GitHub Actions CI (`.github/workflows/ci.yml`).
- Implementasi `src/styles/tokens.css` dengan palet warna terkunci dan rasio kontras terverifikasi WCAG AA.
- Pembuatan migrasi SQL `supabase/migrations/0001_init.sql` (7 tabel, indeks komposit, fungsi RPC transaksional `create_booking_safe`, dan Row Level Security) serta `supabase/seed.sql`.
- Implementasi `src/middleware.ts` untuk pemetaan host `rentgo.my.id`, `book.rentgo.my.id`, dan `admin.rentgo.my.id`, blokir akses langsung ke `/site/*` (HTTP 404), serta dukungan parameter `?site=` di lingkungan non-produksi.
- Implementasi pertukaran sesi Firebase ke cookie HTTP-only `__session` (`POST /api/auth/session` dan `POST /api/auth/logout`).

### Increment 1 - Core Inventory & Admin (`v0.2.0`)
- Pembangunan kerangka `AdminShell` (`src/components/admin/admin-shell.tsx`) dengan proteksi RBAC (`HTTP 403` untuk akun ber-role `customer`).
- Implementasi CRUD Kategori Kendaraan (`/categories` dan `/api/categories`) dengan proteksi penghapusan kategori yang masih memiliki unit aktif.
- Implementasi CRUD Kendaraan (`/vehicles` dan `/api/vehicles`) lengkap dengan pencarian, filter kategori/status/transmisi, paginasi, unggah foto (`/api/upload`), dan soft delete (`deleted_at`).
- Implementasi CRUD Jadwal Perawatan (`/maintenance` dan `/api/maintenance`) yang otomatis mengunci ketersediaan unit ketika berstatus `scheduled` atau `in_progress`.
- Implementasi Manajemen Pelanggan (`/customers` dan `/api/users`) untuk memantau jumlah transaksi serta mengubah role atau status aktif pengguna.

### Increment 2 - Booking Engine (`v0.3.0`)
- Pembangunan antarmuka katalog penyewaan pelanggan (`src/app/site/book/page.tsx`) dengan pencarian tanggal mulai/selesai WIB dan filter spesifikasi.
- Implementasi validasi ketersediaan bebas bentrok (`src/lib/availability.ts`) dengan rumus irisan tanggal inklusif `existing.start_date <= req.end_date AND existing.end_date >= req.start_date`.
- Implementasi halaman detail unit & checkout (`src/app/site/book/vehicles/[id]/page.tsx`) dengan kalkulasi harga server-side (`calculateBookingPrice`) dan pemilihan titik serah terima (`Bandara Kualanamu`, `Stasiun Medan`, `Kantor RentGo Medan`).
- Implementasi halaman "Pesanan Saya" (`/bookings` dan `/bookings/[id]`) dengan konfirmasi pembayaran, pembatalan mandiri saat berstatus `pending`, dan tautan konfirmasi WhatsApp (`wa.me`) otomatis.
- Implementasi manajemen pesanan & verifikasi pembayaran di sisi Admin (`src/components/admin/bookings-manager.tsx`).

### Increment 3 - Landing, AI Recommendation & Reporting (`v0.4.0`)
- Pembangunan halaman Landing publik (`src/app/site/landing/page.tsx`) yang memuat 10 bagian wajib: Navbar sticky, Hero split-layout dengan pencarian tanggal cepat & gambar LCP berprioritas tinggi, 4 keunggulan operasional, armada unggulan dari database, 3 langkah menyewa, tabel transparansi tarif, FAQ Medan, CTA WhatsApp, Footer, serta JSON-LD `AutoRental`.
- Implementasi asisten cerdas "Bantu Saya Pilih" (`POST /api/ai/recommend` dan `src/lib/ai.ts`) yang dibatasi hanya pada ID kendaraan yang tersedia, dilengkapi fallback deterministik berbasis aturan skor, dan pencatatan ke `ai_recommendation_logs`.
- Pembangunan Dasbor Utama Admin (`src/app/site/admin/page.tsx`) dengan 6 kartu KPI, grafik batang pendapatan 6 bulan terakhir, peringkat 5 kendaraan terlaris, matriks kalender ketersediaan 7 hari, dan ekspor laporan CSV (`/api/bookings?format=csv`).
- Implementasi endpoint cron harian (`GET /api/cron/housekeeping`) yang otomatis mengubah pesanan `pending` lewat 24 jam menjadi `expired`.

### Increment 4 - Hardening, Testing, Documentation & Slidev (`v1.0.0`)
- Penyelesaian rangkaian pengujian unit Vitest (21 kasus uji) dan E2E Playwright (`tests/e2e/rentgo.spec.ts`).
- Pengambilan tangkapan layar nyata (`npm run docs:screens`) ke `website/docs/screenshots/` dan sinkronisasi ke `slidev/public/screens/`.
- Penyusunan dokumentasi akademik lengkap (`00` s/d `06`) dan dek presentasi Slidev (`slidev/slides.md`).

### Pembaruan Kredensial Cloud, UI/UX Triadik, & Slidev Lengkap (`v1.1.0`)
1. **Integrasi Kredensial Live:**
   - **Firebase Auth & Firestore (`rentgo-medan`):** Konfigurasi App ID `1:1047637681782:web:5ed7cbbc05c3ff1ed32157` dengan dukungan penuh **Email/Password Authentication** (Masuk & Daftar) serta **Google Sign-In Popup**, diverifikasi di sisi server melalui Identity Toolkit REST API (`accounts:lookup`).
   - **Supabase Database & Cloud Storage (`honhszsloegvpbmczkqf`):** Konfigurasi MCP `.mcp.json` dan unggah foto kendaraan otomatis ke bucket cloud Supabase pada `/api/upload` (dengan fallback lokal `public/uploads/`).
   - **Google Gemini AI (`gemini-flash-latest`):** Terhubung ke endpoint REST `v1beta/models/gemini-flash-latest:generateContent` dengan proteksi **Sliding-Window Rate Limit 10 respons per menit (`10 req/min`)** dan fallback cerdas 2,5 detik.
   - **Midtrans Sandbox QRIS (`rentgo-test`):** Pembayaran dikunci khusus ke **QRIS**, menampilkan matriks kode QRIS Midtrans Sandbox dinamis per kode pesanan, dan menyediakan tombol interaktif **"Sudah Bayar (Simulasi QRIS Midtrans Sandbox)"** yang langsung melunasi tagihan.
2. **Perbaikan Visual, Responsivitas, & Gambar Kendaraan Asli:**
   - **Teori Warna Triadik (`src/styles/tokens.css`):** Penerapan palet Triadik 120 derajat: Triad I Cobalt/Navy (`#0B1D3A`/`#1D4ED8`), Triad II Emerald-Teal (`#0D9488`/`#0F766E`), dan Triad III Warm Amber-Gold (`#F59E0B`/`#B45309`).
   - **Desain Ulang Logo (`src/components/shared/logo.tsx`):** Emblem perisai otomotif Triadik berlapis dengan indikator surface.
   - **Perbaikan Sidebar, Navbar Sticky, & Penghapusan Menu Mati:** Sidebar desktop Admin kini `lg:sticky lg:top-0 lg:h-screen`, dilengkapi laci mobile responsif + bar navigasi cepat, dan tautan mati *Panduan Desain* (`/_styleguide`) telah dihapus.
   - **Perbaikan Tombol Action pada 5 Tabel Admin:** Seluruh tombol aksi kini menggunakan desain *pill button* berbatas tegas (`border`), warna Triadik, dan tata letak `flex-wrap` yang rapi di semua ukuran layar.
   - **Pemetaan 6 Foto Kendaraan Asli (`public/vehicles/`):** Menghubungkan `Honda-Brio-Satya-RS.jfif`, `Toyota-Agya-GR-Sport.jpg`, `Toyota-Avanza-1.5-G-CVT.png`, `Daihatsu-Xenia-1.3-R-MT.png`, `yamaha-nmax-155-connected.png`, dan `honda-vario-160-abs.jfif` ke data kendaraan utama, sementara `.svg` dipertahankan murni sebagai *fallback placeholder*.
3. **Perluasan Slidev & Dokumentasi Pertinggal:**
   - Penambahan slide khusus **Teori Warna Triadik**, **Arsitektur Sistem & Penghubung Antar-Komponen (Inter-Service Connectors)**, **Diagram ERD 7 Tabel + Penjelasan Relasi**, **Flowchart Booking/Anti Double-Booking/QRIS & AI**, serta **Metodologi & Cara Tes Black-Box** pada `slidev/slides.md` dan `slidev/dist/RentGo-UTS.pdf`.
