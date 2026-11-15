# LAPORAN UTS
## Metode & Model Pengembangan Perangkat Lunak (MMPRPL)
### Proyek Individu No. 2 - Sistem Manajemen Penyewaan Kendaraan: **RentGo Medan**

| Atribut | Keterangan |
|---|---|
| **Nama** | Akbar Riansyah |
| **NIM** | `[ISI: NIM]` |
| **Program Studi** | Teknologi Rekayasa Perangkat Lunak (TRPL), Semester III |
| **Institusi** | Politeknik Wilmar Bisnis Indonesia |
| **Dosen Pengampu** | `[ISI: nama dosen]` |
| **Versi Rilis** | `v1.2.0` |
| **Repositori** | [https://github.com/rynnxz/rentGO.git](https://github.com/rynnxz/rentGO.git) |
| **Demo Online** | Target `https://rentgo.my.id` (Terverifikasi penuh di `http://localhost:3000` - deployment online opsional) |
| **Tanggal** | 15 November 2026 |

---

## 1. Pendahuluan

### 1.1 Latar Belakang
Usaha penyewaan kendaraan di Sumatera Utara, khususnya Medan, Bandara Kualanamu, Stasiun Kereta Api Medan, serta rute wisata Berastagi dan Danau Toba, umumnya masih mencatat pesanan lewat chat WhatsApp atau buku manual. Cara ini memunculkan beberapa masalah:

1. **Bentrok jadwal (double-booking):** satu unit dijanjikan ke dua pelanggan pada tanggal yang beririsan.
2. **Jadwal servis tidak sinkron dengan katalog:** unit yang sedang di bengkel masih tampak tersedia.
3. **Kesulitan memilih armada** sesuai medan jalan, jumlah penumpang, dan anggaran (city car, MPV 7 kursi, SUV tanjakan, Hiace rombongan, atau sepeda motor untuk touring berdua).
4. **Status pembayaran dan pesanan menggantung** karena tidak ada batas waktu bayar dan state machine yang baku.

### 1.2 Tujuan
Membangun **sistem manajemen penyewaan kendaraan berbasis web** yang berjalan dengan database, memiliki operasi CRUD lengkap, memuat lebih dari tiga fitur utama, diuji secara sistematis (Black-Box, Unit Test, dan End-to-End), serta dapat dideploy tanpa biaya.

### 1.3 Ruang Lingkup
Level prototipe fungsional yang sudah dapat dipakai (MVP produksi) dengan tiga permukaan dalam satu domain (**Single-Domain Multi-Surface**): **landing publik (`/`)**, **aplikasi pemesanan pelanggan (`/book`)**, dan **panel administrator (`/admin`)**.

---

## 2. Pemilihan Model Pengembangan: Incremental

### 2.1 Model yang Dipilih
**Incremental SDLC.** Sistem dirilis bertahap; tiap *increment* melewati siklus mini-waterfall: Analisis -> Perancangan -> Implementasi -> Pengujian -> Rilis.

### 2.2 Alasan Pemilihan

| Model | Kelebihan | Kekurangan untuk Proyek Ini | Keputusan |
|---|---|---|---|
| Waterfall | Dokumentasi tertib | Perubahan kebutuhan sulit diakomodasi; hasil kerja baru terlihat di akhir | Tidak dipilih |
| Prototype | Cepat memvalidasi UI | Rawan menjadi kode sementara yang tidak terstruktur di sisi transaksi DB | Tidak dipilih |
| Agile (Scrum) | Adaptif | Butuh tim dan ritual sprint harian; proyek ini dikerjakan secara individu | Tidak dipilih |
| **Incremental** | Fitur inti sudah *usable* sejak awal, risiko terdistribusi, cocok untuk pengembang tunggal | Perlu arsitektur dasar yang kokoh sejak increment pertama | **Dipilih** |

### 2.3 Tahapan Increment

| Increment | Versi | Isi & Capaian Fungsional |
|---|---|---|
| 0 | `v0.1.0` | Fondasi monorepo Next.js 15, token desain Triadik, skema SQL 7 tabel Supabase, routing, dan autentikasi Firebase |
| 1 | `v0.2.0` | MVP-1: Dasbor Admin, RBAC (`401`/`403`), CRUD Kategori, Kendaraan (Soft-Delete), dan Jadwal Servis |
| 2 | `v0.3.0` | MVP-2: Mesin booking pelanggan, kalkulasi harga inklusif WIB, anti double-booking (`409`), dan jadwal servis |
| 3 | `v0.4.0` | Landing publik 10 bagian, rekomendasi Gemini AI (limit 10 respons/menit), grafik analitik KPI, dan cron housekeeping |
| 4 | `v1.0.0` | Hardening keamanan, pengujian Black-Box (20 TC), Unit Test Vitest (21 tes), E2E Playwright, dan presentasi Slidev |
| 5 | `v1.1.0 - v1.2.0` | Arsitektur Single-Domain (1x login), navbar 1 baris responsif, QRIS Midtrans Sandbox, ekstraksi bahasa alami AI (motor/mobil & budget), dual-mode Supabase repository, dan logo tipografi `RENTGO. MDN` |

```mermaid
flowchart LR
    I0["Inc 0 (v0.1.0)\nFondasi & Auth"] --> I1["Inc 1 (v0.2.0)\nAdmin & CRUD"]
    I1 --> I2["Inc 2 (v0.3.0)\nBooking & Anti Bentrok"]
    I2 --> I3["Inc 3 (v0.4.0)\nLanding & AI Gemini"]
    I3 --> I4["Inc 4 (v1.0.0)\nHardening & E2E"]
    I4 --> I5["Inc 5 (v1.2.0)\nSingle-Domain, Smart AI & QRIS"]
```

---

## 3. Analisis Kebutuhan

### 3.1 Aktor
- **Pengunjung:** melihat landing page publik, mencari ketersediaan tanggal, dan mencoba asisten rekomendasi AI.
- **Customer:** login 1x (Google OAuth / Email), memesan armada, melakukan simulasi pembayaran QRIS Sandbox, membatalkan pesanan `pending`, serta mengelola profil dan nomor SIM.
- **Admin:** mengelola kategori, kendaraan, pesanan & verifikasi pembayaran, jadwal perawatan bengkel, daftar pelanggan, dan laporan KPI/CSV.

### 3.2 Kebutuhan Fungsional

| Kode | Kebutuhan |
|---|---|
| FR-01 | Autentikasi Google OAuth dan Email/Password (Firebase Auth khusus Auth-Only) |
| FR-02 | CRUD kategori armada dan kendaraan (termasuk unggah foto dan soft-delete `deleted_at`) |
| FR-03 | Pencarian ketersediaan real-time berdasarkan rentang tanggal inklusif WIB |
| FR-04 | Pemesanan dengan perhitungan durasi inklusif (`(end - start) + 1`) dan harga dihitung di sisi server |
| FR-05 | Pencegahan double-booking di tingkat aplikasi dan transaksi database (`HTTP 409 Conflict`) |
| FR-06 | Pembayaran QRIS (Midtrans Sandbox `rentgo-test`) dan simulasi pelunasan instan / unggah bukti bayar |
| FR-07 | Mesin status pesanan: `pending -> confirmed -> ongoing -> completed` plus cabang `cancelled / rejected / expired` |
| FR-08 | Penjadwalan perawatan bengkel yang otomatis menyembunyikan unit dari katalog pelanggan |
| FR-09 | Rekomendasi armada cerdas oleh Gemini AI (ekstraksi niat motor/mobil, penumpang, & budget), dibatasi 10 respons/menit |
| FR-10 | Dasbor admin: 6 kartu KPI, komposisi status armada, peringatan operasional, dan manajemen transaksi |
| FR-11 | Kedaluwarsa otomatis pesanan `pending` setelah 24 jam melalui endpoint `/api/cron/housekeeping` |

### 3.3 Kebutuhan Non-Fungsional
- **Keamanan:** RBAC (`admin` vs `customer`), cookie `__session` `HttpOnly` (`Path=/`, `SameSite=Lax`), validasi input Zod di seluruh endpoint, RLS di Supabase, dan akses langsung `/site/*` diblokir (`HTTP 404`).
- **Integritas data:** foreign key `ON DELETE RESTRICT`, constraint PostgreSQL `EXCLUDE USING gist`, serta *soft-delete* untuk menjaga riwayat transaksi.
- **Biaya:** seluruh stack berjalan di tier gratis (Vercel Hobby, Supabase Free Tier, Firebase Auth Spark, Gemini API Free Tier, Midtrans Sandbox).
- **Ketahanan:** mode persistensi ganda (**Dual-Mode Repository**: otomatis menyinkronkan ke `supabase-cloud` saat `SUPABASE_SERVICE_ROLE_KEY` aktif, dan beralih ke `local-fallback` `.data/rentgo-local.json` untuk CI serta pengujian offline).

---

## 4. Perancangan

### 4.1 Arsitektur: Single-Domain Multi-Surface
Satu origin (`rentgo.my.id` / `localhost:3000`) dengan tiga permukaan yang dirutekan oleh `src/middleware.ts`, sehingga **cukup login satu kali** untuk seluruh permukaan.

| Permukaan | Path Publik | Rewrite Internal | Hak Akses |
|---|---|---|---|
| Landing | `/` | `/site/landing` | Publik |
| Booking | `/book/*` | `/site/book/*` | Publik (katalog & AI), wajib login untuk checkout & Pesanan Saya |
| Admin | `/admin/*` | `/site/admin/*` | Wajib role `admin` (belum login -> Login Gate; role `customer` -> `HTTP 403`) |

### 4.2 Arsitektur Berlapis 4-Tier

```mermaid
flowchart TB
    T1["Tier 1: Presentation (Next.js 15 App Router - Navbar 1 Baris & Triadic UI)"] --> T2["Tier 2: Edge Middleware & Session Guard (src/middleware.ts)"]
    T2 --> T3["Tier 3: Business Logic & Route Handlers (/api/* + Validasi Zod)"]
    T3 --> T4["Tier 4: Layanan Eksternal & Persistensi Dual-Mode"]
    T4 --- FB["Firebase Auth (Auth-only: rentgo-medan)"]
    T4 --- SB["Supabase PostgreSQL + Storage (honhszsloegvpbmczkqf)"]
    T4 --- MT["Midtrans Sandbox QRIS (rentgo-test)"]
    T4 --- GM["Google Gemini AI (Smart Recommendation)"]
```

### 4.3 Pembagian Peran Layanan

| Layanan | Peran Teknis |
|---|---|
| Firebase (`rentgo-medan`) | Autentikasi saja (Auth-Only tanpa Firestore); ID token ditukar menjadi cookie `__session` lewat `POST /api/auth/session` |
| Supabase (`honhszsloegvpbmczkqf`) | 7 tabel relasional PostgreSQL, fungsi RPC atomik `create_booking`, dan 2 bucket Storage (`vehicles`, `payment-proofs`) |
| Midtrans Sandbox (`rentgo-test`) | Pembuatan payload QRIS Dinamis per kode booking dan simulasi pelunasan instan satu klik |
| Google Gemini AI | Ekstraksi bahasa alami (kategori motor/mobil, kursi, anggaran) + rekomendasi armada yang divalidasi terhadap ID kendaraan nyata (anti-halusinasi) |

### 4.4 Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    users ||--o{ bookings : "membuat"
    users ||--o{ payments : "memverifikasi"
    users ||--o{ ai_recommendation_logs : "meminta"
    vehicle_categories ||--|{ vehicles : "mengelompokkan"
    vehicles ||--o{ bookings : "disewa dalam"
    vehicles ||--o{ maintenance_logs : "menjalani servis"
    bookings ||--|| payments : "memiliki tagihan"
```

Ringkasan relasi dan integritas:
- `vehicle_categories -> vehicles` (`ON DELETE RESTRICT`): kategori berisi unit tidak dapat dihapus.
- `vehicles -> bookings` (`RESTRICT` + soft-delete `deleted_at`): riwayat transaksi tetap utuh.
- `bookings -> payments` (1:1, `UNIQUE(booking_id)`, `ON DELETE CASCADE`): satu pesanan memiliki tepat satu tagihan.
- `vehicles -> maintenance_logs` (`ON DELETE CASCADE`): unit dengan servis `scheduled/in_progress` disembunyikan otomatis dari katalog pada tanggal yang beririsan.
- `users -> ai_recommendation_logs` (`ON DELETE SET NULL`): mencatat audit kueri AI dan menghitung kuota *sliding window* 10 respons/menit.

### 4.5 Mekanisme Anti Double-Booking (Dua Lapis)
1. **Pessimistic row lock (`SELECT ... FOR UPDATE`)** pada baris kendaraan di dalam fungsi transaksi RPC `public.create_booking` (serta *in-process mutex lock* `withBookingLock` pada lapisan aplikasi).
2. **GiST exclusion constraint (`no_double_booking`)** pada `daterange(start_date, end_date, '[]')` untuk status `pending`, `confirmed`, dan `ongoing`. Irisan sekecil satu hari langsung ditolak di tingkat database dengan status `HTTP 409 Conflict`.

### 4.6 Alur Bisnis End-to-End

```mermaid
flowchart TD
    A["Pelanggan pilih tanggal"] --> B["Server cek ketersediaan:\nactive, tidak bentrok booking, tidak sedang servis"]
    B --> C["Pilih unit (opsional: Bantu Saya Pilih / AI Gemini)"]
    C --> D{"Sudah login?"}
    D -- Belum --> E["Login 1x Google / Email"] --> F["Isi form + No. WA + No. SIM"]
    D -- Sudah --> F
    F --> G["Kunci baris kendaraan & hitung harga server-side"]
    G --> H{"Bentrok?"}
    H -- Ya --> X["Tolak HTTP 409 Conflict"]
    H -- Tidak --> I["Booking pending (+24 jam) & payment unpaid"]
    I --> J["QRIS Sandbox / klik Sudah Bayar"]
    J --> K["paid -> confirmed"]
    K --> L["ongoing -> completed"]
```

### 4.7 Identitas Visual
Logo wordmark tipografi editorial `RENT` + `GO.` dengan tag `MDN` dan tiga bilah kecepatan. Palet **Teori Warna Triadik** (60% - 30% - 10%) terverifikasi WCAG AA: **Cobalt & Deep Navy** (`#1D4ED8` / `#0B1D3A`) untuk kepercayaan dan navigasi, **Emerald-Teal** (`#0F766E` / `#0D9488`) untuk status tersedia/lunas, serta **Warm Amber-Gold** (`#B45309` / `#F59E0B`) untuk CTA dan badge AI.

---

## 5. Implementasi

### 5.1 Teknologi

| Lapisan | Teknologi |
|---|---|
| Frontend & Backend | Next.js 15.5 (App Router), React 19, TypeScript 5.8 (`strict`), Tailwind CSS 3.4 |
| Validasi Skema | Zod 3.24 |
| Autentikasi | Firebase Authentication (`rentgo-medan` - Auth-Only) |
| Database & Storage | Supabase (`honhszsloegvpbmczkqf` - PostgreSQL, RLS, Storage + Dual-Mode Fallback) |
| Pembayaran | Midtrans Sandbox (QRIS Dinamis `rentgo-test`) |
| Kecerdasan Buatan | Google Gemini API (`gemini-3.5-flash-lite` / `gemini-flash-latest`) |
| Pengujian Otomatis | Vitest 3.2 (Unit & Concurrency Test), Playwright Chromium (E2E) |
| Presentasi | Slidev (`@slidev/cli`) |
| Hosting | Vercel (Gratis) |
| Versioning | Git + GitHub (`https://github.com/rynnxz/rentGO.git`) |

### 5.2 Fitur Utama (Memenuhi Syarat >= 3 Fitur + CRUD)

| No | Fitur | Keterangan Implementasi |
|---|---|---|
| 1 | **CRUD** Kategori & Kendaraan | Pencarian, filter, tambah/ubah unit, unggah foto, dan *soft-delete* (`deleted_at`) |
| 2 | **Booking real-time + anti bentrok** | Hitung durasi inklusif WIB, kunci atomik, dan penolakan `HTTP 409 Conflict` saat bentrok |
| 3 | **Pembayaran QRIS & mesin status** | Simulasi QRIS Midtrans Sandbox, tombol "Sudah Bayar", transisi 7 status, dan kedaluwarsa 24 jam |
| 4 | **Manajemen perawatan bengkel** | Unit yang sedang servis (`scheduled`/`in_progress`) otomatis disembunyikan dari katalog |
| 5 | **Rekomendasi Gemini AI cerdas** | Memahami kueri bahasa alami (misal: touring motor berdua budget 200rb vs MPV keluarga), menampilkan unit tersedia dengan `fit_score` |
| 6 | **Dasbor & operasional admin** | 6 kartu KPI real-time, komposisi armada, peringatan operasional, dan modal "Semua Aksi (+N)" |

### 5.3 Tampilan Aplikasi (17 Tangkapan Layar Bukti Resolusi 1440x900)

| Gambar Tangkapan Layar | Keterangan Bukti Visual |
|---|---|
| ![01 - Landing Hero](screenshots/01-landing.png) | **01. Landing Page (`/`):** Hero section, Logo Typography `RENTGO. MDN`, Navbar 1 baris, dan Quick Date Search WIB. |
| ![02 - Armada & Tarif](screenshots/02-landing-fleet-pricing.png) | **02. Armada Unggulan & Transparansi Tarif:** Kartu unit plat `BK` Sumatera Utara beserta tabel tarif harian transparan. |
| ![03 - Katalog Booking](screenshots/03-catalog.png) | **03. Katalog Pemesanan (`/book`):** Filter tanggal sewa inklusif WIB, kategori, transmisi, dan daftar unit tersedia. |
| ![04 - Rekomendasi AI](screenshots/04-ai-recommend.png) | **04. Smart AI Recommendation (`Bantu Saya Pilih`):** Kueri *"motor yang cocok untuk touring bareng pacar, budget 200rb maksimal"* menghasilkan rekomendasi motor `Yamaha NMAX 155 Connected` & `Honda Vario 160 ABS` beserta `fit_score`. |
| ![05 - Modal Auth Firebase](screenshots/05-auth-modal.png) | **05. Modal Autentikasi Firebase (`rentgo-medan`):** Login 1x menggunakan Google OAuth Popup, Email/Password, atau akun demo pengujian 1-klik. |
| ![06 - Form Checkout](screenshots/06-checkout-qris.png) | **06. Form Checkout & Kalkulasi Harga (`/book/vehicles/[id]`):** Rincian durasi inklusif server-side (`2 Hari x Rp 420.000 = Rp 840.000`) dan navbar 1 baris saat login. |
| ![07 - Detail QRIS Belum Bayar](screenshots/07-booking-detail-qris.png) | **07. Kode QRIS Midtrans Sandbox (`rentgo-test`):** Halaman detail pesanan menampilkan matriks QRIS dinamis dan tombol simulasi **"Sudah Bayar"**. |
| ![08 - Status Paid & Confirmed](screenshots/08-booking-paid-confirmed.png) | **08. Pelunasan Instan QRIS Sandbox:** Setelah tombol **"Sudah Bayar"** diklik, status pembayaran berubah menjadi `PAID` dan pesanan menjadi `CONFIRMED`. |
| ![09 - Pesanan Saya](screenshots/09-my-bookings-and-profile.png) | **09. Halaman Pesanan Saya (`/book/bookings`):** Daftar riwayat pesanan aktif dan selesai milik pelanggan. |
| ![10 - Dasbor Admin](screenshots/10-admin-dashboard.png) | **10. Dasbor Operasional Admin (`/admin`):** 6 kartu metrik KPI real-time, komposisi status pesanan, dan peringatan operasional. |
| ![11 - Kategori Armada Admin](screenshots/11-admin-categories.png) | **11. Manajemen Kategori Armada (`/admin/categories`):** Operasi CRUD kategori kendaraan dengan proteksi integritas relasi. |
| ![12 - Data Kendaraan Admin](screenshots/12-admin-vehicles.png) | **12. Manajemen Armada (`/admin/vehicles`):** Tabel inventaris 10 unit plat `BK` dengan fitur tambah, ubah, dan *soft-delete*. |
| ![13 - Manajemen Pesanan & Semua Aksi](screenshots/13-admin-bookings-actions.png) | **13. Manajemen Pesanan & Modal "Semua Aksi (+N)" (`/admin/bookings`):** Tata letak aksi 1 baris rapi dan dialog modal transisi status lengkap. |
| ![14 - Jadwal Perawatan Bengkel](screenshots/14-admin-maintenance.png) | **14. Manajemen Jadwal Perawatan (`/admin/maintenance`):** Pencatatan jadwal servis bengkel yang otomatis memblokir unit `BK 7099 AAL` dari katalog. |
| ![15 - Data Pelanggan Admin](screenshots/15-admin-customers.png) | **15. Direktori Pelanggan (`/admin/customers`):** Daftar akun pengguna yang tersinkronisasi dari Firebase Auth beserta nomor SIM. |
| ![16 - Proteksi RBAC 403](screenshots/16-rbac-403-and-404.png) | **16. Bukti Proteksi RBAC (`HTTP 403 - Akses Ditolak`):** Akun berperan `Customer` (`Nadia Siregar`) ditolak saat mencoba mengakses `/admin`. |
| ![17 - Pencegahan Double-Booking 409](screenshots/17-double-booking-409.png) | **17. Bukti Pencegahan Double-Booking (`HTTP 409 Conflict`):** Sistem menolak pesanan kedua pada unit dan rentang tanggal yang sudah terkunci. |

---

## 6. Pengujian

### 6.1 Strategi
Tiga teknik **Black-Box Testing**: *Equivalence Partitioning* (EP), *Boundary Value Analysis* (BVA), dan *State Transition Testing*; dilengkapi pengujian otomatis **Unit Test (Vitest)** dan **End-to-End Browser Test (Playwright Chromium)**.

### 6.2 Hasil Black-Box (20 Kasus Uji `TC-001` s/d `TC-020`)

| ID | Modul / Teknik | Input & Langkah | Hasil Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|
| TC-001 | Middleware (EP) | Buka `/site/admin` langsung | HTTP 404 | HTTP 404 | **PASS** |
| TC-002 | Routing single-domain (EP) | Buka `/`, `/book`, `/admin` | Tiga halaman tampil, sesi `__session` sama | Sesuai (1x Login) | **PASS** |
| TC-003 | RBAC belum login (State) | Buka `/admin` tanpa login | Gerbang login admin (`admin-login-gate`) | Sesuai | **PASS** |
| TC-004 | RBAC customer (State) | Login customer, buka `/admin` | HTTP 403 Akses Ditolak (`admin-access-denied`) | Sesuai | **PASS** |
| TC-005 | Firebase Auth (EP) | Login Google & Email/Password | Cookie `__session` terbentuk, navbar tetap 1 baris | Sesuai | **PASS** |
| TC-006 | CRUD kategori (EP) | Tambah, lalu hapus kategori berisi unit | Tambah sukses, hapus ditolak (`RESTRICT`) | Sesuai | **PASS** |
| TC-007 | CRUD kendaraan (EP) | Tambah unit baru, cek `/book` | Unit tampil di katalog (`E2E-02`) | Sesuai | **PASS** |
| TC-008 | Soft-delete (State) | Hapus kendaraan | `deleted_at` terisi, riwayat aman | Sesuai | **PASS** |
| TC-009 | Durasi 1 hari (BVA) | 15-12-2026 s/d 15-12-2026, Rp 420.000/hari | 1 hari, Rp 420.000 | 1 hari / Rp 420.000 | **PASS** |
| TC-010 | Durasi multi-hari (BVA) | 15 s/d 16-12-2026 | 2 hari, Rp 840.000 | 2 hari / Rp 840.000 | **PASS** |
| TC-011 | Tanggal terbalik (BVA) | start 10-12, end 08-12 | HTTP 400 | Ditolak Zod (`400`) | **PASS** |
| TC-012 | Double-booking paralel (BVA) | 2 request bersamaan, tanggal beririsan | 1x `201 Created`, 1x `409 Conflict` | Terbukti di uji konkurensi | **PASS** |
| TC-013 | Blokir servis (State) | Cari saat unit `BK 7099 AAL` sedang servis (15-16 Nov) | Unit tersembunyi dari katalog (`E2E-06`) | Tersembunyi | **PASS** |
| TC-014 | QRIS sandbox (State) | Klik "Sudah Bayar" | payment `PAID`, booking `CONFIRMED` | Sesuai | **PASS** |
| TC-015 | Siklus status admin (State) | `pending -> confirmed -> ongoing -> completed` | Semua transisi berhasil (`E2E-03 & E2E-04`) | Sesuai | **PASS** |
| TC-016 | Modal "Semua Aksi" (EP) | Klik "Semua Aksi (+N)" | Modal berisi seluruh tombol transisi | Sesuai | **PASS** |
| TC-017 | Batal mandiri (State) | Batalkan pesanan `pending` | `cancelled`, unit tersedia lagi (`E2E-05`) | Sesuai | **PASS** |
| TC-018 | Rekomendasi AI (EP) | Kueri touring motor budget 200rb & MPV keluarga 7 kursi | Maks. 3 unit nyata sesuai kategori/budget + `fit_score` | Sesuai (`E2E-07` & `ai.test.ts`) | **PASS** |
| TC-019 | Rate limit AI (BVA) | Permintaan ke-11 dalam 1 menit | HTTP 429 (`X-RateLimit-Limit: 10`) | Terbukti | **PASS** |
| TC-020 | Auto-expire 24 jam (State) | Panggil housekeeping pada pending kedaluwarsa | Status `expired`, tanggal terbuka kembali | Sesuai | **PASS** |

> **Konfirmasi Eksekusi Final (15 November 2026):** Seluruh 20 kasus uji Black-Box (`TC-001` s/d `TC-020`) telah dieksekusi ulang pada rilis `v1.2.0` dan **100% LULUS (20/20 PASS)**, termasuk perbaikan ekstraksi bahasa alami AI untuk kueri sepeda motor touring berbudget Rp 200.000 (`TC-018`) dan tata letak navbar 1 baris saat login (`TC-005`).

### 6.3 Contoh Teknik Uji

- **EP (form checkout):** WhatsApp `081260009988` dan SIM `1271091511040001` -> valid (`HTTP 201`). WhatsApp `abc-bukan-nomor` atau SIM `123` -> ditolak (`HTTP 400`) dengan pesan validasi Zod.
- **BVA (irisan 1 hari):** Pesanan A `10-12 Desember`, Pesanan B `12-14 Desember` pada unit sama -> Pesanan B ditolak (`HTTP 409 Conflict`).
- **State transition ilegal:** pelanggan membatalkan pesanan `confirmed/ongoing` -> ditolak; mengubah `completed` kembali ke `pending` -> ditolak oleh `canTransitionBookingStatus`.

### 6.4 Pengujian Otomatis

| Jenis Pengujian | Alat / Perintah | Cakupan & Jumlah | Hasil Aktual (15 Nov 2026) |
|---|---|---|---|
| Static type check | `npm run typecheck` (`tsc --noEmit`) | Seluruh kode TypeScript (`strict: true`) | **LULUS (0 error)** |
| Unit & concurrency test | Vitest (`npm test`) | **5 file uji (21 kasus uji unit)** | **LULUS 100% (21/21 PASS dalam 14,21 dtk)** |
| End-to-end browser | Playwright Chromium (`npx playwright test`) | **6 blok uji otomatis yang mencakup 8 skenario E2E (`E2E-01` s/d `E2E-08`)** | **LULUS 100% (6/6 blok uji - 8/8 skenario PASS)** |
| Build produksi | `npm run build` (`next build`) | 15 rute halaman + 16 endpoint API + Edge Middleware | **LULUS (Compiled successfully)** |

Perintah menjalankan ulang (di dalam folder `website/`):
```bash
npm run typecheck
npm test
npx playwright test
```

---

## 7. Deployment

| Item | Keterangan |
|---|---|
| Platform | Vercel (paket Hobby gratis), 1 project, Root Directory `website` |
| Database | Supabase (proyek `honhszsloegvpbmczkqf`), setup 1-klik via `website/supabase/RENTGO_FULL_SETUP_AND_SEED.sql` + Dual-Mode Fallback |
| Variabel lingkungan | Firebase, Supabase, Midtrans Sandbox, Gemini API, `CRON_SECRET` (diatur di `.env.local` / dashboard Vercel, 0 secret di-commit ke Git) |
| Cron | `/api/cron/housekeeping` untuk kedaluwarsa otomatis pesanan `pending` > 24 jam |
| URL | Lokal Terverifikasi: `http://localhost:3000` (`/` \| `/book` \| `/admin`) - Target Produksi: `https://rentgo.my.id` (deployment online tidak wajib) |
| Smoke test | Seluruh 7 pemeriksaan rute dan keamanan (`GET /`, `GET /book`, `GET /admin` Gate, RBAC `403`, `/site/*` -> `404`, `GET /api/vehicles`, dan `POST /api/ai/recommend`) lulus 100% (detail di `docs/evidence/deploy-smoke-test.md`) |

Langkah menjalankan secara lokal:
1. `git clone https://github.com/rynnxz/rentGO.git && cd rentGO/website`
2. Salin `.env.example` menjadi `.env.local`, lalu isi nilai kunci API sesuai panduan `docs/MANUAL_STEPS.md`.
3. Jalankan `website/supabase/RENTGO_FULL_SETUP_AND_SEED.sql` di Supabase SQL Editor (opsional jika menggunakan mode `local-fallback`).
4. Jalankan `npm install && npm run dev`, lalu buka `http://localhost:3000`.

---

## 8. Kesimpulan dan Saran

### 8.1 Kesimpulan
1. Model **SDLC Incremental** terbukti sangat efektif untuk pengembang tunggal: fitur inti (CRUD armada dan mesin booking) sudah dapat dipakai sejak increment awal (`v0.2.0 - v0.3.0`), sementara asisten Gemini AI, QRIS Midtrans Sandbox, arsitektur Single-Domain 1x Login, dan hardening ditambahkan bertahap hingga `v1.2.0` tanpa merombak fondasi.
2. Masalah utama usaha rental konvensional di Medan - yaitu bentrok jadwal (*double-booking*), ketidaksinkronan jadwal servis bengkel, dan pembayaran menggantung - ditangani langsung di tingkat transaksi database dan aturan bisnis server-side.
3. Pengujian sistematis menggunakan **Black-Box (EP, BVA, State Transition - 20 TC)** ditambah **21 Unit Test (Vitest)** dan **6 blok uji / 8 skenario E2E (Playwright Chromium)** memberikan bukti terukur atas keandalan sistem.
4. Seluruh stack teknologi berjalan pada tier gratis sehingga biaya operasional prototipe adalah nol rupiah.

### 8.2 Keterbatasan
- Pembayaran QRIS masih berjalan pada lingkungan **Midtrans Sandbox (`rentgo-test`)** (belum memproses uang sungguhan).
- Kuota gratis Gemini API dan Vercel Hobby membatasi laju permintaan AI (dibatasi 10 respons/menit) dan frekuensi cron job.
- Untuk mengaktifkan persistensi `supabase-cloud` secara langsung di proyek `honhszsloegvpbmczkqf`, pemilik akun perlu menjalankan skrip `RENTGO_FULL_SETUP_AND_SEED.sql` satu kali di Supabase SQL Editor dan mengisi `SUPABASE_SERVICE_ROLE_KEY` di `.env.local` (selama belum diisi, aplikasi berjalan otomatis pada mode `local-fallback`).

### 8.3 Saran Pengembangan
Penambahan peran ketiga untuk mitra pemilik armada (*fleet partner*), integrasi notifikasi WhatsApp otomatis saat pesanan dikonfirmasi, migrasi Midtrans ke mode produksi, kalender tarif musiman (*peak season* Lebaran/Tahun Baru), dan pengembangan aplikasi mobile menggunakan Flutter.

---

## 9. Checklist Pemenuhan Syarat Dosen

| Syarat | Status | Bukti |
|---|---|---|
| Aplikasi berjalan dengan database | ✅ Terpenuhi (Dual-Mode Supabase PostgreSQL 7 Tabel + Fallback Lokal; verifikasi cloud langsung menunggu eksekusi SQL Editor pemilik akun) | `website/supabase/RENTGO_FULL_SETUP_AND_SEED.sql` + `docs/evidence/supabase-verification.md` |
| CRUD | ✅ Terpenuhi | Bagian 5.2 Fitur 1 (Kategori, Kendaraan + Soft-Delete, Pesanan, Perawatan) |
| Minimal 3 fitur utama | ✅ Terpenuhi (6 Fitur Utama) | Bagian 5.2 (6 Fitur Utama) |
| 1 model pengembangan dipilih | ✅ Terpenuhi (SDLC Incremental) | Bagian 2 (`v0.1.0` s/d `v1.2.0`) |
| Pengujian | ✅ Terpenuhi (20 Black-Box + 21 Unit Test + 6 Blok / 8 Skenario E2E) | Bagian 6 + `docs/evidence/test-results.md` |
| Deployment (online tidak wajib) | ✅ Terpenuhi (Production Build Lulus & Panduan Vercel Lengkap) | Bagian 7 + `docs/evidence/deploy-smoke-test.md` |
| Laporan singkat + screenshot | ✅ Terpenuhi (17 Tangkapan Layar 1440x900) | Dokumen ini + `laporan/screenshots/` |
| Presentasi | ✅ Terpenuhi (15 Slide Akademik Slidev + PDF) | `slidev/slides.md` + `laporan/slides/presentasi-rentgo-uts.pdf` |
| Kode di GitHub | ✅ Terpenuhi | [https://github.com/rynnxz/rentGO.git](https://github.com/rynnxz/rentGO.git) |

---

## Lampiran
- **A. Skrip SQL Lengkap (Idempoten 1-Klik):** [website/supabase/RENTGO_FULL_SETUP_AND_SEED.sql](file:///c:/uts-mmprpl/rentgo/website/supabase/RENTGO_FULL_SETUP_AND_SEED.sql)
- **B. Dokumen Audit Lengkap (01 - 04):** [audit/README.md](file:///c:/uts-mmprpl/rentgo/audit/README.md)
- **C. Bukti Eksekusi Pengujian & Verifikasi:** [docs/evidence/test-results.md](file:///c:/uts-mmprpl/rentgo/docs/evidence/test-results.md), [docs/evidence/supabase-verification.md](file:///c:/uts-mmprpl/rentgo/docs/evidence/supabase-verification.md), [docs/evidence/deploy-smoke-test.md](file:///c:/uts-mmprpl/rentgo/docs/evidence/deploy-smoke-test.md)
- **D. Naskah Demo Presentasi (3 - 5 Menit):** [docs/DEMO_SCRIPT.md](file:///c:/uts-mmprpl/rentgo/docs/DEMO_SCRIPT.md)
- **E. Panduan Langkah Manual Cloud & Keamanan:** [docs/MANUAL_STEPS.md](file:///c:/uts-mmprpl/rentgo/docs/MANUAL_STEPS.md)

> *Catatan untuk Mahasiswa (Akbar Riansyah): Silakan isi 2 placeholder identitas akademik pada tabel paling atas (`[ISI: NIM]` dan `[ISI: nama dosen]`) sebelum mencetak atau mengumpulkan laporan ini.*
