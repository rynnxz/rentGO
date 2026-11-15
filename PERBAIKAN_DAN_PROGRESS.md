# Laporan Pertinggal: Perbaikan, Integrasi Kredensial, & Progress Proyek RentGo Medan

Dokumen ini merupakan ringkasan pertinggal (*handover*) di direktori utama repositori untuk memudahkan pemeriksaan cepat terhadap seluruh perbaikan, integrasi kredensial cloud, status fitur website, dan pembaruan presentasi Slidev pada proyek **RentGo Medan (Proyek Individu No. 2 - Akbar Riansyah)**.

> Dokumentasi teknis lengkap juga tersedia di:
> - [website/docs/STATUS_DAN_PERBAIKAN.md](file:///c:/uts-mmprpl/rentgo/website/docs/STATUS_DAN_PERBAIKAN.md)
> - [website/docs/progress.md](file:///c:/uts-mmprpl/rentgo/website/docs/progress.md)
> - [website/docs/DESIGN_SYSTEM.md](file:///c:/uts-mmprpl/rentgo/website/docs/DESIGN_SYSTEM.md)
> - [website/docs/03-perancangan.md](file:///c:/uts-mmprpl/rentgo/website/docs/03-perancangan.md)
> - [website/docs/04-pengujian.md](file:///c:/uts-mmprpl/rentgo/website/docs/04-pengujian.md)
> - [slidev/slides.md](file:///c:/uts-mmprpl/rentgo/slidev/slides.md)

---

## 1. Ringkasan 8 Perbaikan Utama yang Telah Diselesaikan

| No | Area Perbaikan | Masalah Sebelumnya | Solusi yang Telah Diimplementasikan |
| :---: | :--- | :--- | :--- |
| **1** | **Logo RentGo** | Logo terlalu sederhana/polos | Dirancang ulang di `src/components/shared/logo.tsx` menggunakan emblem perisai otomotif berlapis dengan warna Triadik + indikator permukaan (`MEDAN`, `BOOKING`, `ADMIN PANEL`). |
| **2** | **Teori Warna Triadik** | Warna belum mengikuti teori warna triadik eksplisit | Diterapkan skema **Triadik 120 derajat (60-30-10)** di `src/styles/tokens.css` & `slidev/style.css`: **Triad I Cobalt/Navy** (`#0B1D3A`/`#1D4ED8`), **Triad II Emerald-Teal** (`#0D9488`/`#0F766E`), dan **Triad III Warm Amber-Gold** (`#F59E0B`/`#B45309`). |
| **3** | **Sidebar, Navbar Sticky, & Menu Mati** | Ada menu "Panduan Desain" yang tidak bisa ditekan; sidebar/navbar ikut tergulung | Menu mati **Panduan Desain** dihapus dari `admin-shell.tsx`; sidebar desktop dibuat `lg:sticky lg:top-0 lg:h-screen`; semua navbar dibuat `sticky top-0 z-40`; ditambahkan laci navigasi mobile + quick-nav horizontal. |
| **4** | **Tombol Action di Tabel Dashboard** | Tombol aksi tabel Admin kurang responsif dan tampak berantakan | Diperbaiki pada seluruh 5 tabel (`bookings`, `vehicles`, `maintenance`, `customers`, `categories`) menggunakan toolbar `inline-flex flex-wrap gap-1.5`, tinggi `min-h-[38px]`, border tegas, dan warna Triadik. |
| **5** | **Foto Kendaraan Asli (`public/vehicles/`)** | Semua kartu menggunakan gambar ilustrasi SVG | Keenam foto asli di `public/vehicles/` (`Honda-Brio-Satya-RS.jfif`, `Toyota-Agya-GR-Sport.jpg`, `Toyota-Avanza-1.5-G-CVT.png`, `Daihatsu-Xenia-1.3-R-MT.png`, `yamaha-nmax-155-connected.png`, `honda-vario-160-abs.jfif`) dipetakan ke unit utama; SVG hanya dijadikan *fallback placeholder*. |
| **6** | **Login Firebase & Kredensial Cloud** | Belum terhubung ke kredensial proyek `rentgo-medan` & `honhszsloegvpbmczkqf` | Terhubung ke Firebase `rentgo-medan` (`1:1047637681782:web:5ed7cbbc05c3ff1ed32157`) dengan dukungan **Email/Password (Masuk & Daftar)** + **Google Sign-In**, serta konfigurasi Supabase `honhszsloegvpbmczkqf` untuk database & cloud photo upload. |
| **7** | **Pembayaran QRIS Midtrans Sandbox** | Masih menampilkan opsi transfer bank manual | Dikunci khusus **QRIS Midtrans Sandbox (`rentgo-test`)**, menampilkan matriks **Kode QRIS Dinamis** pada halaman detail pesanan, serta tombol **"Sudah Bayar (Simulasi QRIS Midtrans Sandbox)"** yang langsung melunasi pesanan. |
| **8** | **Gemini AI (Limit 10/Menit) & Slidev Lengkap** | Belum dibatasi 10/menit; Slidev belum merinci ERD, Flowchart, Arsitektur, & Cara Tes Black-Box | Terhubung ke `gemini-flash-latest` dengan **Rate Limit 10 respons/menit** (`HTTP 429` saat melebihi); Slidev diperluas menjadi **16 slide** mencakup ERD 7 tabel + relasi, Flowchart Booking/QRIS/AI, Arsitektur + Penghubung Antar-Komponen, serta Metodologi & Cara Tes Black-Box. |
| **9** | **Efek Loading Menyeluruh (Landing, Booking, & Admin)** | Saat fetch ketersediaan tanggal, minta rekomendasi AI, checkout QRIS, login/logout, atau klik aksi baris di Admin, UI tampak diam/polos tanpa indikator visual | Dibangun sistem loading berbasis elemen semantik `<progress>` (`LoadingSpinner`, `LoadingBar`, `LoadingStatusBanner`, `CatalogCardSkeleton`, `TableRowsSkeleton`) di `src/components/ui/loading.tsx`, 6 file route-level `loading.tsx`, loading ganti tanggal & skeleton AI di katalog pelanggan, overlay spinner QRIS, serta per-row/per-button spinner di kelima manajer Admin. |

---

## 2. Kredensial & Konfigurasi yang Terpasang (`website/.env.local`)

- **Firebase Project ID:** `rentgo-medan` (`NEXT_PUBLIC_FIREBASE_APP_ID=1:1047637681782:web:5ed7cbbc05c3ff1ed32157`)
- **Supabase Project Ref:** `honhszsloegvpbmczkqf` (`https://honhszsloegvpbmczkqf.supabase.co`)
- **Google Gemini AI:** Model `gemini-flash-latest`, Rate Limit `GEMINI_RATE_LIMIT_PER_MINUTE=10`
- **Midtrans Sandbox:** Merchant ID `rentgo-test`, Server Key disimpan di `.env.local` (Mode QRIS-Only)
