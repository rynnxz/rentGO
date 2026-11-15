# Dokumentasi Pertinggal: Laporan Perbaikan, Status Fitur, & Arsitektur Sistem RentGo Medan

> **Identitas Proyek:**
> - **Nama Sistem:** RentGo Medan - Sistem Manajemen Penyewaan Kendaraan Berbasis Web
> - **Mahasiswa:** Akbar Riansyah (Proyek Individu No. 2 - UTS Metode Model Pengembangan Perangkat Lunak)
> - **Program Studi:** Teknologi Rekayasa Perangkat Lunak (TRPL) Semester III - Politeknik Wilmar Bisnis Indonesia
> - **Versi Rilis Saat Ini:** `v1.1.0` (Seluruh 5 Increment SDLC `v0.1.0`..`v1.0.0` + Pembaruan Kredensial Cloud, UI Triadik, QRIS Sandbox, & Slidev Lengkap)

Dokumen ini disusun sebagai **catatan pertinggal (handover & status report)** yang merangkum seluruh perbaikan yang telah dikerjakan, status kredensial cloud yang terpasang, arsitektur penghubung antar-layanan, daftar fitur lengkap di ketiga subdomain, hingga cara menjalankan dan menguji proyek.

---

## 1. Daftar Lengkap Perbaikan yang Telah Dikerjakan

Berikut adalah rincian seluruh perbaikan yang telah diimplementasikan sesuai permintaan:

### 1.1 Perbaikan Identitas Visual, Logo, & Teori Warna Triadik
- **Penerapan Teori Warna Triadik (`website/src/styles/tokens.css` & `slidev/style.css`):**
  Menggunakan skema warna **Triadik (3 titik berjarak 120 derajat pada roda warna)** dengan proporsi **60% - 30% - 10%** dan kontras yang memenuhi standar **WCAG AA**:
  1. **Triad I - Dominan 60% (`220 deg` Cobalt & Deep Navy):** `#0B1D3A` (`--navy-900`), `#112A52` (`--navy-800`), `#1D4ED8` (`--primary-600`). Digunakan untuk struktur navigasi sticky, sidebar Admin, tipografi judul, dan tombol primer.
  2. **Triad II - Sekunder 30% (`172 deg` Emerald-Teal):** `#0D9488` (`--secondary-600`), `#0F766E` (`--secondary-700`), `#F0FDFA` (`--secondary-50`). Digunakan untuk indikator unit tersedia real-time, status lunas QRIS Midtrans Sandbox, dan tombol upload cloud.
  3. **Triad III - Aksen 10% (`38 deg` Warm Amber-Gold):** `#F59E0B` (`--accent-500`), `#B45309` (`--accent-600`), `#FFFBEB` (`--accent-50`). Digunakan untuk emblem logo, CTA utama, badge rekomendasi AI Gemini, dan tombol aksi Edit.
- **Perombakan Logo RentGo (`website/src/components/shared/logo.tsx`):**
  Mengganti logo lama yang polos menjadi **Emblem Otomotif Perisai Triadik** berlapis (perisai gradien Cobalt-Navy, jalur akselerasi Emerald-Teal, mahkota lokasi Amber-Gold, serta tipografi `RentGo` dua warna lengkap dengan badge indikator permukaan `MEDAN` / `BOOKING` / `ADMIN PANEL`).

### 1.2 Perbaikan Layout Dashboard Admin, Sticky Sidebar/Navbar, & Penghapusan Menu Mati
- **Penghapusan Menu "Panduan Desain" (`website/src/components/admin/admin-shell.tsx`):**
  Menghapus tautan non-aktif *Panduan Desain (`/_styleguide`)* dari sidebar Admin sehingga seluruh menu navigasi di sidebar 100% hidup dan fungsional.
- **Sticky Sidebar & Sticky Top Navbar (`admin-shell.tsx`, `book-navbar.tsx`, `landing/page.tsx`):**
  - Sidebar desktop Admin kini dikunci dengan `lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto` sehingga tidak ikut tergulung ketika halaman memiliki tabel panjang.
  - Topbar Admin, Navbar Booking (`book.rentgo.my.id`), dan Navbar Landing (`rentgo.my.id`) semuanya menggunakan `sticky top-0 z-40` dengan `backdrop-blur-md`.
  - Pada layar mobile/tablet di Dashboard Admin, ditambahkan **tombol Hamburger pembuka Slide-Over Drawer** beserta **bilah akses cepat horizontal** agar perpindahan antar-menu tetap nyaman di layar kecil.

### 1.3 Perbaikan Responsivitas Tombol Action pada Seluruh Tabel Admin
- Memperbaiki tampilan kolom **Aksi (Action)** pada kelima komponen manajemen Admin:
  1. `website/src/components/admin/bookings-manager.tsx` (Set Lunas / Verifikasi Lunas, Konfirmasi, Mulai Sewa, Selesaikan, Tolak, Detail)
  2. `website/src/components/admin/vehicles-manager.tsx` (Edit & Hapus Kendaraan)
  3. `website/src/components/admin/maintenance-manager.tsx` (Mulai Servis, Selesai Servis, Hapus)
  4. `website/src/components/admin/customers-manager.tsx` (Set Admin/Customer, Aktifkan/Nonaktifkan)
  5. `website/src/components/admin/categories-manager.tsx` (Edit & Hapus Kategori)
- Seluruh tombol aksi kini ditempatkan dalam toolbar `inline-flex flex-wrap items-center justify-end gap-1.5` dengan tinggi proporsional `min-h-[38px]`, `whitespace-nowrap`, garis tepi (`border`) tegas, bayangan halus (`shadow-2xs`), serta warna Triadik yang jelas.

### 1.4 Penggunaan Foto Kendaraan Asli (`public/vehicles/`) & Placeholder SVG
- Memetakan **6 foto kendaraan asli** yang tersedia di `website/public/vehicles/` ke data armada utama di `src/lib/repository.ts`, `supabase/seed.sql`, Hero Landing Page, Katalog Booking, dan opsi form Admin:
  1. `/vehicles/Honda-Brio-Satya-RS.jfif` -> **Honda Brio Satya RS** (`BK 1124 AAB`)
  2. `/vehicles/Toyota-Agya-GR-Sport.jpg` -> **Toyota Agya GR Sport** (`BK 1482 AAC`)
  3. `/vehicles/Toyota-Avanza-1.5-G-CVT.png` -> **Toyota Avanza 1.5 G CVT** (`BK 1750 AAD`)
  4. `/vehicles/Daihatsu-Xenia-1.3-R-MT.png` -> **Daihatsu Xenia 1.3 R MT** (`BK 1310 AAG`)
  5. `/vehicles/yamaha-nmax-155-connected.png` -> **Yamaha NMAX 155 Connected** (`BK 4112 AAM`)
  6. `/vehicles/honda-vario-160-abs.jfif` -> **Honda Vario 160 ABS** (`BK 4288 AAN`)
- Memperbarui `website/src/middleware.ts` dan `website/src/app/api/upload/route.ts` agar ekstensi `.jfif` dilayani secara statis tanpa terblokir middleware.
- Mempertahankan berkas `.svg` (`city-car.svg`, `mpv.svg`, `suv.svg`, `van.svg`, `scooter.svg`) murni sebagai **fallback placeholder** apabila gambar gagal dimuat (`onError`) atau unit baru belum memiliki foto kamera.

### 1.5 Integrasi Kredensial Cloud (Firebase Auth, Supabase, Midtrans Sandbox QRIS, & Gemini AI Limit 10/Menit)
- **Firebase Authentication & Firestore (`rentgo-medan`):**
  - Terhubung ke proyek Firebase `rentgo-medan` dengan App ID `1:1047637681782:web:5ed7cbbc05c3ff1ed32157`.
  - Dialog autentikasi (`website/src/components/shared/auth-controls.tsx`) mendukung **Email/Password Authentication** (Masuk & Daftar Akun Baru), **Google Sign-In Popup**, serta tombol cepat **Akun Demo Customer & Admin** untuk pengujian instan.
  - Verifikasi token ID di sisi server (`website/src/lib/firebase-admin.ts`) menggunakan Firebase Identity Toolkit REST API (`accounts:lookup`) dan menyimpan sesi ke cookie HTTP-only `__session`.
- **Supabase Database & Cloud Photo Storage (`honhszsloegvpbmczkqf`):**
  - Konfigurasi MCP tersimpan di `.mcp.json` (`project_ref=honhszsloegvpbmczkqf`).
  - Endpoint `/api/upload` mengunggah foto kendaraan langsung ke **Supabase Storage** (`https://honhszsloegvpbmczkqf.supabase.co`) apabila kunci tersedia, atau menyimpannya secara aman ke `public/uploads/` sebagai fallback lokal.
- **Pembayaran Khusus QRIS Midtrans Sandbox (`rentgo-test`):**
  - Menggunakan Merchant ID `rentgo-test` dan Server Key yang dikonfigurasi melalui `.env.local`.
  - Halaman Checkout (`vehicle-checkout-view.tsx`) mengunci metode pembayaran khusus ke **QRIS (Midtrans Sandbox)** dan menampilkan pratinjau alur QRIS.
  - Halaman Detail Pesanan (`booking-detail-client.tsx`) menampilkan **Kartu Kode QRIS Midtrans Sandbox Dinamis** lengkap dengan NMID, nominal tagihan Rupiah, serta tombol **"Sudah Bayar (Simulasi QRIS Midtrans Sandbox)"** yang langsung mengubah status pembayaran menjadi `Lunas (Paid)`.
- **Google Gemini AI (`gemini-flash-latest`) dengan Rate Limit 10 Respons per Menit:**
  - Terhubung ke endpoint `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent` menggunakan header `X-goog-api-key`.
  - Dilengkapi **Sliding-Window Rate Limiter 10 respons per menit (`GEMINI_RATE_LIMIT_PER_MINUTE=10`)** di `src/app/api/ai/recommend/route.ts` menggunakan perhitungan log 60 detik terakhir (`countAiRequestsInLastMinute`) untuk mencegah penggunaan kuota berlebih.

### 1.6 Perbaikan & Perluasan Materi Presentasi Slidev (`slidev/slides.md`)
Dek presentasi Slidev telah diperluas menjadi **16 slide komprehensif** (dan diekspor ulang ke `slidev/dist/RentGo-UTS.pdf`) yang mencakup:
1. **Penjelasan Teori Warna Triadik & Identitas Visual Baru** (Slide 4).
2. **Arsitektur Sistem Lengkap (Multi-Surface Subdomain + 4-Tier Layered Architecture)** (Slide 5).
3. **Penghubung Antar-Arsitektur (Inter-Service Connectors):** Tabel & penjelasan teknis bagaimana Browser, Next.js Middleware, Firebase Auth, Supabase PostgreSQL/Storage, Midtrans Sandbox QRIS, dan Gemini AI saling berkomunikasi (Slide 6).
4. **Diagram ERD (Entity Relationship Diagram) Lengkap 7 Tabel** beserta **Penjelasan Relasi Antar-Tabel, Kardinalitas (`1:N`, `1:1`), & Soft-Delete** (Slide 7 & Slide 8).
5. **Flowchart Alur Sistem End-to-End:** Flowchart Pemesanan + Anti Double-Booking (`SELECT ... FOR UPDATE`) + QRIS Midtrans Sandbox, serta Flowchart Rekomendasi AI Gemini (Limit 10/menit) + State Machine Booking (Slide 9 & Slide 10).
6. **Metodologi & Prosedur Cara Tes Black-Box:** Penjelasan teknik *Equivalence Partitioning (EP)*, *Boundary Value Analysis (BVA)*, dan *State Transition Testing* beserta langkah-langkah cara menguji, input data uji, dan perbandingan *Expected vs Actual Output* (Slide 15 & Slide 16).

---

## 2. Status Kemajuan Website & Fitur Saat Ini (100% Selesai & Teruji)

Seluruh tiga permukaan subdomain **RentGo Medan** telah berfungsi penuh dan lulus seluruh pengujian otomatis:

### A. Permukaan 1: Landing Page Publik (`rentgo.my.id` / `http://localhost:3000/?site=landing`)
- Sticky Navbar dengan Logo Perisai Triadik & status sesi pengguna.
- Split-Hero dengan formulir pencarian tanggal cepat WIB dan kartu showcase **Honda Brio Satya RS** berfoto asli.
- Pita spesifikasi warna Triadik (Cobalt, Emerald-Teal, Amber-Gold).
- 4 Kartu Keunggulan Operasional Nyata (Anti Double-Booking, Harga Inklusif Transparan, Terintegrasi Jadwal Bengkel, Asisten AI Gemini).
- Showcase 6 Armada Unggulan dari database dengan foto asli (`public/vehicles/`).
- 3 Langkah Menyewa dengan QRIS Midtrans Sandbox.
- Tabel Transparansi Tarif per Kategori Armada, FAQ Operasional Medan, CTA WhatsApp, Footer, dan JSON-LD `AutoRental`.

### B. Permukaan 2: Aplikasi Booking Pelanggan (`book.rentgo.my.id` / `http://localhost:3000/?site=book`)
- Pencarian ketersediaan kendaraan real-time berdasarkan tanggal mulai & selesai (WIB), kategori, transmisi, kapasitas kursi, dan pengurutan harga.
- Panel Asisten Cerdas **"Bantu Saya Pilih"** berbasis **Gemini AI (`gemini-flash-latest`)** dengan batas **10 respons/menit** dan fallback heuristik deterministik.
- Halaman Detail Kendaraan & Checkout (`/?site=book/vehicles/[id]`) dengan kalkulator harga server-side, pilihan lokasi serah terima (`Bandara Kualanamu`, `Stasiun Medan`, `Kantor RentGo Medan`), dan metode pembayaran **QRIS Midtrans Sandbox (`rentgo-test`)**.
- Halaman **"Pesanan Saya"** (`/?site=book/bookings`) dan **Detail Pesanan** (`/?site=book/bookings/[id]`) yang menampilkan **Kode QRIS Dinamis**, tombol **"Sudah Bayar"**, tombol unggah bukti bayar manual, pembatalan pesanan saat `pending`, serta tombol konfirmasi WhatsApp Admin otomatis.

### C. Permukaan 3: Panel Operasional Admin (`admin.rentgo.my.id` / `http://localhost:3000/?site=admin`)
- Proteksi RBAC ketat: pengguna belum login diarahkan ke Gate Login; pengguna ber-role `customer` ditolak dengan halaman **HTTP 403 - Akses Ditolak**.
- Sticky Sidebar Desktop + Mobile Slide-Over Drawer + Quick Navigation Bar.
- **Dasbor Utama (`/`):** 6 Kartu KPI real-time, Grafik Pendapatan 6 Bulan Terakhir, Top 5 Armada Terlaris, dan Matriks Ketersediaan Armada 7 Hari ke Depan.
- **Manajemen Kendaraan (`/vehicles`):** Tabel pencarian & filter, tambah/edit unit dengan pilihan 6 foto asli `public/vehicles/` atau upload cloud Supabase, serta soft-delete (`deleted_at`).
- **Manajemen Kategori (`/categories`):** CRUD kategori dengan proteksi penghapusan kategori aktif.
- **Manajemen Pesanan & Pembayaran (`/bookings`):** Filter status, tombol **Set Lunas / Verifikasi Lunas**, transisi status (`Konfirmasi`, `Mulai Sewa`, `Selesaikan`, `Tolak`), modal detail & catatan internal, serta **Ekspor Laporan CSV**.
- **Manajemen Jadwal Perawatan (`/maintenance`):** Pencatatan jadwal bengkel (`scheduled`, `in_progress`, `done`) yang otomatis mengunci unit dari pencarian pelanggan.
- **Manajemen Pelanggan (`/customers`):** Daftar pengguna terautentikasi, total histori sewa, pengaturan role (`admin`/`customer`), dan pembekuan/pengaktifan akun.

---

## 3. Panduan Menjalankan Proyek & Verifikasi

```bash
# 1. Menjalankan Website Next.js (http://localhost:3000)
cd website
npm run dev

# Akses 3 Permukaan di Lokal:
# - Landing Page : http://localhost:3000/?site=landing
# - Booking App  : http://localhost:3000/?site=book
# - Admin Panel  : http://localhost:3000/?site=admin

# 2. Menjalankan Pemeriksaan Tipe & Unit Test (21 Test Vitest)
cd website
npm run typecheck
npm test

# 3. Menjalankan Pengujian E2E Browser Otomatis (Playwright)
cd website
npx playwright test

# 4. Mengambil Ulang 10 Tangkapan Layar Dokumentasi & Slidev
cd website
npm run docs:screens

# 5. Menjalankan & Mengekspor Dek Presentasi Slidev ke PDF
cd ../slidev
npm run sync:screens
npm run export
```
