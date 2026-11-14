# MASTER PROMPT — RentGo (Sistem Manajemen Penyewaan Kendaraan)

> Prompt tunggal untuk dieksekusi end-to-end oleh agent di Antigravity.
> Konteks: UTS Metode Model Pengembangan Perangkat Lunak, TRPL Semester III, Politeknik Wilmar Bisnis Indonesia.
> Mahasiswa: Akbar Riansyah — Proyek Individu No. 2 "Sistem Manajemen Penyewaan Kendaraan".
>
> **Struktur repo (monorepo, satu repo GitHub):** folder induk `rentgo/` berisi **dua folder**: `website/` (MVP/prototype RentGo) dan `slidev/` (slide presentasi memakai Slidev).
> Kecuali disebut lain, path `src/`, `docs/`, `supabase/`, `tests/` di dokumen ini **relatif terhadap `rentgo/website/`**.

---

## 0. PERAN & CARA KERJA

Kamu adalah tim lengkap dalam satu agent: **Software Architect + Business Analyst + Full-stack Engineer + UI/UX Designer + QA Engineer + DevOps + Technical Writer**. Gunakan reasoning mendalam.

Aturan main:

1. **Plan dulu, baru eksekusi.** Mulai dengan membuat *Implementation Plan* dan *Task List* (artifact Antigravity), lalu eksekusi berurutan per Increment (Bagian 6). Jangan berhenti untuk bertanya kecuali **benar-benar terblokir** (butuh kredensial/aksi manual). Untuk keputusan kecil, pilih default terbaik dan catat di `docs/DECISIONS.md` (format: Konteks → Keputusan → Alasan → Konsekuensi).
2. **Jangan menambah scope** di luar dokumen ini. Kalau ada ide bagus, taruh di `docs/BACKLOG.md`.
3. **Semua biaya harus Rp0** (kecuali domain `.my.id` yang sudah dimiliki/dibeli pengguna). Jika sebuah layanan butuh kartu kredit atau berbayar, ganti dengan alternatif gratis dan catat di DECISIONS.
4. **Tidak ada secret di repo.** Semua lewat env var. Sediakan `.env.example` lengkap dengan komentar.
5. **Bahasa:** UI & dokumentasi dalam **Bahasa Indonesia**; identifier kode, nama tabel, dan commit message dalam **Bahasa Inggris** (Conventional Commits).
6. **Verifikasi nyata.** Setiap fitur dianggap selesai hanya jika sudah dijalankan dan diuji (unit/e2e/browser), bukan sekadar "kodenya ditulis".
7. Versi library & nama model berubah cepat. **Cek dokumentasi resmi terbaru** (Next.js, Firebase, Supabase, Gemini API) sebelum memakai API-nya; jangan mengandalkan ingatan.

---

## 1. FASE 0 — AKTIVASI SKILLS, MCP, & TOOLS (WAJIB DI AWAL)

Sebelum menulis kode, lakukan inventarisasi lalu **aktifkan/gunakan semua yang relevan**:

1. Telusuri skills yang tersedia di workspace dan global (mis. `.agent/skills/`, folder skills global Antigravity, rules, workflows) serta MCP server yang terhubung.
2. Buat `docs/00-capability-check.md` berisi tabel: *Kebutuhan → Skill/MCP/Tool yang dipakai → Status (aktif / tidak tersedia + fallback)*.
3. Kebutuhan yang harus dipetakan:

| Kebutuhan | Dipakai untuk |
|---|---|
| Frontend / UI design skill | Design system, 3 surface UI yang konsisten & tidak terlihat "template default" |
| Next.js / React best practices | App Router, Server Components, route handlers, middleware/proxy |
| Supabase / Postgres (MCP bila ada) | Migrasi, RLS, fungsi SQL, storage bucket, seed |
| Firebase (MCP/CLI bila ada) | Auth Google, Auth Emulator untuk test |
| Gemini API | Fitur rekomendasi AI |
| Browser agent / Playwright | Verifikasi UI nyata, e2e, ambil screenshot dokumentasi |
| Testing (Vitest, Playwright) | Pengujian fitur utama |
| GitHub (MCP/CLI) | Repo, branch per increment, tag rilis, GitHub Actions |
| Vercel (MCP/CLI) | Deploy, domain, env var, cron |
| Document/Markdown writing | Laporan, diagram Mermaid, panduan presentasi |
| Slidev / presentation skill | Deck presentasi di `slidev/` (Markdown → slide, export PDF) |
| Security review | Cek RLS, validasi input, rate limit, secret leakage |

4. Jika sebuah skill/MCP **tidak tersedia**, jangan berhenti: pakai fallback (CLI, SQL manual, dokumentasi langkah manual) dan catat di capability-check.
5. Kumpulkan semua **aksi manual** yang butuh manusia ke satu file `docs/SETUP_MANUAL.md` (checklist bernomor): buat project Firebase, buat project Supabase, isi env var, tambah domain di Vercel, setting DNS, daftar OAuth authorized domains. Kerjakan kode dulu sambil menunggu; jalankan migrasi/tes begitu kredensial tersedia (atau langsung bila MCP bisa membuatnya).

---

## 2. RINGKASAN PRODUK

**RentGo** — platform penyewaan kendaraan (mobil & motor) berbasis web untuk rental di wilayah Medan. Tiga surface dalam **satu codebase**, **satu database**, **satu sistem login**:

| Surface | Domain | Aktor | Tujuan |
|---|---|---|---|
| Landing page | `rentgo.my.id` | Publik | Memperkenalkan RentGo, menampilkan armada unggulan, mengarahkan ke booking |
| Booking | `book.rentgo.my.id` | Customer | Cari kendaraan, cek ketersediaan, booking, lihat/batalkan pesanan |
| Admin dashboard | `admin.rentgo.my.id` | Admin | Kelola armada, pesanan, pembayaran, perawatan, pelanggan, statistik |

Login **Google (Firebase Auth)** untuk ketiganya, sesi dibagi lintas subdomain.
Fitur AI: **Gemini (free tier)** untuk rekomendasi kendaraan **yang tersedia saat ini / pada tanggal yang dipilih**.

### 2.1 Pemetaan ke syarat dosen (jangan sampai ada yang terlewat)

| Syarat UTS | Pemenuhan di RentGo |
|---|---|
| Aplikasi bisa dijalankan + database | Next.js + Supabase Postgres, dapat dijalankan lokal & online |
| CRUD | CRUD Kendaraan, Kategori, Booking, Perawatan, Pelanggan/Role |
| Minimal 3 fitur utama berfungsi | (1) Manajemen armada, (2) Booking + ketersediaan + anti-bentrok, (3) Manajemen pesanan & pembayaran, (4) Dashboard statistik, (5) Rekomendasi AI |
| Model pengembangan | **Incremental** (Bagian 5) |
| Pengujian fitur utama | Unit + e2e + tabel test case (Bagian 9) |
| Deployment | Vercel + 3 domain (online), plus panduan jalan lokal |
| Presentasi | Deck **Slidev** di `slidev/` (+ export PDF cadangan) dan `website/docs/06-presentasi.md` (skrip demo + antisipasi tanya jawab) |
| Laporan singkat | `docs/` — analisis, rancangan, model pengembangan, hasil uji |
| Screenshot | `docs/screenshots/` dihasilkan otomatis via Playwright |

---

## 3. ARSITEKTUR & TECH STACK (KEPUTUSAN FINAL, FULL GRATIS)

### 3.1 Stack

| Lapisan | Pilihan | Catatan gratis |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript strict** | Satu app melayani 3 host |
| Styling/UI | **Tailwind CSS + shadcn/ui + lucide-react**, font **Plus Jakarta Sans** (`next/font`) | Open source |
| Form & validasi | react-hook-form + **zod** (skema dipakai ulang di client & server) | |
| Tanggal | date-fns (+ tz), zona waktu **Asia/Jakarta (WIB)** | |
| Chart | recharts | |
| Auth | **Firebase Auth (Google Sign-In)** + `firebase-admin` untuk verifikasi & session cookie | Spark plan gratis |
| Database | **Supabase Postgres** (+ Storage bucket `vehicle-images`) | Free tier |
| AI | **Gemini API (free tier, Google AI Studio)** via SDK resmi `@google/genai` | Free tier, ada rate limit |
| Hosting | **Vercel Hobby** (1 project, 3 domain) + Vercel Cron | Hobby = non-komersial, sesuai untuk tugas kuliah |
| Repo & CI | **GitHub** + GitHub Actions (lint, typecheck, unit test) | |
| Test | **Vitest** (unit) + **Playwright** (e2e) + **Firebase Auth Emulator** | |
| Presentasi | **Slidev** (`slidev/`), tema/warna mengikuti design tokens RentGo | Open source; bisa dijalankan lokal & di-export ke PDF |

### 3.2 Struktur repo & satu app untuk tiga host

**Layout repo:**

```
rentgo/
  README.md              # gambaran umum + cara jalan website & slidev
  .github/workflows/     # CI (jalankan di folder website/)
  website/               # Next.js — landing + booking + admin (SATU app)
  slidev/                # presentasi Slidev
```

**Prinsip: JANGAN memecah menjadi 3 website/3 project.** Landing, booking, dan admin adalah **satu aplikasi Next.js** di `website/`, di-deploy sebagai **satu project Vercel** (Root Directory = `website`), lalu **tiga domain** ditambahkan ke project yang sama. Alasan: satu codebase, satu deploy, satu set env var, komponen UI & auth dipakai bersama, dan tetap gratis di Vercel Hobby. Ketiga domain menunjuk ke deployment yang sama; yang membedakan hanya host yang dibaca middleware.

- Satu project Next.js. `middleware.ts` (atau `proxy.ts` jika versi Next.js yang dipakai sudah mengganti namanya — cek docs) membaca header `host` dan **rewrite** ke segmen internal:
  - `rentgo.my.id` → `/site/landing/*`
  - `book.rentgo.my.id` → `/site/book/*`
  - `admin.rentgo.my.id` → `/site/admin/*`
- Folder: `src/app/site/landing`, `src/app/site/book`, `src/app/site/admin`, plus `src/app/api/*` (dipakai bersama).
- Akses langsung ke path `/site/*` dari browser harus ditolak (404) — hanya boleh lewat rewrite.
- Dev lokal: `localhost:3000` (landing), `book.localhost:3000`, `admin.localhost:3000`. Host root dibaca dari env `ROOT_DOMAIN`.
- **Preview deployment Vercel** hanya punya satu host `*.vercel.app` (tanpa subdomain). Di environment **non-production**, sediakan override `?site=landing|book|admin` (disimpan di cookie `__site`) agar tiga surface tetap bisa diuji di preview. Override ini **harus mati di production**.
- Domain di Vercel: tambahkan `rentgo.my.id`, `book.rentgo.my.id`, `admin.rentgo.my.id` di Project Settings → Domains, lalu buat DNS record sesuai nilai yang ditampilkan Vercel (jangan ditebak). Catat langkahnya di `docs/05-deployment.md`.
- Struktur kode inti (di dalam `website/`):

```
src/
  app/site/{landing,book,admin}/...
  app/api/{auth,vehicles,bookings,payments,maintenance,ai,cron,...}/route.ts
  components/{ui,shared,landing,book,admin}/
  lib/{firebase-client,firebase-admin,supabase-server,session,rbac,pricing,availability,ai,env,utils}.ts
  styles/tokens.css
supabase/{migrations,seed.sql}
tests/{unit,e2e}
docs/...
```

### 3.3 Auth & sesi lintas subdomain

1. Client: `signInWithPopup(GoogleAuthProvider)` → ambil ID token.
2. `POST /api/auth/session` → verifikasi dengan `firebase-admin`, **upsert** baris `users` (berdasar `firebase_uid`), buat **session cookie** Firebase (`createSessionCookie`, masa berlaku 5 hari).
3. Cookie: `__session`, `HttpOnly`, `Secure`, `SameSite=Lax`, `Domain=.rentgo.my.id` di production (host-only di dev). Sehingga login di satu surface otomatis berlaku di surface lain.
4. `POST /api/auth/logout` menghapus cookie.
5. **RBAC:** role `customer` | `admin`. Admin pertama ditentukan allowlist env `ADMIN_EMAILS` (comma-separated); admin lain bisa dipromosikan lewat halaman Pelanggan di dashboard. Setiap route admin & API admin **wajib** cek role di server. Customer yang membuka `admin.` → halaman "Akses ditolak".
6. Daftarkan di Firebase *Authorized domains*: `rentgo.my.id`, `book.rentgo.my.id`, `admin.rentgo.my.id`, `localhost`, dan domain preview Vercel.

### 3.4 Akses data & keamanan database

- Semua akses DB lewat **server** (route handler / server component) memakai Supabase **service role key** yang hanya ada di env server (`import 'server-only'`).
- **RLS diaktifkan di semua tabel tanpa policy** untuk `anon` & `authenticated` (deny-all). Browser tidak pernah menyentuh DB langsung.
- Validasi semua input dengan zod; sanitasi output; security headers (CSP dasar, `X-Frame-Options`, `Referrer-Policy`).
- Rate limit endpoint AI (Bagian 8.4) dan endpoint auth.
- Data pribadi minimal: nama, email, foto profil (dari Google), no. HP, no. SIM. Tidak menyimpan KTP/foto dokumen.

### 3.5 Keep-alive & housekeeping

Supabase free tier otomatis **pause** jika tidak aktif ±1 minggu. Buat `GET /api/cron/housekeeping` (dilindungi `CRON_SECRET`) yang dijadwalkan harian via Vercel Cron untuk: (a) query ringan agar DB tetap aktif, (b) mengubah booking `pending` yang melewati `expires_at` menjadi `expired`.

### 3.6 Slidev — `slidev/`

- Project Slidev mandiri (`package.json` sendiri), file utama `slides.md`; jalankan `npm run dev`, export `npm run export` → `slidev/dist/RentGo-UTS.pdf` (cadangan bila proyektor/koneksi bermasalah).
- Tema & warna **mengikuti design tokens RentGo (Bagian 4)** — buat tema/CSS kecil di `slidev/style.css`, jangan memakai warna di luar palet.
- Screenshot diambil dari `website/docs/screenshots/` lewat skrip `npm run sync:screens` (salin ke `slidev/public/screens/`), sehingga slide selalu memakai tampilan terbaru.
- Isi deck (±10–12 slide): Judul & identitas → Latar belakang & masalah → Tujuan → Aktor & fitur utama → **Model pengembangan Incremental** (diagram 5 increment + progress nyata) → Arsitektur (diagram Mermaid, 3 domain 1 app) → ERD & anti double-booking → Fitur AI Gemini → **Demo** (slide pemisah + checklist urutan demo) → Hasil pengujian (angka nyata dari `04-pengujian.md`) → Deployment → Kesimpulan & pengembangan lanjutan → Tanya jawab.
- Gunakan fitur Slidev yang relevan (code highlight untuk SQL constraint, Mermaid, `v-click` seperlunya); jaga teks minimal, visual lebih dominan.
- Deploy Slidev **opsional** sebagai project Vercel terpisah (Root Directory = `slidev`, mis. `slides.rentgo.my.id`); wajib bisa jalan lokal dan ter-export PDF.

---

## 4. DESIGN SYSTEM — PALET WARNA DIKUNCI DI AWAL

> Dibuat **sebelum** UI apa pun (Increment 0) dan **tidak boleh diubah** tanpa catatan di DECISIONS.md. Dilarang hardcode hex di komponen; semua lewat token (`src/styles/tokens.css` + konfigurasi Tailwind).

**Karakter brand:** terpercaya, cepat, bersih. Biru navy + aksen amber (nuansa rambu jalan).

| Token | Hex | Penggunaan |
|---|---|---|
| `--navy-900` | `#0B1F3A` | Teks judul, sidebar admin, footer, teks di atas tombol aksen |
| `--primary-600` | `#1D4ED8` | Tombol utama, link, fokus |
| `--primary-700` | `#1E40AF` | Hover/active tombol utama |
| `--primary-100` | `#DBEAFE` | Latar badge/seleksi |
| `--primary-50` | `#EFF6FF` | Latar section lembut |
| `--accent-500` | `#F59E0B` | CTA sekunder penting ("Booking Sekarang"), highlight harga |
| `--accent-600` | `#D97706` | Hover aksen |
| `--accent-50` | `#FFFBEB` | Latar peringatan lembut |
| `--slate-50` | `#F8FAFC` | Latar halaman |
| `--slate-200` | `#E2E8F0` | Border, divider |
| `--slate-400` | `#94A3B8` | Placeholder, ikon redup |
| `--slate-600` | `#475569` | Teks sekunder |
| `--slate-900` | `#0F172A` | Teks utama |
| `--success` | `#16A34A` | Selesai, tersedia, pembayaran lunas |
| `--danger` | `#DC2626` | Ditolak, error, hapus |
| `--info` | `#0D9488` | Sedang berjalan (ongoing) |

**Warna status booking (badge):** `pending` = aksen (amber), `confirmed` = primary (biru), `ongoing` = info (teal), `completed` = success (hijau), `cancelled` = slate, `rejected` = danger, `expired` = slate gelap.

**Aturan desain:**
- Tipografi: Plus Jakarta Sans; skala heading konsisten; angka uang selalu `Rp 350.000` (locale `id-ID`).
- Radius 12px (kartu), 8px (input/tombol); bayangan halus; spasi kelipatan 4px.
- Kontras teks minimal WCAG AA; fokus ring jelas; semua input berlabel; navigasi keyboard berfungsi.
- Mobile-first; breakpoint diuji di 360px, 768px, 1280px.
- Identitas per surface (token sama, komposisi beda): **Landing** lapang & visual besar; **Booking** berbasis kartu & filter jelas; **Admin** padat, sidebar navy, tabel rapi.
- Logo: wordmark "RentGo" + ikon SVG sederhana buatan sendiri. **Jangan memakai foto/aset berhak cipta**; gambar kendaraan seed memakai ilustrasi SVG placeholder, admin dapat mengunggah foto asli.
- Seluruh komponen UI memakai set shadcn/ui yang sama di ketiga surface (satu `components/ui`). Deck Slidev memakai palet & font yang sama.
- Tulis `docs/DESIGN_SYSTEM.md` (token, tipografi, komponen, contoh) dan buat halaman internal `/site/admin/_styleguide` (dev only) yang menampilkan semuanya.

---

## 5. MODEL PENGEMBANGAN (SDLC): INCREMENTAL

**Keputusan: Incremental Model**, dengan siklus mini-waterfall di setiap increment (analisis → desain → implementasi → pengujian → deployment → review).

**Alasan (masukkan ke `docs/02-sdlc-incremental.md` dengan perbandingan singkat):**
- Kebutuhan sudah jelas dan relatif stabil (tema & syarat ditetapkan dosen) → tidak butuh eksplorasi besar seperti **Prototype**.
- **Waterfall** menunda produk jalan sampai akhir → berisiko untuk tenggat UTS; Incremental memberi produk yang **sudah bisa dipakai di setiap increment**.
- **Agile/Scrum** idealnya untuk tim dengan product owner & sprint review; proyek ini individual. Unsur Agile yang tetap dipakai: backlog berprioritas (MoSCoW), definisi selesai (DoD), review di akhir increment.
- Cocok dengan tujuan "MVP yang bisa dipakai orang": increment 1 sudah memberi admin sistem armada yang berfungsi.

**Dokumen kemajuan hidup:** `docs/progress.md` — tabel Increment × (status, tanggal mulai/selesai, fitur selesai, hasil uji, masalah & solusi, tag rilis). **Update setiap akhir increment**, juga `CHANGELOG.md`.

**Disiplin git:** branch `inc-0-foundation`, `inc-1-core-admin`, `inc-2-booking-engine`, `inc-3-landing-ai`, `inc-4-hardening-release` → PR/merge ke `main` → tag `v0.1.0` … `v1.0.0`. Commit Conventional Commits.

### Prioritas fitur (MoSCoW)

- **Must:** login Google & RBAC; CRUD kendaraan + kategori; cek ketersediaan per tanggal; booking tanpa bentrok; alur status booking; manajemen booking & pembayaran manual oleh admin; riwayat booking customer; dashboard KPI dasar; landing page; deploy 3 domain.
- **Should:** rekomendasi AI Gemini; upload foto kendaraan; upload bukti transfer; perawatan (maintenance) memblokir ketersediaan; grafik pendapatan; auto-expire pending; tautan WhatsApp konfirmasi.
- **Could:** kalender timeline ketersediaan di admin; ekspor CSV; JSON-LD SEO.
- **Won't (MVP):** payment gateway, notifikasi email/SMS, multi-cabang, review/rating, kupon, mobile app.

---

## 6. RENCANA INCREMENT (EKSEKUSI BERURUTAN)

Setiap increment punya **Definition of Done (DoD)**: kode ter-merge, lint+typecheck hijau, unit test lulus, e2e untuk fitur increment lulus, deploy preview diverifikasi, `docs/progress.md` & dokumen terkait diperbarui, screenshot diambil.

### Increment 0 — Fondasi (`v0.1.0`)
- Inisialisasi repo, TypeScript strict, ESLint, Prettier, Vitest, Playwright, GitHub Actions CI.
- Design tokens + `DESIGN_SYSTEM.md` + styleguide.
- Host-based routing 3 surface (halaman placeholder berbeda tiap host) + penolakan `/site/*` langsung.
- Firebase Auth Google + session cookie + RBAC + upsert user.
- Migrasi DB penuh (Bagian 7), RLS, fungsi SQL, storage bucket, seed data.
- `lib/env.ts` dengan validasi zod untuk semua env (gagal cepat jika kurang).
- **DoD tambahan:** login Google berhasil di ketiga host (lokal via emulator), role admin berfungsi.

### Increment 1 — Core Admin: Armada (`v0.2.0`) ← *MVP-1*
- Admin: dashboard dasar (KPI: total armada, tersedia hari ini, dalam perawatan), **CRUD Kategori**, **CRUD Kendaraan** (pencarian, filter, paginasi, soft delete, upload foto), guard admin.
- Test: validasi form, RBAC (customer ditolak), CRUD e2e.

### Increment 2 — Booking Engine (`v0.3.0`) ← *MVP-2 (bisa dipakai)*
- Booking site: daftar kendaraan + filter + pilih tanggal → hanya tampil yang tersedia; halaman detail; checkout (wajib login & lengkapi no. HP + no. SIM); "Pesanan Saya" (detail, batalkan jika masih `pending`); upload bukti transfer; tautan WhatsApp konfirmasi.
- Admin: manajemen booking (filter status, detail, aksi sesuai state machine Bagian 8.2), pembayaran manual (tandai lunas / refund), CRUD perawatan, halaman pelanggan (riwayat, ubah role).
- Anti-bentrok di level database (Bagian 7) + test konkurensi.

### Increment 3 — Landing + AI + Polish (`v0.4.0`)
- Landing page lengkap (Bagian 8.1), SEO dasar (metadata, OG image, sitemap, robots).
- Fitur AI Gemini (Bagian 8.4), grafik pendapatan & kendaraan terlaris di dashboard.
- Housekeeping cron + keep-alive.
- Empty state, loading skeleton, error boundary, toast di semua alur.

### Increment 4 — Hardening & Rilis (`v1.0.0`)
- E2E penuh alur utama, uji responsif, uji aksesibilitas dasar, Lighthouse landing ≥ 90 (performance & accessibility).
- Review keamanan (checklist Bagian 10).
- Deploy production 3 domain, uji di domain asli.
- Screenshot otomatis, laporan final, deck **Slidev** (`slidev/`) + export PDF, skrip demo, `README.md` root + `website/README.md` (cara jalan lokal ≤ 5 langkah).

---

## 7. STRUKTUR DATABASE (BASELINE — BOLEH DIPERBAIKI, TAPI JANGAN DIKURANGI)

Simpan sebagai `supabase/migrations/0001_init.sql` (pecah jika perlu). Semua PK `uuid default gen_random_uuid()`, semua tabel punya `created_at`, `updated_at` (trigger `set_updated_at`). Uang disimpan sebagai `numeric(12,0)` (Rupiah, tanpa desimal).

```sql
create extension if not exists btree_gist;

create type user_role          as enum ('customer','admin');
create type vehicle_status     as enum ('active','maintenance','inactive');
create type transmission_type  as enum ('manual','automatic');
create type fuel_type          as enum ('bensin','diesel','listrik','hybrid');
create type booking_status     as enum ('pending','confirmed','ongoing','completed','cancelled','rejected','expired');
create type payment_method     as enum ('cash','transfer','qris');
create type payment_status     as enum ('unpaid','paid','refunded');
create type maintenance_status as enum ('scheduled','in_progress','done');

create table users (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text not null unique,
  email text not null unique,
  full_name text not null,
  avatar_url text,
  phone text,
  driver_license_no text,
  role user_role not null default 'customer',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table vehicle_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table vehicles (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references vehicle_categories(id) on delete restrict,
  plate_number text not null unique,
  brand text not null,
  model text not null,
  year smallint not null check (year between 1990 and 2100),
  color text,
  transmission transmission_type not null,
  fuel fuel_type not null,
  seats smallint not null check (seats between 1 and 60),
  daily_price numeric(12,0) not null check (daily_price > 0),
  status vehicle_status not null default 'active',
  description text,
  image_url text,
  deleted_at timestamptz,                       -- soft delete
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text not null unique,            -- format: RG-YYMMDD-XXXX
  user_id uuid not null references users(id) on delete restrict,
  vehicle_id uuid not null references vehicles(id) on delete restrict,
  start_date date not null,                     -- tanggal ambil (inklusif)
  end_date date not null,                       -- tanggal kembali (inklusif)
  total_days int generated always as (end_date - start_date + 1) stored,
  pickup_location text not null,
  return_location text not null,
  daily_price_snapshot numeric(12,0) not null,  -- harga saat booking (tidak berubah walau harga kendaraan berubah)
  total_price numeric(12,0) not null,
  status booking_status not null default 'pending',
  notes text,
  admin_notes text,
  expires_at timestamptz,                       -- batas bayar untuk status pending
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_booking_dates check (end_date >= start_date),
  -- ANTI DOUBLE-BOOKING di level database:
  constraint no_double_booking exclude using gist (
    vehicle_id with =,
    daterange(start_date, end_date, '[]') with &&
  ) where (status in ('pending','confirmed','ongoing'))
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  amount numeric(12,0) not null check (amount >= 0),
  method payment_method not null,
  status payment_status not null default 'unpaid',
  proof_url text,
  paid_at timestamptz,
  verified_by uuid references users(id),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table maintenance_logs (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  title text not null,
  description text,
  start_date date not null,
  end_date date not null,
  cost numeric(12,0) default 0,
  status maintenance_status not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_maint_dates check (end_date >= start_date)
);

create table ai_recommendation_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  query_text text not null,
  params jsonb not null default '{}',
  recommended_vehicle_ids uuid[] not null default '{}',
  model text,
  used_fallback boolean not null default false,
  latency_ms int,
  created_at timestamptz not null default now()
);

-- Indeks minimal: bookings(user_id), bookings(vehicle_id,status), bookings(status,start_date),
-- vehicles(category_id,status) where deleted_at is null, payments(booking_id),
-- maintenance_logs(vehicle_id,start_date,end_date), ai_recommendation_logs(user_id,created_at).
-- RLS: alter table ... enable row level security; pada SEMUA tabel, tanpa policy (deny-all).
```

**Fungsi SQL yang wajib dibuat:**

1. `get_available_vehicles(p_start date, p_end date)` → kendaraan `active`, `deleted_at is null`, **tanpa** booking aktif (`pending/confirmed/ongoing`) yang tumpang tindih, dan **tanpa** perawatan (`scheduled/in_progress`) yang tumpang tindih.
2. `create_booking(...)` (plpgsql, satu transaksi): validasi kendaraan aktif & bebas perawatan, hitung `total_price` dari harga **di server** (jangan percaya harga dari client), isi `daily_price_snapshot`, `expires_at = now() + interval '24 hours'`, generate `booking_code`, buat baris `payments` berstatus `unpaid`. Tabrakan tanggal ditangkap constraint `no_double_booking` → kembalikan error terkontrol ("Kendaraan sudah dipesan pada tanggal tersebut").
3. `set_updated_at()` trigger generik untuk semua tabel.

**Seed:** 5 kategori (Mobil City, MPV/Minibus, SUV, Van/Hiace, Motor), ±12 kendaraan realistis untuk pasar Indonesia, 1 admin dari `ADMIN_EMAILS`, beberapa booking contoh berbagai status, 1 jadwal perawatan.

**Dokumentasi DB:** `docs/03-perancangan.md` wajib memuat ERD (Mermaid), kamus data (tabel × kolom × tipe × keterangan), dan relasi.

---

## 8. SPESIFIKASI FITUR

### 8.1 Landing page — `rentgo.my.id`
Navbar (logo, menu, tombol "Masuk dengan Google"/avatar menu bila sudah login, CTA "Booking") → Hero (judul kuat, form cepat: tanggal ambil/kembali + tombol "Cari Kendaraan" menuju `book.` dengan query param) → Keunggulan (3–4 poin) → Armada unggulan (data nyata dari DB, ISR) → Cara sewa (3 langkah) → Harga transparan → FAQ → CTA akhir + kontak WhatsApp → Footer. Statis/ISR agar cepat dan SEO baik. Tidak butuh login untuk melihat.

### 8.2 Alur status booking (state machine — implementasikan sebagai satu modul teruji)

| Dari | Ke | Oleh |
|---|---|---|
| `pending` | `confirmed` | admin (setelah pembayaran terverifikasi / tunai) |
| `pending` | `cancelled` | customer (pemilik) atau admin |
| `pending` | `rejected` | admin |
| `pending` | `expired` | sistem (cron, melewati `expires_at`) |
| `confirmed` | `ongoing` | admin (serah terima kendaraan) |
| `confirmed` | `cancelled` | admin |
| `ongoing` | `completed` | admin (kendaraan kembali) |

Transisi lain **ditolak** dengan pesan jelas. Setiap perubahan mencatat siapa & kapan (kolom/tabel log sederhana, atau `admin_notes`).

### 8.3 Booking site — `book.rentgo.my.id`
- **Beranda/Cari:** pilih tanggal → grid kendaraan tersedia; filter kategori, transmisi, kursi, rentang harga; urutkan harga/terbaru. Tanpa tanggal: tampilkan "tersedia hari ini" (hari ini = WIB).
- **Detail kendaraan:** foto, spesifikasi, harga/hari, kalender ketersediaan, panel ringkasan harga (hari × tarif = total) yang dihitung ulang di server saat submit.
- **Checkout:** wajib login; wajib no. HP & no. SIM (disimpan ke profil); pilih lokasi ambil/kembali (opsi tetap: Bandara Kualanamu, Stasiun Medan, Kantor RentGo Medan); catatan; tampilkan instruksi pembayaran (rekening dummy dari env) + batas bayar 24 jam.
- **Pesanan Saya:** daftar & detail, badge status, batalkan (hanya `pending`), unggah bukti transfer, tombol WhatsApp konfirmasi dengan pesan yang sudah terisi kode booking.
- **Profil:** ubah no. HP/SIM.

### 8.4 Fitur AI — Rekomendasi Kendaraan Tersedia (Gemini free tier)
Entry point: tombol/panel **"Bantu saya pilih"** di booking site. Input: tanggal (opsional, default hari ini), jumlah penumpang, anggaran per hari (opsional), teks kebutuhan bebas (≤ 300 karakter), mis. "liburan keluarga 6 orang ke Berastagi 3 hari".

Alur (semua di server, `POST /api/ai/recommend`):
1. Wajib login. Rate limit berbasis DB: maks **10 permintaan/user/hari** (cek `ai_recommendation_logs`) + penanganan 429 dari Gemini.
2. Ambil kandidat via `get_available_vehicles` (maks 30). **Hanya kendaraan yang benar-benar tersedia yang boleh direkomendasikan.**
3. Panggil Gemini model flash tier gratis — nama model dari env `GEMINI_MODEL`; **verifikasi nama model yang valid & gratis di dokumentasi saat ini**. Gunakan **structured output (JSON schema)**: `{ summary: string, recommendations: [{ vehicle_id, rank, reason, fit_score }] }`.
4. **Validasi hasil:** buang `vehicle_id` yang bukan bagian dari kandidat; maks 3 rekomendasi; `reason` singkat berbahasa Indonesia.
5. **Fallback** bila Gemini error/kuota habis/JSON invalid: skoring heuristik (kursi ≥ penumpang, harga ≤ anggaran, kategori sesuai) → tandai `used_fallback = true` dan tampilkan label netral.
6. **Keamanan:** teks pengguna diperlakukan sebagai **data**, bukan instruksi (system prompt tegas, delimiter jelas); jangan mengirim data pribadi (nama, email, HP) ke Gemini — hanya spesifikasi kendaraan & kebutuhan; API key hanya di server. Catat ke `ai_recommendation_logs`.
7. UI: kartu hasil dengan alasan, tombol langsung "Pesan" ke detail kendaraan; state loading, error, dan kosong ("Belum ada kendaraan yang cocok").

### 8.5 Admin dashboard — `admin.rentgo.my.id`
- **Dashboard:** KPI (total armada, tersedia hari ini, booking aktif, booking menunggu, pendapatan bulan ini dari pembayaran `paid`); grafik pendapatan 6 bulan; kendaraan terlaris; booking terbaru.
- **Kendaraan & Kategori:** CRUD penuh, pencarian, filter, soft delete (tolak hapus jika ada booking aktif), upload foto ke Storage.
- **Booking:** tabel + filter status/tanggal/kendaraan; detail; aksi sesuai state machine; catatan admin.
- **Pembayaran:** lihat bukti, tandai lunas/refund, metode.
- **Perawatan:** CRUD; jadwal perawatan otomatis memblokir ketersediaan.
- **Pelanggan:** daftar, riwayat, ubah role, nonaktifkan.
- *(Could)* kalender timeline ketersediaan per kendaraan.

---

## 9. STRATEGI PENGUJIAN

- **Unit (Vitest):** `pricing` (hari inklusif, total), state machine (semua transisi sah & tidak sah), validasi zod, util tanggal WIB, validasi hasil AI (buang ID asing), fallback heuristik.
- **Integrasi/DB:** `get_available_vehicles` dengan skenario tumpang tindih (awal, akhir, di dalam, di luar, dibatasi perawatan); **uji konkurensi**: dua booking bersamaan untuk kendaraan & tanggal sama → tepat satu berhasil.
- **E2E (Playwright + Firebase Auth Emulator):** (1) login Google & guard admin, (2) admin CRUD kendaraan, (3) customer cari → booking → muncul di Pesanan Saya, (4) admin konfirmasi → ongoing → completed, (5) batal oleh customer, (6) kendaraan dalam perawatan tidak muncul, (7) rekomendasi AI (mock Gemini di test; satu smoke test nyata opsional), (8) akses silang role ditolak. **Dilarang membuat bypass auth di kode production.**
- **Non-fungsional:** responsif 360/768/1280, Lighthouse landing ≥ 90, cek aksesibilitas dasar.
- **Dokumentasi uji:** `docs/04-pengujian.md` berisi tabel test case (ID `TC-001…`, fitur, skenario, data uji, hasil diharapkan, hasil aktual, status Lulus/Gagal, bukti/screenshot) dan ringkasan cakupan. Hasil aktual diisi dari eksekusi nyata.
- **Screenshot dokumentasi:** skrip Playwright `npm run docs:screens` menyimpan screenshot semua halaman utama ke `docs/screenshots/` dengan nama deskriptif.

---

## 10. CHECKLIST KEAMANAN (REVIEW DI INCREMENT 4)

- [ ] RLS aktif di semua tabel; anon key tidak dipakai mengakses data
- [ ] Service role key & `GEMINI_API_KEY` & kredensial Firebase Admin hanya di server/env Vercel
- [ ] Harga & total dihitung server; input client tidak dipercaya
- [ ] Setiap route admin cek role server-side; IDOR dicek (customer hanya bisa akses booking miliknya)
- [ ] Cookie sesi `HttpOnly; Secure; SameSite=Lax`
- [ ] Rate limit AI & auth; endpoint cron dilindungi `CRON_SECRET`
- [ ] Upload: batasi tipe (jpg/png/webp/pdf) dan ukuran (≤ 2 MB), nama file di-generate server
- [ ] Tidak ada secret/`.env` ter-commit (cek riwayat git); `.env.example` lengkap
- [ ] `npm audit` tanpa kerentanan kritis

---

## 11. DAFTAR ENV (`.env.example`)

```
ROOT_DOMAIN=rentgo.my.id
NEXT_PUBLIC_LANDING_URL= / NEXT_PUBLIC_BOOK_URL= / NEXT_PUBLIC_ADMIN_URL=
NEXT_PUBLIC_FIREBASE_API_KEY= / _AUTH_DOMAIN= / _PROJECT_ID= / _APP_ID=
FIREBASE_SERVICE_ACCOUNT_JSON_BASE64=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
GEMINI_MODEL=
ADMIN_EMAILS=email1@gmail.com,email2@gmail.com
CRON_SECRET=
PAYMENT_BANK_INFO=   # rekening dummy untuk instruksi pembayaran
WHATSAPP_NUMBER=     # format 628xxxxxxxxxx
```

---

## 12. DELIVERABLES AKHIR (SEMUA HARUS ADA)

```
rentgo/                       repo GitHub (main, tag v0.1.0 … v1.0.0)
  README.md                   gambaran umum + link demo
  .github/workflows/          CI
  slidev/                     slides.md, style.css, public/screens/, export PDF
  website/
    README.md                 jalan lokal ≤ 5 langkah
    CHANGELOG.md
    src/ tests/ supabase/{migrations/*.sql, seed.sql}
    docs/
      00-capability-check.md
      01-analisis.md          aktor, use case (Mermaid), user story, FR/NFR, batasan
      02-sdlc-incremental.md  justifikasi + rencana + perbandingan model
      03-perancangan.md       arsitektur, ERD, kamus data, sequence diagram (login, booking, AI), wireframe ringkas
      04-pengujian.md         test case + hasil nyata
      05-deployment.md        deploy Vercel (1 project, 3 domain) + Firebase + Supabase + cron
      06-presentasi.md        skrip demo 5–7 menit + antisipasi tanya jawab (slide ada di slidev/)
      DESIGN_SYSTEM.md  DECISIONS.md  BACKLOG.md  progress.md  SETUP_MANUAL.md
      screenshots/*.png
```

`docs/06-presentasi.md` (skrip demo + Q&A) dan deck `slidev/` harus menyiapkan jawaban untuk: *kenapa Incremental, bukan Waterfall/Agile? · bagaimana double booking dicegah? · kenapa Firebase Auth + Supabase DB? · bagaimana AI dijamin hanya merekomendasikan stok yang tersedia? · apa yang terjadi jika kuota Gemini habis? · bagaimana semuanya tetap gratis?*

---

## 13. URUTAN EKSEKUSI YANG DIHARAPKAN

1. Fase 0 (Bagian 1) → `docs/00-capability-check.md` + `docs/SETUP_MANUAL.md`.
2. Buat kerangka repo `rentgo/` (`website/`, `slidev/`), lalu tulis `docs/01-analisis.md`, `02-sdlc-incremental.md`, `03-perancangan.md` (versi awal) + `DESIGN_SYSTEM.md`.
3. Increment 0 → 1 → 2 → 3 → 4 (Bagian 6), update `docs/progress.md` & `CHANGELOG.md` di akhir tiap increment.
4. Deploy production (1 project Vercel, 3 domain), uji di 3 domain asli, ambil screenshot, selesaikan deck Slidev + export PDF, finalkan semua dokumen.
5. Laporan penutup di chat: ringkasan apa yang selesai, hasil uji (angka nyata), URL, daftar aksi manual yang tersisa untuk pengguna, dan risiko/batasan yang diketahui (jujur, termasuk hal yang belum sempat diuji).

**Mulai sekarang dari Fase 0.**
