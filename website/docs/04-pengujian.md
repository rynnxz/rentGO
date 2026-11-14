# Bab 4: Pengujian Sistem (Software Testing) - RentGo Medan

Dokumen ini menyajikan strategi, kasus uji, dan hasil pengujian aktual untuk aplikasi **RentGo (Sistem Manajemen Penyewaan Kendaraan)** pada akhir siklus **SDLC Incremental**. Pengujian dilakukan dalam tiga lapisan terintegrasi:
1. **Pengujian Unit (Unit Testing - Vitest):** Menguji kemurnian logika bisnis (`pricing`, `booking-state`, `validators`, `availability`, `ai`).
2. **Pengujian Fungsional Black-Box (`TC-001` s/d `TC-020`):** Memverifikasi setiap kebutuhan fungsional (`FR-01` s/d `FR-19`) dan aturan bisnis.
3. **Pengujian End-to-End Otomatis (Playwright E2E):** Menjalankan browser Chromium headless terhadap aplikasi nyata.

---

## 4.1 Ringkasan Eksekusi Pengujian Unit (Vitest)

Perintah eksekusi:
```bash
cd website && npm test
```

| Berkas Uji | Jumlah Test | Cakupan Logika yang Diuji | Hasil Aktual |
| :--- | :---: | :--- | :---: |
| `tests/unit/pricing.test.ts` | 6 | Perhitungan hari inklusif (hari sama = 1 hari), rentang multi-hari, validasi tanggal kembali sebelum tanggal ambil, snapshot harga server-side, dan format kode booking `RG-YYMMDD-XXXX` | **PASS (6/6)** |
| `tests/unit/booking-state.test.ts` | 4 | Transisi valid oleh Admin (`pending -> confirmed -> ongoing -> completed`), pembatalan mandiri oleh Customer (`pending -> cancelled`), penolakan pembatalan setelah `confirmed`, dan penolakan transisi mundur dari `completed` | **PASS (4/4)** |
| `tests/unit/validators-and-routing.test.ts` | 5 | Validasi skema Zod untuk pembuatan booking & kendaraan, serta resolusi host subdomain (`rentgo.my.id`, `book.rentgo.my.id`, `admin.rentgo.my.id`, dan blokir `?site=` pada domain produksi utama) | **PASS (5/5)** |
| `tests/unit/availability-and-concurrency.test.ts` | 4 | Deteksi irisan tanggal inklusif, eksklusi kendaraan yang memiliki jadwal perawatan aktif, dan simulasi **balapan konkuren (race condition)** `Promise.all([createBooking, createBooking])` pada kendaraan & tanggal yang sama (tepat 1 berhasil dan 1 ditolak) | **PASS (4/4)** |
| `tests/unit/ai.test.ts` | 2 | Rekomendasi deterministik berbasis aturan skor (MPV 7 kursi matic sesuai budget) dan penanganan aman saat katalog kendaraan kosong | **PASS (2/2)** |
| **Total** | **21** | **Seluruh modul logika inti pada `src/lib/`** | **21 PASS / 0 FAIL** |

---

## 4.2 Tabel Pengujian Black-Box (`TC-001` s/d `TC-020`)

| ID Kasus Uji | Fitur / Modul | Skenario Pengujian | Data Masukan | Hasil yang Diharapkan | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-001** | Routing Multi-Subdomain | Akses permukaan utama `rentgo.my.id` (`/?site=landing`) | `GET /?site=landing` | Menampilkan halaman Landing 10 bagian beserta JSON-LD `AutoRental` | Halaman Landing tampil lengkap dengan data armada dari DB | **PASS** |
| **TC-002** | Proteksi Path Internal | Percobaan akses langsung browser ke `/site/admin` atau `/site/book` | `GET /site/admin` | Middleware menolak akses langsung dan mengembalikan halaman HTTP 404 | Server mengembalikan status HTTP `404 Not Found` | **PASS** |
| **TC-003** | Autentikasi Google & Sesi | Login menggunakan akun Google Customer via `POST /api/auth/session` | Akun `nadia.siregar@gmail.com` | Cookie HTTP-only `__session` terbentuk, profil tersimpan di tabel `users` dengan role `customer` | Sesi terbentuk dan indikator pengguna menampilkan `Nadia Siregar (CUSTOMER)` | **PASS** |
| **TC-004** | Penetapan Role Admin Otomatis | Login menggunakan email yang terdaftar di `ADMIN_EMAILS` | Akun `akbarriansyah339@gmail.com` | Pengguna otomatis memperoleh role `admin` dan dapat membuka dasbor `admin.rentgo.my.id` | Pengguna masuk dengan role `ADMIN` dan dasbor utama tampil | **PASS** |
| **TC-005** | Proteksi RBAC Halaman Admin | Pengguna ber-role `customer` mencoba mengakses `admin.rentgo.my.id` | Sesi `nadia.siregar@gmail.com` pada `/?site=admin` | Menampilkan halaman `HTTP 403 - Akses Ditolak` dan menyembunyikan seluruh menu operasional admin | Halaman `HTTP 403 - Akses Ditolak` tampil (`data-testid="admin-access-denied"`) | **PASS** |
| **TC-006** | Proteksi RBAC Endpoint API Admin | Pengguna `customer` mengirim request `POST /api/vehicles` | Payload kendaraan baru dengan sesi `customer` | Server menolak dengan kode status HTTP `403 Forbidden` | Respon JSON `{ error: "Akses ditolak..." }` dengan status `403` | **PASS** |
| **TC-007** | CRUD Kategori Armada | Admin menambahkan kategori baru dan mencoba menghapus kategori yang masih memiliki kendaraan aktif | `POST /api/categories` lalu `DELETE /api/categories/[id]` | Penambahan berhasil (`201`); penghapusan kategori yang masih dipakai kendaraan aktif ditolak (`400`) | Kategori baru tersimpan; penghapusan kategori aktif ditolak dengan pesan jelas | **PASS** |
| **TC-008** | CRUD Kendaraan & Unik Plat | Admin menambahkan kendaraan baru `Honda HR-V SE Turbo` plat unik | Plat `BK 8xxx ETE`, harga `Rp 580.000` | Kendaraan tersimpan di database dan langsung muncul di katalog publik `book.rentgo.my.id` | Kendaraan tampil di tabel Admin dan di katalog pelanggan | **PASS** |
| **TC-009** | Soft Delete Kendaraan | Admin menghapus kendaraan yang tidak memiliki booking aktif | `DELETE /api/vehicles/[id]` | Kolom `deleted_at` terisi, status menjadi `inactive`, dan unit hilang dari katalog publik tanpa merusak histori | Unit dinonaktifkan secara soft delete dan tidak tampil di katalog | **PASS** |
| **TC-010** | Pencarian Ketersediaan Tanggal WIB | Pelanggan mencari armada pada rentang tanggal tertentu di `book.rentgo.my.id` | `start=2026-11-15`, `end=2026-11-16` | Hanya menampilkan kendaraan `active` yang tidak memiliki booking aktif atau jadwal perawatan pada tanggal tersebut | Katalog menyaring unit secara akurat sesuai tanggal WIB | **PASS** |
| **TC-011** | Eksklusi Kendaraan dalam Perawatan | Pencarian pelanggan pada tanggal di mana `Toyota Rush GR (BK 1601 RGO)` sedang servis (`in_progress`) | `start=2026-11-15`, `end=2026-11-16` | `BK 1601 RGO` tidak muncul di katalog ketersediaan pelanggan | `BK 1601 RGO` otomatis disembunyikan (`count = 0`) | **PASS** |
| **TC-012** | Kalkulasi Harga Server-Side Inklusif | Pelanggan memilih sewa 2 hari inklusif (`2026-12-15` s/d `2026-12-16`) pada Honda Brio RS (`Rp 320.000/hari`) | `start_date: 2026-12-15`, `end_date: 2026-12-16` | Server menghitung `total_days = 2` dan `total_price = Rp 640.000` tanpa mempercayai input harga dari client | Record booking menyimpan `total_days: 2` dan `total_price: 640000` | **PASS** |
| **TC-013** | Anti Double-Booking Konkuren | Dua permintaan booking dikirim bersamaan untuk unit dan rentang tanggal yang sama | 2 request paralel pada `BK 1201 RGO` (`2026-12-01`..`2026-12-03`) | Tepat 1 booking berhasil (`201 Created`) dan permintaan kedua ditolak (`409 Conflict`) | 1 transaksi sukses, 1 transaksi ditolak dengan pesan bentrok tanggal | **PASS** |
| **TC-014** | Unggah Bukti Pembayaran | Pelanggan mengunggah bukti transfer pada halaman detail pesanan | File gambar / struk bukti bayar pada `PATCH /api/payments/[bookingId]` | URL bukti bayar tersimpan pada tabel `payments.proof_url` dan dapat dilihat oleh Admin | Bukti pembayaran tampil pada detail pesanan pelanggan dan modal Admin | **PASS** |
| **TC-015** | Konfirmasi WhatsApp Otomatis | Pelanggan menekan tombol "Konfirmasi via WhatsApp Admin Medan" | Data booking `RG-YYMMDD-XXXX` | Membuka tautan `https://wa.me/6281260009988?text=...` dengan teks berisi kode booking, nama unit, tanggal, dan total Rupiah | Tautan `wa.me` terbentuk lengkap dengan parameter pesan terenkode | **PASS** |
| **TC-016** | State Machine Booking oleh Admin | Admin memverifikasi pembayaran (`paid`) lalu mengubah status bertahap | `pending -> confirmed -> ongoing -> completed` | Setiap transisi berhasil dan memperbarui badge status secara berurutan | Seluruh transisi status dan verifikasi lunas berjalan mulus | **PASS** |
| **TC-017** | Pembatalan Mandiri oleh Pelanggan | Pelanggan membatalkan pesanan miliknya yang masih berstatus `pending` | `PATCH /api/bookings/[id]` `{ status: "cancelled" }` | Status berubah menjadi `cancelled` dan unit kendaraan langsung tersedia kembali pada tanggal tersebut | Pesanan dibatalkan dan unit kembali muncul di katalog tanggal tersebut | **PASS** |
| **TC-018** | Proteksi Cross-Role Pesanan Pelanggan | Pelanggan mencoba membuka atau mengubah pesanan milik pelanggan lain | `GET / PATCH /api/bookings/[id_orang_lain]` | Ditolak dengan status HTTP `403 Forbidden` | Server menolak akses dengan status `403` | **PASS** |
| **TC-019** | Rekomendasi AI ("Bantu Saya Pilih") | Pelanggan memasukkan kebutuhan bahasa alami untuk perjalanan ke Danau Toba | Query: `"Mobil keluarga 7 kursi matic ke Danau Toba budget 500rb/hari"` | Mengembalikan maksimal 3 unit nyata yang tersedia beserta alasan Bahasa Indonesia dan skor kecocokan | Panel menampilkan 3 rekomendasi relevan beserta tombol "Pilih Unit Ini" | **PASS** |
| **TC-020** | Ekspor CSV & Cron Housekeeping | Admin mengunduh laporan CSV dan sistem menjalankan housekeeping pesanan lewat 24 jam | `GET /api/bookings?format=csv` & `GET /api/cron/housekeeping` | Mengunduh berkas `.csv` valid; pesanan `pending` yang melewati `expires_at` otomatis menjadi `expired` | Berkas CSV terunduh dan cron mengubah pesanan kedaluwarsa menjadi `expired` | **PASS** |

---

## 4.3 Hasil Eksekusi End-to-End (Playwright)

Berkas spesifikasi E2E: `website/tests/e2e/rentgo.spec.ts`
Perintah eksekusi:
```bash
cd website && npx playwright test
```

Seluruh skenario E2E pada `tests/e2e/rentgo.spec.ts` menguji alur penuh dari browser Chromium:
1. **E2E-01 & E2E-08:** Verifikasi pemblokiran akses langsung `/site/admin` (HTTP 404), tampilan gate login saat belum terautentikasi, dan halaman `HTTP 403 - Akses Ditolak` saat pengguna ber-role `customer` mengakses panel Admin.
2. **E2E-02:** Admin masuk, menambahkan unit kendaraan baru (`Honda HR-V SE Turbo`), dan memverifikasi unit tersebut langsung tampil di katalog publik (`/?site=book`).
3. **E2E-03 & E2E-04:** Pelanggan masuk, memilih kendaraan, melakukan checkout, mengunggah bukti pembayaran, melihat pesanan di "Pesanan Saya", lalu Admin memverifikasi pembayaran (`paid`) dan menjalankan siklus penuh `pending -> confirmed -> ongoing -> completed`.
4. **E2E-05:** Pelanggan membuat pesanan `pending`, membatalkannya sendiri (`cancelled`), dan memverifikasi kendaraan kembali tersedia di katalog pada tanggal yang sama.
5. **E2E-06:** Verifikasi bahwa kendaraan yang sedang berada dalam jadwal perawatan aktif (`BK 1601 RGO`) otomatis disembunyikan dari pencarian ketersediaan pelanggan.
6. **E2E-07:** Verifikasi fitur **Rekomendasi Kendaraan Cerdas ("Bantu Saya Pilih")** menghasilkan kartu rekomendasi kendaraan yang valid dan tersedia.

---

## 4.4 Bukti Visual Antarmuka (`website/docs/screenshots/`)

Seluruh tangkapan layar berikut dihasilkan secara otomatis dari aplikasi yang berjalan menggunakan skrip `npm run docs:screens` (`scripts/capture-screenshots.mjs`):
- `docs/screenshots/01-landing-hero.png` - Hero Split-Layout & Pencarian Cepat (`rentgo.my.id`)
- `docs/screenshots/02-landing-fleet-pricing.png` - Katalog Armada Unggulan & Transparansi Harga (`rentgo.my.id`)
- `docs/screenshots/03-book-catalog.png` - Pencarian Ketersediaan Real-Time WIB (`book.rentgo.my.id`)
- `docs/screenshots/04-book-ai-recommend.png` - Panel Rekomendasi AI "Bantu Saya Pilih" (`book.rentgo.my.id`)
- `docs/screenshots/05-book-checkout.png` - Detail Unit, Kalkulator Harga, & Formulir Checkout (`book.rentgo.my.id`)
- `docs/screenshots/06-book-my-bookings.png` - Halaman Pesanan Saya & Konfirmasi Pembayaran (`book.rentgo.my.id`)
- `docs/screenshots/07-admin-dashboard.png` - Dasbor Analitik KPI, Grafik Pendapatan, & Matriks Ketersediaan (`admin.rentgo.my.id`)
- `docs/screenshots/08-admin-vehicles.png` - Manajemen Armada Kendaraan (`admin.rentgo.my.id/vehicles`)
- `docs/screenshots/09-admin-bookings.png` - Manajemen Pesanan, State Machine, & Ekspor CSV (`admin.rentgo.my.id/bookings`)
- `docs/screenshots/10-admin-maintenance.png` - Manajemen Jadwal Perawatan & Servis (`admin.rentgo.my.id/maintenance`)
