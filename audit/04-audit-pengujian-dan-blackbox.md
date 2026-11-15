# 04 - Audit Pengujian Sistem & Panduan Lengkap Black-Box Testing

Dokumen ini menjelaskan **bagaimana pengujian dilakukan di RentGo Medan**, khususnya penjelasan rinci mengenai **metodologi, cara melakukan pengujian Black-Box langkah demi langkah**, serta hasil eksekusi **20 Kasus Uji Black-Box**, **21 Unit Test (Vitest pada 5 file uji)**, dan **6 blok uji otomatis yang mencakup 8 skenario End-to-End (`E2E-01` s/d `E2E-08`, Playwright)**.

---

## 1. Bagaimana Cara Kerja & Prosedur Black-Box Testing di RentGo Medan?

**Black-Box Testing** adalah metode pengujian perangkat lunak yang menguji fungsionalitas aplikasi **dari sudut pandang pengguna akhir (input -> proses -> output tampilan/HTTP status)** tanpa melihat struktur kode internal.

Dalam menguji RentGo Medan, pengujian Black-Box dibagi ke dalam **3 teknik rekayasa perangkat lunak formal**:

### Teknik 1: Equivalence Partitioning (EP) - Partisi Kelas Input
Membagi seluruh kemungkinan input pengguna ke dalam **Partisi Valid** (harus diterima sistem) dan **Partisi Tidak Valid** (harus ditolak dengan pesan error Bahasa Indonesia yang jelas):
- **Contoh Cara Tes pada Form Checkout (`/book/vehicles/[id]`):**
  1. *Partisi Valid:* Masukkan Nomor WhatsApp `081260009988` (10-15 digit angka) dan Nomor SIM `1271091511040001` (minimal 8 karakter). **Hasil yang diharapkan:** Pesanan berhasil dibuat (`HTTP 201`).
  2. *Partisi Tidak Valid:* Masukkan Nomor WhatsApp `abc-bukan-nomor` atau Nomor SIM `123` (kurang dari 8 karakter). **Hasil yang diharapkan:** Sistem menolak form (`HTTP 400`) dan menampilkan pesan validasi Zod tanpa membuat data kotor di database.

### Teknik 2: Boundary Value Analysis (BVA) - Analisis Nilai Batas
Menguji tepat pada **batas bawah dan batas atas aturan bisnis** tempat bug paling sering muncul:
- **Cara Tes Batas Tanggal Inklusif (`start_date` vs `end_date`):**
  1. **Batas Minimum Valid (`end_date == start_date`, sewa 1 hari di tanggal yang sama):**
     - Buka `/book`, pilih unit `Toyota Avanza (BK 1750 AAD)` dengan `Tanggal Mulai = 2026-12-15` dan `Tanggal Selesai = 2026-12-15`.
     - **Verifikasi:** Sistem menghitung `(2026-12-15 - 2026-12-15) + 1 = 1 Hari` (Rp 420.000), bukan 0 hari!
  2. **Batas Bawah Tidak Valid (`end_date = start_date - 1 hari`):**
     - Masukkan `Tanggal Mulai = 2026-12-15` dan `Tanggal Selesai = 2026-12-14` via request API `POST /api/bookings`.
     - **Verifikasi:** Sistem wajib menolak dengan `HTTP 400 Bad Request` ("Tanggal selesai tidak boleh sebelum tanggal mulai").
  3. **Batas Irisan 1 Hari (*Single-Day Edge Overlap*):**
     - Jika Pesanan A menyewa tanggal `10 s/d 12 Desember`, lalu Pelanggan B mencoba memesan unit yang sama untuk tanggal `12 s/d 14 Desember` (beririsan tepat di tanggal 12 saja).
     - **Verifikasi:** Sistem wajib menolak pesanan B (`HTTP 409 Conflict`) karena tanggal 12 Desember masih dipakai oleh Pesanan A secara inklusif.
  4. **Batas Rate Limit Gemini AI (10 Permintaan / Menit):**
     - Kirim permintaan ke `/api/ai/recommend` sebanyak 10 kali berturut-turut dalam 60 detik -> permintaan ke-1 s/d ke-10 berhasil (`HTTP 200`).
     - Kirim permintaan ke-11 pada detik ke-45 -> sistem wajib menolak dengan `HTTP 429 Too Many Requests` ("Batas penggunaan AI tercapai: maksimal 10 respons per menit").

### Teknik 3: State Transition Testing - Pengujian Mesin Status Booking & RBAC
Menguji apakah perpindahan status pesanan mematuhi matriks **State Machine** dan tidak bisa melompati prosedur:
- **Cara Tes Transisi Valid:**
  1. Pelanggan membuat pesanan -> status awal `pending` & pembayaran `unpaid`.
  2. Admin membuka `/admin/bookings` (atau pelanggan menekan tombol **"Sudah Bayar"** pada simulasi QRIS Sandbox) -> pembayaran menjadi `paid` dan status berubah `pending -> confirmed`.
  3. Saat serah terima kunci, Admin menekan **"Mulai Sewa (Ongoing)"** -> status berubah `confirmed -> ongoing`.
  4. Saat unit dikembalikan, Admin menekan **"Selesaikan Sewa"** -> status berubah `ongoing -> completed`.
- **Cara Tes Transisi Ilegal (Harus Ditolak):**
  1. Pelanggan mencoba membatalkan pesanan yang sudah berstatus `confirmed` atau `ongoing` melalui `PATCH /api/bookings/[id]` -> sistem wajib menolak (`HTTP 400/403`) karena pelanggan hanya boleh membatalkan pesanan yang masih `pending`.
  2. Mengubah pesanan yang sudah `completed` kembali menjadi `pending` -> ditolak oleh `canTransitionBookingStatus`.

---

## 2. Cara Menjalankan Pengujian Otomatis di Terminal

Seluruh skenario Black-Box, Unit Test, dan E2E di atas telah diotomatisasi sehingga penguji atau dosen dapat menjalankannya kapan saja dengan perintah berikut di folder `website/`:

```bash
# 1. Pemeriksaan Tipe Statis TypeScript (Strict Mode)
npm run typecheck

# 2. Menjalankan 21 Unit Test & Concurrency Test (Vitest)
npm test

# 3. Menjalankan 6 Suite End-to-End Browser Test (Playwright Chromium)
npx playwright test
```

---

## 3. Tabel Hasil 20 Kasus Uji Black-Box (`TC-001` s/d `TC-020`)

| ID Uji | Modul & Teknik Uji | Langkah Pengujian & Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|
| **TC-001** | Middleware Security (EP) | Buka URL internal `/site/admin` atau `/site/book` secara langsung di browser | Diblokir oleh middleware dengan status `HTTP 404` | Mengembalikan `HTTP 404` | **PASS** |
| **TC-002** | Single-Domain Routing (EP) | Buka `/`, `/book`, dan `/admin` pada domain yang sama | Merender Landing (`/`), Katalog (`/book`), dan Panel Admin (`/admin`) dengan 1 sesi login terpadu | Ketiga halaman tampil dengan sesi `__session` yang sama | **PASS** |
| **TC-003** | RBAC Unauthenticated (State) | Buka `/admin` saat belum login | Menampilkan gerbang `Autentikasi Administrator Diperlukan` (`admin-login-gate`) | Tampil gerbang login admin | **PASS** |
| **TC-004** | RBAC Customer 403 (State) | Login sebagai Customer (`nadia.siregar@gmail.com`) lalu buka `/admin` | Ditolak dengan tampilan `HTTP 403 - Akses Ditolak` (`admin-access-denied`) | Tampil halaman HTTP 403 | **PASS** |
| **TC-005** | Firebase Google OAuth & Email (EP) | Klik `Masuk / Daftar`, uji Google OAuth Popup (`rentgo-medan`) dan form Email/Password | Popup Google OAuth terbuka tanpa error & login menyimpan cookie `__session` | Popup Google & sesi berhasil dibuat | **PASS** |
| **TC-006** | Admin CRUD Kategori (EP) | Tambah kategori baru di `/admin/categories`, lalu coba hapus kategori yang masih memiliki kendaraan | Tambah kategori berhasil; hapus kategori berelasi ditolak (`ON DELETE RESTRICT`) | Sesuai aturan integritas referensial | **PASS** |
| **TC-007** | Admin CRUD Kendaraan (EP) | Tambah unit baru `Honda HR-V SE Turbo` (`BK 8xxx ETE`) di `/admin/vehicles` lalu cek di `/book` | Unit tersimpan dan langsung tampil di katalog pelanggan `/book` | Tampil di katalog `/book` (`E2E-02`) | **PASS** |
| **TC-008** | Soft-Delete Kendaraan (State) | Klik tombol `Hapus` pada salah satu kendaraan di `/admin/vehicles` | Kolom `deleted_at` terisi, unit hilang dari katalog aktif namun histori booking lama tetap aman | Soft-delete berjalan akurat | **PASS** |
| **TC-009** | Kalkulasi Durasi 1 Hari (BVA) | Pilih `start_date = 2026-12-15` dan `end_date = 2026-12-15` pada unit Rp 420.000/hari | Durasi dihitung inklusif `1 hari` dengan total `Rp 420.000` | `1 hari / Rp 420.000` | **PASS** |
| **TC-010** | Kalkulasi Multi-Hari Server (BVA) | Pilih `start_date = 2026-12-15` dan `end_date = 2026-12-16` (2 hari inklusif) | Server menghitung `total_days = 2` dan `total_price = Rp 840.000` | `2 hari / Rp 840.000` (`E2E-03`) | **PASS** |
| **TC-011** | Validasi Tanggal Terbalik (BVA) | Kirim `start_date = 2026-12-10` dan `end_date = 2026-12-08` | Ditolak oleh validator Zod & DB (`HTTP 400`) | Ditolak dengan pesan error validasi | **PASS** |
| **TC-012** | Anti Double-Booking Konkuren (BVA) | Kirim 2 request checkout paralel pada kendaraan dan tanggal yang beririsan | Tepat 1 request berhasil (`201 Created`) dan 1 request ditolak (`409 Conflict`) | Terbukti di unit test konkurensi & DB | **PASS** |
| **TC-013** | Blokir Jadwal Perawatan (State) | Cari kendaraan pada tanggal `2026-11-15 s/d 2026-11-16` saat `Toyota Hiace Premio (BK 7099 AAL)` sedang servis | Unit `BK 7099 AAL` otomatis disembunyikan dari katalog `/book` | Unit tidak tampil (`E2E-06`) | **PASS** |
| **TC-014** | Simulasi QRIS Midtrans Sandbox (State) | Buat pesanan QRIS lalu klik tombol `Sudah Bayar (Simulasi Sandbox Instan)` di halaman detail | Status pembayaran berubah menjadi `PAID` dan status booking menjadi `CONFIRMED` | Berubah instan menjadi Lunas & Dikonfirmasi | **PASS** |
| **TC-015** | Siklus Penuh State Machine Admin (State) | Admin memproses pesanan dari `pending -> confirmed -> ongoing -> completed` di `/admin/bookings` | Setiap transisi berhasil dan memperbarui badge status secara real-time | Seluruh transisi lulus (`E2E-03`) | **PASS** |
| **TC-016** | Menu "Semua Aksi" Modal Admin (EP) | Klik tombol `Semua Aksi (+N)` pada baris tabel `/admin/bookings` | Membuka modal `<dialog>` berisi seluruh tombol transisi (`Batalkan`, `Tolak`, `Kedaluwarsa`, `Tandai Lunas`, `Refund`) | Modal terbuka rapi tanpa menumpuk baris tabel | **PASS** |
| **TC-017** | Pembatalan Mandiri oleh Pelanggan (State) | Pelanggan menekan `Batalkan Pesanan` saat status `pending` di `/book/bookings/[id]` | Status berubah menjadi `cancelled` dan unit langsung tersedia kembali di katalog pada tanggal tersebut | Unit kembali tersedia (`E2E-05`) | **PASS** |
| **TC-018** | Rekomendasi Gemini AI (EP) | Masukkan kueri `"Saya butuh mobil keluarga 7 kursi matic ke Danau Toba budget 500rb per hari"` | Mengembalikan maksimal 3 unit nyata yang tersedia beserta `fit_score` dan alasan | Tampil 3 kartu rekomendasi (`E2E-07`) | **PASS** |
| **TC-019** | Rate Limit Gemini AI 10/Menit (BVA) | Kirim >10 permintaan ke `/api/ai/recommend` dalam waktu 1 menit | Permintaan ke-11 ditolak dengan `HTTP 429` dan header `X-RateLimit-Limit: 10` | Terbukti pada unit test rate limiter | **PASS** |
| **TC-020** | Housekeeping Auto-Expire 24 Jam (State) | Panggil `/api/cron/housekeeping` ketika ada pesanan `pending` yang melewati `expires_at` | Pesanan otomatis diubah menjadi `expired` dan tanggal kendaraan kembali terbuka | Berjalan akurat sesuai jadwal cron | **PASS** |

---

## 4. Ringkasan Hasil Pengujian Otomatis (Unit Test & E2E)

1. **Unit Testing (`tests/unit/*.test.ts` - Vitest):**
   - **Total Suite:** **5 File Uji** (`ai.test.ts` [2 tes], `availability-and-concurrency.test.ts` [4 tes], `booking-state.test.ts` [4 tes], `pricing.test.ts` [6 tes], `validators-and-routing.test.ts` [5 tes])
   - **Total Test Cases:** **21 Unit Tests (100% PASS)**
   - Mencakup perhitungan tarif inklusif, matriks transisi 7 status booking, simulasi 2 request konkuren (*race condition*), pemfilteran ketersediaan terhadap jadwal servis, ekstraksi kueri natural language & rate limiter AI 10 respons/menit, serta resolusi routing single-domain (`/`, `/book`, `/admin`).
2. **End-to-End Browser Testing (`tests/e2e/rentgo.spec.ts` - Playwright Chromium):**
   - **Total Suite:** **6 blok uji otomatis yang mencakup 8 skenario E2E (`E2E-01` s/d `E2E-08`, 100% PASS)** (`E2E-01 & E2E-08` digabung dalam blok uji ke-1, serta `E2E-03 & E2E-04` digabung dalam blok uji ke-3)
   - Menguji langsung di browser Chromium mulai dari pemblokiran `/site/*` (`404`), proteksi RBAC Admin (`403`), pembuatan kendaraan baru oleh Admin hingga tampil di katalog, checkout pelanggan, unggah bukti bayar, transisi `pending -> confirmed -> ongoing -> completed`, pembatalan pesanan, penyembunyian unit servis, hingga asisten rekomendasi AI.
