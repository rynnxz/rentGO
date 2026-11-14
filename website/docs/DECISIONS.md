# Catatan Keputusan Arsitektur & Desain (Architecture Decision Records)

Dokumen ini mencatat keputusan teknis dan desain yang diambil selama pengembangan **RentGo** menggunakan format: **Konteks -> Keputusan -> Alasan -> Konsekuensi**.

---

## ADR-001: Satu Aplikasi Next.js untuk Tiga Subdomain (Multi-Surface Host Routing)

- **Konteks:** Sistem RentGo memiliki tiga surface berbeda: Landing Page (`rentgo.my.id`), Booking Customer (`book.rentgo.my.id`), dan Admin Dashboard (`admin.rentgo.my.id`).
- **Keputusan:** Membangun ketiga surface dalam satu aplikasi Next.js (`website/`) menggunakan `src/middleware.ts` yang membaca header `Host` dan melakukan internal rewrite ke `/site/landing`, `/site/book`, dan `/site/admin`, serta memblokir akses langsung ke path `/site/*` dengan status 404.
- **Alasan:** Menghindari duplikasi komponen UI, skema validasi Zod, konfigurasi autentikasi, dan koneksi database. Deployment cukup satu project di Vercel Hobby (Rp0) yang dihubungkan ke tiga domain.
- **Konsekuensi:** Middleware harus menangani resolusi host dengan cermat untuk produksi (`*.rentgo.my.id`), pengembangan lokal (`*.localhost:3000`), dan preview Vercel (`?site=landing|book|admin` yang dinonaktifkan otomatis saat `NODE_ENV === 'production'` pada domain utama).

---

## ADR-002: Kombinasi Firebase Auth (Google Sign-In) + Supabase Postgres

- **Konteks:** Sistem membutuhkan login Google yang mudah dan dapat berbagi sesi lintas subdomain (`.rentgo.my.id`), sekaligus membutuhkan database relasional yang mampu mencegah jadwal sewa bentrok di level constraint database.
- **Keputusan:** Menggunakan Firebase Authentication (`signInWithPopup` + session cookie `__session` via `firebase-admin`) untuk autentikasi, dan Supabase PostgreSQL untuk penyimpanan data relasional.
- **Alasan:** Firebase Auth menyediakan Google Sign-In dan pembuatan `sessionCookie` dengan atribut `Domain=.rentgo.my.id` secara gratis di paket Spark, sedangkan PostgreSQL di Supabase mendukung ekstensi `btree_gist` untuk `EXCLUDE USING gist (vehicle_id WITH =, daterange(start_date, end_date, '[]') WITH &&)` yang tidak dimiliki database NoSQL seperti Firestore.
- **Konsekuensi:** Sinkronisasi profil pengguna dilakukan melalui mekanisme `upsert` berdasarkan `firebase_uid` pada endpoint `POST /api/auth/session`. Seluruh akses database dilakukan di sisi server memakai `SUPABASE_SERVICE_ROLE_KEY` dengan RLS berstatus *deny-all* untuk akses publik langsung.

---

## ADR-003: Dual-Mode Repository (Supabase Postgres + Transactional File Store Lokal)

- **Konteks:** Sesuai prinsip verifikasi nyata di `RENTGO_MASTER_PROMPT.md`, seluruh fitur, unit test, dan E2E test Playwright harus dapat dijalankan dan diverifikasi secara lokal maupun di CI GitHub Actions meskipun kredensial cloud (`SUPABASE_SERVICE_ROLE_KEY`) belum diisi oleh pengguna.
- **Keputusan:** Mengimplementasikan layer repositori server (`src/lib/db/`) yang secara otomatis menggunakan Supabase Postgres ketika `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` tersedia, serta beralih ke penyimpanan transaksional lokal (`website/.data/rentgo-local.json` dengan mutex lock di memori) yang menerapkan aturan bisnis identik (constraint anti double-booking inklusif `[]`, pengecekan `maintenance_logs`, kalkulasi harga di server, dan seed data awal 5 kategori + 12 kendaraan).
- **Alasan:** Memastikan aplikasi dapat langsung dijalankan (`npm run dev`), diuji (`npm test` & `npm run test:e2e`), dan diambil screenshot dokumentasinya (`npm run docs:screens`) secara deterministik tanpa ketergantungan jaringan eksternal saat pengujian.
- **Konsekuensi:** Aturan validasi tanggal dan anti-bentrok dijaga konsisten di kedua mode (fungsi SQL `create_booking` / constraint `no_double_booking` di Postgres dan fungsi transaksi atomik di repositori server).

---

## ADR-004: Penggunaan SDK `@google/genai` Terbaru (`interactions.create`) dan Model `gemini-3.5-flash-lite`

- **Konteks:** Spesifikasi meminta penggunaan SDK resmi `@google/genai` dan verifikasi nama model flash tier gratis yang berlaku di dokumentasi resmi saat ini.
- **Keputusan:** Menggunakan `@google/genai` (`>=3.2.0`) dengan API `ai.interactions.create` dan konfigurasi `response_format: { type: "text", mime_type: "application/json", schema: ... }`, serta menetapkan default `GEMINI_MODEL=gemini-3.5-flash-lite`.
- **Alasan:** Berdasarkan verifikasi dokumentasi resmi melalui MCP `gemini-api-docs`, model generasi lama (`gemini-1.5-*`, `gemini-2.0-*`, `gemini-2.5-*`) telah berstatus *deprecated*, dan SDK `@google/genai` v3+ menggunakan `interactions.create` dengan `response_format` bertipe `text` + `application/json`. Model `gemini-3.5-flash-lite` merupakan model flash-tier tercepat dan paling hemat biaya untuk tugas berfrekuensi tinggi.
- **Konsekuensi:** Respons AI selalu divalidasi kembali di server menggunakan skema Zod dan difilter terhadap daftar ID kendaraan dari `get_available_vehicles`. Jika API key belum diisi, kuota habis (HTTP 429), atau terjadi kegagalan jaringan, sistem otomatis menggunakan algoritma skoring heuristik (`used_fallback = true`).

---

## ADR-005: Kepatuhan Penuh pada Filter Desain `antislop` (Mode `during`)

- **Konteks:** Antarmuka pengguna tidak boleh terlihat seperti template AI generik dan harus memenuhi standar aksesibilitas manusia serta keterbacaan di perangkat mobile.
- **Keputusan:** Mengaktifkan aturan `antislop` dalam mode `during` dengan *Design Read*: `Multi-surface vehicle rental platform for Medan travelers and rental operators, in a trustworthy navy-and-amber road-signage language, dial ENERGY 2 / RHYTHM 2 / MOTION 1`.
- **Alasan:** Palet warna sudah dikunci di Bagian 4 (`#0B1F3A` Navy 900, `#1D4ED8` Primary 600, `#F59E0B` Accent 500). Dengan menetapkan dial `ENERGY 2 / RHYTHM 2 / MOTION 1`, setiap surface memiliki komposisi yang sesuai fungsinya (Landing visual & informatif, Booking berfokus pada filter & kartu spesifikasi nyata, Admin padat & berorientasi keputusan operasional).
- **Konsekuensi:** Tidak ada klaim/testimoni palsu, tidak ada karakter em dash di teks, semua pasangan warna memenuhi WCAG AA (`>= 4.5:1`), semua kontrol interaktif berukuran minimal 44x44px di mobile dan memiliki `cursor: pointer` serta `:focus-visible`.
