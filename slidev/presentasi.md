# Buku Pegangan Presentasi & Pendalaman Teknis UTS — RentGo Medan (`v1.2.0`)

**Identitas Mahasiswa & Proyek:**
- **Nama Mahasiswa:** Akbar Riansyah
- **Proyek Individu:** No. 2 — Sistem Manajemen Penyewaan Kendaraan (**RentGo Medan**)
- **Domain Produksi (Live):** [https://rentgo.my.id](https://rentgo.my.id) (`/`, `/book`, `/admin`)
- **Program Studi:** Teknologi Rekayasa Perangkat Lunak (TRPL) — Semester III
- **Mata Kuliah:** Metode Model Pengembangan Perangkat Lunak (MMPRPL)
- **Institusi:** Politeknik Wilmar Bisnis Indonesia (PWBI), Medan

---

## Daftar Isi Dokumen Ini
1. **[Bagian I — Strategi Penyampaian & Manajemen Waktu (10–12 Menit)](#bagian-i--strategi-penyampaian--manajemen-waktu-1012-menit)**
2. **[Bagian II — Alur & Naskah Bicara Slide-demi-Slide (Slide 01 s/d Slide 16)](#bagian-ii--alur--naskah-bicara-slide-demi-slide-slide-01-sd-slide-16)**
3. **[Bagian III — Urutan Klik Saat Live Demo di `rentgo.my.id` (Slide 16)](#bagian-iii--urutan-klik-saat-live-demo-di-rentgomyid-slide-16)**
4. **[Bagian IV — Penjelasan Teknis Mendalam (Deep-Dive Engineering Reference)](#bagian-iv--penjelasan-teknis-mendalam-deep-dive-engineering-reference)**
   - 4.1. Arsitektur *Single-Domain Multi-Surface* (`1x Login`) & *Edge Middleware*
   - 4.2. Mekanisme *2-Layer Anti Double-Booking Guard* (`SELECT ... FOR UPDATE` + `GiST Exclusion Constraint`)
   - 4.3. Kalkulasi Tarif Inklusif Zona Waktu WIB (`Asia/Jakarta`) & Pencegahan Manipulasi Harga Client
   - 4.4. Bedah Skema Basis Data Relasional 7 Tabel (ERD, *Foreign Key*, *Soft-Delete*, & Kardinalitas)
   - 4.5. Mesin Status (*State Machine*) Siklus Hidup Pesanan & *Housekeeping Auto-Expire* 24 Jam
   - 4.6. Integrasi Pembayaran QRIS Midtrans Sandbox (`rentgo-test`)
   - 4.7. Asisten Rekomendasi AI Google Gemini Flash, *Anti-Halusinasi*, & *Sliding-Window Rate Limiter* (10/Menit)
   - 4.8. Geolokasi 3 Titik Jemput Medan & Rumus Matematika *Haversine*
   - 4.9. Metodologi Pengujian Kualitas (*Equivalence Partitioning*, *Boundary Value Analysis*, *State Transition*, Vitest, & Playwright)
   - 4.10. *Dual-Mode Persistence Repository* & Pipeline Cloud Tanpa Biaya (*Zero-Cost Cloud*)
5. **[Bagian V — Bank Pertanyaan & Jawaban Kritis Dosen Penguji (Q&A Defense)](#bagian-v--bank-pertanyaan--jawaban-kritis-dosen-penguji-qa-defense)**

---

# Bagian I — Strategi Penyampaian & Manajemen Waktu (10–12 Menit)

Agar penyampaian terasa seperti *keynote* profesional (tenang, meyakinkan, dan menguasai penuh aspek rekayasa perangkat lunak), bagi waktu presentasi menjadi **4 babak**:

| Babak | Cakupan Slide | Alokasi Waktu | Fokus Intonasi & Tujuan |
| :--- | :--- | :--- | :--- |
| **1. Hook & Konteks Bisnis** | Slide 01 – 04 | **2,5 Menit** | Buka dengan tegas, tunjukkan bahwa sistem **sudah online di `https://rentgo.my.id`**, angkat masalah nyata rental di Medan (bentrok jadwal plat `BK`), lalu jelaskan alasan memilih **SDLC Incremental**. |
| **2. Arsitektur & Inti Teknis** | Slide 05 – 09 | **3,5 Menit** | Ini bagian paling berbobot secara akademik. Tekankan **Arsitektur 4-Tier**, **1x Login Single-Domain**, **ERD 7 Tabel**, dan **Kunci Atomik Anti Double-Booking (`SELECT ... FOR UPDATE` + `GiST`)**. |
| **3. Alur, Desain, & Kualitas Uji** | Slide 10 – 14 | **2,5 Menit** | Tunjukkan simulasi 7 langkah dengan kursor otomatis, peta Haversine Medan, **49 pengujian yang lulus 100%**, serta pipeline cloud Rp 0/bulan. |
| **4. Live Demo Produksi** | Slide 15 – 16 | **3,0 Menit** | Biarkan animasi *Game Loading* di Slide 15 membangun antusiasme, lalu masuk ke Slide 16 dan demonstrasikan langsung **`https://rentgo.my.id`** (baik di dalam *iframe* slide maupun tab baru). |

> **Tips Emas Saat Tampil:**
> - Jangan membaca teks di slide kata demi kata. Slide sudah dirancang minimalis (*maksimal 15–25 kata*), sehingga mata dosen akan fokus pada visual di layar sementara telinga mereka mendengarkan penjelasanmu.
> - Setiap kali ada tanda **`[TEKAN SPASI / KLIK]`** di naskah bawah ini, tekan tombol **Spasi** atau **Panah Kanan (`→`)** pada keyboard untuk memicu animasi bertahap di Slidev.

---

# Bagian II — Alur & Naskah Bicara Slide-demi-Slide (Slide 01 s/d Slide 16)

---

### Slide 01 — Cover / Cold Open (`RentGo Medan v1.2.0`)
- **Apa yang tampil di layar:** Logo `RENTGO. MDN` mengetik otomatis dengan 3 bilah aksen kecepatan (*Electric Triadic*), *tagline* *"Satu Domain. Nol Bentrok. Siap Jalan."*, tautan aktif **`https://rentgo.my.id`**, dan kartu unit *Honda Brio Satya RS BK 1124 AAB*.
- **Kalimat Penyampaian (Bicara):**
  > *"Selamat pagi/siang/sore Bapak/Ibu Dosen penguji mata kuliah Metode Model Pengembangan Perangkat Lunak (MMPRPL). Perkenalkan saya **Akbar Riansyah** dari program studi **TRPL Semester III Politeknik Wilmar Bisnis Indonesia**. Pada kesempatan ini saya mempresentasikan Proyek Individu Nomor 2, yaitu **RentGo Medan versi 1.2.0** — sebuah platform manajemen penyewaan mobil dan sepeda motor real-time untuk wilayah Kota Medan dan Bandara Kualanamu yang saat ini **sudah aktif beroperasi secara online di domain `https://rentgo.my.id`**."*
- **Kalimat Jembatan ke Slide 02:**
  > *"Mengapa sistem ini perlu dibangun? Mari kita lihat empat masalah nyata yang terjadi di lapangan."* **`[TEKAN PANAH KANAN →]`**

---

### Slide 02 — Masalah Operasional (`Empat Kendala Rental Manual`)
- **Apa yang tampil di layar:** Panggung tabrakan *Double-Booking* di bagian atas (Pelanggan A via WhatsApp vs Pelanggan B Walk-In Bandara Kualanamu berebut *Honda Brio BK 1124 AAB* di tanggal 20–22 November) dan 4 kartu masalah yang muncul bertahap.
- **Kalimat Penyampaian (Bicara):**
  > *"Operasional rental kendaraan konvensional di Medan yang masih mengandalkan buku catatan atau spreadsheet terpisah menghadapi empat kendala kritis:*
  > - *(Saat kartu 1 aktif)* **Pertama, risiko Double-Booking.** Ketika admin menerima pesanan via WhatsApp di saat bersamaan dengan pelanggan walk-in di Bandara Kualanamu untuk plat nomor `BK 1124 AAB` yang sama pada tanggal 20 sampai 22 November, terjadi bentrok jadwal karena tidak adanya penguncian baris transaksi di database.
  > - **`[TEKAN SPASI]`** **Kedua, jadwal bengkel yang terpisah.** Unit yang sedang ganti oli atau servis rem di bengkel masih tampil seolah-olah siap disewa di katalog pelanggan.
  > - **`[TEKAN SPASI]`** **Ketiga, kalkulasi tarif dan bukti bayar manual.** Perhitungan jumlah hari sewa inklusif sering salah hitung dan verifikasi pembayaran di chat tidak dikontrol oleh State Machine yang baku.
  > - **`[TEKAN SPASI]`** **Keempat, kebingungan wisatawan memilih spesifikasi unit.** Banyak penyewa luar kota salah memilih kendaraan untuk medan tanjakan seperti rute Medan menuju Berastagi atau Danau Toba."*
- **Kalimat Jembatan ke Slide 03:**
  > *"Keempat masalah tersebut kami selesaikan dalam satu ekosistem terpadu."* **`[TEKAN PANAH KANAN →]`**

---

### Slide 03 — Solusi Terpadu (`Satu Domain. Tiga Permukaan. Satu Login.`)
- **Apa yang tampil di layar:** Kartu *Honda Brio BK 1124 AAB* yang tadinya merah (bentrok) di Slide 2 kini **bertransformasi (morph)** masuk ke dalam layar *iPhone 16 Pro* dengan status hijau `✓ TERKUNCI ATOMIK`, berdampingan dengan *MacBook Pro* yang menampilkan `https://rentgo.my.id`.
- **Aksi Interaktif (Opsional):** Kamu bisa mengklik tombol kecil `/`, `/book`, dan `/admin` di pojok kanan atas browser MacBook pada slide untuk memperlihatkan pergantian layar.
- **Kalimat Penyampaian (Bicara):**
  > *"Solusi kami adalah **RentGo Medan v1.2.0** yang berjalan di atas arsitektur **Single-Domain Multi-Surface** pada domain **`rentgo.my.id`**. Berbeda dengan arsitektur multi-subdomain yang memaksa pengguna login berulang kali karena isolasi cookie browser, di RentGo seluruh permukaan — mulai dari halaman **Landing Publik (`/`)**, **Katalog & Pemesanan (`/book`)**, hingga **Panel Operasional Admin (`/admin`)** — berbagi satu sesi cookie `HttpOnly` yang sama (`__session`). Cukup **satu kali login**, dan setiap transaksi sewa langsung dikunci secara atomik di database."* **`[TEKAN PANAH KANAN →]`**

---

### Slide 04 — Model Pengembangan SDLC (`Lima Increment. Teruji Sejak Awal.`)
- **Apa yang tampil di layar:** 5 kartu tahapan **SDLC Incremental** dari `v0.1.0` hingga `v1.2.0` yang mekar satu per satu setiap kali tombol Spasi ditekan, disertai bilah perbandingan metodologi di bagian bawah.
- **Kalimat Penyampaian (Bicara):**
  > *"Dalam membangun RentGo Medan, kami menggunakan metodologi **SDLC Incremental** yang dibagi menjadi lima rilis terukur:*
  > - *(Increment 0 — `v0.1.0`)* **Foundation & Auth**: Membangun fondasi routing Single-Domain, skema 7 tabel PostgreSQL di Supabase, dan autentikasi Firebase Auth-Only.
  > - **`[TEKAN SPASI]`** *(Increment 1 — `v0.2.0`)* **Admin & Armada**: Menyelesaikan CRUD kendaraan, kategori, pencatatan jadwal servis bengkel, mekanisme soft-delete, serta proteksi RBAC Admin (`HTTP 403`).
  > - **`[TEKAN SPASI]`** *(Increment 2 — `v0.3.0`)* **Anti Double-Booking & QRIS**: Mengimplementasikan jantung transaksi, yaitu kunci baris atomik `SELECT ... FOR UPDATE`, kalkulasi tarif inklusif WIB, dan pembayaran QRIS Midtrans Sandbox.
  > - **`[TEKAN SPASI]`** *(Increment 3 — `v0.4.0`)* **AI Gemini & Peta**: Menambahkan asisten cerdas Google Gemini Flash dengan rate limit 10 respons per menit serta peta interaktif Leaflet dengan rumus jarak Haversine.
  > - **`[TEKAN SPASI]`** *(Increment 4 — `v1.2.0`)* **Triadic Design & Full QA**: Merombak antarmuka dengan Teori Warna Triadik (Light & Dark Mode) dan memverifikasi sistem lewat 49 pengujian otomatis dan black-box.
  >
  > *Mengapa kami memilih **Incremental** dibanding Waterfall, Prototype, atau Agile Scrum? Karena pada aplikasi penyewaan kendaraan, fitur berisiko tinggi seperti pencegahan double-booking harus sudah diuji pada database nyata sejak pertengahan proyek (`v0.3.0`), bukan ditunda di akhir seperti Waterfall. Selain itu, sebagai pengembang tunggal (solo developer), Incremental jauh lebih efisien daripada Agile Scrum yang menuntut seremoni tim harian."* **`[TEKAN PANAH KANAN →]`**

---

### Slide 05 — Fitur Utama (`Enam Pilar Fungsional Inti`)
- **Apa yang tampil di layar:** *Bento Grid 3×2* berisi 6 kapabilitas utama yang menyala bertahap saat diklik.
- **Kalimat Penyampaian (Bicara):**
  > *"Secara fungsional, sistem ditopang oleh enam pilar utama yang memenuhi spesifikasi kebutuhan FR-01 hingga FR-19:*
  > 1. **CRUD Armada & Soft-Delete** — ketika admin menghapus kendaraan, sistem mengisi kolom `deleted_at` tanpa menghapus baris fisik agar histori keuangan pesanan lama tidak rusak.
  > 2. **`[TEKAN SPASI]`** **Booking Anti Double-Booking** — menolak irisan tanggal sewa maupun irisan jadwal bengkel secara otomatis dengan kode status `HTTP 409 Conflict`.
  > 3. **`[TEKAN SPASI]`** **QRIS Midtrans Sandbox (`rentgo-test`)** — menerbitkan matriks QRIS dinamis per kode pesanan dengan fitur simulasi pelunasan instan satu klik.
  > 4. **`[TEKAN SPASI]`** **Rekomendasi AI Gemini Flash** — menyaring armada berdasarkan bahasa alami pelanggan (jumlah kursi, rute, dan budget) dengan proteksi anti-halusinasi dan kuota 10 panggilan per menit.
  > 5. **`[TEKAN SPASI]`** **Peta Lokasi & Haversine** — menghitung jarak garis lengkung bumi ke 3 titik jemput utama di Medan.
  > 6. **`[TEKAN SPASI]`** **Dasbor KPI & 1x Login** — memantau pendapatan lunas, utilisasi armada, dan mengendalikan State Machine pesanan."* **`[TEKAN PANAH KANAN →]`**

---

### Slide 06 — Tech Stack (`Tujuh Teknologi. Empat Lapisan Modern.`)
- **Apa yang tampil di layar:** 7 kartu teknologi muncul satu per satu (klik 1 s/d 6), lalu pada **klik ke-7** ketujuh kartu tersebut **bertransformasi (morph)** menjadi susunan **4-Layer Architecture Stack**.
- **Kalimat Penyampaian (Bicara):**
  > *"Untuk mengeksekusi keenam fitur tersebut, kami menggunakan tujuh teknologi modern dengan pembagian peran yang tegas:*
  > - **Next.js 15 App Router** dengan TypeScript ketat sebagai framework full-stack.
  > - **`[TEKAN SPASI]`** **Leaflet & OpenStreetMap** untuk visualisasi geospasial titik jemput Medan.
  > - **`[TEKAN SPASI]`** **Firebase Authentication** yang digunakan **khusus untuk autentikasi (Auth-Only)** Google OAuth dan Email/Password — tanpa menggunakan Firestore.
  > - **`[TEKAN SPASI]`** **Google Gemini AI** sebagai mesin rekomendasi kontekstual.
  > - **`[TEKAN SPASI]`** **Midtrans Sandbox** untuk gateway pembayaran QRIS.
  > - **`[TEKAN SPASI]`** **Supabase** sebagai pusat basis data relasional PostgreSQL 7 tabel dan penyimpanan foto armada di Cloud Storage.
  > - **`[TEKAN SPASI]`** **Vercel Cloud** untuk deployment serverless otomatis dari GitHub ke domain `rentgo.my.id`.
  > - **`[TEKAN SPASI — MORPH!]`** *Ketika ketujuh teknologi ini disatukan, mereka membentuk empat lapisan arsitektur yang bersih dari Presentation Layer hingga Cloud Data Layer.*" **`[TEKAN PANAH KANAN →]`**

---

### Slide 07 — Arsitektur Sistem (`Arsitektur 4-Tier & Single-Domain`)
- **Apa yang tampil di layar:** 4 kolom Tier dengan jalur paket data SVG yang mengalir dari Tier 1 ke Tier 4, serta 4 kartu konektor di bagian bawah.
- **Kalimat Penyampaian (Bicara):**
  > *"Mari kita bedah aliran satu HTTP request di dalam **Arsitektur 4-Tier** kami:*
  > - **Tier 1 (Presentation Layer):** Pengguna mengakses `/`, `/book`, atau `/admin` di domain `rentgo.my.id` dengan membawa satu cookie sesi `__session`.
  > - **`[TEKAN SPASI]`** **Tier 2 (Edge Middleware — `src/middleware.ts`):** Bertindak sebagai gerbang keamanan. Middleware memetakan path publik ke folder internal `/site/*`, namun jika ada pengguna yang mencoba mengakses URL internal `/site/admin` secara langsung, Middleware langsung memblokirnya dengan **`HTTP 404 Not Found`**.
  > - **`[TEKAN SPASI]`** **Tier 3 (Route Handlers & Domain Logic):** Seluruh input divalidasi menggunakan skema **Zod**, hak akses Admin diperiksa secara ketat (pelanggan yang mencoba masuk ke `/admin` ditolak dengan **`HTTP 403 Forbidden`**), dan tarif sewa dihitung ulang di sisi server dalam zona waktu WIB.
  > - **`[TEKAN SPASI]`** **Tier 4 (Data & Cloud Persistence):** Menyimpan transaksi secara atomik ke Supabase PostgreSQL, memverifikasi UID Firebase, menerbitkan QRIS Midtrans, dan memanggil Gemini AI."* **`[TEKAN PANAH KANAN →]`**

---

### Slide 08 — Basis Data / ERD (`Skema Relasional Tujuh Tabel`)
- **Apa yang tampil di layar:** Papan skema relasional 7 tabel PostgreSQL dengan jalur konektor SVG presisi (`● ──[1:N]──►` dan `● ──[1:1 UNIQUE]──►`) yang menghubungkan setiap Primary Key (`PK`) ke Foreign Key (`FK`) tanpa tertutup kartu, lengkap dengan matriks 6 relasi di bagian bawah.
- **Kalimat Penyampaian (Bicara):**
  > *"Pada Slide ke-8 ini terlihat rancangan **Entity Relationship Diagram (ERD)** basis data PostgreSQL kami di Supabase yang terdiri atas **7 tabel relasional** dalam tiga kelompok:*
  > - *(Tahap 1 — Grup Biru: Master & Identitas)* Tabel **`vehicle_categories`** berelasi **`1 : N` (`ON DELETE RESTRICT`)** ke tabel **`vehicles`**. Artinya, satu kategori seperti MPV menaungi banyak unit mobil, dan kategori tidak bisa dihapus jika masih ada mobil di dalamnya. Tabel **`vehicles`** juga memiliki kolom `deleted_at` untuk mekanisme **Soft-Delete**. Di bawahnya terdapat tabel **`users`** yang mengikat `firebase_uid` dari Firebase Auth dengan peran `customer` atau `admin`.
  > - **`[TEKAN SPASI]`** *(Tahap 2 — Grup Teal: Transaksi Inti & QRIS)* Tabel **`bookings`** menjadi jantung transaksi yang menerima Foreign Key **`vehicle_id`** dari tabel `vehicles` (`1 : N`) dan **`user_id`** dari tabel `users` (`1 : N`). Setiap baris `bookings` berelasi **`1 : 1 UNIQUE` (`ON DELETE CASCADE`)** ke tabel **`payments`** melalui kolom `booking_id` yang memiliki constraint `UNIQUE`, sehingga satu kode booking dijamin hanya memiliki tepat satu tagihan QRIS.
  > - **`[TEKAN SPASI]`** *(Tahap 3 — Grup Amber: Operasional Bengkel & Audit AI)* Tabel **`vehicles`** berelasi **`1 : N`** ke tabel **`maintenance_logs`** untuk memblokir tanggal unit yang sedang diservis di bengkel. Sementara itu, tabel **`users`** berelasi **`1 : N`** ke **`ai_recommendation_logs`** yang mencatat timestamp `created_at` dan `latency_ms` guna menegakkan kuota rate limit AI 10 permintaan per menit."* **`[TEKAN PANAH KANAN →]`**

---

### Slide 09 — Fokus Teknis (`Kunci Atomik Anti Double-Booking`)
- **Apa yang tampil di layar:** Di kolom kiri terdapat simulator *Race Condition* antara Pelanggan A (Raka, `T+0ms`) dan Pelanggan B (Sinta, `T+4ms`) yang memesan *Honda Brio BK 1124 AAB* di tanggal yang sama. Di kolom kanan terdapat **Shiki Magic Move** yang menganimasikan perubahan baris kode secara *live* saat kamu menekan Spasi.
- **Kalimat Penyampaian (Bicara):**
  > *"Sekarang kita masuk ke fokus teknis paling krusial: **Bagaimana RentGo mencegah Double-Booking saat dua pelanggan menekan tombol Bayar di milidetik yang sama?***
  > - *(Kode Langkah 1 di kanan)* Jika kita hanya memakai pengecekan naif di aplikasi (`findMany` lalu `create`), dua request paralel di `T+0ms` dan `T+4ms` akan sama-sama melihat mobil masih kosong dan keduanya lolos membuat pesanan.
  > - **`[TEKAN SPASI — KODE BERUBAH!]`** *(Kode Langkah 2)* Pertama, kami menerapkan fungsi deteksi irisan tanggal inklusif di zona waktu WIB: `startA <= endB && startB <= endA`. Bahkan jika tanggal sewa hanya bersinggungan satu hari saja di ujung tanggal, sistem mendeteksinya sebagai bentrok.
  > - **`[TEKAN SPASI — KODE BERUBAH KE SQL!]`** *(Kode Langkah 3)* Kedua, di tingkat database PostgreSQL, fungsi RPC `create_booking` mengunci baris kendaraan menggunakan **`SELECT ... FOR UPDATE`** ditambah constraint **`EXCLUDE USING gist`** pada tipe `daterange(start_date, end_date, '[]')`. Hasilnya deterministik: transaksi Pelanggan A di `T+0ms` mengunci baris dan berhasil mendapat **`201 Created`**, sedangkan transaksi Pelanggan B di `T+4ms` tertahan oleh lock dan langsung ditolak dengan **`409 Conflict`**."* **`[TEKAN PANAH KANAN →]`**

---

### Slide 10 — Simulasi Alur Pemesanan (`7 Langkah End-to-End`)
- **Apa yang tampil di layar:** Jendela aplikasi macOS dengan kursor panah kuning yang bergerak otomatis mengklik tombol dari Langkah 1 sampai Langkah 7 setiap kali kamu menekan Spasi (atau klik tombol `▶ Auto`).
- **Kalimat Penyampaian (Bicara):**
  > *"Slide ke-10 ini memperagakan siklus hidup pemesanan dari hulu ke hilir dalam 7 langkah:*
  > 1. Pelanggan memilih rentang tanggal sewa inklusif WIB (20–22 November, terhitung 3 hari penuh).
  > 2. **`[TEKAN SPASI]`** Pelanggan meminta saran ke asisten AI Gemini dan direkomendasikan unit yang benar-benar tersedia di garasi.
  > 3. **`[TEKAN SPASI]`** Pelanggan memilih unit *Toyota Avanza CVT* dan sistem mengunci baris unit secara atomik.
  > 4. **`[TEKAN SPASI]`** Pelanggan memilih titik jemput di Bandara Kualanamu pada peta interaktif dengan jarak Haversine 23,4 km.
  > 5. **`[TEKAN SPASI]`** Sistem menerbitkan kode QRIS Midtrans Sandbox (`rentgo-test`) dan pelanggan menekan tombol simulasi **Sudah Bayar**.
  > 6. **`[TEKAN SPASI]`** Status pembayaran berubah menjadi `paid` (Lunas).
  > 7. **`[TEKAN SPASI]`** Admin membuka panel `/admin/bookings` menggunakan sesi 1x Login yang sama dan mengonfirmasi pesanan menjadi **`confirmed` (Siap Diambil)**."* **`[TEKAN PANAH KANAN →]`**

---

### Slide 11 — Geolokasi Medan & Sistem Desain (`Peta Haversine & Dua Tema`)
- **Apa yang tampil di layar:** Peta interaktif 3 titik jemput Medan (Bandara Kualanamu KNO, Stasiun Kereta Api Medan, dan Kantor Garasi Jl. Gatot Subroto) beserta tombol **Ganti ke Light Mode / Dark Mode**.
- **Aksi Interaktif:** Klik lokasi di sebelah kiri untuk menerbangkan pin peta, dan tekan **Spasi** (atau klik tombol kuning di kanan atas) untuk mengubah tema dari Gelap ke Terang!
- **Kalimat Penyampaian (Bicara):**
  > *"Untuk konteks lokal Kota Medan, kami mengintegrasikan peta **Leaflet & OpenStreetMap** yang memetakan tiga titik serah-terima kunci utama: **Bandara Internasional Kualanamu (23,4 km)**, **Stasiun Besar Kereta Api Medan (2,1 km)**, dan **Garasi Utama RentGo di Jl. Gatot Subroto (0,8 km)** menggunakan rumus trigonometri bola bumi **Haversine**.*
  > **`[TEKAN SPASI — TEMA BERUBAH KE LIGHT MODE!]`** *Dari sisi ergonomi visual, antarmuka dibangun dengan **Teori Warna Triadik** — 60% Electric Cobalt untuk otoritas dan navigasi, 30% Emerald-Teal untuk status tersedia/lunas, dan 10% Warm Amber untuk aksi utama — yang mendukung **Dark Mode** maupun **Light Mode** sesuai standar kontras WCAG AA."* **`[TEKAN PANAH KANAN →]`**

---

### Slide 12 — Verifikasi Kualitas (`Empat Puluh Sembilan Pengujian Lulus`)
- **Apa yang tampil di layar:** Angka *count-up* besar **`21` Unit Test**, **`20` Black-Box**, dan **`8` Skenario E2E** (total 49 skenario = 100% PASS), diikuti 3 kartu metode pengujian di baris bawah.
- **Kalimat Penyampaian (Bicara):**
  > *"Kualitas rekayasa perangkat lunak kami buktikan secara terukur melalui **49 skenario pengujian yang lulus 100%**:*
  > - **21 Unit Test otomatis menggunakan Vitest** pada 5 file uji yang memverifikasi rumus tarif inklusif WIB, matriks State Machine, deteksi overlap tanggal, simulasi balapan konkuren (`Promise.all`), dan ekstraksi bahasa alami AI.
  > - **20 Kasus Uji Black-Box (`TC-001` s/d `TC-020`)** yang dirancang dengan tiga metode formal: **Equivalence Partitioning (EP)** untuk memisahkan input valid dan invalid, **Boundary Value Analysis (BVA)** untuk menguji batas sewa 1 hari (`start == end`), irisan 1 hari, serta request AI ke-11 per menit (`HTTP 429`), dan **State Transition Testing** untuk memastikan tidak ada lompatan status pesanan yang ilegal.
  > - **8 Skenario End-to-End otomatis menggunakan Playwright Chromium** pada viewport Desktop dan Mobile."* **`[TEKAN PANAH KANAN →]`**

---

### Slide 13 — Arsitektur Cloud (`Pipeline Cloud Tanpa Biaya`)
- **Apa yang tampil di layar:** Diagram aliran CI/CD dari `GitHub Repo (rynnxz/rentGO)` → `Vercel Cloud (rentgo.my.id)` → `Supabase Free Tier + Firebase Spark Plan + Midtrans Sandbox & Gemini Free Tier` dengan total biaya **Rp 0 / Bulan**.
- **Kalimat Penyampaian (Bicara):**
  > *"Dari sisi deployment dan efisiensi operasional, seluruh infrastruktur produksi di **`rentgo.my.id`** berjalan dengan biaya langganan **Rp 0 per bulan (Zero-Cost Cloud Architecture)**. Setiap `git push` ke cabang utama GitHub otomatis memicu build serverless Next.js 15 di Vercel dan terhubung ke Supabase PostgreSQL Free Tier, Firebase Spark Plan, Midtrans Sandbox, serta Gemini API Free Tier. Kami juga menyematkan pola **Dual-Mode Repository** sehingga apabila koneksi internet terputus saat pengembangan lokal, sistem otomatis melakukan fallback ke penyimpanan atomik lokal tanpa error."* **`[TEKAN PANAH KANAN →]`**

---

### Slide 14 — Kesimpulan (`Siap Beroperasi Secara Nyata`)
- **Apa yang tampil di layar:** Bento 6 sel kesimpulan utama dan tautan **`🌐 Live: https://rentgo.my.id`**.
- **Kalimat Penyampaian (Bicara):**
  > *"Sebagai kesimpulan, **RentGo Medan v1.2.0** telah berhasil menjawab seluruh permasalahan operasional rental kendaraan melalui metodologi **SDLC Incremental**, arsitektur **Single-Domain 1x Login**, penguncian transaksi **Anti Double-Booking**, integrasi **QRIS Midtrans & AI Gemini**, peta geolokasi **Haversine Medan**, serta terverifikasi lulus **100% pada 49 skenario pengujian**. Selanjutnya, mari kita masuk langsung ke aplikasi web produksi yang sudah online."* **`[TEKAN PANAH KANAN →]`**

---

### Slide 15 — Transisi Game Loading (`Menuju Portal Live rentgo.my.id`)
- **Apa yang tampil di layar:** Layar pemuatan bergaya *game* (`0%` → `100%`) dengan logo `RENTGO. MDN` berdenyut, *status ticker* yang menghubungkan ke `https://rentgo.my.id`, dan tombol bercahaya **`⚡ Masuk ke Web Live https://rentgo.my.id (Slide 16) →`**.
- **Kalimat Penyampaian (Bicara):**
  > *"Transisi ini menyiapkan koneksi langsung ke portal produksi kami di **`https://rentgo.my.id`**. Mari kita klik untuk masuk ke demo live."* *(Klik tombol di layar atau tekan Panah Kanan `→`)*

---

### Slide 16 — Portal Live `rentgo.my.id` (`Interactive Web Embed`)
- **Apa yang tampil di layar:** Aplikasi web asli **`https://rentgo.my.id`** langsung tampil dan bisa dioperasikan di dalam slide! Di bilah atas tersedia tombol pintas:
  - `🌐 Live: rentgo.my.id/`
  - `🚗 Live: rentgo.my.id/book`
  - `🛡️ Live: rentgo.my.id/admin`
  - `💻 Lokal: localhost:3000`
  - `📱 QR rentgo.my.id` & `Buka rentgo.my.id ↗`

---

# Bagian III — Urutan Klik Saat Live Demo di `rentgo.my.id` (Slide 16)

Saat berada di Slide 16 (atau setelah mengklik **`Buka rentgo.my.id ↗`** jika ingin layar penuh), lakukan **5 peragaan kilat (2–3 menit)** berikut yang dijamin membuat dosen penguji terkesan:

1. **Peragaan 1 — Tunjukkan Landing Page & Single-Domain (`https://rentgo.my.id/`)**:
   - Tunjukkan identitas warna *Electric Triadic*, tombol toggle **Light/Dark Mode** di navbar, dan daftar armada berplat `BK` Sumatera Utara.
   - Klik tombol **`🚗 Live: rentgo.my.id/book`** (atau klik **Cek Ketersediaan Unit**).
2. **Peragaan 2 — Coba Asisten AI Gemini ("Bantu Saya Pilih")**:
   - Di halaman `/book`, klik salah satu chip pintasan di panel AI, misalnya **"Rute Keluarga Danau Toba (7 Kursi Matic)"** atau **"Touring Motor Berdua (Budget 200rb)"**, lalu klik **Cari Rekomendasi AI**.
   - Tunjukkan bahwa AI hanya merekomendasikan armada nyata yang sedang tersedia di database beserta *Fit Score* dan alasan kecocokan rutenya.
3. **Peragaan 3 — Buktikan Jadwal Bengkel Otomatis Menyembunyikan Armada (`FR-15`)**:
   - Ubah tanggal pencarian ke **`15 November 2026` s/d `16 November 2026`** -> tunjukkan bahwa **Toyota Hiace Premio (`BK 7099 AAL`)** otomatis disembunyikan karena sedang servis rem di bengkel pada tanggal 14–18 November.
   - Ubah tanggal ke **`15 Desember 2026` s/d `16 Desember 2026`** -> **Toyota Hiace Premio** langsung muncul kembali!
4. **Peragaan 4 — 1x Login, Checkout Inklusif WIB, & Pelunasan QRIS Instan**:
   - Klik **Masuk / Daftar** -> pilih akun demo **Customer: Nadia Siregar** (atau login Google OAuth).
   - Pilih salah satu unit (misal *Toyota Avanza CVT*), tunjukkan perhitungan otomatis 2 hari inklusif, pilih titik jemput di peta **Bandara Kualanamu**, lalu buat pesanan.
   - Pada halaman detail pesanan yang menampilkan **QRIS Midtrans Sandbox (`rentgo-test`)**, klik tombol hijau **"Sudah Bayar (Simulasi Sandbox Instan)"** -> tunjukkan status berubah instan menjadi **`PAID (Lunas)`** dan **`CONFIRMED`**.
5. **Peragaan 5 — Buktikan Proteksi RBAC (`HTTP 403`) & Panel Admin (`/admin`)**:
   - Saat masih login sebagai **Nadia (Customer)**, klik preset **`🛡️ Live: rentgo.my.id/admin`** -> tunjukkan sistem menolak akses dengan halaman **`HTTP 403 — Akses Ditolak`**.
   - Ganti akun ke **Admin: Akbar Riansyah** -> tanpa pindah domain, halaman `/admin` langsung terbuka menampilkan **6 Kartu KPI Real-Time** dan tabel manajemen pesanan!

---

# Bagian IV — Penjelasan Teknis Mendalam (Deep-Dive Engineering Reference)

Bagian ini adalah **pegangan teknis lengkap** untuk kamu baca sebelum maju presentasi. Jika dosen penguji bertanya *"Bagaimana cara kerja kode di balik layar?"*, kamu bisa menjelaskan poin-poin di bawah ini secara rinci dan akurat.

---

## 4.1. Arsitektur *Single-Domain Multi-Surface* (`1x Login`) & *Edge Middleware*

### Masalah pada Arsitektur Lama (Multi-Subdomain)
Banyak aplikasi memisahkan halaman pelanggan di `book.domain.com` dan halaman admin di `admin.domain.com`. Masalah teknisnya:
- Browser modern menerapkan kebijakan *Same-Origin Policy* pada `IndexedDB` dan `localStorage` tempat SDK Firebase Authentication menyimpan token sesi.
- Akibatnya, pengguna yang sudah login di `domain.com` dianggap belum login saat berpindah ke `book.domain.com` atau `admin.domain.com`.

### Solusi Rekayasa di RentGo Medan (`v1.2.0`)
Kami menyatukan ketiga permukaan aplikasi di bawah **satu origin tunggal (`https://rentgo.my.id`)** dan mengaturnya menggunakan **Next.js 15 Edge Middleware** di file [website/src/middleware.ts](file:///c:/uts-mmprpl/rentgo/website/src/middleware.ts):
1. **Struktur Folder Internal Tersembunyi (`/site/*`):**
   Di dalam kode sumber `website/src/app/site/`, halaman dipisahkan secara rapi menjadi 3 modul:
   - `src/app/site/landing/page.tsx`
   - `src/app/site/book/...`
   - `src/app/site/admin/...`
2. **Mekanisme `NextResponse.rewrite()` di Edge Middleware:**
   - Ketika pengguna membuka `https://rentgo.my.id/`, middleware melakukan *internal rewrite* ke `/site/landing`.
   - Ketika pengguna membuka `https://rentgo.my.id/book/*`, middleware melakukan *internal rewrite* ke `/site/book/*`.
   - Ketika pengguna membuka `https://rentgo.my.id/admin/*`, middleware melakukan *internal rewrite* ke `/site/admin/*`.
   - **Penting:** *Rewrite* berbeda dengan *Redirect*! URL di bilah alamat browser pengguna tetap `https://rentgo.my.id/book`, bukan `/site/book`.
3. **Pemblokiran Akses Langsung ke `/site/*` (`HTTP 404`):**
   Jika ada pengguna atau bot yang mencoba menembak URL internal `https://rentgo.my.id/site/admin` secara langsung, middleware mendeteksi prefiks `/site` dan langsung mengembalikan status **`HTTP 404 Not Found`** agar struktur direktori internal tidak terekspos.
4. **Sesi Cookie Terpadu (`__session`):**
   Saat pengguna login lewat Firebase Auth di klien, token dikirim ke `POST /api/auth/session`. Server memverifikasi identitas lalu menerbitkan satu cookie bernama `__session` dengan atribut:
   - `Path=/` (berlaku di `/`, `/book`, dan `/admin` sekaligus!)
   - `HttpOnly` (tidak bisa dicuri oleh skrip JavaScript berbahaya / XSS)
   - `SameSite=Lax` (melindungi dari serangan CSRF)

---

## 4.2. Mekanisme *2-Layer Anti Double-Booking Guard* (`SELECT ... FOR UPDATE` + `GiST`)

Ini adalah bagian teknis paling penting di proyekmu. Mengapa sistem biasa bisa mengalami *Double-Booking*?

### Anatomi *Race Condition* (Kondisi Balapan)
Bayangkan tinggal **1 unit** *Honda Brio BK 1124 AAB*. Pada jam `10:00:00.000`, **Pelanggan A** dan **Pelanggan B** sama-sama menekan tombol "Buat Pesanan" untuk tanggal `20–22 November`:
1. Request A menjalankan `SELECT * FROM bookings WHERE vehicle_id = 'brio' AND ...` -> Hasil: **0 baris (Kosong)**.
2. Hanya **4 milidetik kemudian** (sebelum Request A sempat melakukan `INSERT`), Request B menjalankan `SELECT` yang sama -> Hasil: **0 baris (Masih terlihat kosong!)**.
3. Request A melakukan `INSERT` -> Berhasil.
4. Request B melakukan `INSERT` -> Berhasil juga! **Terjadilah Double-Booking!**

### Bagaimana RentGo Medan Mencegahnya Secara Mutlak?
Kami menerapkan **2 Lapis Pertahanan (Defense-in-Depth)** di [website/src/lib/availability.ts](file:///c:/uts-mmprpl/rentgo/website/src/lib/availability.ts) dan [website/supabase/RENTGO_FULL_SETUP_AND_SEED.sql](file:///c:/uts-mmprpl/rentgo/website/supabase/RENTGO_FULL_SETUP_AND_SEED.sql):

#### Lapis 1 — Rumus Matematika Irisan Tanggal Inklusif (Zona Waktu WIB)
Di industri rental kendaraan Indonesia, sewa tanggal `20 Nov` sampai `22 Nov` adalah **inklusif** (mobil dipakai penuh dari tanggal 20 pagi sampai tanggal 22 malam = **3 hari**).
Dua rentang tanggal $[Start_A, End_A]$ dan $[Start_B, End_B]$ dinyatakan **bentrok (overlap)** jika dan hanya jika:
$$\text{Start}_A \le \text{End}_B \quad \text{DAN} \quad \text{Start}_B \le \text{End}_A$$
- **Contoh Kasus Batas (Boundary):** Pesanan A menyewa tanggal `20 s/d 22 Nov`. Pesanan B ingin menyewa tanggal `22 s/d 24 Nov` (bersinggungan tepat di tanggal 22 Nov).
  - Apakah $20 \le 24$? **TRUE**.
  - Apakah $22 \le 22$? **TRUE**.
  - Karena keduanya TRUE, maka **BENTROK** dan langsung ditolak!
- Pengecekan ini dilakukan terhadap **dua tabel sekaligus**:
  1. Tabel `bookings` yang berstatus aktif (`pending`, `confirmed`, `ongoing`).
  2. Tabel `maintenance_logs` (jadwal servis bengkel) yang berstatus aktif (`scheduled`, `in_progress`).

#### Lapis 2 — Penguncian Baris Atomik PostgreSQL (`SELECT ... FOR UPDATE`) & `GiST Exclusion Constraint`
Di dalam fungsi transaksi RPC PostgreSQL `public.create_booking(...)`:
```sql
-- 1. Kunci baris kendaraan secara eksklusif (Pessimistic Row-Level Lock)
SELECT id, daily_price, status
FROM public.vehicles
WHERE id = p_vehicle_id AND deleted_at IS NULL
FOR UPDATE;
```
- Ketika Request A menjalankan `SELECT ... FOR UPDATE` pada baris *Honda Brio*, PostgreSQL memasang **kunci eksklusif (Row Lock)** pada baris mobil tersebut hingga transaksi A selesai (`COMMIT` atau `ROLLBACK`).
- Ketika Request B masuk 4 milidetik kemudian dan mencoba menjalankan `SELECT ... FOR UPDATE` pada mobil yang sama, **PostgreSQL memaksa Request B mengantre (menunggu)** sampai Request A selesai!
- Begitu Request A selesai melakukan `INSERT` dan `COMMIT`, barulah Request B diizinkan lanjut membaca tabel `bookings`. Saat Request B mengecek irisan tanggal, Request B langsung melihat baris yang baru saja dimasukkan oleh Request A, sehingga fungsi melempar eksepsi **`CONFLICT_409`** (`HTTP 409 Conflict`)!
- Sebagai pengaman terakhir di level kernel database, tabel `bookings` juga dipasangi **PostgreSQL GiST Exclusion Constraint**:
```sql
CONSTRAINT no_double_booking EXCLUDE USING gist (
  vehicle_id WITH =,
  daterange(start_date, end_date, '[]') WITH &&
) WHERE (status IN ('pending', 'confirmed', 'ongoing'))
```
Artinya, mustahil ada dua baris pesanan aktif dengan `vehicle_id` yang sama (`=`) dan rentang tanggal inklusif `'[]'` yang beririsan (`&&`) di dalam tabel PostgreSQL, bahkan jika seseorang mencoba memasukkan data langsung lewat SQL!

---

## 4.3. Kalkulasi Tarif Inklusif Zona Waktu WIB (`Asia/Jakarta`) & Keamanan Harga Server

Di file [website/src/lib/pricing.ts](file:///c:/uts-mmprpl/rentgo/website/src/lib/pricing.ts):
1. **Mengapa Tidak Boleh Percaya Harga dari Browser (Client)?**
   Jika total harga dihitung di browser lalu dikirim lewat body JSON `POST /api/bookings`, pengguna nakal bisa mengubah request menggunakan DevTools/Postman menjadi `total_price: 1000` (Rp 1.000).
2. **Perhitungan Ulang Server-Side & Snapshot Harga:**
   - Saat checkout, server **mengabaikan** angka harga apa pun dari client.
   - Server mengambil `daily_price` asli langsung dari tabel `vehicles` di database.
   - Server menghitung jumlah hari sewa secara inklusif:
     $$\text{Total Hari} = \left(\frac{\text{ EndDate}_{\text{UTC}} - \text{StartDate}_{\text{UTC}} }{86.400.000 \text{ ms}}\right) + 1$$
   - Jika `start_date = 2026-12-15` dan `end_date = 2026-12-15` (sewa di hari yang sama), hasilnya adalah $(0) + 1 = \mathbf{1 \text{ Hari}}$, bukan 0 hari!
   - Server menyimpan harga harian saat itu ke kolom `daily_price_snapshot` di tabel `bookings`, lalu menghitung `total_price = daily_price_snapshot * total_days`. Mengapa pakai *snapshot*? Agar jika bulan depan Admin menaikkan harga sewa Avanza dari Rp 420.000 menjadi Rp 450.000, laporan keuangan pesanan bulan lalu **tidak ikut berubah**!

---

## 4.4. Bedah Skema Basis Data Relasional 7 Tabel (ERD, *Foreign Key*, & *Soft-Delete*)

Berikut adalah rincian ketujuh tabel di Supabase PostgreSQL yang tampil pada **Slide 08**:

| No | Nama Tabel | Primary Key (`PK`) & Unique (`UK`) | Foreign Key (`FK`) & Aturan Hapus | Fungsi Teknis dalam Sistem |
| :--- | :--- | :--- | :--- | :--- |
| **1** | `users` | `PK id (uuid)`<br>`UK firebase_uid`<br>`UK email` | — | Menyimpan profil pengguna hasil sinkronisasi Firebase Auth beserta peran RBAC (`customer` / `admin`), No. WA, dan No. SIM A/C. |
| **2** | `vehicle_categories` | `PK id (uuid)`<br>`UK name`, `UK slug` | — | Master kategori armada (*City Car*, *MPV*, *SUV*, *Minibus*, *Skutik*). |
| **3** | `vehicles` | `PK id (uuid)`<br>`UK plate_number` | `FK category_id` → `vehicle_categories(id)` **`ON DELETE RESTRICT`** | Menyimpan spesifikasi armada plat `BK`, tarif harian, status, URL foto, dan kolom **`deleted_at`** untuk *Soft-Delete*. |
| **4** | `bookings` | `PK id (uuid)`<br>`UK booking_code` | `FK user_id` → `users(id)` **`RESTRICT`**<br>`FK vehicle_id` → `vehicles(id)` **`RESTRICT`** | Tabel transaksi inti penyewaan. Dilengkapi kolom generated `total_days`, `daily_price_snapshot`, `expires_at` (+24 jam), dan *GiST Lock*. |
| **5** | `payments` | `PK id (uuid)`<br>`UK booking_id` | `FK booking_id` → `bookings(id)` **`ON DELETE CASCADE`** (**Relasi 1:1**) | Menyimpan tagihan pembayaran per pesanan (`method: qris`, `status: unpaid \| paid \| refunded`, `paid_at`). Karena `booking_id` bersifat `UNIQUE`, relasinya adalah **1-ke-1 murni**. |
| **6** | `maintenance_logs` | `PK id (uuid)` | `FK vehicle_id` → `vehicles(id)` **`ON DELETE CASCADE`** | Mencatat jadwal perawatan bengkel (*Servis Rem*, *Ganti Oli*) dengan `start_date` dan `end_date` yang otomatis memblokir ketersediaan unit. |
| **7** | `ai_recommendation_logs` | `PK id (uuid)` | `FK user_id` → `users(id)` **`ON DELETE SET NULL`** | Mencatat kueri pelanggan, model AI, latensi (`latency_ms`), dan waktu panggilan (`created_at`) untuk mengaudit dan membatasi kuota AI **10 permintaan/menit**. |

---

## 4.5. Mesin Status (*State Machine*) Siklus Hidup Pesanan & *Auto-Expire* 24 Jam

Di file [website/src/lib/booking-state.ts](file:///c:/uts-mmprpl/rentgo/website/src/lib/booking-state.ts), status pesanan tidak boleh diubah sembarangan, melainkan dikawal oleh fungsi deterministik `canTransitionBookingStatus(currentStatus, nextStatus, actorRole)`:

```text
                       ┌── (Lewat 24 Jam Belum Bayar) ──► [ EXPIRED ]
                       │
                       ├── (Pelanggan / Admin Batal)  ──► [ CANCELLED ]
                       │
[ PENDING ] ───────────┼── (Admin Menolak Dokumen)    ──► [ REJECTED ]
     │
     ▼ (Bayar QRIS Lunas / Admin Verifikasi)
[ CONFIRMED ] (Siap Diambil di Bandara/Garasi)
     │
     ▼ (Serah Terima Kunci Fisik oleh Admin)
[ ONGOING ] (Unit Sedang Disewa di Jalan)
     │
     ▼ (Unit Dikembalikan & Diperiksa Admin)
[ COMPLETED ] (Transaksi Selesai & Masuk Pendapatan)
```

- **Aturan Ketat State Machine:**
  - Pelanggan (`customer`) **hanya** boleh membatalkan (`cancelled`) pesanan yang masih berstatus `pending`. Jika pesanan sudah `confirmed` atau `ongoing`, pelanggan tidak bisa membatalkannya secara sepihak lewat API (`HTTP 403`).
  - Status terminal (`completed`, `cancelled`, `rejected`, `expired`) bersifat final dan tidak dapat dikembalikan ke `pending` atau `ongoing`.
  - Endpoint `/api/cron/housekeeping` secara otomatis mengubah pesanan `pending` yang telah melewati batas `expires_at` (24 jam sejak checkout) menjadi `expired` agar unit mobil tidak terkunci selamanya oleh pelanggan yang batal membayar.

---

## 4.6. Integrasi Pembayaran QRIS Midtrans Sandbox (`rentgo-test`)

- Setiap kali pesanan dibuat (`POST /api/bookings`), sistem secara atomik membuat baris di tabel `payments` dengan `method = 'qris'` dan `status = 'unpaid'`.
- Pada halaman detail pesanan (`/book/bookings/[id]`), sistem merender matriks **QRIS Dinamis Midtrans Sandbox** dengan identitas merchant `rentgo-test`, nominal tagihan presisi (`amount`), dan kode referensi `booking_code` (`RG-YYMMDD-XXXX`).
- Untuk memudahkan pengujian saat presentasi maupun UAT tanpa harus memotong saldo rekening nyata, tersedia tombol **"Sudah Bayar (Simulasi Sandbox Instan)"** yang mengirim `PATCH /api/payments/[bookingId]` dengan payload `{ simulate_qris_paid: true }`.
- Server kemudian:
  1. Mengubah `payments.status` menjadi `paid` dan mengisi timestamp `paid_at = now()`.
  2. Mengubah `bookings.status` dari `pending` menjadi `confirmed`.

---

## 4.7. Asisten Rekomendasi AI Google Gemini Flash, *Anti-Halusinasi*, & *Rate Limiter* 10/Menit

Di file [website/src/lib/ai-recommend.ts](file:///c:/uts-mmprpl/rentgo/website/src/lib/ai-recommend.ts):
1. **Ekstraksi Niat Bahasa Alami (Natural Language Intent Extraction):**
   Sebelum memanggil LLM, sistem mengekstrak parameter kunci dari kalimat bahasa Indonesia pengguna menggunakan parser deterministik:
   - Deteksi jenis kendaraan: kata kunci `"motor"`, `"skutik"`, `"nmax"`, `"vario"`, `"pcx"` otomatis mengunci filter kategori ke **Sepeda Motor**; kata kunci `"mobil"`, `"keluarga"`, `"mpv"`, `"suv"` mengunci ke **Mobil**.
   - Deteksi kapasitas penumpang (misal `"7 kursi"`, `"berdua"` -> `seats = 2`) dan anggaran maksimal (misal `"budget 200rb"` -> `maxPrice = 200000`).
2. **Context Injection & Proteksi Anti-Halusinasi (`vehicle_id` Whitelist):**
   - Masalah umum AI generatif adalah *halusinasi* (merekomendasikan mobil yang sebenarnya tidak dimiliki oleh rental atau sedang disewa orang lain).
   - Di RentGo Medan, server terlebih dahulu mengambil **hanya daftar kendaraan yang benar-benar tersedia (available)** pada tanggal pilihan pelanggan dari database, lalu menyuntikkannya (*Context Injection*) ke dalam *system prompt* Gemini AI (`gemini-flash-latest`).
   - Setelah Gemini mengembalikan respons JSON berisi rekomendasi `vehicle_id`, server melakukan **validasi silang (whitelist check)**: setiap `vehicle_id` dari AI dicocokkan kembali dengan daftar UUID armada tersedia di memori server. Jika AI mengembalikan ID fiktif, baris tersebut langsung dibuang!
3. **Sliding-Window Rate Limiter (Maksimal 10 Respons / Menit):**
   - Untuk melindungi kuota API dan mencegah penyalahgunaan (spam), sistem memeriksa jumlah panggilan dalam jendela waktu **60 detik terakhir (60.000 ms)**.
   - Jika pengguna mengirim permintaan ke-11 dalam kurun 1 menit, server langsung menolak dengan kode **`HTTP 429 Too Many Requests`** beserta header `X-RateLimit-Limit: 10` dan `X-RateLimit-Remaining: 0`.

---

## 4.8. Geolokasi 3 Titik Jemput Medan & Rumus Matematika *Haversine*

Pada komponen peta interaktif Leaflet & OpenStreetMap, sistem menghitung jarak antara posisi pengguna (atau pusat Kota Medan) ke tiga titik jemput resmi:
1. **Bandara Internasional Kualanamu (KNO):** `3.6422° N, 98.8853° E` (~23,4 km)
2. **Stasiun Besar Kereta Api Medan (City Railink):** `3.5917° N, 98.6783° E` (~2,1 km)
3. **Kantor & Garasi Utama RentGo (Jl. Gatot Subroto):** `3.5902° N, 98.6598° E` (~0,8 km)

Jarak dihitung menggunakan **Formula Haversine** (memperhitungkan kelengkungan bola bumi dengan jari-jari rata-rata $R = 6.371 \text{ km}$):
$$a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cdot\cos(\phi_2)\cdot\sin^2\left(\frac{\Delta \lambda}{2}\right)$$
$$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1-a}\right), \quad d = R \cdot c$$
di mana $\phi$ adalah lintang (*latitude*) dan $\lambda$ adalah bujur (*longitude*) dalam satuan radian.

---

## 4.9. Metodologi Pengujian Kualitas (EP, BVA, State Transition, Vitest, & Playwright)

Jika dosen bertanya tentang **Slide 12 (Pengujian)**, jelaskan perbedaan ketiga lapisan dan ketiga teknik pengujian berikut:
1. **Tiga Lapisan Eksekusi Otomatis:**
   - **Unit Test (Vitest — 21 Kasus Uji di 5 File):** Menguji fungsi murni di `src/lib/` secara terisolasi dalam hitungan milidetik (tanpa perlu membuka browser).
   - **Black-Box Testing (`TC-001` s/d `TC-020` — 20 Kasus Uji):** Menguji kesesuaian input dan output fungsional terhadap spesifikasi kebutuhan `FR-01` s/d `FR-19`.
   - **End-to-End Browser Test (Playwright Chromium — 8 Skenario di 6 Blok Uji):** Robot browser nyata yang membuka halaman, mengklik tombol, mengisi form, dan memverifikasi tampilan pada layar Desktop (`1440×900`) dan Mobile (`390×844`).
2. **Tiga Teknik Perancangan Kasus Uji Black-Box:**
   - **Equivalence Partitioning (EP):** Membagi data input menjadi kelas valid dan kelas tidak valid. Contoh: menguji akses `/admin` menggunakan akun ber-role `customer` (kelas invalid -> wajib ditolak `HTTP 403`) vs akun ber-role `admin` (kelas valid -> diterima `HTTP 200`).
   - **Boundary Value Analysis (BVA):** Menguji tepat di titik batas aturan bisnis. Contoh:
     - Batas bawah durasi sewa: `start_date == end_date` (wajib terhitung `1 hari`, bukan `0 hari`).
     - Batas bawah tidak valid: `end_date = start_date - 1 hari` (wajib ditolak `HTTP 400`).
     - Batas irisan tanggal: beririsan tepat 1 hari di tanggal terakhir (wajib ditolak `HTTP 409`).
     - Batas kuota AI: request ke-10 berhasil (`HTTP 200`), request ke-11 dalam 1 menit ditolak (`HTTP 429`).
   - **State Transition Testing:** Menguji perpindahan antar-status pada State Machine (`pending` → `confirmed` → `ongoing` → `completed`) serta memastikan transisi terlarang (seperti `completed` kembali ke `pending`) ditolak.

---

## 4.10. *Dual-Mode Persistence Repository* & Pipeline Cloud Tanpa Biaya

Di file [website/src/lib/repository.ts](file:///c:/uts-mmprpl/rentgo/website/src/lib/repository.ts), kami merancang pola arsitektur **Dual-Mode Repository**:
- **Mode 1 (`supabase-cloud`):** Di lingkungan produksi (`https://rentgo.my.id`) atau saat terkoneksi internet dengan kredensial Supabase aktif, seluruh operasi baca/tulis dijalankan langsung ke PostgreSQL Supabase Cloud.
- **Mode 2 (`local-fallback`):** Apabila server dijalankan di lingkungan pengujian tertutup (CI/CD atau ruang kelas tanpa internet), repositori secara transparan melakukan *fallback* ke mesin penyimpanan lokal ber-mutex di `.data/rentgo-local.json` yang memiliki struktur 7 tabel dan aturan penguncian transaksi yang 100% identik.

---

# Bagian V — Bank Pertanyaan & Jawaban Kritis Dosen Penguji (Q&A Defense)

Berikut adalah daftar pertanyaan yang paling sering ditanyakan dosen penguji pada sidang/presentasi UTS MMPRPL beserta jawaban singkat, padat, dan telak:

### Q1: *"Kenapa kamu memilih model SDLC Incremental, bukan Waterfall atau Agile Scrum?"*
> **Jawaban:**
> *"Ada dua alasan utama, Pak/Bu:*
> 1. **Mitigasi Risiko Teknis Sejak Dini (vs Waterfall):** Pada sistem penyewaan kendaraan, risiko terbesarnya ada pada transaksi konkuren (Double-Booking) dan pembayaran QRIS. Di model Waterfall, integrasi dan pengujian baru dilakukan di tahap akhir. Dengan **SDLC Incremental**, fitur inti Anti Double-Booking sudah selesai dan teruji di database nyata pada **Increment 2 (`v0.3.0`)**, sebelum kami menambahkan fitur AI dan Peta di Increment 3.
> 2. **Efisiensi Pengembang Tunggal (vs Agile Scrum):** Proyek UTS ini dikerjakan secara individu (Proyek Individu No. 2). Agile Scrum membutuhkan seremoni tim seperti Daily Standup, Sprint Planning bersama Scrum Master, dan Product Owner. Model **Incremental** memberikan struktur tahapan rilis yang disiplin (`v0.1.0` s/d `v1.2.0`) tanpa beban birokrasi tim."*

---

### Q2: *"Apa bedanya peran Firebase dan Supabase di aplikasi kamu? Kenapa pakai dua-duanya?"*
> **Jawaban:**
> *"Perannya dipisahkan secara tegas tanpa tumpang tindih (**Separation of Concerns**), Pak/Bu:*
> - **Firebase (`rentgo-medan`) hanya digunakan khusus untuk Autentikasi (`Auth-Only`)** karena Firebase memiliki integrasi Google OAuth Popup yang sangat cepat dan stabil di sisi klien. Kami sama sekali tidak menggunakan Firestore.
> - **Supabase (`honhszsloegvpbmczkqf`) digunakan sebagai Basis Data Relasional PostgreSQL (7 tabel) dan Cloud Storage.** Mengapa database utamanya memakai PostgreSQL di Supabase dan bukan NoSQL seperti Firestore? Karena sistem rental membutuhkan **integritas relasional Foreign Key (`ON DELETE RESTRICT`)**, penguncian baris transaksi atomik **`SELECT ... FOR UPDATE`**, dan **GiST Exclusion Constraint** untuk mencegah double-booking — fitur yang merupakan kekuatan utama database relasional SQL.
> - Penghubung keduanya ada di kolom **`users.firebase_uid`** di Supabase yang menyimpan UID unik dari Firebase Auth."*

---

### Q3: *"Bagaimana kalau ada dua orang memesan mobil dengan plat nomor yang sama pada detik yang sama persis?"*
> **Jawaban:**
> *"Sistem kami menanganinya di tingkat transaksi database PostgreSQL menggunakan **Pessimistic Row Locking (`SELECT ... FOR UPDATE`)** dan **GiST Exclusion Constraint**, Pak/Bu. Saat dua request masuk bersamaan, baris kendaraan di tabel `vehicles` dikunci secara eksklusif oleh transaksi pertama. Transaksi kedua dipaksa mengantre oleh PostgreSQL sampai transaksi pertama selesai melakukan `COMMIT`. Begitu transaksi kedua membaca ulang jadwal dan mendeteksi sudah ada pesanan aktif pada rentang tanggal tersebut, sistem langsung membatalkan transaksi kedua dan mengembalikan status **`HTTP 409 Conflict`**. Skenario ini juga sudah dibuktikan secara otomatis menggunakan `Promise.all` di unit test Vitest kami."*

---

### Q4: *"Kalau Admin menghapus data mobil yang sudah pernah disewa bulan lalu, apakah laporan pendapatan bulan lalu ikut hilang atau error?"*
> **Jawaban:**
> *"Tidak hilang dan tidak error, Pak/Bu. Kami menerapkan mekanisme **Soft-Delete** pada tabel `vehicles` menggunakan kolom timestamp `deleted_at` serta kebijakan Foreign Key **`ON DELETE RESTRICT`** pada tabel `bookings`. Ketika Admin menekan tombol Hapus pada suatu kendaraan, baris fisik kendaraan tersebut tidak dihapus dari database, melainkan kolom `deleted_at` diisi waktu saat ini dan statusnya diubah menjadi `inactive`. Dengan demikian, mobil tersebut langsung disembunyikan dari katalog pelanggan baru, tetapi seluruh histori transaksi dan laporan keuangan masa lalu di tabel `bookings` dan `payments` tetap utuh 100%."*

---

### Q5: *"Bagaimana cara kamu memastikan AI Gemini tidak berhalusinasi (misalnya menyarankan mobil yang tidak ada di garasi atau sedang disewa)?"*
> **Jawaban:**
> *"Kami menerapkan dua lapis pengaman **Anti-Halusinasi** di sisi server (`/api/ai/recommend`), Pak/Bu:*
> 1. **Pre-Filtering & Context Injection:** Sebelum memanggil API Gemini, server terlebih dahulu menyaring database untuk mengambil **hanya daftar kendaraan yang berstatus `active` dan tidak bentrok jadwal sewa maupun servis bengkel** pada tanggal yang dipilih pelanggan. Hanya daftar unit tersedia inilah yang dikirim ke prompt Gemini.
> 2. **Post-Validation Whitelist:** Setelah Gemini mengembalikan JSON berisi daftar `vehicle_id` yang direkomendasikan, server memvalidasi ulang setiap ID tersebut terhadap himpunan UUID kendaraan tersedia di memori server. Jika AI mengembalikan ID di luar daftar tersebut, sistem otomatis membuangnya."*
