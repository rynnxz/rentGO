# RentGo Medan - Website & Sistem Manajemen Penyewaan Kendaraan (`website/`)

Aplikasi web **Next.js 15 (App Router, TypeScript strict)** yang melayani **3 subdomain** dari satu proyek dan satu deployment tunggal:
- `rentgo.my.id` (`http://localhost:3000` atau `?site=landing`) -> Halaman Pemasaran Utama & Profil Layanan
- `book.rentgo.my.id` (`http://book.localhost:3000` atau `?site=book`) -> Katalog Ketersediaan Real-Time, Rekomendasi AI ("Bantu Saya Pilih"), Checkout, & Pesanan Saya
- `admin.rentgo.my.id` (`http://admin.localhost:3000` atau `?site=admin`) -> Dasbor Analitik, CRUD Armada & Kategori, Verifikasi Pesanan & Pembayaran, Jadwal Perawatan, & Pelanggan

---

## Fitur Utama

1. **Multi-Subdomain Routing (`src/middleware.ts`)**
   - Memetakan request berdasarkan header `Host` ke `/site/landing`, `/site/book`, atau `/site/admin`.
   - Memblokir akses langsung browser ke `/site/*` (mengembalikan HTTP 404).
   - Mendukung parameter `?site=landing|book|admin` pada lingkungan pengembangan dan Vercel preview.
2. **Autentikasi Google & RBAC (`src/lib/firebase-admin.ts`, `src/lib/session.ts`)**
   - Login menggunakan akun Google via Firebase Authentication dan pertukaran token ke cookie HTTP-only `__session` lintas subdomain (`.rentgo.my.id`).
   - Penetapan role `admin` otomatis berdasarkan kecocokan email dengan variabel lingkungan `ADMIN_EMAILS`.
   - Dilengkapi mode **Firebase Auth Emulator / Local Account Picker** saat dijalankan secara lokal tanpa kredensial cloud.
3. **Mesin Anti Double-Booking & Kalkulasi Harga Server-Side (`src/lib/availability.ts`, `src/lib/pricing.ts`)**
   - Mencegah dua pesanan aktif (`pending`, `confirmed`, `ongoing`) atau jadwal servis (`scheduled`, `in_progress`) beririsan pada unit dan tanggal yang sama (`start_date <= req.end_date AND end_date >= req.start_date`).
   - Perhitungan durasi sewa inklusif pada zona waktu `Asia/Jakarta` (WIB): `(end_date - start_date) + 1 hari`.
4. **Rekomendasi Kendaraan Cerdas ("Bantu Saya Pilih") (`src/lib/ai.ts`, `POST /api/ai/recommend`)**
   - Menggunakan Google Gemini SDK (`@google/genai`) dengan keluaran JSON terstruktur yang hanya boleh memilih dari daftar kendaraan yang nyata dan tersedia pada tanggal pilihan pelanggan.
   - Dilengkapi mesin fallback deterministik berbasis aturan skor sehingga fitur tetap berfungsi 100% meskipun kuota API habis atau kunci belum diisi.

---

## Cara Menjalankan Secara Lokal

```bash
# 1. Masuk ke direktori website
cd website

# 2. Salin konfigurasi environment (opsional, aplikasi sudah memiliki fallback lokal penuh)
cp .env.example .env.local

# 3. Instal dependensi
npm install

# 4. Jalankan server pengembangan
npm run dev
```

Akses ketiga permukaan aplikasi di browser:
- **Landing Surface:** `http://localhost:3000` (atau `http://localhost:3000/?site=landing`)
- **Booking Surface:** `http://book.localhost:3000` (atau `http://localhost:3000/?site=book`)
- **Admin Surface:** `http://admin.localhost:3000` (atau `http://localhost:3000/?site=admin`)

---

## Perintah Pengujian & Build

```bash
# Pemeriksaan tipe TypeScript strict
npm run typecheck

# Pengujian unit dengan Vitest (21 kasus uji)
npm test

# Build produksi Next.js
npm run build

# Pengujian End-to-End dengan Playwright
npm run test:e2e

# Pengambilan tangkapan layar dokumentasi otomatis
npm run docs:screens
```

---

## Struktur Dokumentasi (`website/docs/`)

- [00-capability-check.md](docs/00-capability-check.md) - Laporan pemeriksaan kemampuan alat, CLI, dan MCP
- [01-analisis.md](docs/01-analisis.md) - Analisis Masalah, Kebutuhan Fungsional/Non-Fungsional, & Studi Kelayakan
- [02-sdlc-incremental.md](docs/02-sdlc-incremental.md) - Pemilihan Metodologi SDLC Incremental & Rencana 5 Increment
- [03-perancangan.md](docs/03-perancangan.md) - Arsitektur Multi-Subdomain, DFD/Use Case, ERD, State Machine, & UI/UX
- [04-pengujian.md](docs/04-pengujian.md) - Skenario Uji Black-Box, Hasil Unit Test, & Hasil E2E Playwright
- [05-deployment.md](docs/05-deployment.md) - Panduan Deployment Vercel, DNS Cloudflare, Supabase, & Firebase
- [06-presentasi.md](docs/06-presentasi.md) - Naskah Demo 7 Langkah & Jawaban 6 Pertanyaan Dosen Penguji
- [DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) - Spesifikasi Token Warna Terkunci & Komponen UI
- [DECISIONS.md](docs/DECISIONS.md) - Catatan Keputusan Arsitektur & Teknis
- [BACKLOG.md](docs/BACKLOG.md) - Daftar Fitur Masa Depan (Post-UTS)
- [SETUP_MANUAL.md](docs/SETUP_MANUAL.md) - Panduan Langkah Manual Pengaturan Kredensial Cloud Gratis (Rp0)
