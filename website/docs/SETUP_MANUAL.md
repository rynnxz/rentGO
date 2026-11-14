# Panduan Setup Manual (Checklist Konfigurasi Cloud & Domain)

Dokumen ini berisi daftar langkah manual berurutan yang perlu dilakukan oleh pemilik proyek (Akbar Riansyah) untuk menghubungkan proyek **RentGo** ke layanan cloud produksi (Firebase, Supabase, Gemini API, Vercel, dan DNS `.my.id`). Seluruh layanan menggunakan paket **100% Gratis (Rp0)**.

> **Catatan:** Untuk menjalankan aplikasi dan seluruh pengujian di komputer lokal, Anda **tidak wajib** menyelesaikan langkah cloud ini terlebih dahulu karena aplikasi telah dilengkapi mode penyimpanan lokal transaksional (`website/.data/rentgo-local.json`) dan dukungan emulator/dev auth.

---

## 1. Setup Project Supabase (Database & Storage)

- [ ] **1.1.** Buka [https://supabase.com/dashboard](https://supabase.com/dashboard) dan masuk dengan akun GitHub Anda.
- [ ] **1.2.** Buat project baru (Free Tier) bernama `rentgo-medan` di region **Southeast Asia (Singapore)** (atau gunakan project `veuhrdylqvgmdchjibje` yang sudah ada).
- [ ] **1.3.** Buka menu **SQL Editor** di dashboard Supabase:
  1. Salin seluruh isi file `website/supabase/migrations/0001_init.sql` lalu klik **Run** (membuat ekstensi `btree_gist`, enum, 7 tabel, indeks, RLS deny-all, fungsi `get_available_vehicles`, dan `create_booking`).
  2. Salin seluruh isi file `website/supabase/seed.sql` lalu klik **Run** (mengisi 5 kategori, 12 kendaraan wilayah Medan, akun admin awal, contoh booking, dan jadwal perawatan).
- [ ] **1.4.** Buka menu **Storage** di dashboard Supabase:
  1. Pastikan bucket publik bernama `vehicle-images` dan `payment-proofs` telah terbentuk (atau klik **New Bucket**, beri nama `vehicle-images`, aktifkan **Public bucket**).
- [ ] **1.5.** Buka **Project Settings -> API**, lalu salin nilai berikut untuk diisi ke environment variables:
  - `Project URL` -> `SUPABASE_URL`
  - `service_role (secret)` -> `SUPABASE_SERVICE_ROLE_KEY` (jangan pernah ditaruh di variabel `NEXT_PUBLIC_`).

---

## 2. Setup Project Firebase (Google Sign-In)

- [ ] **2.1.** Buka [https://console.firebase.google.com](https://console.firebase.google.com) (masuk dengan `akbarriansyah339@gmail.com`).
- [ ] **2.2.** Buat project baru bernama `rentgo-auth` pada paket **Spark Plan (Gratis)** (atau gunakan project yang sudah tersedia).
- [ ] **2.3.** Buka **Authentication -> Sign-in method**, lalu aktifkan provider **Google**:
  - Isi Project public-facing name: `RentGo Medan`
  - Pilih email dukungan: `akbarriansyah339@gmail.com`
  - Klik **Save**.
- [ ] **2.4.** Buka **Authentication -> Settings -> Authorized domains**, lalu tambahkan domain berikut (tanpa `https://` atau port):
  - `localhost`
  - `rentgo.my.id`
  - `book.rentgo.my.id`
  - `admin.rentgo.my.id`
  - Domain preview Vercel Anda (misal `rentgo-website.vercel.app`)
- [ ] **2.5.** Buka **Project Settings -> General -> Your apps**, klik ikon Web (`</>`), daftarkan aplikasi web `rentgo-web`, lalu salin konfigurasi ke variabel berikut:
  - `apiKey` -> `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `authDomain` -> `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `projectId` -> `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `appId` -> `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] **2.6.** Buka **Project Settings -> Service accounts**, klik **Generate new private key** untuk mengunduh file JSON service account. Encode isi file JSON tersebut ke Base64 melalui PowerShell:
  ```powershell
  [Convert]::ToBase64String([IO.File]::ReadAllBytes("path\ke\service-account.json"))
  ```
  Tempel hasilnya ke variabel `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64`.

---

## 3. Setup Gemini API Key (Google AI Studio - Free Tier)

- [ ] **3.1.** Buka [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey).
- [ ] **3.2.** Klik **Create API key** pada project gratis (Free of charge tier).
- [ ] **3.3.** Salin kunci API ke variabel `GEMINI_API_KEY` dan pastikan `GEMINI_MODEL=gemini-3.5-flash-lite`.

---

## 4. Setup Vercel (1 Project untuk 3 Domain)

- [ ] **4.1.** Push repositori `rentgo` ke GitHub (`https://github.com/rynnxz/rentgo`).
- [ ] **4.2.** Buka [https://vercel.com/new](https://vercel.com/new) (paket **Hobby - Gratis**), lalu import repositori `rentgo`.
- [ ] **4.3.** Pada bagian **Root Directory**, klik **Edit** dan pilih folder `website`.
- [ ] **4.4.** Pada bagian **Environment Variables**, masukkan seluruh variabel dari `website/.env.example`:
  - `ROOT_DOMAIN=rentgo.my.id`
  - `NEXT_PUBLIC_LANDING_URL=https://rentgo.my.id`
  - `NEXT_PUBLIC_BOOK_URL=https://book.rentgo.my.id`
  - `NEXT_PUBLIC_ADMIN_URL=https://admin.rentgo.my.id`
  - `NEXT_PUBLIC_FIREBASE_API_KEY=...`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID=...`
  - `NEXT_PUBLIC_FIREBASE_APP_ID=...`
  - `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64=...`
  - `SUPABASE_URL=...`
  - `SUPABASE_SERVICE_ROLE_KEY=...`
  - `GEMINI_API_KEY=...`
  - `GEMINI_MODEL=gemini-3.5-flash-lite`
  - `ADMIN_EMAILS=akbarriansyah339@gmail.com`
  - `CRON_SECRET=` (isi string acak minimal 32 karakter)
  - `PAYMENT_BANK_INFO=Bank Mandiri 105-00-8899776-5 a.n. PT RentGo Transportasi Medan`
  - `WHATSAPP_NUMBER=6281260009988`
- [ ] **4.5.** Klik **Deploy** dan tunggu hingga build pertama selesai.

---

## 5. Setup 3 Domain di Vercel & DNS `.my.id`

- [ ] **5.1.** Di dashboard project Vercel, buka **Settings -> Domains**.
- [ ] **5.2.** Tambahkan ketiga domain satu per satu ke **project yang sama**:
  1. `rentgo.my.id`
  2. `book.rentgo.my.id`
  3. `admin.rentgo.my.id`
- [ ] **5.3.** Buka panel pengelolaan DNS registrar domain `.my.id` Anda (atau Cloudflare jika menggunakan Cloudflare DNS), lalu tambahkan record sesuai nilai yang ditampilkan oleh Vercel:
  - `A` record `@` (`rentgo.my.id`) -> IP yang ditampilkan Vercel (misal `76.76.21.21`)
  - `CNAME` record `book` (`book.rentgo.my.id`) -> target CNAME unik yang ditampilkan Vercel (misal `cname.vercel-dns.com`)
  - `CNAME` record `admin` (`admin.rentgo.my.id`) -> target CNAME unik yang ditampilkan Vercel (misal `cname.vercel-dns.com`)
- [ ] **5.4.** Tunggu propagasi DNS dan penerbitan sertifikat SSL otomatis oleh Vercel hingga ketiga domain berstatus **Valid Configuration**.
