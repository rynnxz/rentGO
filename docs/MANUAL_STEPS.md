# Panduan Langkah Manual Konfigurasi Cloud, Deployment, & Keamanan Kunci (`MANUAL_STEPS.md`)

Dokumen ini merangkum langkah-langkah manual yang hanya dapat dilakukan melalui dasbor pemilik akun cloud (**Supabase Dashboard**, **Firebase Console**, **Vercel Dashboard**, dan **Google AI Studio**) untuk mengaktifkan mode produksi penuh pada **RentGo Medan v1.2.0**.

---

## 1. Mengapa Tabel Supabase Sebelumnya Masih Kosong & Cara Setup 1-Klik (2 Menit)

### Penjelasan Teknis Mengapa Tabel Belum Terbuat Otomatis
Saat aplikasi dijalankan secara lokal, terdapat dua alasan teknis mengapa tabel di proyek Supabase **`honhszsloegvpbmczkqf`** tidak langsung terisi otomatis oleh kode aplikasi:
1. **Keterbatasan Keamanan REST API (`anon key`):** Kunci publik `NEXT_PUBLIC_SUPABASE_ANON_KEY` yang ada di `.env.local` hanya mengizinkan operasi baca/tulis data (`SELECT`/`INSERT`) melalui PostgREST dan **dilarang keras oleh Supabase untuk mengeksekusi perintah DDL (`CREATE TABLE`, `CREATE EXTENSION`, `CREATE FUNCTION`)** demi mencegah peretasan skema database dari sisi browser.
2. **Variabel `SUPABASE_SERVICE_ROLE_KEY` Masih Kosong:** Di dalam file `website/.env.local`, variabel `SUPABASE_SERVICE_ROLE_KEY=""` belum diisi oleh pemilik proyek, sehingga *Repository Layer* (`website/src/lib/repository.ts`) secara cerdas mengalihkan penyimpanan ke mode **`local-fallback`** (`website/.data/rentgo-local.json`) agar aplikasi tetap dapat diuji 100% tanpa error.

### Langkah 1A: Buat 7 Tabel, RPC, Storage Bucket, & Data Awal di Supabase SQL Editor
1. Buka dasbor Supabase proyek Anda:  
   [https://supabase.com/dashboard/project/honhszsloegvpbmczkqf/sql/new](https://supabase.com/dashboard/project/honhszsloegvpbmczkqf/sql/new)
2. Buka file berikut dari repositori lokal Anda:  
   [website/supabase/RENTGO_FULL_SETUP_AND_SEED.sql](file:///c:/uts-mmprpl/rentgo/website/supabase/RENTGO_FULL_SETUP_AND_SEED.sql)
3. Salin seluruh isi file tersebut (`Ctrl + A` lalu `Ctrl + C`), tempelkan ke **Supabase SQL Editor**, lalu klik tombol hijau **Run** (`Ctrl + Enter`).
4. Skrip bersifat **100% idempoten** (aman dijalankan berulang kali) dan akan langsung membuat:
   - 7 tabel utama (`users`, `vehicle_categories`, `vehicles`, `bookings`, `payments`, `maintenance_logs`, `ai_recommendation_logs`).
   - Constraint Anti Double-Booking (`EXCLUDE USING gist`) dan fungsi transaksi atomik `public.create_booking(...)`.
   - 2 bucket Supabase Storage (`vehicles` publik & `payment-proofs` privat).
   - Data awal (*seed*): 2 pengguna (`Akbar Riansyah` sebagai Admin & `Nadia Siregar` sebagai Customer), 5 kategori, 10 unit armada berplat `BK` Sumatera Utara, 2 jadwal perawatan bengkel, dan 2 pesanan contoh.

### Langkah 1B: Isi `SUPABASE_SERVICE_ROLE_KEY` di `.env.local`
1. Buka halaman pengaturan API Supabase:  
   [https://supabase.com/dashboard/project/honhszsloegvpbmczkqf/settings/api](https://supabase.com/dashboard/project/honhszsloegvpbmczkqf/settings/api)
2. Pada bagian **Project API keys**, salin kunci **`service_role` (secret)**.
3. Tempelkan nilainya ke dalam `website/.env.local` pada baris:
   ```env
   SUPABASE_SERVICE_ROLE_KEY="<tempel-service-role-key-anda-di-sini>"
   ```
4. Restart server `npm run dev`. Endpoint `GET /api/vehicles` kini otomatis melaporkan `"persistence_mode": "supabase-cloud"`, dan setiap perubahan data di aplikasi akan langsung tersimpan secara real-time di tabel Supabase Anda!

---

## 2. Konfigurasi Firebase Authentication (`rentgo-medan`)

Aplikasi RentGo Medan v1.2.0 menggunakan Firebase **khusus untuk Autentikasi saja (Auth-Only)**. Agar Google OAuth Popup dan Email/Password berjalan di domain lokal maupun produksi:

1. Buka [Firebase Console - Project `rentgo-medan`](https://console.firebase.google.com/project/rentgo-medan/authentication/providers).
2. Pada tab **Sign-in method**, pastikan provider berikut berstatus **Enabled**:
   - **Google** (pilih email dukungan proyek Anda).
   - **Email/Password**.
3. Buka tab **Authentication -> Settings -> Authorized domains**, lalu pastikan domain berikut terdaftar:
   - `localhost`
   - `rentgo.my.id`
   - Domain preview Vercel Anda (misalnya `rentgo-medan.vercel.app`).

---

## 3. Konfigurasi Deployment Produksi (Vercel & Custom Domain `rentgo.my.id`)

1. Buka [Vercel Dashboard](https://vercel.com/new) dan impor repositori GitHub `https://github.com/rynnxz/rentGO.git`.
2. Atur **Root Directory** ke: `website`
3. Tambahkan **Environment Variables** berikut di Vercel (gunakan nilai asli dari `.env.local` Anda, jangan pernah di-commit ke Git):
   - `NEXT_PUBLIC_ROOT_DOMAIN` = `rentgo.my.id`
   - `NEXT_PUBLIC_SITE_URL` = `https://rentgo.my.id`
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://honhszsloegvpbmczkqf.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = *(Anon Key Supabase)*
   - `SUPABASE_SERVICE_ROLE_KEY` = *(Service Role Key Supabase)*
   - `NEXT_PUBLIC_FIREBASE_API_KEY` = *(Web API Key Firebase)*
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = `rentgo-medan.firebaseapp.com`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = `rentgo-medan`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` = `rentgo-medan.firebasestorage.app`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` = `144616692761`
   - `NEXT_PUBLIC_FIREBASE_APP_ID` = `1:144616692761:web:c0fa64df5859994162c6f9`
   - `ADMIN_EMAIL_ALLOWLIST` = `akbarriansyah339@gmail.com,admin@rentgo.my.id`
   - `MIDTRANS_ENV` = `sandbox`
   - `MIDTRANS_MERCHANT_ID` = *(Merchant ID Sandbox Midtrans)*
   - `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` = *(Client Key Sandbox Midtrans)*
   - `MIDTRANS_SERVER_KEY` = *(Server Key Sandbox Midtrans)*
   - `GEMINI_API_KEY` = *(API Key Google AI Studio)*
   - `GEMINI_MODEL` = `gemini-3.5-flash-lite`
   - `CRON_SECRET` = *(String acak minimal 24 karakter untuk `/api/cron/housekeeping`)*
4. Pada tab **Project Settings -> Domains** di Vercel, tambahkan `rentgo.my.id` (serta opsional `www.rentgo.my.id`). Karena v1.2.0 menggunakan **Arsitektur Single-Domain**, seluruh permukaan (`/`, `/book`, `/admin`) langsung aktif di bawah satu domain tanpa perlu membuat DNS subdomain terpisah.

---

## 4. Daftar Rotasi Kunci Keamanan (Pasca Pembersihan Git History Lokal)

Pada rilis `v1.2.0`, seluruh nilai kunci yang sebelumnya sempat tertulis sebagai nilai *default fallback* di kode sumber atau dokumentasi lokal telah **dihapus bersih** dari seluruh file terpantau (`website/src/lib/env.ts`, `website/src/lib/firebase-client.ts`, `website/.env.example`, dan dokumen status).

Sebagai praktik keamanan terbaik (*security hygiene*), Anda disarankan melakukan rotasi (*regenerate*) kunci berikut setelah pengujian UTS selesai:
1. **Google AI Studio (`GEMINI_API_KEY`):** Buat API key baru di [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) dan cabut (*revoke*) kunci lama jika repositori dipublikasikan secara terbuka.
2. **Midtrans Sandbox (`MIDTRANS_SERVER_KEY` & `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`):** Dapat di-regenerate melalui [Midtrans Sandbox Dashboard -> Settings -> Access Keys](https://dashboard.sandbox.midtrans.com/settings/config_info).
3. **Firebase Web API Key (`NEXT_PUBLIC_FIREBASE_API_KEY`):** Batasi penggunaan kunci (*HTTP Referrer Restrictions*) di Google Cloud Console hanya untuk `localhost/*`, `*.rentgo.my.id/*`, dan `*.vercel.app/*`.
