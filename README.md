# RentGo Medan - Monorepo UTS Metode Model Pengembangan Perangkat Lunak

Repositori ini merupakan pengerjaan proyek individu **Ujian Tengah Semester (UTS) Metode Model Pengembangan Perangkat Lunak** pada Program Studi **Teknologi Rekayasa Perangkat Lunak (TRPL) Semester III, Politeknik Wilmar Bisnis Indonesia**:

- **Nama Mahasiswa:** Akbar Riansyah
- **Nomor Urut / Proyek Individu:** No. 2 - **Sistem Manajemen Penyewaan Kendaraan (RentGo)**
- **Metodologi SDLC:** **Incremental Model** (5 Increment: `v0.1.0` s/d `v1.0.0`)
- **Arsitektur Domain:** Single Next.js 15 Deployment untuk `rentgo.my.id`, `book.rentgo.my.id`, dan `admin.rentgo.my.id`

---

## Struktur Monorepo

```text
rentgo/
├── website/                  # Aplikasi utama Next.js 15 + Supabase + Firebase Auth + Gemini AI
│   ├── src/                  # Kode sumber (App Router, Middleware, Komponen, Libs)
│   ├── supabase/             # Migrasi SQL (0001_init.sql) & Seed Data Medan (seed.sql)
│   ├── tests/                # Unit tests (Vitest) & End-to-End tests (Playwright)
│   └── docs/                 # Dokumentasi akademik lengkap (01..06) & tangkapan layar nyata
├── slidev/                   # Dek presentasi akademik berbasis Slidev (Markdown -> Slide & PDF)
│   ├── slides.md             # 12 slide presentasi UTS RentGo
│   ├── style.css             # Tema Slidev selaras dengan token desain RentGo
│   ├── public/screens/       # Tangkapan layar aplikasi yang disinkronkan dari website/docs/screenshots
│   └── dist/RentGo-UTS.pdf   # Hasil ekspor PDF siap kumpul
└── .github/workflows/ci.yml  # Pipeline CI otomatis (typecheck, unit test, build)
```

---

## Panduan Cepat Menjalankan Proyek

### 1. Menjalankan Aplikasi Web (`website/`)
```bash
cd website
npm install
npm run dev
```
- Halaman Landing: `http://localhost:3000/?site=landing`
- Aplikasi Booking: `http://localhost:3000/?site=book` (atau `http://book.localhost:3000`)
- Panel Admin: `http://localhost:3000/?site=admin` (atau `http://admin.localhost:3000`)

### 2. Menjalankan Dek Presentasi (`slidev/`)
```bash
cd slidev
npm install
npm run sync:screens
npm run dev
```
Untuk mengekspor slide ke PDF (`slidev/dist/RentGo-UTS.pdf`):
```bash
cd slidev
npm run export
```
