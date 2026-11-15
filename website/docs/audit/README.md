# Laporan Audit Komprehensif Sistem RentGo Medan (v1.2.0)

Selamat datang di direktori **`audit/`** untuk proyek **RentGo Medan - Sistem Manajemen Penyewaan Kendaraan Real-Time Berbasis Web**. Dokumen-dokumen di dalam folder ini menyajikan audit teknis menyeluruh mulai dari deskripsi aplikasi, arsitektur sistem dan penghubung antar-layanan, skema ERD dan relasi basis data Supabase, hingga metodologi dan prosedur pengujian Black-Box, Unit Test, dan End-to-End (E2E).

---

## Daftar Dokumen Audit di Folder Ini

1. **[01-profil-dan-fitur-aplikasi.md](file:///c:/uts-mmprpl/rentgo/audit/01-profil-dan-fitur-aplikasi.md)**
   - Penjelasan lengkap tentang aplikasi RentGo Medan, latar belakang masalah operasional rental di Sumatera Utara, metodologi SDLC Incremental (`v0.1.0` s/d `v1.2.0`), Logo Typography murni, Teori Warna Triadik, serta rincian fitur di halaman publik (`/`), aplikasi pemesanan (`/book`), dan panel admin (`/admin`).
2. **[02-arsitektur-dan-penghubung-sistem.md](file:///c:/uts-mmprpl/rentgo/audit/02-arsitektur-dan-penghubung-sistem.md)**
   - Penjelasan **Single-Domain Multi-Surface Path Architecture** (`rentgo.my.id/`, `rentgo.my.id/book`, `rentgo.my.id/admin`) yang memungkinkan **1x Login berlaku di seluruh halaman**, **4-Tier Layered Architecture**, pembagian peran **Firebase khusus Autentikasi (Auth-Only)** dan **Supabase khusus Database + Cloud Storage**, integrasi **Midtrans Sandbox QRIS (`rentgo-test`)**, **Google Gemini AI (`gemini-flash-latest` limit 10 respons/menit)**, serta **Flowchart End-to-End**.
3. **[03-erd-dan-relasi-database.md](file:///c:/uts-mmprpl/rentgo/audit/03-erd-dan-relasi-database.md)**
   - Diagram **Entity Relationship Diagram (ERD)** 7 tabel PostgreSQL, penjelasan relasi antar-tabel (`1:N` dan `1:1`), mekanisme Anti Double-Booking (`EXCLUDE USING gist`), penjelasan mengapa tabel di Supabase (`honhszsloegvpbmczkqf`) sebelumnya belum terbuat otomatis, dan panduan 1-klik menjalankan file SQL **[RENTGO_FULL_SETUP_AND_SEED.sql](file:///c:/uts-mmprpl/rentgo/website/supabase/RENTGO_FULL_SETUP_AND_SEED.sql)**.
4. **[04-audit-pengujian-dan-blackbox.md](file:///c:/uts-mmprpl/rentgo/audit/04-audit-pengujian-dan-blackbox.md)**
   - Panduan lengkap **cara melakukan pengujian Black-Box langkah demi langkah** menggunakan 3 teknik (Equivalence Partitioning, Boundary Value Analysis, dan State Transition Testing), rekapitulasi 20 skenario Black-Box (`TC-001` s/d `TC-020`), 21 Unit Test Vitest (5 file uji), dan 6 blok uji otomatis yang mencakup 8 skenario E2E (`E2E-01` s/d `E2E-08`, Playwright).

---

## Ringkasan 6 Perbaikan Terbaru (Rilis `v1.2.0`)

| No | Permintaan Perbaikan | Implementasi & File Terkait | Status |
|---|---|---|---|
| **1** | **Logo Typography Modern** (tanpa ikon mobil/perisai) | Merancang ulang [logo.tsx](file:///c:/uts-mmprpl/rentgo/website/src/components/shared/logo.tsx) menjadi **Editorial Typography Wordmark** (`RENT` tebal + `GO` miring beraksen + titik Emerald `.` + tag `MDN` monospace + aksen garis kecepatan Triadik). | Selesai |
| **2** | **Arsitektur Single-Domain (`rentgo.my.id`, `/book`, `/admin`) agar cukup 1x Login** | Memperbarui [middleware.ts](file:///c:/uts-mmprpl/rentgo/website/src/middleware.ts) dan [utils.ts](file:///c:/uts-mmprpl/rentgo/website/src/lib/utils.ts) serta seluruh navigasi internal agar menggunakan path satu domain (`/`, `/book`, `/admin`). Sesi cookie `__session` dan Firebase Auth kini otomatis menyatu dalam 1 domain tanpa perlu login ulang. | Selesai |
| **3** | **Perbaikan Modal Admin & Tombol "Semua Aksi" (Satu Baris Rapi)** | Memperbaiki seluruh `<dialog>` modal di Admin dengan header Navy sticky dan backdrop blur, serta merombak kolom aksi di [bookings-manager.tsx](file:///c:/uts-mmprpl/rentgo/website/src/components/admin/bookings-manager.tsx) menjadi 1 baris horizontal berisi aksi utama + tombol **"Semua Aksi (+N)"** yang membuka panel lengkap transisi status di dalam modal. | Selesai |
| **4** | **Setup Tabel & Seed Database Supabase (`honhszsloegvpbmczkqf`)** | Menyiapkan konfigurasi MCP global `~/.gemini/antigravity/mcp_config.json` serta skrip SQL lengkap 1-klik [RENTGO_FULL_SETUP_AND_SEED.sql](file:///c:/uts-mmprpl/rentgo/website/supabase/RENTGO_FULL_SETUP_AND_SEED.sql) dan [0001_init.sql](file:///c:/uts-mmprpl/rentgo/website/supabase/migrations/0001_init.sql). | Selesai |
| **5** | **Firebase Khusus untuk Autentikasi Saja (Auth-Only)** | Menghapus seluruh pemanggilan `firebase/firestore` dari [firebase-client.ts](file:///c:/uts-mmprpl/rentgo/website/src/lib/firebase-client.ts). Firebase kini 100% hanya menangani autentikasi pengguna (Google OAuth & Email/Password), sedangkan Database & Cloud Storage ditangani oleh Supabase. | Selesai |
| **6** | **Pembuatan Folder `audit/` Berisi Audit Lengkap Sistem** | Menyusun 5 dokumen audit Markdown lengkap di dalam folder [audit/](file:///c:/uts-mmprpl/rentgo/audit/) dan menyinkronkannya ke `website/docs/audit/`. | Selesai |
