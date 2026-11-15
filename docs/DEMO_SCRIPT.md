# Skenario & Naskah Demo Presentasi UTS (3 - 5 Menit)

Dokumen ini merupakan panduan langkah-demi-langkah bagi **Akbar Riansyah** saat mendemonstrasikan aplikasi **RentGo Medan (v1.2.0)** di hadapan dosen penguji mata kuliah **Metode Model Pengembangan Perangkat Lunak (MMPRPL)**.

---

## Persiapan Sebelum Demo (30 Detik)
1. Pastikan server lokal aktif di `http://localhost:3000` (`cd website && npm run dev`) atau buka domain produksi `https://rentgo.my.id`.
2. Siapkan dek presentasi **Slidev** di tab sebelah (`cd slidev && npm run dev` atau buka PDF di `laporan/slides/presentasi-rentgo-uts.pdf`).
3. Pastikan kondisi awal belum login (klik **Keluar** jika masih ada sesi aktif).

---

## Alur Demo Langsung (7 Skenario Inti - Durasi Total ~4 Menit)

### Menit 0:00 - 0:45 | Alur 1: Landing Page Publik, Identitas Triadik, & Single-Domain (`/` -> `/book`)
1. **Buka `http://localhost:3000/`**
   - Tunjukkan **Logo Typography Editorial (`RENTGO. MDN`)** dengan 3 bilah aksen kecepatan **Teori Warna Triadik** (Cobalt 60%, Emerald-Teal 30%, Warm Amber 10%) serta **Navbar 1 Baris Sticky** yang tetap rapi baik sebelum maupun sesudah login.
   - Scroll singkat melewati kartu **Armada Unggulan** (foto asli unit plat `BK` Sumatera Utara), bagian **Mengapa RentGo Medan**, tabel **Transparansi Tarif Harian**, dan **FAQ**.
2. **Gunakan Pencarian Cepat Tanggal (WIB):**
   - Pilih Tanggal Mulai `2026-12-15` dan Tanggal Selesai `2026-12-16`, lalu klik tombol **"Cek Ketersediaan Unit"**.
   - Jelaskan bahwa halaman berpindah ke `/book` pada domain yang sama (**Single-Domain Architecture**).

---

### Menit 0:45 - 1:30 | Alur 2: Smart AI Recommendation ("Bantu Saya Pilih") & Rate Limit 10/Menit
1. **Di halaman `/book`, fokus ke panel "Bantu Saya Pilih Kendaraan (Asisten AI Gemini)":**
   - Klik tombol pintasan **"Touring Motor Berdua (Budget 200rb)"** atau ketik langsung:
     > `motor yang cocok untuk touring bareng pacar, budget 200rb maksimal`
   - Klik **"Cari Rekomendasi AI"**.
2. **Tunjukkan Hasil Cerdas AI:**
   - Sistem mengekstraksi niat pengguna (*kategori = motor, kapasitas = 2 penumpang, anggaran <= Rp 200.000/hari*) dan memanggil model Google Gemini.
   - Tunjukkan bahwa hasil rekomendasi menampilkan **Yamaha NMAX 155 Connected (Rp 140.000/hari)** dan **Honda Vario 160 ABS (Rp 120.000/hari)** beserta skor kecocokan (`fit_score`) dan alasan kontekstual rute Medan/Berastagi (bukan lagi mobil 5 kursi!).
   - Tunjukkan juga skenario kedua: klik pintasan **"Rute Keluarga Danau Toba (7 Kursi Matic)"** untuk melihat rekomendasi MPV 7 penumpang.
   - Jelaskan bahwa endpoint `/api/ai/recommend` dilindungi **Sliding Window Rate Limiter 10 respons/menit** (`HTTP 429`) dan **Anti-Halusinasi `vehicle_id`**.

---

### Menit 1:30 - 2:15 | Alur 3: Penyembunyian Otomatis Unit yang Sedang Servis Bengkel (`FR-15`)
1. **Masih di `/book`, ubah filter tanggal ke `2026-11-15` s/d `2026-11-16` lalu klik "Perbarui Ketersediaan":**
   - Tunjukkan bahwa unit **Toyota Hiace Premio (`BK 7099 AAL`)** **tidak muncul** di katalog pada tanggal tersebut karena sedang berstatus `in_progress` (Servis Sistem Rem & Ganti Kampas) pada tanggal `14 - 18 November 2026`.
   - Ubah kembali tanggal ke `2026-12-15` s/d `2026-12-16` -> unit **Toyota Hiace Premio (`BK 7099 AAL`)** langsung muncul kembali sebagai tersedia.

---

### Menit 2:15 - 3:00 | Alur 4: 1x Login Terpadu, Checkout Inklusif WIB, & Simulasi QRIS Midtrans Sandbox
1. **Klik tombol "Masuk / Daftar" di kanan atas navbar:**
   - Tunjukkan bahwa modal mendukung **Google OAuth Popup (`rentgo-medan`)**, **Email/Password**, serta **Akun Demo Pengujian 1-Klik**.
   - Klik akun **Customer: Nadia Siregar (`nadia.siregar@gmail.com`)**.
2. **Pilih unit `Toyota Avanza 1.5 G CVT (BK 1750 AAD)` (Rp 420.000/hari):**
   - Di halaman `/book/vehicles/veh-avanza`, pastikan tanggal sewa `2026-12-15` s/d `2026-12-16`.
   - Tunjukkan rumus server-side inklusif: `(16 - 15) + 1 = 2 Hari x Rp 420.000 = Rp 840.000`.
   - Klik **"Buat Pesanan & Tampilkan QRIS Sekarang"**.
3. **Di Halaman Detail Pesanan (`/book/bookings/[id]`):**
   - Tunjukkan kode unik pesanan (`RG-261115-XXXX`), matriks **Kode QRIS Dinamis Midtrans Sandbox (`rentgo-test`)**, dan status awal `Menunggu Pembayaran (PENDING)`.
   - Klik tombol hijau **"Sudah Bayar (Simulasi Sandbox Instan)"** -> status pembayaran langsung berubah menjadi **`PAID (Lunas)`** dan status pesanan menjadi **`CONFIRMED`**.

---

### Menit 3:00 - 3:40 | Alur 5: Bukti Proteksi RBAC (`HTTP 403`) & Pencegahan Double-Booking (`HTTP 409`)
1. **Proteksi RBAC Pelanggan (`HTTP 403`):**
   - Saat masih login sebagai **Nadia Siregar (Customer)**, ubah URL browser ke `http://localhost:3000/admin`.
   - Tunjukkan bahwa sistem menolak akses dengan halaman **`HTTP 403 - Akses Ditolak (Akun Pelanggan Tidak Memiliki Hak Admin)`**.
   - Tunjukkan juga bahwa membuka URL internal `http://localhost:3000/site/admin` secara langsung diblokir oleh Edge Middleware dengan **`HTTP 404`**.
2. **Pencegahan Double-Booking (`HTTP 409 Conflict`):**
   - Kembali ke `/book/vehicles/veh-avanza` dan coba pesan kembali unit `BK 1750 AAD` pada tanggal yang sama (`2026-12-15` s/d `2026-12-16`).
   - Klik submit -> sistem langsung menolak dengan banner merah **`HTTP 409 Conflict: Kendaraan sudah dipesan atau sedang dalam perawatan pada rentang tanggal tersebut`**.

---

### Menit 3:40 - 4:30 | Alur 6 & 7: Panel Operasional Admin (`/admin`) & Siklus Penuh State Machine
1. **Klik "Keluar", lalu klik "Masuk / Daftar" dan pilih akun `Admin: Akbar Riansyah (`akbarriansyah339@gmail.com`)`:**
   - Perhatikan di navbar bahwa sekali login sebagai Admin, Anda dapat berpindah bebas antara `/`, `/book`, dan `/admin` tanpa perlu login ulang (**1x Login Single-Domain**), dan navbar tetap rapi dalam 1 baris.
2. **Buka `/admin` (Dasbor Operasional KPI):**
   - Tunjukkan 6 kartu metrik KPI real-time (Total Armada, Unit Tersedia Hari Ini, Sedang Disewa, Dalam Perawatan, Menunggu Konfirmasi, dan Pendapatan Bulan Ini).
3. **Buka `/admin/bookings` (Manajemen Pesanan & State Machine):**
   - Cari baris pesanan `RG-261115-XXXX` milik Nadia Siregar.
   - Tunjukkan desain kolom **Aksi 1 Baris** beserta tombol **"Semua Aksi (+N)"** yang membuka modal `<dialog>` berheader Navy rapi.
   - Klik **"Mulai Sewa (Ongoing)"** (`confirmed -> ongoing`), lalu klik **"Selesaikan Sewa"** (`ongoing -> completed`).
4. **Penutup Demo:**
   - Tunjukkan terminal hasil pengujian otomatis (`21/21 Unit Test Vitest PASS` dan `6 Blok Uji / 8 Skenario E2E Playwright PASS`).
