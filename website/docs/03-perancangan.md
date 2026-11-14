# 03 - Perancangan Sistem, Arsitektur, & Database (RentGo)

Dokumen ini memuat rancangan arsitektur perangkat lunak, skema basis data relasional (ERD & Kamus Data), diagram urutan (*sequence diagrams*), serta rancangan struktur antarmuka untuk tiga surface **RentGo**.

---

## 1. Arsitektur Sistem (Satu Aplikasi untuk Tiga Subdomain)

RentGo menerapkan arsitektur **Single Codebase Multi-Surface** di atas Next.js App Router. Ketiga domain menunjuk ke satu deployment yang sama di Vercel; `src/middleware.ts` memeriksa header `Host` pada setiap request dan melakukan *internal rewrite* ke folder rute yang sesuai tanpa mengubah URL di bilah alamat browser.

```mermaid
flowchart TB
    subgraph Client["Browser Pengguna (Mobile & Desktop)"]
        H1["rentgo.my.id (Publik)"]
        H2["book.rentgo.my.id (Customer)"]
        H3["admin.rentgo.my.id (Admin)"]
    end

    subgraph NextApp["Satu Aplikasi Next.js (Vercel Hobby)"]
        MW["src/middleware.ts (Host Resolution & Direct /site/* Block)"]
        S1["/site/landing/* (Landing Surface)"]
        S2["/site/book/* (Booking Surface)"]
        S3["/site/admin/* (Admin Dashboard + RBAC Guard)"]
        API["/api/* (Route Handlers: Auth, Vehicles, Bookings, Payments, Maintenance, AI, Cron)"]
    end

    subgraph External["Layanan Cloud Gratis (Free Tier)"]
        FB["Firebase Auth (Google Sign-In & Session Cookie .rentgo.my.id)"]
        SB["Supabase Postgres + Storage (RLS Deny-All, Service Role Server-Only)"]
        GM["Google Gemini API (@google/genai, gemini-3.5-flash-lite)"]
        VC["Vercel Cron (GET /api/cron/housekeeping Harian)"]
    end

    H1 & H2 & H3 --> MW
    MW -->|Host: rentgo.my.id| S1
    MW -->|Host: book.rentgo.my.id| S2
    MW -->|Host: admin.rentgo.my.id| S3
    S1 & S2 & S3 --> API
    VC -->|Bearer CRON_SECRET| API
    API --> FB
    API --> SB
    API --> GM
```

### Aturan Resolusi Host & Keamanan Rute
1. Akses langsung dari browser ke URL `/site/landing`, `/site/book`, atau `/site/admin` langsung dikembalikan **HTTP 404** oleh middleware.
2. Di lingkungan non-produksi (`development` / `test` / preview `.vercel.app`), parameter `?site=landing|book|admin` dapat digunakan untuk berpindah surface dan disimpan ke cookie `__site`. Fitur ini dinonaktifkan ketika `NODE_ENV === 'production'` pada domain utama.

---

## 2. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    users ||--o{ bookings : "membuat"
    users ||--o{ payments : "memverifikasi (admin)"
    users ||--o{ ai_recommendation_logs : "meminta"
    vehicle_categories ||--o{ vehicles : "mengelompokkan"
    vehicles ||--o{ bookings : "disewa_dalam"
    vehicles ||--o{ maintenance_logs : "dijadwalkan_servis"
    bookings ||--o{ payments : "memiliki_pembayaran"

    users {
        uuid id PK
        text firebase_uid UK
        text email UK
        text full_name
        text avatar_url
        text phone
        text driver_license_no
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
        uuid category_id FK
        text plate_number UK
        text brand
        text model
        smallint year
        text color
        transmission_type transmission "manual | automatic"
        fuel_type fuel "bensin | diesel | listrik | hybrid"
        smallint seats
        numeric daily_price "numeric(12,0)"
        vehicle_status status "active | maintenance | inactive"
        text description
        text image_url
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }

    bookings {
        uuid id PK
        text booking_code UK "RG-YYMMDD-XXXX"
        uuid user_id FK
        uuid vehicle_id FK
        date start_date
        date end_date
        int total_days "generated: end_date - start_date + 1"
        text pickup_location
        text return_location
        numeric daily_price_snapshot "numeric(12,0)"
        numeric total_price "numeric(12,0)"
        booking_status status "pending..expired"
        text notes
        text admin_notes
        timestamptz expires_at
        timestamptz created_at
        timestamptz updated_at
    }

    payments {
        uuid id PK
        uuid booking_id FK
        numeric amount "numeric(12,0)"
        payment_method method "cash | transfer | qris"
        payment_status status "unpaid | paid | refunded"
        text proof_url
        timestamptz paid_at
        uuid verified_by FK
        text note
        timestamptz created_at
        timestamptz updated_at
    }

    maintenance_logs {
        uuid id PK
        uuid vehicle_id FK
        text title
        text description
        date start_date
        date end_date
        numeric cost "numeric(12,0)"
        maintenance_status status "scheduled | in_progress | done"
        timestamptz created_at
        timestamptz updated_at
    }

    ai_recommendation_logs {
        uuid id PK
        uuid user_id FK
        text query_text
        jsonb params
        uuid_array recommended_vehicle_ids
        text model
        boolean used_fallback
        int latency_ms
        timestamptz created_at
    }
```

### Mekanisme Anti Double-Booking di Level Database
Untuk menjamin tidak ada dua pesanan aktif pada kendaraan dan tanggal yang beririsan meskipun terjadi *race condition* (dua request masuk pada milidetik yang sama), tabel `bookings` menggunakan PostgreSQL Exclusion Constraint berbasis indeks `btree_gist`:

```sql
constraint no_double_booking exclude using gist (
  vehicle_id with =,
  daterange(start_date, end_date, '[]') with &&
) where (status in ('pending','confirmed','ongoing'))
```

Batas `'[]'` menandakan rentang tanggal **inklusif** di kedua ujung. Begitu pesanan berstatus `cancelled`, `rejected`, `expired`, atau `completed`, tanggal tersebut otomatis terbuka kembali.

---

## 3. Kamus Data (Data Dictionary)

### 3.1 Tabel `users`
| Kolom | Tipe Data | Constraint | Keterangan |
|---|---|---|---|
| `id` | `uuid` | `PK, default gen_random_uuid()` | Identifier internal pengguna |
| `firebase_uid` | `text` | `NOT NULL, UNIQUE` | UID dari Firebase Authentication |
| `email` | `text` | `NOT NULL, UNIQUE` | Alamat email akun Google |
| `full_name` | `text` | `NOT NULL` | Nama lengkap pengguna |
| `avatar_url` | `text` | `NULL` | URL foto profil Google |
| `phone` | `text` | `NULL` | Nomor HP/WhatsApp aktif (wajib saat checkout) |
| `driver_license_no` | `text` | `NULL` | Nomor SIM A/C (wajib saat checkout) |
| `role` | `user_role` | `NOT NULL, default 'customer'` | Peran akses (`customer` atau `admin`) |
| `is_active` | `boolean` | `NOT NULL, default true` | Status aktif akun |
| `created_at` / `updated_at` | `timestamptz` | `NOT NULL, default now()` | Waktu pembuatan & pembaruan baris |

### 3.2 Tabel `vehicle_categories`
| Kolom | Tipe Data | Constraint | Keterangan |
|---|---|---|---|
| `id` | `uuid` | `PK, default gen_random_uuid()` | Identifier kategori |
| `name` | `text` | `NOT NULL, UNIQUE` | Nama kategori (misal: MPV/Minibus, SUV, Motor) |
| `slug` | `text` | `NOT NULL, UNIQUE` | Slug URL ramah SEO |
| `description` | `text` | `NULL` | Penjelasan singkat kategori |

### 3.3 Tabel `vehicles`
| Kolom | Tipe Data | Constraint | Keterangan |
|---|---|---|---|
| `id` | `uuid` | `PK, default gen_random_uuid()` | Identifier kendaraan |
| `category_id` | `uuid` | `FK -> vehicle_categories(id) RESTRICT` | Kategori kendaraan |
| `plate_number` | `text` | `NOT NULL, UNIQUE` | Nomor polisi (contoh: `BK 1284 AAB`) |
| `brand` / `model` | `text` | `NOT NULL` | Merek (Toyota, Honda) & model (Avanza, PCX 160) |
| `year` | `smallint` | `CHECK (year BETWEEN 1990 AND 2100)` | Tahun perakitan kendaraan |
| `color` | `text` | `NULL` | Warna bodi kendaraan |
| `transmission` | `transmission_type` | `NOT NULL` | `manual` atau `automatic` |
| `fuel` | `fuel_type` | `NOT NULL` | `bensin`, `diesel`, `listrik`, atau `hybrid` |
| `seats` | `smallint` | `CHECK (seats BETWEEN 1 AND 60)` | Kapasitas tempat duduk |
| `daily_price` | `numeric(12,0)` | `CHECK (daily_price > 0)` | Tarif sewa per hari dalam Rupiah |
| `status` | `vehicle_status` | `NOT NULL, default 'active'` | `active`, `maintenance`, atau `inactive` |
| `description` | `text` | `NULL` | Spesifikasi tambahan & fasilitas unit |
| `image_url` | `text` | `NULL` | Path ilustrasi SVG atau URL foto di Storage |
| `deleted_at` | `timestamptz` | `NULL` | Penanda *soft delete* (`NULL` = masih aktif) |

### 3.4 Tabel `bookings`
| Kolom | Tipe Data | Constraint | Keterangan |
|---|---|---|---|
| `id` | `uuid` | `PK, default gen_random_uuid()` | Identifier pesanan |
| `booking_code` | `text` | `NOT NULL, UNIQUE` | Kode unik format `RG-YYMMDD-XXXX` |
| `user_id` | `uuid` | `FK -> users(id) RESTRICT` | Pemesan (customer) |
| `vehicle_id` | `uuid` | `FK -> vehicles(id) RESTRICT` | Unit kendaraan yang disewa |
| `start_date` / `end_date` | `date` | `NOT NULL, CHECK (end_date >= start_date)` | Tanggal ambil & kembali (inklusif WIB) |
| `total_days` | `int` | `GENERATED ALWAYS AS (end_date - start_date + 1) STORED` | Durasi hari sewa inklusif |
| `pickup_location` / `return_location` | `text` | `NOT NULL` | Lokasi serah terima & pengembalian di Medan |
| `daily_price_snapshot` | `numeric(12,0)` | `NOT NULL` | Harga per hari saat transaksi dibuat |
| `total_price` | `numeric(12,0)` | `NOT NULL` | Total biaya sewa (`total_days * daily_price_snapshot`) |
| `status` | `booking_status` | `NOT NULL, default 'pending'` | Status siklus hidup pesanan |
| `notes` / `admin_notes` | `text` | `NULL` | Catatan pelanggan & catatan internal admin |
| `expires_at` | `timestamptz` | `NULL` | Tenggat pembayaran untuk pesanan `pending` (+24 jam) |

### 3.5 Tabel `payments`, `maintenance_logs`, dan `ai_recommendation_logs`
- **`payments`:** Menyimpan nilai tagihan (`amount`), metode (`cash`, `transfer`, `qris`), status (`unpaid`, `paid`, `refunded`), bukti transfer (`proof_url`), waktu lunas (`paid_at`), serta admin pemverifikasi (`verified_by`).
- **`maintenance_logs`:** Menyimpan jadwal perawatan kendaraan (`vehicle_id`, `title`, `start_date`, `end_date`, `cost`, `status`: `scheduled` | `in_progress` | `done`).
- **`ai_recommendation_logs`:** Mencatat audit pemanggilan rekomendasi AI (`user_id`, `query_text`, `params`, `recommended_vehicle_ids`, `model`, `used_fallback`, `latency_ms`, `created_at`) sekaligus menjadi dasar perhitungan *rate limit* 10 permintaan/user/hari.

---

## 4. Sequence Diagram Alur Utama

### 4.1 Alur Login Lintas Subdomain (`POST /api/auth/session`)

```mermaid
sequenceDiagram
    actor User as Pengguna (Customer/Admin)
    participant Client as Browser (Firebase Client SDK)
    participant API as Next.js API (/api/auth/session)
    participant FAdmin as Firebase Admin SDK
    participant DB as Supabase Postgres (users)

    User->>Client: Klik "Masuk dengan Google"
    Client->>Client: signInWithPopup(GoogleAuthProvider)
    Client-->>API: POST /api/auth/session { idToken }
    API->>FAdmin: verifyIdToken(idToken)
    FAdmin-->>API: DecodedToken (uid, email, name, picture)
    API->>API: Cek apakah email ada di ADMIN_EMAILS
    API->>DB: UPSERT users (firebase_uid, email, full_name, role)
    DB-->>API: Data user + role ('customer' | 'admin')
    API->>FAdmin: createSessionCookie(idToken, { expiresIn: 5 hari })
    API-->>Client: Set-Cookie: __session (HttpOnly, Secure, SameSite=Lax, Domain=.rentgo.my.id)
```

### 4.2 Alur Pembuatan Booking Anti-Bentrok (`POST /api/bookings`)

```mermaid
sequenceDiagram
    actor Cust as Customer
    participant UI as Checkout UI (book.rentgo.my.id)
    participant API as POST /api/bookings
    participant DB as Postgres (create_booking + GIST Constraint)

    Cust->>UI: Isi No. HP, No. SIM, Lokasi, Metode Bayar -> Klik "Konfirmasi Booking"
    UI->>API: POST /api/bookings (vehicleId, startDate, endDate, pickup, return, phone, licenseNo)
    API->>API: Verifikasi sesi & validasi skema Zod (WIB date check)
    API->>DB: UPDATE users SET phone, driver_license_no
    API->>DB: Panggil transaksi create_booking(...)
    alt Kendaraan sedang maintenance atau tanggal bentrok
        DB-->>API: Exception no_double_booking / maintenance conflict
        API-->>UI: HTTP 409 Conflict ("Kendaraan sudah dipesan atau dalam perawatan pada tanggal tersebut")
    else Jadwal Tersedia
        DB->>DB: Hitung total_price = (end_date - start_date + 1) * daily_price
        DB->>DB: INSERT bookings (status='pending', expires_at=now()+24h)
        DB->>DB: INSERT payments (status='unpaid', amount=total_price)
        DB-->>API: Data booking baru (RG-YYMMDD-XXXX)
        API-->>UI: HTTP 201 Created -> Redirect ke Detail Pesanan Saya
    end
```

### 4.3 Alur Rekomendasi AI dengan Penjaga Stok & Fallback (`POST /api/ai/recommend`)

```mermaid
sequenceDiagram
    actor Cust as Customer
    participant UI as Panel "Bantu Saya Pilih"
    participant API as POST /api/ai/recommend
    participant DB as Supabase Postgres
    participant Gemini as Gemini API (@google/genai)

    Cust->>UI: Masukkan tanggal, jumlah penumpang, anggaran, & kebutuhan perjalanan
    UI->>API: POST /api/ai/recommend
    API->>DB: Hitung jumlah log user hari ini di ai_recommendation_logs
    alt Melebihi 10 permintaan hari ini
        API-->>UI: HTTP 429 ("Batas penggunaan rekomendasi AI harian (10x) telah tercapai")
    else Masih dalam kuota
        API->>DB: get_available_vehicles(start_date, end_date)
        DB-->>API: Daftar kandidat kendaraan yang benar-benar tersedia
        API->>Gemini: ai.interactions.create (model: GEMINI_MODEL, response_format: JSON Schema)
        alt Gemini sukses & JSON valid
            Gemini-->>API: { summary, recommendations }
            API->>API: Filter hanya vehicle_id yang ada di kandidat tersedia (maks 3)
        else Gemini error / 429 / API Key kosong
            API->>API: Jalankan Skoring Heuristik (kursi >= penumpang, harga <= anggaran, kecocokan kata kunci)
            API->>API: Set used_fallback = true
        end
        API->>DB: INSERT ai_recommendation_logs
        API-->>UI: Daftar maksimal 3 kendaraan tersedia + alasan berbahasa Indonesia
    end
```

---

## 5. Rancangan Struktur Antarmuka (Wireframe Ringkas)

1. **Surface Landing (`rentgo.my.id`):**
   - **Header Sticky:** Logo SVG RentGo, tautan jangkar (`#armada`, `#cara-sewa`, `#harga`, `#faq`), indikator pengguna / tombol Masuk Google, dan tombol aksen "Mulai Booking".
   - **Hero Split Layout:** Judul utama bernuansa rambu perjalanan Medan, kartu formulir pencarian cepat (Tanggal Ambil, Tanggal Kembali, Kategori -> langsung membuka `book.rentgo.my.id` dengan parameter pencarian).
   - **Armada Unggulan & Transparansi Tarif:** Grid unit nyata dari database lengkap dengan label transmisi, kapasitas kursi, bahan bakar, dan harga harian (`Rp xxx.xxx / hari`).
   - **Alur Penyewaan & FAQ Spesifik Medan:** Penjelasan syarat SIM, titik serah terima Kualanamu/Stasiun Medan, dan kebijakan pembatalan.
2. **Surface Booking (`book.rentgo.my.id`):**
   - **Bilah Pencarian & Filter Ketersediaan:** Pemilih rentang tanggal WIB, filter kategori, transmisi, kapasitas kursi minimum, rentang harga maksimum, dan pengurutan.
   - **Panel Asisten AI ("Bantu Saya Pilih"):** Formulir interaktif kebutuhan perjalanan yang menampilkan hingga 3 rekomendasi stok tersedia beserta alasan pemilihan.
   - **Halaman Detail & Checkout:** Kalender tanggal terblokir, rincian kalkulasi harga (`hari x tarif`), form kelengkapan SIM/HP, pilihan lokasi jemput/kembali, dan halaman "Pesanan Saya" (unggah bukti bayar + tombol WhatsApp).
3. **Surface Admin (`admin.rentgo.my.id`):**
   - **Sidebar Navy (`#0B1F3A`):** Navigasi ke Ringkasan Dashboard, Armada Kendaraan, Kategori, Pesanan (Booking), Pembayaran, Jadwal Perawatan, Pelanggan, dan Kalender Ketersediaan.
   - **Workspace Operasional:** Kartu KPI nyata dari database, grafik batang pendapatan 6 bulan, tabel berfilter dengan tombol aksi kontekstual sesuai *state machine* booking.
