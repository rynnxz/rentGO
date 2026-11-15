# 03 - Audit ERD, Relasi Database, dan Panduan Setup Supabase

## 1. Mengapa Sebelumnya di Dashboard Supabase Belum Ada Tabelnya?

Pertanyaan penting: **"Kenapa di Supabase (`honhszsloegvpbmczkqf`) sebelumnya belum ada tables / databasenya?"**

Berikut adalah hasil audit teknis penyebabnya dan solusinya:
1. **Penyebab Teknis:**
   - Pada konfigurasi `.env.local`, kredensial yang diberikan adalah `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` (kunci publik `sb_publishable_...`). Demi keamanan standar PostgreSQL, kunci publik (*anon/publishable key*) **tidak diizinkan menjalankan perintah DDL (`CREATE TABLE`, `CREATE TYPE`, `ALTER TABLE`)** melalui REST API biasa.
   - Selain itu, konfigurasi MCP Supabase sebelumnya baru tertulis di file lokal workspace `.mcp.json` dan belum tertulis di file konfigurasi global Antigravity (`C:\Users\user\.gemini\antigravity\mcp_config.json`), sehingga server MCP memerlukan *refresh/authenticate* terlebih dahulu.
   - Karena aplikasi memiliki fitur **Dual-Mode Persistence Fallback**, aplikasi tetap berjalan lancar menggunakan penyimpanan lokal `.data/rentgo-local.json` meskipun tabel di cloud Supabase belum dibuat.
2. **Solusi Permanen yang Telah Disiapkan:**
   - Konfigurasi MCP Supabase kini sudah dipasang di lokasi global yang benar: **`C:\Users\user\.gemini\antigravity\mcp_config.json`**.
   - Kami juga telah membuat skrip SQL All-in-One yang 100% *idempotent* di **[website/supabase/RENTGO_FULL_SETUP_AND_SEED.sql](file:///c:/uts-mmprpl/rentgo/website/supabase/RENTGO_FULL_SETUP_AND_SEED.sql)** yang menggabungkan pembuatan 8 tipe ENUM, 7 tabel relasional, *constraint* Anti Double-Booking, *Row Level Security (RLS)*, 2 *Storage Bucket* (`vehicles` dan `payment-proofs`), serta *seed data* 12 kendaraan Medan dengan foto unit asli.

### Cara Membuat Seluruh Tabel & Seed Data di Supabase dalam 1 Klik (30 Detik):
1. Buka **Supabase SQL Editor** proyek Anda melalui tautan berikut:
   `https://supabase.com/dashboard/project/honhszsloegvpbmczkqf/sql/new`
2. Buka file **[website/supabase/RENTGO_FULL_SETUP_AND_SEED.sql](file:///c:/uts-mmprpl/rentgo/website/supabase/RENTGO_FULL_SETUP_AND_SEED.sql)**, salin (*copy*) seluruh isinya, lalu tempel (*paste*) ke SQL Editor Supabase.
3. Klik tombol **Run** (atau tekan `Ctrl + Enter`).
4. Seluruh **7 tabel (`users`, `vehicle_categories`, `vehicles`, `bookings`, `payments`, `maintenance_logs`, `ai_recommendation_logs`)**, fungsi RPC, storage bucket, dan **12 kendaraan Medan** langsung aktif di menu **Table Editor** Supabase Anda!

---

## 2. Entity Relationship Diagram (ERD) - 7 Tabel Relasional

Basis data PostgreSQL RentGo Medan terdiri atas **7 tabel utama** yang saling berelasi secara ketat menggunakan *Foreign Key* (`UUID`):

```mermaid
erDiagram
    users ||--o{ bookings : "membuat (1:N)"
    users ||--o{ payments : "memverifikasi (1:N)"
    users ||--o{ ai_recommendation_logs : "meminta rekomendasi (1:N)"
    vehicle_categories ||--|{ vehicles : "mengelompokkan (1:N)"
    vehicles ||--o{ bookings : "disewa dalam (1:N)"
    vehicles ||--o{ maintenance_logs : "menjalani servis (1:N)"
    bookings ||--|| payments : "memiliki tagihan (1:1)"

    users {
        uuid id PK
        text firebase_uid UK "UID dari Firebase Auth"
        text email UK
        text full_name
        text phone "No. WhatsApp"
        text driver_license_no "No. SIM A / SIM C"
        user_role role "customer | admin"
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    vehicle_categories {
        uuid id PK
        text name UK
        text slug UK
        text description
        timestamptz created_at
        timestamptz updated_at
    }

    vehicles {
        uuid id PK
        uuid category_id FK "ON DELETE RESTRICT"
        text plate_number UK "Plat BK Sumatera Utara"
        text brand
        text model
        smallint year "CHECK 1990..2100"
        text color
        transmission_type transmission "manual | automatic"
        fuel_type fuel "bensin | diesel | listrik | hybrid"
        smallint seats "CHECK 1..60"
        numeric daily_price "CHECK > 0 (Rupiah)"
        vehicle_status status "active | maintenance | inactive"
        text image_url "Foto unit asli / placeholder"
        timestamptz deleted_at "Soft delete"
    }

    bookings {
        uuid id PK
        text booking_code UK "Format RG-YYMMDD-XXXX"
        uuid user_id FK "ON DELETE RESTRICT"
        uuid vehicle_id FK "ON DELETE RESTRICT"
        date start_date "Tanggal ambil inklusif"
        date end_date "Tanggal kembali inklusif"
        int total_days "GENERATED (end - start + 1)"
        text pickup_location
        text return_location
        numeric daily_price_snapshot "Harga saat booking dikunci"
        numeric total_price "daily_price_snapshot * total_days"
        booking_status status "pending..completed"
        timestamptz expires_at "Batas bayar +24 jam"
    }

    payments {
        uuid id PK
        uuid booking_id FK_UK "1:1 ON DELETE CASCADE"
        numeric amount
        payment_method method "qris | transfer | cash"
        payment_status status "unpaid | paid | refunded"
        text proof_url "URL bukti bayar di Storage"
        timestamptz paid_at
        uuid verified_by FK "Admin yang memverifikasi"
        text note
    }

    maintenance_logs {
        uuid id PK
        uuid vehicle_id FK "ON DELETE CASCADE"
        text title
        text description
        date start_date
        date end_date
        numeric cost
        maintenance_status status "scheduled | in_progress | done"
    }

    ai_recommendation_logs {
        uuid id PK
        uuid user_id FK "ON DELETE SET NULL"
        text query_text
        jsonb params
        uuid_array recommended_vehicle_ids
        text model "gemini-flash-latest"
        boolean used_fallback
        int latency_ms
        timestamptz created_at
    }
```

---

## 3. Penjelasan Detail Relasi & Integritas Referensial

1. **`vehicle_categories` (1) -> `vehicles` (N) [`ON DELETE RESTRICT`]:**
   - Satu kategori armada (misal `MPV / Minibus`) menaungi banyak unit kendaraan (`Avanza`, `Xpander`, `Innova`, `Xenia`).
   - Kebijakan `ON DELETE RESTRICT` mencegah admin menghapus kategori yang masih memiliki unit kendaraan aktif agar tidak ada kendaraan yatim (*orphan rows*).
2. **`vehicles` (1) -> `bookings` (N) [`ON DELETE RESTRICT` + Soft Delete]:**
   - Satu unit kendaraan dapat memiliki banyak riwayat pesanan dari waktu ke waktu, namun **tidak boleh memiliki lebih dari satu pesanan aktif (`pending`, `confirmed`, `ongoing`) pada rentang tanggal yang beririsan**.
   - Ketika admin menghapus kendaraan di dashboard, sistem melakukan **Soft Delete** (mengisi kolom `deleted_at = now()` dan `status = 'inactive'`) sehingga histori transaksi keuangan di tabel `bookings` tetap utuh 100%.
3. **`users` (1) -> `bookings` (N) [`ON DELETE RESTRICT`]:**
   - Satu pelanggan yang terautentikasi melalui Firebase Auth (`firebase_uid`) dapat membuat banyak pesanan sewa.
4. **`bookings` (1) -> `payments` (1) [`UNIQUE(booking_id)` + `ON DELETE CASCADE`]:**
   - Setiap pesanan memiliki tepat satu catatan tagihan pembayaran (`payments`) yang dibuat secara atomik pada saat *checkout*.
5. **`vehicles` (1) -> `maintenance_logs` (N) [`ON DELETE CASCADE`]:**
   - Satu unit kendaraan dapat memiliki banyak jadwal perawatan bengkel. Jika jadwal perawatan berstatus `scheduled` atau `in_progress`, fungsi ketersediaan otomatis menyembunyikan unit tersebut pada tanggal servis yang bersangkutan.
6. **`users` (1) -> `ai_recommendation_logs` (N) [`ON DELETE SET NULL`]:**
   - Setiap permintaan rekomendasi ke Gemini AI dicatat beserta latensi (`latency_ms`), model yang digunakan (`gemini-flash-latest`), dan daftar UUID kendaraan yang direkomendasikan untuk keperluan audit.

---

## 4. Mekanisme Anti Double-Booking di Level Database

Selain pengecekan di lapisan aplikasi, PostgreSQL menjaga agar tidak mungkin terjadi *race condition* atau *double-booking* melalui dua lapisan penguncian:
1. **Pessimistic Row Locking (`SELECT ... FOR UPDATE`):** Di dalam fungsi RPC `public.create_booking(...)`, baris kendaraan di tabel `vehicles` dikunci selama transaksi pembuatan booking berlangsung.
2. **GiST Exclusion Constraint (`no_double_booking`):**
   ```sql
   constraint no_double_booking exclude using gist (
     vehicle_id with =,
     daterange(start_date, end_date, '[]') with &&
   ) where (status in ('pending', 'confirmed', 'ongoing'))
   ```
   Operator `&&` pada tipe `daterange(..., '[]')` (inklusif di kedua ujung tanggal) menolak secara instan di tingkat kernel PostgreSQL apabila ada dua baris booking aktif pada `vehicle_id` yang sama yang memiliki irisan tanggal sekecil satu hari pun.
