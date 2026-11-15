# LAPORAN UJIAN TENGAH SEMESTER (UTS)
## Metode & Model Pengembangan Perangkat Lunak (MMPRPL)
### Proyek Individu No. 2 — Sistem Manajemen Penyewaan Kendaraan: **RentGo Medan**

| Atribut | Keterangan |
|---|---|
| **Nama Mahasiswa** | Akbar Riansyah |
| **NIM** | `2505010009` |
| **Program Studi** | Teknologi Rekayasa Perangkat Lunak (TRPL), Semester III |
| **Institusi** | Politeknik Wilmar Bisnis Indonesia |
| **Dosen Pengampu** | Rizki Ramadhansyah, S.T., M.Kom |
| **Versi Rilis & Commit** | `v1.2.0` (HEAD `9102e1e`) |
| **Repositori GitHub** | [https://github.com/rynnxz/rentGO.git](https://github.com/rynnxz/rentGO.git) |
| **Produksi Online** | [https://rentgo.my.id](https://rentgo.my.id) (`HTTP 308 -> https://www.rentgo.my.id/`, `HTTP 200 OK`) |
| **Tanggal Penyusunan** | 16 November 2026 |

---

## 1. Pendahuluan

### 1.1 Latar Belakang
Usaha penyewaan kendaraan di Sumatera Utara — mencakup Kota Medan, Bandara Internasional Kualanamu, Stasiun Kereta Api Medan, serta rute wisata unggulan menuju Berastagi dan Danau Toba — umumnya masih mengandalkan pencatatan manual lewat pesan WhatsApp atau buku kas fisik. Pola operasional tersebut menimbulkan empat permasalahan kritis:

1. **Bentrok jadwal (*double-booking*):** satu unit kendaraan dijanjikan kepada dua penyewa berbeda pada rentang tanggal yang beririsan.
2. **Ketidaksinkronan jadwal perawatan bengkel:** kendaraan yang sedang terjadwal servis berkala atau perbaikan tetap muncul seolah-olah siap disewa.
3. **Kesulitan pemilihan armada oleh calon penyewa:** pelanggan sering bingung menentukan kecocokan kategori kendaraan (city car, MPV 7 kursi, SUV rute tanjakan, van/Hiace rombongan, atau sepeda motor touring) terhadap anggaran harian dan jumlah penumpang.
4. **Status pesanan dan tagihan menggantung:** tanpa batas waktu pembayaran dan *state machine* yang baku, pesanan yang tidak dibayar mengunci stok unit tanpa kejelasan.

### 1.2 Tujuan
Membangun **Sistem Informasi Manajemen Penyewaan Kendaraan berbasis web (`RentGo Medan`)** yang berjalan penuh di atas basis data relasional, menyediakan operasi CRUD komprehensif, mengimplementasikan lebih dari tiga fitur utama terintegrasi, menerapkan metodologi pengembangan **SDLC Incremental** secara disiplin, lolos pengujian terstruktur (*Static Type Check*, *Unit & Concurrency Test*, *Black-Box Testing*, dan *Production Build*), serta aktif di lingkungan produksi cloud (*zero-cost tier*).

### 1.3 Ruang Lingkup Sistem
Aplikasi dirancang dalam arsitektur **Single-Domain Multi-Surface** dengan satu *origin* terpadu (`rentgo.my.id` / `localhost:3000`) yang membawahi tiga permukaan:
1. **Permukaan Landing Publik (`/`)** — profil layanan, pencarian tanggal cepat WIB, armada unggulan, transparansi tarif, peta interaktif 3 titik penjemputan Medan, dan FAQ.
2. **Aplikasi Pemesanan Pelanggan (`/book/*`)** — katalog filter ketersediaan real-time, asisten rekomendasi **Gemini AI (`Bantu Saya Pilih`)**, formulir checkout server-priced + validasi SIM/WhatsApp, QRIS Midtrans Sandbox, riwayat *"Pesanan Saya"*, dan pengelolaan profil.
3. **Panel Administrator (`/admin/*`)** — dasbor 6 KPI real-time, manajemen kategori armada, CRUD kendaraan + unggah foto + *soft-delete*, manajemen pesanan & verifikasi pembayaran modal aksi lengkap, penjadwalan servis bengkel, direktori pelanggan, serta ekspor laporan CSV.

---

## 2. Pemilihan Model Pengembangan Perangkat Lunak (SDLC Incremental)

### 2.1 Konsep & Justifikasi Model Incremental
Proyek **RentGo Medan** dikembangkan menggunakan **Incremental Software Development Life Cycle (SDLC)**. Pada model ini, kebutuhan sistem didekomposisi menjadi beberapa modul rilis terencana (*Increment 0* hingga *Increment 5 / Hardening*), di mana setiap *increment* melewati siklus mini-waterfall lengkap (**Analisis Kebutuhan -> Perancangan -> Implementasi -> Pengujian -> Rilis**) sehingga menghasilkan perangkat lunak yang terus bertambah kapabilitasnya dan selalu dalam kondisi layak pakai (*potentially shippable*).

Alasan pemilihan **Incremental SDLC** dibandingkan alternatif SDLC lain:
1. **Spesifikasi Inti Sudah Jelas di Awal:** Kebutuhan CRUD penyewaan kendaraan, aturan *anti double-booking*, dan peran pengguna (`customer` vs `admin`) telah terdefinisi sejak awal sehingga tidak memerlukan iterasi eksploratif UI yang dibuang seperti pada *Prototyping*.
2. **Menghindari Risiko Integrasi di Akhir (*Big-Bang Risk*):** Tidak seperti *Waterfall* murni di mana produk baru bisa diuji utuh di akhir proyek, Incremental memastikan aplikasi inti sudah berfungsi sejak *Increment 1* (Admin CRUD) dan *Increment 2* (Mesin Booking + Anti-Bentrok).
3. **Ideal untuk Pengembang Tunggal (*Individual Project*):** *Agile/Scrum* menuntut ritual tim lintas fungsi (*Sprint Planning*, *Daily Standup*, *Scrum Master*, *Product Owner*). Incremental memberikan disiplin bertahap yang sesuai bagi satu pengembang penuh dengan tenggat UTS, sambil meminjam praktik prioritas **MoSCoW** dan *Definition of Done*.

### 2.2 Perbandingan Model SDLC

| Aspek Pembanding | Waterfall | Prototype | Agile (Scrum) | **Incremental (Dipilih)** |
|---|---|---|---|---|
| **Sifat Kebutuhan** | Kaku 100% di awal | Belum jelas / eksploratif | Dinamis berubah tiap sprint | **Terstruktur di awal, dibangun modular** |
| **Waktu Produk Bisa Dipakai** | Di tahap paling akhir (*Big-Bang*) | Cepat terlihat, kode sering rapuh / dibuang | Setiap akhir sprint tim (1–4 minggu) | **Setiap akhir increment (kumulatif & stabil)** |
| **Kecocokan Tim** | Tim besar terstruktur | 1–3 orang | Tim lintas peran 3–9 orang | **Sangat cocok untuk proyek individu** |
| **Pengendalian Risiko Teknis** | Risiko bug & DB menumpuk di akhir | Rawan utang teknis transaksi database | Risiko *scope creep* tanpa PO ketat | **Risiko berat (Auth, DB Lock, Routing) diselesaikan lebih awal di Inc 0–2** |
| **Dokumentasi & Pengujian** | Berat di awal | Minim dokumentasi | Ringan | **Seimbang & terukur: audit + unit test bertambah di tiap increment** |

### 2.3 Prioritisasi Fitur (Metode MoSCoW)
- **Must Have (Wajib di MVP awal):** Autentikasi terpusat, CRUD Kategori & Kendaraan, pengecekan ketersediaan berbasis rentang tanggal inklusif, mesin booking bebas bentrok (`409 Conflict`), *state machine* 7 status pesanan, RBAC Admin vs Customer, dan arsitektur deployment Single-Domain.
- **Should Have (Increment 2–4):** Asisten AI Gemini dengan fallback heuristik & rate limiter, unggah foto ke Cloud Storage, jadwal perawatan pemblokir katalog, simulasi QRIS Midtrans Sandbox, peta interaktif penjemputan Medan (Leaflet + Haversine), dan cron auto-expire 24 jam.
- **Could Have (Nilai Tambah):** Dual Theme Light/Dark Triadic WCAG AA, ekspor laporan CSV admin, dan drawer responsif mobile (`MobileDrawer`) beserta tampilan kartu tabel responsif.
- **Won't Have (Ditunda Pasca-UTS):** Pembayaran uang riil mode produksi Midtrans, aplikasi mobile native, serta manajemen multi-cabang/mitra.

### 2.4 Realisasi Tahapan Increment (`v0.1.0` s/d `v1.2.0` + `9102e1e`)

| Tahap Increment | Branch / Tag / Commit | Cakupan Fungsional & Teknis yang Dihasilkan |
|---|---|---|
| **Increment 0 — Fondasi** | `inc-0-foundation` (`v0.1.0` / `e43266c`) | Inisialisasi monorepo Next.js 15, skema SQL PostgreSQL 7 tabel (`btree_gist`, RLS, RPC), Firebase Auth-only, dan routing awal. |
| **Increment 1 — Core Admin (MVP-1)** | `inc-1-core-admin` (`v0.2.0` / `515d2d5`) | Guard RBAC (`401`/`403`), panel dasbor admin, CRUD Kategori (`ON DELETE RESTRICT`), CRUD Kendaraan + foto + *soft-delete*. |
| **Increment 2 — Booking Engine (MVP-2)** | `inc-2-booking-engine` (`v0.3.0` / `d0e43eb`) | Mesin ketersediaan WIB, kalkulator harga server-side, kunci atomik anti double-booking (`409`), manajemen perawatan, dan mesin 7 status. |
| **Increment 3 — Landing, AI & Analytics** | `inc-3-landing-ai` (`v0.4.0` / `d35e485`) | Landing page publik 10 bagian, integrasi `@google/genai` + fallback deterministik + limiter 10 req/menit, grafik KPI, cron housekeeping. |
| **Increment 4 — Hardening & E2E QA** | `inc-4-hardening-release` (`v1.0.0` / `589d0ad`) | Audit keamanan, Vitest Unit & Concurrency Tests, skenario E2E Playwright Chromium, bukti pengujian, dan dek presentasi Slidev. |
| **Increment 5 — Arsitektur Single-Domain & QRIS** | `v1.1.0` – `v1.2.0` (`7eee77d`) | Konsolidasi **Single-Domain Multi-Surface (1x Login)**, wordmark tipografi `RENTGO. MDN`, QRIS Midtrans Sandbox (`rentgo-test`), ekstraksi niat AI bahasa alami, Dual-Mode Repository. |
| **Increment 5.1 — Ekspansi Pasca-v1.2.0 (Tahap A–D & Security Hardening)** | `717e26d` – `9102e1e` | **Tahap A:** `getDisplayStatus()` & cron expire khusus `pending + unpaid`; **Tahap B:** Peta Interaktif `Leaflet + OSM + Haversine` (`RENTGO_LOCATIONS`); **Tahap C:** Dual Theme `Light & Dark` (`next-themes`); **Tahap D:** `MobileDrawer` Portal & tabel kartu mobile; **Hardening (`08e1154`, `ca3ea57`, `9102e1e`):** `os.tmpdir()` Vercel read-only fix, penghapusan tombol demo login + `/api/auth/config` + verifikasi JWT 3-lapis, serta perbaikan responsivitas overflow modal. |

---

## 3. Analisis Kebutuhan

### 3.1 Aktor Sistem
- **Pengunjung Publik:** mengakses landing page, mencari ketersediaan unit berdasarkan tanggal WIB, mengeksplorasi 3 titik penjemputan Medan pada peta Leaflet beserta jarak Haversine terdekat, dan mencoba rekomendasi AI.
- **Pelanggan (*Customer*):** melakukan login 1x (Google OAuth atau Email/Password via Firebase Auth), memilih dan memesan unit, melengkapi nomor WhatsApp & SIM, membayar melalui simulasi QRIS Midtrans Sandbox / unggah bukti bayar, membatalkan pesanan `pending`, serta memperbarui profil.
- **Administrator (*Admin*):** memiliki akses penuh panel `/admin` (dilindungi RBAC `requireAdminUser()`) untuk memantau KPI, mengelola kategori dan inventaris armada, memverifikasi pembayaran dan memproses siklus hidup pesanan, menjadwalkan servis bengkel, memantau direktori pelanggan, dan mengekspor CSV.

### 3.2 Kebutuhan Fungsional (`FR-01` s/d `FR-14`)

| Kode | Kebutuhan Fungsional | Deskripsi Implementasi |
|---|---|---|
| **FR-01** | Autentikasi 1x Login Firebase Auth | Google OAuth Popup & Email/Password dengan rantai verifikasi token server-side 3 lapis (`firebase-admin` -> sertifikat publik x509 RS256 -> Identity Toolkit REST) serta cookie `__session` `HttpOnly`. |
| **FR-02** | CRUD Kategori & Armada + Soft-Delete | Manajemen kategori (`ON DELETE RESTRICT`), data unit plat `BK`, unggah foto <= 2 MB ke Supabase Storage / lokal, dan penghapusan aman berbasis `deleted_at`. |
| **FR-03** | Pencarian Ketersediaan Real-Time WIB | Menyaring kendaraan `active` dan bebas irisan tanggal inklusif terhadap pesanan aktif serta jadwal servis di zona waktu `Asia/Jakarta` (WIB). |
| **FR-04** | Kalkulasi Durasi Inklusif & Harga Server | Menghitung hari sewa inklusif `((end_date - start_date) + 1)` dan mengunci `daily_price_snapshot` serta `total_price` sepenuhnya di sisi server. |
| **FR-05** | Pencegahan Double-Booking Dua Lapis | Memadukan *in-process async mutex* (`transactionLock`) / `SELECT ... FOR UPDATE` pada RPC `public.create_booking` serta constraint PostgreSQL `EXCLUDE USING gist` (`HTTP 409 Conflict`). |
| **FR-06** | Pembayaran QRIS Sandbox & Bukti Bayar | Rendering kode QRIS dinamis merchant `rentgo-test` per kode booking (`RG-YYMMDD-XXXX`), simulasi "Sudah Bayar", dan unggah bukti QRIS. |
| **FR-07** | State Machine 7 Status & `getDisplayStatus` | Aturan transisi status berbasis aktor (`pending`, `confirmed`, `ongoing`, `completed`, `cancelled`, `rejected`, `expired`) + pemetaan terpadu status pesanan x pembayaran (`getDisplayStatus`). |
| **FR-08** | Manajemen Perawatan Bengkel | Pencatatan servis (`scheduled`, `in_progress`, `done`) yang otomatis menyembunyikan kendaraan dari katalog pelanggan pada tanggal yang beririsan. |
| **FR-09** | Asisten Rekomendasi Gemini AI Cerdas | Menganalisis bahasa alami (*motor/mobil*, kapasitas kursi, rute tanjakan, anggaran harian), memfilter stok tersedia nyata (anti-halusinasi UUID), dengan fallback deterministik. |
| **FR-10** | Perlindungan Kuota AI (*Rate Limiting*) | *Sliding window* 60 detik di server (`10` respons/menit dari DB log -> `HTTP 429`) dan batas harian `50` permintaan/pengguna/hari. |
| **FR-11** | Peta Lokasi Interaktif & Geolocation | Peta **Leaflet + OpenStreetMap** untuk Bandara Kualanamu, Stasiun Medan, dan Kantor RentGo Medan disertai rumus **Haversine** (`EARTH_RADIUS_KM = 6371`) untuk mengurutkan titik terdekat + tautan rute Google Maps. |
| **FR-12** | Dual Theme (Light & Dark Triadic UI) | Pergantian tema instan via `next-themes` (`ThemeToggle`) dan CSS variables WCAG AA (`[data-theme="light"]` dan `[data-theme="dark"]`). |
| **FR-13** | Desain Responsif Mobile & Ekspor CSV | Navigasi mobile menggunakan `MobileDrawer` React Portal `<dialog>`, tabel admin otomatis menjadi kartu bertumpuk di layar kecil (`< lg`), dan ekspor `GET /api/bookings?format=csv`. |
| **FR-14** | Cron Housekeeping Kedaluwarsa 24 Jam | Endpoint `/api/cron/housekeeping` (terautentikasi `CRON_SECRET`) yang dieksekusi harian oleh Vercel Cron (`0 17 * * *` UTC / `00:00 WIB`) guna menandai kedaluwarsa **khusus** pesanan `pending` dengan status pembayaran `unpaid` (`shouldExpireBooking`). |

### 3.3 Kebutuhan Non-Fungsional
- **Keamanan:** RBAC di tiap route handler API (`requireAuthenticatedUser()`, `requireAdminUser()`), validasi skema **Zod 3.24** di sisi API, header keamanan `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Strict-Transport-Security`, RLS aktif di ketujuh tabel Supabase, pemblokiran URL internal `/site/*` -> `HTTP 404`, serta rate-limit endpoint login `30 percobaan/menit per IP`.
- **Ketahanan Infrastruktur (*Resilience*):** **Dual-Mode Repository** menyinkronkan data ke Supabase Cloud bila `SUPABASE_SERVICE_ROLE_KEY` aktif, dan beralih mulus ke file fallback `.data/rentgo-local.json` (atau `os.tmpdir()/rentgo-data/rentgo-local.json` di runtime read-only serverless Vercel) bila dijalankan offline atau pada suite Vitest.
- **Efisiensi Biaya:** Seluruh layanan cloud berjalan pada paket gratis (*Vercel Hobby*, *Supabase Free Tier*, *Firebase Auth Spark*, *Gemini API Free Tier*, dan *Midtrans Sandbox*).

---

## 4. Perancangan Arsitektur & Basis Data

### 4.1 Arsitektur Single-Domain Multi-Surface (`src/middleware.ts`)
Pada rilis awal (`v0.1.0`–`v1.0.0`), aplikasi menggunakan pemisahan subdomain (`book.*` dan `admin.*`). Karena peramban mengisolasi *IndexedDB* milik Firebase SDK dan *cookie* antar-subdomain pada pengembangan lokal maupun domain tertentu, mulai `v1.2.0` arsitektur disatukan menjadi **Single-Domain Multi-Surface Path Architecture**:

| Permukaan | URL Publik (Single Origin) | Rewrite Internal Middleware | Kebijakan Akses |
|---|---|---|---|
| **Landing** | `/` | `/site/landing` | Publik |
| **Booking App** | `/book`, `/book/*` | `/site/book/*` | Publik (katalog & AI); wajib login untuk checkout, Pesanan Saya, dan Profil |
| **Admin Panel** | `/admin`, `/admin/*` | `/site/admin/*` | Wajib login role `admin` (belum login -> Gerbang Admin; role `customer` -> `HTTP 403`) |
| **Rute Internal** | `/site`, `/site/*` | *Diblokir eksplisit* | Mengembalikan `HTTP 404` agar struktur routing internal tidak terekspos |

Keunggulan utama pola ini adalah **1x Login Berlaku Menyeluruh**: cookie `__session` (`Path=/`, `HttpOnly`, `SameSite=Lax`, durasi 5 hari) berlaku di seluruh permukaan tanpa perlu autentikasi berulang.

### 4.2 Arsitektur Berlapis 4-Tier
1. **Tier 1 — Presentation Layer (Next.js 15.5 App Router & React 19):** 12 halaman SSR/interaktif di `/site/*`, komponen sistem desain Triadik (`tokens.css`), peta Leaflet (`dynamic(..., { ssr: false })`), grafik Recharts, dan dialog modal terproteksi overflow.
2. **Tier 2 — Edge Middleware & Session Guard (`src/middleware.ts`):** Mencegat setiap request, memblokir akses `/site/*`, meneruskan aset/API, dan menulis ulang `/book/*` serta `/admin/*` secara transparan.
3. **Tier 3 — Business Logic & 17 API Endpoints (`/api/*`):** Menangani autentikasi (`/api/auth/config`, `/api/auth/session`, `/api/auth/logout`), transaksi (`/api/vehicles`, `/api/categories`, `/api/bookings`, `/api/payments/[bookingId]`, `/api/maintenance`, `/api/users`, `/api/upload`), AI (`/api/ai/recommend`), dan cron (`/api/cron/housekeeping`).
4. **Tier 4 — External Cloud Services & Dual-Mode Persistence:**
   - **Firebase Auth (`rentgo-medan`):** murni autentikasi tanpa Firestore; konfigurasi client dimuat dinamis lewat `GET /api/auth/config`, sedangkan server memverifikasi token menggunakan rantai 3 fallback: `firebase-admin` SDK -> Google x509 public certs RS256 (`verifyFirebaseIdTokenJwtWithCerts`) -> Identity Toolkit REST (`accounts:lookup`).
   - **Supabase (`honhszsloegvpbmczkqf`):** PostgreSQL 7 tabel terproteksi RLS + fungsi RPC `public.get_available_vehicles` & `public.create_booking` + 2 bucket Storage (`vehicles`, `payment-proofs`).
   - **Google Gemini AI:** memprioritaskan alias model berlatensi rendah (`gemini-3.5-flash-lite`, `gemini-flash-lite-latest`, `GEMINI_MODEL`, `gemini-3.1-flash-lite`) via endpoint REST `v1beta` dengan `responseMimeType: "application/json"`, schema terstruktur, mitigasi *prompt injection*, serta sanitasi UUID output `sanitizeAiRecommendations()`.
   - **Midtrans Sandbox (`rentgo-test`) & OpenStreetMap:** QRIS dinamis Sandbox dan tile peta gratis tanpa kunci API berbayar.

### 4.3 Skema & Relasi Basis Data (7 Tabel PostgreSQL Terverifikasi)

Hasil inspeksi langsung ke proyek Supabase `honhszsloegvpbmczkqf`:

| Nama Tabel | RLS Aktif | Jumlah Baris Live | Fungsi & Relasi Kunci |
|---|---|---|---|
| `public.users` | ✅ Ya | 4 | Identitas pengguna (`firebase_uid` UNIQUE, `email` UNIQUE, `role`: `customer`/`admin`, `driver_license_no`, `is_active`). |
| `public.vehicle_categories` | ✅ Ya | 5 | Pengelompokan armada (`slug` UNIQUE: Mobil City, MPV/Minibus, SUV, Van/Hiace, Motor). `ON DELETE RESTRICT` ke `vehicles`. |
| `public.vehicles` | ✅ Ya | 12 | Data unit plat `BK` (`plate_number` UNIQUE, `daily_price`, `transmission`, `fuel`, `seats`, `status`, `deleted_at`). |
| `public.bookings` | ✅ Ya | 4 | Pesanan sewa (`booking_code` UNIQUE, `total_days` *generated column* `(end_date - start_date + 1)`, `daily_price_snapshot`, constraint `no_double_booking`). |
| `public.payments` | ✅ Ya | 4 | Tagihan 1:1 per pesanan (`booking_id` UNIQUE FK `ON DELETE CASCADE`, `method`, `status`: `unpaid/paid/refunded`, `proof_url`). |
| `public.maintenance_logs` | ✅ Ya | 1 | Jadwal bengkel (`vehicle_id` FK `ON DELETE CASCADE`, memblokir ketersediaan jika `scheduled`/`in_progress`). |
| `public.ai_recommendation_logs` | ✅ Ya | 0 | Log audit prompt AI, UUID terpilih, status fallback, latensi, dan dasar perhitungan kuota `10 req/menit`. |

### 4.4 Mekanisme Anti Double-Booking Dua Lapis
1. **Lapisan Aplikasi & Transaksi RPC:**
   - Pada mode lokal/fallback, setiap eksekusi penulisan melewati rantai promise `transactionLock` asinkron (*in-process mutex*) sebelum mengecek `isVehicleAvailableForRange()`.
   - Pada PostgreSQL Supabase, prosedur `public.create_booking(...)` melakukan `SELECT * FROM public.vehicles WHERE id = p_vehicle_id AND deleted_at IS NULL FOR UPDATE` (pessimistic row lock) serta memverifikasi tidak ada jadwal `maintenance_logs` yang beririsan.
2. **Lapisan Database Constraint (`btree_gist`):**
   - Tabel `public.bookings` memasang constraint:
     ```sql
     constraint no_double_booking exclude using gist (
       vehicle_id with =,
       daterange(start_date, end_date, '[]') with &&
     ) where (status in ('pending', 'confirmed', 'ongoing'))
     ```
   - Operator `daterange(..., '[]')` bersifat **inklusif di kedua ujung tanggal**, sehingga irisan sekecil 1 hari langsung melempar `exclusion_violation` dan dikembalikan API sebagai `HTTP 409 Conflict`.

### 4.5 Perhitungan Geolocation & Haversine (`src/lib/locations.ts`)
RentGo menetapkan 3 titik serah-terima resmi di `RENTGO_LOCATIONS`:
- **Bandara Kualanamu** (`3.6422, 98.8853`, operasional 05.00–24.00 WIB)
- **Stasiun Medan** (`3.5917, 98.6783`, operasional 06.00–22.00 WIB)
- **Kantor RentGo Medan** (`3.5902, 98.6598`, operasional 07.00–22.00 WIB — titik operasional placeholder di Jl. Gatot Subroto No. 88)

Ketika pengguna mengaktifkan *"Gunakan lokasi saya"*, fungsi `calculateHaversineDistanceKm(lat1, lng1, lat2, lng2)` menghitung jarak garis lurus permukaan bumi ($R = 6.371\text{ km}$) untuk menandai titik terdekat (`isNearest: true`) dengan pembulatan $0,1\text{ km}$.

### 4.6 Identitas Visual & Tema Ganda Triadik (`src/styles/tokens.css`)
- **Logo:** Wordmark tipografi editorial `RENT` + `GO.` dilengkapi badge `MDN` serta tiga bilah kecepatan tanpa ketergantungan aset raster eksternal.
- **Harmoni Warna Triadik 60-30-10 (Terverifikasi WCAG AA pada Tema Terang & Gelap):**
  - *Triad I (60% — Kepercayaan & Navigasi):* Cobalt Blue (`#1D4ED8` Terang / `#3B82F6` Gelap) & Midnight Navy (`#0B1D3A` Terang / `#0B1120` Gelap).
  - *Triad II (30% — Status Aktif & Lunas):* Emerald-Teal Jade (`#0D9488` / `#14B8A6`).
  - *Triad III (10% — Aksi CTA & Badge AI):* Warm Road Amber-Gold (`#D97706` / `#F59E0B`).

---

## 5. Implementasi Sistem

### 5.1 Spesifikasi Teknologi (`website/package.json`)

| Lapisan | Teknologi & Versi Terpasang |
|---|---|
| Framework Web & Runtime API | Next.js `15.5.29` (App Router), React `19`, TypeScript `5.8.2` (`strict`) |
| Styling, Tema & Grafik | Tailwind CSS `4`, `next-themes 0.4.6`, `recharts 2.15.1`, `lucide-react 0.487.0` |
| Validasi Skema & Tanggal WIB | `zod 3.24.2`, `date-fns 4.1.0`, `@date-fns/tz 1.2.0` |
| Autentikasi | Firebase SDK `11.4.0` (Client) & `firebase-admin 13.2.0` (Server, Auth-Only) |
| Basis Data & Storage | Supabase `@supabase/supabase-js 2.49.1` & `@supabase/ssr 0.6.1` |
| Pemetaan Interaktif | `leaflet 1.9.4` & `react-leaflet 5.0.0` + ubin OpenStreetMap |
| Kecerdasan Buatan | Google Gemini API (`@google/genai 3.3.0` + REST `v1beta/models`) |
| Pengujian Otomatis | Vitest `3.2.7` (Unit & Concurrency) & Playwright `1.51.0` (Browser E2E) |
| Hosting & Automasi | Vercel Hobby (`https://rentgo.my.id`) & Vercel Cron Jobs |

### 5.2 Enam Fitur Utama Terimplementasi
1. **CRUD Kategori & Armada + Soft-Delete (`deleted_at`):** Tambah/ubah/cari/filter armada plat `BK`, unggah foto <= 2 MB ke Cloud Storage, serta proteksi penghapusan kategori/unit berelasi transaksi.
2. **Mesin Ketersediaan Real-Time & Anti Double-Booking (`409`):** Validasi tanggal WIB inklusif dan penguncian dua lapis saat checkout.
3. **QRIS Midtrans Sandbox (`rentgo-test`) & State Machine 7 Status:** QRIS dinamis per booking, pelunasan sandbox instan / unggah bukti bayar, serta pemetaan UI tunggal `getDisplayStatus()`.
4. **Manajemen Perawatan Bengkel Otomatis:** Jadwal servis `scheduled`/`in_progress` otomatis menyembunyikan armada pada tanggal terkait.
5. **Asisten Rekomendasi Gemini AI Cerdas:** Mengekstrak niat bahasa alami (*motor vs mobil*, jumlah penumpang, anggaran), anti-halusinasi terhadap UUID nyata, plus rate limit 10/menit & fallback heuristik deterministik.
6. **Dasbor Operasional Admin, Peta Haversine, Dual Theme & Ekspor CSV:** 6 KPI real-time, grafik pendapatan 6 bulan, modal transaksi terpadu *"Semua Aksi"*, peta Leaflet 3 titik penjemputan Medan, tema Terang/Gelap, serta `MobileDrawer` responsif.

### 5.3 Dokumentasi Tangkapan Layar Aplikasi (20 Layar Bukti)

Seluruh tangkapan layar aplikasi meliputi 16 bukti fungsionalitas `v1.2.0` pada `laporan/screenshots/` ditambah 4 bukti terbaru hasil pengujian langsung produksi `https://www.rentgo.my.id` (`05-auth-modal.png` pasca hardening tanpa tombol demo, `18-landing-pickup-map.png` Peta Interaktif Leaflet, `19-dark-mode-theme.png` Tema Gelap Triadik, dan `20-mobile-drawer.png` Navigasi Drawer Mobile 390px):

1. `01-landing.png` — Landing Page (`/`): Hero Navy, wordmark `RENTGO. MDN`, dan pencarian tanggal cepat WIB.
2. `02-landing-fleet-pricing.png` — Seksi Armada Unggulan plat `BK` & tabel transparansi tarif harian.
3. `03-catalog.png` — Katalog Pemesanan (`/book`): filter rentang tanggal inklusif, kategori, transmisi, kursi, dan harga.
4. `04-ai-recommend.png` — Asisten Gemini AI (`Bantu Saya Pilih`): kueri touring motor budget Rp 200rb menghasilkan `Yamaha NMAX 155 Connected` (98%) & `Honda Vario 160 ABS` (92%) dengan `ENGINE: GEMINI-FLASH-LATEST`.
5. `05-auth-modal.png` — **Modal Autentikasi Firebase Terbaru (`9102e1e`)**: Google OAuth Popup + Email/Password bersih tanpa tombol demo pintasan.
6. `06-checkout-qris.png` — Form Checkout (`/book/vehicles/[id]`): kalkulasi harga server-side (`2 Hari x Rp 420.000 = Rp 840.000`).
7. `07-booking-detail-qris.png` — Tagihan QRIS Midtrans Sandbox (`rentgo-test`) & tombol simulasi pembayaran.
8. `08-booking-paid-confirmed.png` — Status tagihan `PAID` & pesanan `CONFIRMED` setelah pelunasan instan QRIS.
9. `09-my-bookings-and-profile.png` — Halaman *"Pesanan Saya"* (`/book/bookings`) milik pelanggan.
10. `10-admin-dashboard.png` — Dasbor Operasional Admin (`/admin`): 6 kartu KPI, grafik pendapatan 6 bulan, dan unit terlaris.
11. `11-admin-categories.png` — Manajemen Kategori Armada (`/admin/categories`).
12. `12-admin-vehicles.png` — Manajemen Armada (`/admin/vehicles`) lengkap plat `BK` dan status.
13. `13-admin-bookings-actions.png` — Manajemen Pesanan & Pembayaran (`/admin/bookings`) dengan dialog *"Semua Aksi"*.
14. `14-admin-maintenance.png` — Manajemen Jadwal Perawatan Bengkel (`/admin/maintenance`).
15. `15-admin-customers.png` — Direktori Pelanggan (`/admin/customers`) tersinkronisasi dari Firebase Auth.
16. `16-rbac-403-and-404.png` — Bukti proteksi RBAC (`HTTP 403 Akses Ditolak`) bagi akun `customer`.
17. `17-double-booking-409.png` — Bukti penolakan bentrok jadwal (`HTTP 409 Conflict`) di antarmuka checkout.
18. `18-landing-pickup-map.png` — **Peta Interaktif Lokasi Penjemputan (`#lokasi`)**: ubin OpenStreetMap + penanda titik Medan + tombol geolokasi Haversine.
19. `19-dark-mode-theme.png` — **Implementasi Mode Gelap (`[data-theme="dark"]`)**: kontras WCAG AA Triadik pada hero & kontrol input.
20. `20-mobile-drawer.png` — **Tampilan Mobile Responsif (`390x844`)**: navigasi `MobileDrawer` React Portal terisolasi di luar `<header>`.

---

## 6. Pengujian & Verifikasi Kualitas

### 6.1 Hasil Verifikasi Otomatis Terbaru (Dijalankan Langsung 16 November 2026 — Commit `9102e1e`)

| Jenis Pemeriksaan | Perintah (`website/`) | Cakupan Pengujian | Hasil Teramati | Status |
|---|---|---|---|---|
| **Static Type Check** | `npm run typecheck` (`tsc --noEmit`) | Seluruh basis kode TypeScript (`strict: true`) | Exit code `0`, 0 error tipe statis | **LULUS** |
| **Unit & Concurrency Test** | `npm test` (`vitest run` v3.2.7) | **7 file uji (39 skenario unit)** — rincian pada tabel di bawah | **39 / 39 PASS** dalam `12,90 dtk` | **LULUS 100%** |
| **Build Produksi** | `npm run build` (`next build` Next 15.5.29) | 16 rute statis/dinamis (12 halaman UI + sistem), **17 endpoint API**, Edge Middleware (`36,8 kB`) | Compiled successfully in `5,3 dtk` | **LULUS** |

Rincian **7 File & 39 Kasus Uji Unit (Vitest 3.2.7)**:
1. `availability-and-concurrency.test.ts` (**6 tes**): deteksi irisan tanggal inklusif, blokir unit servis, **simulasi 2 request paralel (*race condition*) -> 1 sukses 1 ditolak**, blokir soft-delete unit berbooking aktif, cron expire khusus `pending + unpaid`, dan ketahanan fallback Vercel `os.tmpdir()`.
2. `booking-state.test.ts` (**14 tes**): seluruh transisi valid & ilegal 7 status booking, otorisasi peran (`admin`/`customer`/`system`), pemetaan UI `getDisplayStatus()` untuk seluruh kombinasi status pesanan x pembayaran, serta aturan kedaluwarsa `shouldExpireBooking()`.
3. `pricing.test.ts` (**6 tes**): kalkulasi durasi inklusif WIB, penolakan tanggal terbalik, kalkulasi total biaya server-side, format Rupiah `id-ID`, kode booking `RG-YYMMDD-XXXX`, dan akurasi konversi hari melintasi tengah malam UTC->WIB.
4. `validators-and-routing.test.ts` (**5 tes**): skema Zod kendaraan, booking (HP & SIM), perawatan/AI, resolusi 3 permukaan Single-Domain vs proteksi override `?site` di produksi, dan validasi env `WHATSAPP_NUMBER`.
5. `locations.test.ts` (**4 tes**): kesesuaian `RENTGO_LOCATIONS` dengan `PICKUP_LOCATIONS`, perhitungan matematis Haversine, pengurutan lokasi terdekat (aman saat `null`), dan generator tautan rute Google Maps.
6. `ai.test.ts` (**2 tes**): pembersihan `vehicle_id` halusinasi oleh `sanitizeAiRecommendations()` dan akurasi *heuristic fallback* untuk niat kapasitas/jenis/anggaran.
7. `firebase-auth.test.ts` (**2 tes**): verifikasi tanda tangan kriptografis JWT `RS256` token Firebase ID terhadap sertifikat x509 serta penolakan token kedaluwarsa, salah audiens, atau termanipulasi.

### 6.2 Pengujian Black-Box (Teknik EP, BVA, State Transition — 20 Kasus Uji `TC-001`–`TC-020`)
Pengujian Black-Box dilaksanakan menggunakan tiga teknik formal:
- **Equivalence Partitioning (EP):** memvalidasi partisi input diterima vs ditolak pada form checkout (No. WhatsApp 9–16 digit, No. SIM min. 8 karakter -> `HTTP 201` vs huruf/terlalu pendek -> `HTTP 400` Zod) serta proteksi `/site/* -> HTTP 404` (`TC-001`–`TC-020`).
- **Boundary Value Analysis (BVA):** menguji sewa 1 hari di tanggal sama (`15–15 Des -> 1 hari`), tanggal terbalik (`10–08 Des -> HTTP 400`), irisan tepat 1 hari ujung (`10–12` vs `12–14 Des -> HTTP 409`), dan permintaan AI ke-11 dalam 60 detik (`HTTP 429`).
- **State Transition Testing:** memverifikasi alur sah `pending -> confirmed -> ongoing -> completed`, simulasi QRIS `unpaid -> paid`, pembatalan `pending -> cancelled` oleh pelanggan, dan penolakan transisi mundur/ilegal seperti membatalkan booking `confirmed` atau mengembalikan `completed -> pending`.

Ringkasan eksekusi Black-Box pada `v1.2.0` mencatat **20/20 PASS** (`TC-001` s/d `TC-020`, rincian lengkap tersimpan di `audit/04-audit-pengujian-dan-blackbox.md`).

### 6.3 Catatan Status Automated Browser E2E Test (Playwright)
- Pada rilis `v1.2.0` (`7eee77d`), seluruh **6 blok uji / 8 skenario End-to-End (`E2E-01` s/d `E2E-08`)** di Playwright Chromium berhasil lulus 100%, kemudian pada commit `94087ca` ditambahkan skenario **`E2E-09`** untuk memverifikasi `MobileDrawer` React Portal di viewport `320x640`.
- Pada commit hardening **`ca3ea57`** (penghapusan tombol login demo cepat `emulator-login-*` dari `AuthControls` demi keamanan produksi), skrip `tests/e2e/rentgo.spec.ts` belum dimutakhirkan dari selektor `emulator-login-customer` / `emulator-login-admin`. Penulis mencatat hal ini secara transparan sebagai tindak lanjut pembaruan skrip pengujian otomatis pasca-UTS.

---

## 7. Deployment & Verifikasi Produksi

| Komponen | Konfigurasi & Bukti Operasional Aktual |
|---|---|
| **Hosting Web & Edge** | **Vercel (Paket Hobby — Gratis)**, Root Directory `website`, domain khusus aktif di **`https://rentgo.my.id`** (`308 -> https://www.rentgo.my.id/`, diverifikasi `HTTP 200 OK` pada 16 November 2026). |
| **Header Keamanan Produksi** | Terverifikasi aktif melalui `next.config.ts` & Vercel edge: `Content-Security-Policy`, `Strict-Transport-Security` (`max-age=63072000`), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`. |
| **Basis Data & Storage Cloud** | **Supabase PostgreSQL (`honhszsloegvpbmczkqf`)** telah dieksekusi dan aktif penuh: seluruh **7 tabel** memiliki RLS aktif (`vehicle_categories` 5 baris, `vehicles` 12 baris, `users` 4 baris, `bookings` 4 baris, `payments` 4 baris, `maintenance_logs` 1 baris). |
| **Autentikasi & AI Cloud** | **Firebase Authentication (`rentgo-medan`)** terhubung lewat `/api/auth/config` & `/api/auth/session`; **Google Gemini API** & **Midtrans Sandbox (`rentgo-test`)** terkonfigurasi lewat environment variables aman di Vercel Dashboard. |
| **Cron Otomatis** | Vercel Cron dikonfigurasi pada `website/vercel.json` setiap pukul **`0 17 * * *` UTC (`00:00 WIB`)** memanggil `GET /api/cron/housekeeping` dilindungi header/query `CRON_SECRET`. |

---

## 8. Kesimpulan & Saran

### 8.1 Kesimpulan
1. Penerapan **SDLC Incremental** sangat efektif untuk proyek pengembangan individu: fondasi database dan routing risiko tinggi diselesaikan di *Increment 0*, fitur inti CRUD & anti double-booking sudah dapat dijalankan di *Increment 1–2*, dan inovasi lanjutan (Gemini AI, Peta Leaflet + Haversine, Dual Theme Light/Dark, Mobile Drawer Portal, serta Auth Hardening) ditambahkan bertahap tanpa merusak kestabilan sistem hingga commit `9102e1e`.
2. Persoalan operasional rental di Medan diselesaikan langsung di tingkat arsitektur: konsistensi ketersediaan dan anti bentrok dijamin oleh **dua lapis penguncian** (`transactionLock`/`FOR UPDATE` + `EXCLUDE USING gist`), sementara konsolidasi **Single-Domain Multi-Surface** memampukan pengalaman **1x Login** di `/`, `/book`, dan `/admin`.
3. Kesiapan sistem terverifikasi secara objektif melalui `tsc --noEmit` (0 error), **39/39 Unit & Concurrency Tests (7 file Vitest)**, `next build` produksi bersih, verifikasi database langsung **7 tabel RLS di Supabase**, serta tayangan produksi aktif di **`https://rentgo.my.id`** dengan biaya operasional **Rp 0** (*free-tier stack*).

### 8.2 Keterbatasan
- Gateway pembayaran QRIS berjalan di lingkungan **Midtrans Sandbox (`rentgo-test`)** sehingga belum memproses penyelesaian dana perbankan riil.
- Pemakaian Gemini API pada paket gratis dibatasi *rate limiter* aplikasi sebesar **10 respons/menit** dan **50 kueri/pengguna/hari**, sedangkan penjadwalan cron pada paket Vercel Hobby berjalan maksimal 1x sehari (`00:00 WIB`).
- Skrip E2E browser Playwright (`tests/e2e/rentgo.spec.ts`) perlu penyesuaian penyuntikan cookie sesi uji pasca penghapusan tombol demo cepat pada `ca3ea57`.

### 8.3 Saran Pengembangan Lanjutan
Penambahan integrasi webhook verifikasi otomatis Midtrans Produksi, notifikasi WhatsApp otomatis kepada penyewa ketika status menjadi *Siap Diambil* (`confirmed`), kalender tarif musiman hari besar/libur nasional, peran *Fleet Partner* bagi pemilik kendaraan titipan, serta pembaruan skrip Playwright E2E memakai sesi cookie bertanda tangan untuk lingkungan CI.

---

## 9. Matriks Pemenuhan Syarat Ujian Tengah Semester (UTS MMPRPL)

| Syarat Ketentuan UTS | Status | Bukti Terverifikasi |
|---|---|---|
| Aplikasi berjalan dengan database | ✅ Terpenuhi | 7 tabel PostgreSQL + RLS aktif di Supabase (`honhszsloegvpbmczkqf`) + Dual-Mode Fallback lokal |
| Wajib memiliki fitur CRUD | ✅ Terpenuhi | CRUD Kategori (`RESTRICT`), CRUD Kendaraan + foto + Soft-Delete, CRUD Booking & Perawatan |
| Minimal 3 fitur utama berfungsi | ✅ Terpenuhi (6+) | Availability + Anti-Bentrok `409`, QRIS Sandbox + State Machine, Perawatan Bengkel, Gemini AI + Rate Limiter, Peta Haversine, Dasbor KPI + CSV |
| Menerapkan 1 model pengembangan SDLC | ✅ Terpenuhi | **Incremental SDLC** (`inc-0` s/d `inc-4` + rilis `v1.2.0` & Tahap A–D) |
| Pengujian fitur utama | ✅ Terpenuhi | `tsc --noEmit` (0 error), **7 file / 39 Unit Test Vitest PASS**, 20 Black-Box TC, Build Produksi lulus |
| Deployment agar dapat dijalankan | ✅ Terpenuhi | Aktif online di **`https://rentgo.my.id`** (Vercel) + panduan lengkap instalasi lokal |
| Presentasi kelas | ✅ Terpenuhi | Dek Slidev akademik (`slidev/slides.md`) & ekspor `laporan/slides/presentasi-rentgo-uts.pdf` |
| Laporan singkat + screenshot aplikasi | ✅ Terpenuhi | Laporan Markdown + PDF akademik (`LAPORAN_UTS_RENTGO_MEDAN.pdf`) + 20 tangkapan layar bukti |
| Kode tersimpan di GitHub | ✅ Terpenuhi | [https://github.com/rynnxz/rentGO.git](https://github.com/rynnxz/rentGO.git) |
