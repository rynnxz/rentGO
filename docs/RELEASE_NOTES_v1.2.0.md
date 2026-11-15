# Catatan Rilis (Release Notes) - RentGo Medan `v1.2.0`

- **Versi Rilis:** `v1.2.0`
- **Tanggal Rilis:** 15 November 2026
- **Pengembang:** Akbar Riansyah (Proyek Individu No. 2 - UTS MMPRPL, TRPL Semester III, Politeknik Wilmar Bisnis Indonesia)
- **Repositori:** [https://github.com/rynnxz/rentGO.git](https://github.com/rynnxz/rentGO.git)

---

## Ringkasan Eksekutif Rilis `v1.2.0`

Rilis **`v1.2.0`** merupakan iterasi penyempurnaan arsitektur, kecerdasan buatan, antarmuka pengguna, dan kelengkapan audit akademik di atas fondasi `v1.0.0` pada metodologi **SDLC Incremental**.

### 1. Peningkatan Mesin Rekomendasi AI (`Smart Natural-Language Extraction + Multi-Model Gemini Chain`)
- **Ekstraksi Kueri Bahasa Alami (`extractNaturalQueryIntent`):** Mesin AI kini secara cerdas mengekstraksi kategori kendaraan (`motor`/`skutik` vs `mobil`), jumlah penumpang (`bareng pacar`/`berdua` -> 2 kursi, `sendiri` -> 1 kursi, `N orang` -> N kursi), serta batas anggaran harian (`200rb` -> `Rp 200.000`, `1,2 juta` -> `Rp 1.200.000`) langsung dari kalimat pengguna.
- **Pra-Filter Kategori Ketat:** Jika pengguna meminta sepeda motor (contoh: *"motor yang cocok untuk touring bareng pacar, budget 200rb maksimal"*), kandidat armada disaring ketat hanya pada kategori `Motor` (`Yamaha NMAX 155 Connected` Rp 140.000/hari & `Honda Vario 160 ABS` Rp 120.000/hari), sehingga tidak lagi merekomendasikan mobil 5 kursi.
- **Rantai Model Gemini Berlatensi Rendah:** Mengatasi kendala `HTTP 503 High Demand` pada endpoint tunggal dengan rantai model prioritas (`gemini-3.5-flash-lite` -> `gemini-flash-lite-latest` -> `gemini-flash-latest` -> `gemini-3.1-flash-lite`) dengan *timeout* 6 detik dan pelabelan jujur apabila *heuristic fallback* digunakan.

### 2. Perbaikan Tata Letak Navbar 1 Baris (Single-Row Responsive Header)
- **Anti-Wrapping Saat Login:** Menghapus `flex-wrap` pada kontainer navbar desktop di Landing Page (`/`), Aplikasi Booking (`/book`), dan komponen `AuthControls`.
- **Konsistensi Satu Baris:** Saat pengguna masuk sebagai `Akbar Riansyah (ADMIN)` maupun `Nadia Siregar (CUSTOMER)`, logo `RENTGO. MDN`, tautan navigasi tengah, tombol pintasan `Panel Admin` / `Buka Aplikasi Booking`, badge pengguna aktif, dan tombol `Keluar` tetap sejajar presisi dalam satu baris horizontal tanpa turun ke baris kedua.

### 3. Arsitektur Dual-Mode Supabase Cloud & Penyimpanan Lokal (`supabase-cloud` / `local-fallback`)
- **Sinkronisasi Cloud & Fallback Otomatis:** Memperbarui `website/src/lib/supabase-server.ts` dan `website/src/lib/repository.ts` agar secara otomatis membaca/menulis ke 7 tabel PostgreSQL Supabase (`honhszsloegvpbmczkqf`) saat `SUPABASE_SERVICE_ROLE_KEY` aktif, serta beralih mulus ke penyimpanan lokal `.data/rentgo-local.json` apabila kunci service role belum diisi atau koneksi offline.
- **Indikator Mode Persistensi:** Endpoint `GET /api/vehicles` kini menyertakan metadata `persistence_mode` (`"supabase-cloud"` atau `"local-fallback"`) dan `supabase_configured`.
- **Skrip SQL Idempoten 1-Klik:** Menyediakan [website/supabase/RENTGO_FULL_SETUP_AND_SEED.sql](file:///c:/uts-mmprpl/rentgo/website/supabase/RENTGO_FULL_SETUP_AND_SEED.sql) untuk membangun 7 tabel, constraint GiST anti double-booking, fungsi RPC `create_booking`, bucket storage, dan data awal hanya dengan sekali klik di Supabase SQL Editor.

### 4. Arsitektur Single-Domain (`1x Login`) & Pemisahan Peran Cloud
- **Single-Domain Multi-Surface (`/`, `/book`, `/admin`):** Sesi cookie `__session` (`Path=/`, `httpOnly`, `SameSite=Lax`) berlaku di seluruh halaman tanpa perlu login ulang.
- **Firebase Auth-Only & Supabase Database/Storage:** Memastikan `firebase-client.ts` murni menggunakan `firebase/auth` tanpa ketergantungan Firestore.
- **Pembersihan Kunci Rahasia (Zero Hardcoded Secrets):** Menghapus seluruh nilai kunci API yang sebelumnya menjadi fallback statis di kode sumber dan dokumentasi, serta memperketat `.gitignore`.

---

## Riwayat Tag & Increment SDLC

| Versi / Tag | Increment | Fokus Utama |
| :--- | :--- | :--- |
| **`v0.1.0`** | Increment 0 | Fondasi monorepo Next.js 15, skema SQL 7 tabel Supabase, middleware, dan konfigurasi Auth. |
| **`v0.2.0`** | Increment 1 | Panel Operasional Admin (`/admin`), RBAC (`401`/`403`), CRUD Kategori, Kendaraan (Soft-Delete), dan Jadwal Servis. |
| **`v0.3.0`** | Increment 2 | Katalog pelanggan (`/book`), kalkulasi harga inklusif WIB, Anti Double-Booking (`409`), State Machine 7 status, dan QRIS Midtrans Sandbox. |
| **`v0.4.0`** | Increment 3 | Landing Page publik 10 seksi (`/`), rekomendasi AI Gemini (limit 10/menit), Dasbor KPI Admin, dan Cron Housekeeping. |
| **`v1.0.0`** | Increment 4 | Sistem Desain Triadik WCAG AA, foto armada asli, pengujian Black-Box (20 TC), Unit Test (21 tes), E2E Playwright, dan Slidev. |
| **`v1.2.0`** | Finalisasi UTS | Single-Domain 1x Login, Smart AI Natural-Language Query (Motor/Mobil & Budget), Navbar 1 Baris, Dual-Mode Supabase Repository, Audit Lengkap, dan Laporan Akhir UTS. |
