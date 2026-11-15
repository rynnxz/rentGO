# Bab 4: Pengujian Sistem (Software Testing) - RentGo Medan

Dokumen ini menyajikan metodologi, prosedur pelaksanaan langkah-demi-langkah, kasus uji, dan hasil pengujian aktual untuk aplikasi **RentGo Medan (Sistem Manajemen Penyewaan Kendaraan)**. Pengujian dilakukan dalam tiga lapisan terintegrasi:
1. **Pengujian Unit (Unit Testing - Vitest):** Menguji kemurnian logika bisnis (`pricing`, `booking-state`, `validators`, `availability`, `ai`).
2. **Pengujian Fungsional Black-Box (`TC-001` s/d `TC-020`):** Memverifikasi setiap kebutuhan fungsional (`FR-01` s/d `FR-19`) dari sudut pandang pengguna akhir dan kontrak HTTP API tanpa menginspeksi struktur kode internal.
3. **Pengujian End-to-End Otomatis (Playwright E2E):** Menjalankan browser Chromium headless terhadap aplikasi nyata untuk memvalidasi alur pelanggan dan administrator.

---

## 4.1 Metodologi & Prosedur Pelaksanaan Pengujian Black-Box (Cara Tes)

Agar pengujian **Black-Box** dapat direproduksi secara objektif, pengujian dilaksanakan dengan tahapan dan teknik berikut:

### A. Tiga Teknik Desain Kasus Uji Black-Box yang Digunakan
1. **Equivalence Partitioning (EP):**
   - Membagi domain input ke dalam kelas partisi **Valid** dan **Tidak Valid**.
   - *Contoh penerapan:* Pengujian akses halaman `admin.rentgo.my.id` dibagi menjadi 3 partisi sesi: (a) Tanpa sesi login -> wajib tampil Gate Login, (b) Sesi ber-role `customer` (`nadia.siregar@gmail.com`) -> wajib ditolak `HTTP 403 Forbidden`, dan (c) Sesi ber-role `admin` (`akbarriansyah339@gmail.com`) -> wajib diizinkan masuk (`HTTP 200 OK`).
2. **Boundary Value Analysis (BVA):**
   - Menguji nilai tepat pada batas bawah, batas atas, dan tepat di luar batas aturan bisnis.
   - *Contoh penerapan:*
     - **Durasi Sewa Minimum:** `start_date == end_date` (`2026-12-15` s/d `2026-12-15`) harus dihitung tepat **1 hari inklusif** (`total_days = 1`), sedangkan `end_date < start_date` ditolak dengan `HTTP 400`.
     - **Batas Irisan Tanggal Booking:** Jika Pesanan A menyewa tanggal `10 s/d 12`, maka Pesanan B pada unit yang sama untuk tanggal `12 s/d 14` (beririsan tepat di tanggal `12`) wajib ditolak dengan `HTTP 409 Conflict`, sedangkan tanggal `13 s/d 14` berhasil (`HTTP 201 Created`).
     - **Batas Rate Limit AI Gemini (10 Respons/Menit):** Permintaan ke-1 hingga ke-10 dalam jendela waktu 60 detik berhasil (`HTTP 200`), sedangkan permintaan ke-11 dalam menit yang sama wajib ditolak dengan `HTTP 429 Too Many Requests`.
3. **State Transition Testing (Pengujian Transisi Status):**
   - Menguji perpindahan state pada mesin status pesanan (`bookings.status`) dan pembayaran (`payments.status`).
   - *Contoh penerapan:*
     - Saat checkout dibuat, status awal adalah `booking: pending` dan `payment: unpaid (method: qris)`.
     - Saat pelanggan menekan tombol **"Sudah Bayar (Simulasi QRIS Midtrans Sandbox)"**, status pembayaran berpindah `unpaid -> paid`.
     - Saat Admin menekan tombolurutan aksi pada tabel Pesanan, status pesanan berpindah `pending -> confirmed -> ongoing -> completed`. Percobaan transisi ilegal (misalnya `completed -> pending` atau pembatalan oleh pelanggan saat sudah `confirmed`) wajib ditolak.

### B. Langkah-Langkah Cara Melakukan Tes (Prosedur Uji)
1. **Persiapan Lingkungan Uji:**
   - Jalankan server aplikasi di lokal (`cd website && npm run dev` pada port `3000`) dengan kredensial `.env.local` aktif (Firebase `rentgo-medan`, Supabase `honhszsloegvpbmczkqf`, Midtrans Sandbox `rentgo-test`, dan Gemini `gemini-flash-latest`).
2. **Eksekusi Skenario Uji Manual / Browser:**
   - Buka masing-masing permukaan (`http://localhost:3000/?site=landing`, `/?site=book`, `/?site=admin`).
   - Masukkan data uji sesuai kolom **Data Masukan** pada Tabel 4.3, lakukan aksi klik atau submit formulir, lalu amati respons UI (banner status, perubahan badge, kode QRIS, atau pesan galat) dan kode status HTTP pada tab *Network* DevTools.
3. **Eksekusi Verifikasi Otomatis:**
   - Jalankan `npm test` untuk mengeksekusi 21 pengujian unit Vitest dan `npx playwright test` untuk mengeksekusi 6 suite E2E otomatis di browser Chromium.

---

## 4.2 Ringkasan Eksekusi Pengujian Unit (Vitest)

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
| `tests/unit/ai.test.ts` | 2 | Sanitasi anti-halusinasi ID kendaraan serta rekomendasi deterministik berbasis aturan skor sesuai jumlah penumpang dan budget | **PASS (2/2)** |
| **Total** | **21** | **Seluruh modul logika inti pada `src/lib/`** | **21 PASS / 0 FAIL** |

---

## 4.3 Tabel Pengujian Black-Box Lengkap (`TC-001` s/d `TC-020`)

| ID Kasus Uji | Fitur & Teknik Uji | Cara Tes (Prosedur Langkah Uji) | Data Masukan (Input) | Hasil yang Diharapkan (Expected) | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-001** | Routing Multi-Subdomain *(EP)* | Buka `/?site=landing`, amati komponen navbar sticky, logo Triadik, dan kartu armada foto asli. | `GET /?site=landing` | Menampilkan halaman Landing 10 bagian dengan foto kendaraan asli dari `public/vehicles/` & JSON-LD | Halaman Landing tampil lengkap dengan foto asli Honda Brio, Agya, Avanza, Xenia, NMAX, Vario | **PASS** |
| **TC-002** | Proteksi Path Internal *(EP)* | Ketik URL `/site/admin` atau `/site/book` secara langsung di bilah alamat browser. | `GET /site/admin` | Middleware memblokir akses langsung ke path internal `/site/*` dan mengembalikan HTTP 404 | Server mengembalikan halaman `404 Not Found` | **PASS** |
| **TC-003** | Login Firebase (Email/Password & Google) *(EP)* | Klik tombol **Masuk / Daftar**, pilih tab Email/Password atau Google Sign-In (`rentgo-medan`) / Akun Demo Customer. | Email `nadia.siregar@gmail.com` | Cookie HTTP-only `__session` terbentuk, profil tersimpan di tabel `users` dengan role `customer` | Sesi aktif dan header menampilkan `Nadia Siregar (CUSTOMER)` | **PASS** |
| **TC-004** | Penetapan Role Admin Otomatis *(EP)* | Login menggunakan akun Admin (`akbarriansyah339@gmail.com`) lalu buka `/?site=admin`. | Email `akbarriansyah339@gmail.com` | Pengguna otomatis memperoleh role `admin` dan dapat membuka dasbor `admin.rentgo.my.id` | Pengguna masuk dengan role `ADMIN` dan dasbor KPI tampil | **PASS** |
| **TC-005** | Proteksi RBAC Halaman Admin *(EP)* | Login sebagai `customer`, lalu akses halaman `/?site=admin`. | Sesi `customer` pada `/?site=admin` | Menampilkan halaman `HTTP 403 - Akses Ditolak` dan menyembunyikan seluruh menu operasional admin | Halaman `HTTP 403 - Akses Ditolak` tampil (`data-testid="admin-access-denied"`) | **PASS** |
| **TC-006** | Proteksi RBAC Endpoint API Admin *(EP)* | Kirim request `POST /api/vehicles` menggunakan sesi cookie `customer`. | Payload JSON kendaraan baru dengan sesi `customer` | Server menolak dengan kode status HTTP `403 Forbidden` | Respon JSON `{ error: "Akses ditolak..." }` dengan status `403` | **PASS** |
| **TC-007** | CRUD Kategori Armada *(EP)* | Di `/categories`, klik **Tambah Kategori**, simpan, lalu coba hapus kategori yang masih dipakai unit aktif. | `POST /api/categories` lalu `DELETE /api/categories/[id]` | Penambahan berhasil (`201`); penghapusan kategori yang masih dipakai kendaraan aktif ditolak (`400`) | Kategori baru tersimpan; penghapusan kategori aktif ditolak dengan pesan jelas | **PASS** |
| **TC-008** | CRUD Kendaraan & Upload Cloud *(EP)* | Di `/vehicles`, klik **Tambah Kendaraan**, isi form, pilih foto/upload ke Supabase Storage, lalu simpan. | `Honda HR-V SE Turbo`, Plat `BK 8xxx ETE`, `Rp 580.000` | Kendaraan tersimpan di database dan langsung muncul di katalog publik `book.rentgo.my.id` | Kendaraan tampil di tabel Admin dan di katalog pelanggan | **PASS** |
| **TC-009** | Soft Delete Kendaraan *(State)* | Klik tombol **Hapus** pada baris unit kendaraan yang tidak memiliki pesanan aktif. | `DELETE /api/vehicles/[id]` | Kolom `deleted_at` terisi, status menjadi `inactive`, dan unit hilang dari katalog publik tanpa merusak histori | Unit dinonaktifkan secara soft delete dan tidak tampil di katalog | **PASS** |
| **TC-010** | Pencarian Ketersediaan Tanggal WIB *(BVA)* | Pilih tanggal mulai & selesai pada bar pencarian di `/?site=book`, lalu klik **Cari Ketersediaan**. | `start=2026-11-15`, `end=2026-11-16` | Hanya menampilkan kendaraan `active` yang tidak memiliki booking aktif atau jadwal perawatan pada tanggal tersebut | Katalog menyaring unit secara akurat sesuai tanggal WIB | **PASS** |
| **TC-011** | Eksklusi Kendaraan dalam Perawatan *(State)* | Cari kendaraan pada rentang tanggal saat `Toyota Rush GR (BK 1601 RGO)` berstatus `in_progress` di tabel servis. | `start=2026-11-15`, `end=2026-11-16` | `BK 1601 RGO` tidak muncul di katalog ketersediaan pelanggan | `BK 1601 RGO` otomatis disembunyikan (`count = 0`) | **PASS** |
| **TC-012** | Kalkulasi Harga Server-Side Inklusif *(BVA)* | Pilih sewa 2 hari inklusif (`2026-12-15` s/d `2026-12-16`) pada Honda Brio RS (`Rp 320.000/hari`) dan lakukan checkout. | `start_date: 2026-12-15`, `end_date: 2026-12-16` | Server menghitung `total_days = 2` dan `total_price = Rp 640.000` tanpa mempercayai input harga dari client | Record booking menyimpan `total_days: 2` dan `total_price: 640000` | **PASS** |
| **TC-013** | Anti Double-Booking Konkuren *(BVA)* | Kirim 2 permintaan `POST /api/bookings` secara paralel untuk unit dan tanggal sewa yang beririsan. | 2 request paralel pada `BK 1124 AAB` (`2026-12-01`..`2026-12-03`) | Tepat 1 booking berhasil (`201 Created`) dan permintaan kedua ditolak (`409 Conflict`) | 1 transaksi sukses, 1 transaksi ditolak dengan pesan bentrok tanggal | **PASS** |
| **TC-014** | Pembayaran QRIS Midtrans Sandbox & Tombol "Sudah Bayar" *(State)* | Setelah checkout QRIS (`rentgo-test`), amati kode QRIS pada halaman detail lalu klik tombol **"Sudah Bayar"**. | Klik `data-testid="simulate-upload-proof-button"` | Kode QRIS Sandbox tampil jelas; saat tombol diklik, `payment.status` langsung berubah menjadi `paid` (`Lunas`) | Status pembayaran berubah menjadi `Lunas` dengan bukti referensi QRIS Sandbox | **PASS** |
| **TC-015** | Konfirmasi WhatsApp Otomatis *(EP)* | Pada halaman detail pesanan, klik tombol **Konfirmasi via WhatsApp Admin**. | Data booking `RG-YYMMDD-XXXX` | Membuka tautan `https://wa.me/6281260009988?text=...` berisi kode booking, nama unit, tanggal, dan total Rupiah | Tautan `wa.me` terbentuk lengkap dengan parameter pesan terenkode | **PASS** |
| **TC-016** | State Machine Booking oleh Admin *(State)* | Di `/bookings` Admin, klik tombol **Verifikasi Lunas**, lalu klik **Konfirmasi**, **Mulai Sewa**, dan **Selesaikan**. | `pending -> confirmed -> ongoing -> completed` | Setiap transisi berhasil dan memperbarui badge status secara berurutan | Seluruh transisi status dan verifikasi lunas berjalan mulus | **PASS** |
| **TC-017** | Pembatalan Mandiri oleh Pelanggan *(State)* | Pelanggan membuka pesanan miliknya yang masih `pending` lalu menekan **Batalkan Pesanan**. | `PATCH /api/bookings/[id]` `{ status: "cancelled" }` | Status berubah menjadi `cancelled` dan unit kendaraan langsung tersedia kembali pada tanggal tersebut | Pesanan dibatalkan dan unit kembali muncul di katalog tanggal tersebut | **PASS** |
| **TC-018** | Proteksi Cross-Role Pesanan Pelanggan *(EP)* | Pelanggan A mencoba mengakses atau mengubah pesanan milik Pelanggan B melalui endpoint `/api/bookings/[id]`. | `GET / PATCH /api/bookings/[id_orang_lain]` | Ditolak dengan status HTTP `403 Forbidden` | Server menolak akses dengan status `403` | **PASS** |
| **TC-019** | Rekomendasi AI Gemini (`gemini-flash-latest`) & Limit 10/Menit *(BVA)* | Isi jumlah penumpang & budget pada panel **Bantu Saya Pilih**, klik **Cari Rekomendasi AI**, dan uji batas 10 request/menit. | Query: `"Liburan keluarga 6 orang ke Berastagi budget 650rb/hari"` | Mengembalikan maksimal 3 unit nyata yang tersedia beserta alasan Bahasa Indonesia; request ke-11 dalam 1 menit ditolak `HTTP 429` | Panel menampilkan rekomendasi relevan & rate limiter 10/menit aktif | **PASS** |
| **TC-020** | Ekspor CSV & Cron Housekeeping *(EP)* | Klik tombol **Unduh CSV** di halaman Pesanan Admin dan panggil `GET /api/cron/housekeeping`. | `GET /api/bookings?format=csv` & `GET /api/cron/housekeeping` | Mengunduh berkas `.csv` valid; pesanan `pending` yang melewati `expires_at` otomatis menjadi `expired` | Berkas CSV terunduh dan cron mengubah pesanan kedaluwarsa menjadi `expired` | **PASS** |

---

## 4.4 Hasil Eksekusi End-to-End (Playwright)

Berkas spesifikasi E2E: `website/tests/e2e/rentgo.spec.ts`
Perintah eksekusi:
```bash
cd website && npx playwright test
```

Seluruh 6 suite E2E pada `tests/e2e/rentgo.spec.ts` menguji alur penuh dari browser Chromium:
1. **E2E-01 & E2E-08:** Verifikasi pemblokiran akses langsung `/site/admin` (HTTP 404), tampilan gate login saat belum terautentikasi, dan halaman `HTTP 403 - Akses Ditolak` saat pengguna ber-role `customer` mengakses panel Admin.
2. **E2E-02:** Admin masuk, menambahkan unit kendaraan baru (`Honda HR-V SE Turbo`), dan memverifikasi unit tersebut langsung tampil di katalog publik (`/?site=book`).
3. **E2E-03 & E2E-04:** Pelanggan masuk, memilih kendaraan, melakukan checkout QRIS Midtrans Sandbox, menekan tombol **"Sudah Bayar"**, melihat pesanan di "Pesanan Saya", lalu Admin memverifikasi pembayaran (`paid`) dan menjalankan siklus penuh `pending -> confirmed -> ongoing -> completed`.
4. **E2E-05:** Pelanggan membuat pesanan `pending`, membatalkannya sendiri (`cancelled`), dan memverifikasi kendaraan kembali tersedia di katalog pada tanggal yang sama.
5. **E2E-06:** Verifikasi bahwa kendaraan yang sedang berada dalam jadwal perawatan aktif (`BK 1601 RGO`) otomatis disembunyikan dari pencarian ketersediaan pelanggan.
6. **E2E-07:** Verifikasi fitur **Rekomendasi Kendaraan Cerdas ("Bantu Saya Pilih")** berbasis Gemini AI menghasilkan kartu rekomendasi kendaraan yang valid dan tersedia.
