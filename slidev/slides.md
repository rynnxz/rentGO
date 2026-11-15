---
theme: default
title: "RentGo Medan - Keynote Presentasi UTS MMPRPL (Akbar Riansyah)"
info: |
  Presentasi Ujian Tengah Semester (UTS)
  Mata Kuliah: Metode Model Pengembangan Perangkat Lunak (MMPRPL)
  Mahasiswa: Akbar Riansyah
  Proyek Individu No. 2: Sistem Manajemen Penyewaan Kendaraan (RentGo Medan)
  Program Studi: TRPL Semester III - Politeknik Wilmar Bisnis Indonesia (PWBI)
colorSchema: dark
aspectRatio: 16/9
canvasWidth: 980
transition: view-transition
mdc: true
---

<ColdOpenHero />

<!--
Narasi Dosen (Slide 1 - Cold Open):
Selamat pagi/siang/malam Bapak/Ibu Dosen penguji mata kuliah Metode Model Pengembangan Perangkat Lunak.
Saya Akbar Riansyah dari TRPL Semester III Politeknik Wilmar Bisnis Indonesia, membawakan Proyek Individu Nomor 2 yaitu Sistem Manajemen Penyewaan Kendaraan bernama RentGo Medan.
Presentasi ini merangkum tujuan, fitur, metodologi SDLC Incremental, arsitektur, pengujian, deployment, hingga demo live aplikasi.
-->

---
transition: view-transition
clicks: 3
---

<SlideBrandHeader section="01 • Masalah Operasional" stepLabel="4 Kendala Kritis" slideNum="02 / 16" />

<div v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { duration: 450 } }">

# Empat Kendala Rental Manual.
## Jadwal bentrok, bengkel terpisah, resi manual, bingung pilih unit.

</div>

<ProblemCollisionCards />

<!--
Narasi Dosen (Slide 2 - Masalah):
Operasional rental mobil dan motor di Kota Medan (Bandara Kualanamu, Stasiun Medan, dan koridor wisata Danau Toba) menghadapi 4 masalah utama saat masih dicatat di buku atau spreadsheet:
1. Risiko Double-Booking: dua pelanggan memesan plat BK yang sama di tanggal beririsan karena tidak ada kunci transaksi database.
2. Jadwal Bengkel Terpisah: kendaraan yang sedang ganti oli atau servis rem tetap tampil siap sewa.
3. Tarif dan Pembayaran Manual: perhitungan durasi hari sewa inklusif dan bukti bayar chat tidak dikontrol oleh state machine.
4. Kebingungan Memilih Unit: wisatawan kesulitan menentukan unit yang tepat untuk rute tanjakan Berastagi atau dalam kota.
-->

---
transition: view-transition
---

<SlideBrandHeader section="02 • Solusi Terpadu" stepLabel="Single-Domain 1x Login" slideNum="03 / 16" />

<div v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { duration: 450 } }">

# Satu Domain. Tiga Permukaan. Satu Login.
## Seluruh operasional terhubung real-time di rentgo.my.id.

</div>

<SolutionDeviceMorph />

<!--
Narasi Dosen (Slide 3 - Solusi):
Solusi kami adalah RentGo Medan v1.2.0: satu platform web dengan arsitektur Single-Domain Multi-Surface di rentgo.my.id.
Pelanggan dan Admin cukup melakukan 1 kali login (shared cookie __session) untuk mengakses halaman Landing (/), aplikasi Katalog & Booking (/book), serta Panel Operasional Admin (/admin), lengkap dengan kunci transaksi atomik anti double-booking.
-->

---
transition: view-transition
clicks: 4
---

<SlideBrandHeader section="03 • Model Pengembangan" stepLabel="SDLC Incremental" slideNum="04 / 16" />

<div v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { duration: 450 } }">

# Lima Increment. Teruji Sejak Awal.
## Metodologi SDLC Incremental dari v0.1.0 hingga v1.2.0.

</div>

<SdlcTimeline />

<!--
Narasi Dosen (Slide 4 - Model Pengembangan SDLC Incremental):
Mengapa memilih SDLC Incremental?
Karena fitur berisiko tinggi seperti pencegahan double-booking dan pembayaran QRIS harus diuji di database nyata sejak pertengahan proyek (Increment 2 / v0.3.0), bukan ditunda sampai akhir seperti Waterfall.
Berbeda dari Prototype yang hanya fokus pada antarmuka semu, atau Agile Scrum yang membutuhkan upacara tim harian, SDLC Incremental sangat pas untuk pengembang tunggal dengan tahapan rilis terukur dari v0.1.0 sampai v1.2.0.
-->

---
transition: view-transition
clicks: 5
---

<SlideBrandHeader section="04 • Fitur Utama" stepLabel="6 Kapabilitas Inti" slideNum="05 / 16" />

<div v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { duration: 450 } }">

# Enam Pilar Fungsional Inti.
## Dirancang untuk kecepatan reservasi dan akurasi stok.

</div>

<FeatureBentoGrid />

<!--
Narasi Dosen (Slide 5 - Fitur Utama):
RentGo Medan memiliki 6 fitur utama yang saling mengunci:
1. CRUD Armada, Kategori, dan Jadwal Bengkel dengan mekanisme soft-delete (deleted_at) agar histori pesanan tetap utuh.
2. Booking Engine Anti Double-Booking di tingkat transaksi PostgreSQL.
3. Pembayaran QRIS Midtrans Sandbox (rentgo-test) dengan simulasi pelunasan satu klik.
4. Asisten Rekomendasi AI Google Gemini Flash dengan proteksi anti-halusinasi dan kuota 10 respons per menit.
5. Peta Lokasi Interaktif Leaflet & OpenStreetMap dengan rumus jarak Haversine untuk 3 titik jemput Medan.
6. Dasbor KPI Admin real-time dengan Role-Based Access Control (RBAC).
-->

---
transition: view-transition
clicks: 7
---

<SlideBrandHeader section="05 • Tech Stack" stepLabel="7 Teknologi Modern" slideNum="06 / 16" />

<div v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { duration: 450 } }">

# Tujuh Teknologi. Empat Lapisan Modern.
## Muncul bertahap lalu menyatu membentuk arsitektur cloud.

</div>

<TechStackLayers />

<!--
Narasi Dosen (Slide 6 - Tech Stack):
Setiap teknologi dipilih dengan peran spesifik tanpa tumpang tindih:
- Next.js 15 App Router menangani antarmuka, Edge Middleware, dan REST API.
- Leaflet dan OpenStreetMap merender peta titik jemput Medan beserta jarak Haversine.
- Firebase Authentication digunakan khusus untuk autentikasi (Auth-Only) Google OAuth dan Email/Password.
- Google Gemini AI memberikan rekomendasi armada cerdas dengan batas 10 panggilan per menit.
- Midtrans Sandbox menghasilkan kode QRIS dinamis per kode booking.
- Supabase menyediakan PostgreSQL 7 tabel dan Cloud Storage foto armada.
- Vercel menjalankan deployment serverless otomatis dari GitHub.
-->

---
transition: view-transition
clicks: 3
---

<SlideBrandHeader section="06 • Arsitektur Sistem" stepLabel="4-Tier + 1x Login" slideNum="07 / 16" />

<div v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { duration: 450 } }">

# Arsitektur 4-Tier & Single-Domain.
## Aliran satu request terproteksi dari browser ke database.

</div>

<ArchitectureDiagram />

<!--
Narasi Dosen (Slide 7 - Arsitektur 4-Tier):
Slide ini memperbaiki diagram arsitektur dan tabel konektor agar tampil utuh dan beranimasi:
1. Tier 1 (Presentation): Browser mengakses /, /book, dan /admin dalam satu domain dengan satu cookie sesi __session.
2. Tier 2 (Edge Middleware): src/middleware.ts memetakan path publik ke folder internal /site/* dan memblokir akses langsung ke /site/* dengan HTTP 404.
3. Tier 3 (Application & Domain Logic): Route Handlers Next.js 15 memvalidasi skema via Zod, memeriksa peran Admin (HTTP 403), dan menghitung ulang tarif sewa di sisi server.
4. Tier 4 (Data & Cloud): Terhubung ke Supabase PostgreSQL, Firebase Auth-Only, Midtrans QRIS Sandbox, dan Gemini AI.
-->

---
transition: view-transition
clicks: 2
---

<SlideBrandHeader section="07 • Basis Data" stepLabel="7 Tabel Relasional" slideNum="08 / 16" />

<div v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { duration: 450 } }">

# Skema Relasional Tujuh Tabel.
## Integritas kunci asing dan audit kuota di Supabase.

</div>

<ErdDiagram />

<!--
Narasi Dosen (Slide 8 - ERD 7 Tabel):
Basis data PostgreSQL di Supabase terdiri atas 7 tabel yang saling berelasi:
- Grup 1 (Master & Identitas): tabel users menyimpan firebase_uid dan role; vehicle_categories mengelompokkan vehicles (dilengkapi kolom deleted_at untuk soft-delete).
- Grup 2 (Transaksi Inti): tabel bookings mencatat transaksi sewa dan berelasi 1-ke-1 (UNIQUE booking_id) dengan tabel payments yang menggunakan metode qris.
- Grup 3 (Operasional & Audit): tabel maintenance_logs memblokir tanggal unit yang sedang diservis di bengkel, sedangkan ai_recommendation_logs mencatat waktu panggilan AI untuk menegakkan rate limit 10 respons per menit.
-->

---
transition: view-transition
---

<SlideBrandHeader section="08 • Transaksi Atomik" stepLabel="PostgreSQL Row Lock" slideNum="09 / 16" />

<div v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { duration: 450 } }">

# Kunci Atomik Anti Double-Booking.
## Baris unit dikunci, pesanan kedua langsung ditolak 409.

</div>

<div class="grid grid-cols-12 gap-3 items-start mt-1">
  <div class="col-span-6">
    <AtomicBookingDemo />
  </div>
  <div class="col-span-6">

````md magic-move
```ts
// 1. Cek Naif (Rawan Race Condition)
const existing = await db.bookings.findMany({
  where: { vehicle_id: req.vehicleId }
});
// Tanpa lock, 2 request paralel lolos bersamaan!
return db.bookings.create(req);
```
```ts
// 2. Rumus Irisan Tanggal Inklusif (WIB)
export function isDateRangeOverlapping(
  startA: string, endA: string,
  startB: string, endB: string
): boolean {
  return startA <= endB && startB <= endA;
}
```
```sql
-- 3. Transaksi Atomik PostgreSQL + GiST Constraint
SELECT id, daily_price, status FROM vehicles
WHERE id = p_vehicle_id AND deleted_at IS NULL
FOR UPDATE; -- Kunci baris unit secara eksklusif!

-- Jika ada irisan bookings / maintenance_logs:
-- RAISE EXCEPTION 'CONFLICT_409: Unit sudah dipesan';
```
````

  </div>
</div>

<!--
Narasi Dosen (Slide 9 - Anti Double-Booking & Shiki Magic Move):
Bagaimana RentGo mencegah dua pelanggan memesan mobil yang sama di milidetik yang sama?
Pada sisi kiri terlihat simulasi ketika Pelanggan A dan Pelanggan B memesan Honda Brio BK 1124 AAB untuk tanggal 20 sampai 22 November secara bersamaan.
Melalui Shiki Magic Move di sisi kanan, kita melihat evolusi kode dari pengecekan biasa menjadi rumus irisan tanggal inklusif (startA <= endB AND startB <= endA), lalu dikunci secara atomik di tingkat database menggunakan SELECT ... FOR UPDATE dan constraint GiST di PostgreSQL. Hasilnya: Pelanggan A mendapat 201 Created, sedangkan Pelanggan B ditolak secara deterministik dengan HTTP 409 Conflict.
-->

---
transition: view-transition
clicks: 6
---

<SlideBrandHeader section="09 • Simulasi Interaktif" stepLabel="7 Langkah End-to-End" slideNum="10 / 16" />

<div v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { duration: 450 } }">

# Simulasi Alur Pemesanan End-to-End.
## Dari cari tanggal hingga siap diambil di bandara.

</div>

<InteractiveBookingDemo />

<!--
Narasi Dosen (Slide 10 - Demo-Like Interaktif 7 Langkah):
Komponen interaktif ini memperagakan alur lengkap pengguna dan admin dengan kursor otomatis:
1. Pelanggan memilih tanggal sewa 20-22 November (3 hari inklusif WIB).
2. Pelanggan mengetik kebutuhan di asisten AI Gemini dan mendapatkan rekomendasi Toyota Avanza CVT.
3. Pelanggan memilih unit Avanza CVT dan lanjut ke halaman checkout.
4. Pelanggan memilih titik jemput Bandara Kualanamu di peta interaktif (pin terbang dengan jarak Haversine 23,4 km).
5. Sistem menerbitkan kode QRIS Midtrans Sandbox (rentgo-test) dan pelanggan menekan tombol Sudah Bayar.
6. Status pembayaran berubah menjadi Lunas (Paid) dan status pesanan menjadi Menunggu Konfirmasi Admin.
7. Admin membuka /admin/bookings (dengan sesi 1x login yang sama) dan mengonfirmasi pesanan menjadi Siap Diambil (Confirmed).
-->

---
transition: view-transition
clicks: 1
---

<SlideBrandHeader section="10 • Geolokasi & Desain" stepLabel="Light & Dark Triadic" slideNum="11 / 16" />

<div v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { duration: 450 } }">

# Geolokasi Medan & Dua Tema.
## Peta interaktif Haversine dengan mode terang dan gelap.

</div>

<MapThemeShowcase />

<!--
Narasi Dosen (Slide 11 - Peta Lokasi & Toggle Tema Light/Dark):
RentGo dilengkapi peta interaktif berbasis Leaflet dan OpenStreetMap yang mencakup 3 titik jemput nyata di Medan: Bandara Kualanamu, Stasiun Kereta Api Medan, dan Kantor Garasi RentGo di Jl. Gatot Subroto.
Jarak dihitung menggunakan rumus geometri bola bumi Haversine.
Selain itu, sistem desain menggunakan Teori Warna Triadik (Cobalt Navy 60%, Emerald-Teal 30%, Warm Amber 10%) yang mendukung perpindahan instan antara Tema Gelap (Dark Mode) dan Tema Terang (Light Mode) dengan kontras terverifikasi WCAG AA.
-->

---
transition: view-transition
---

<SlideBrandHeader section="11 • Verifikasi Kualitas" stepLabel="49 Uji Lulus 100%" slideNum="12 / 16" />

<div v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { duration: 450 } }">

# Empat Puluh Sembilan Pengujian Lulus.
## Diverifikasi lewat Vitest, Black-Box, dan Playwright Chromium.

</div>

<TestingMetrics />

<!--
Narasi Dosen (Slide 12 - Pengujian):
Kualitas perangkat lunak dibuktikan melalui 3 lapis pengujian:
1. 21 Unit Test menggunakan Vitest pada 5 file uji (kalkulasi tarif inklusif WIB, state machine pesanan, overlap tanggal, balapan konkuren paralel, dan ekstraksi kueri AI).
2. 20 Skenario Black-Box Testing (TC-001 s/d TC-020) yang menguji seluruh kebutuhan fungsional FR-01 sampai FR-19.
3. 8 Skenario End-to-End otomatis di browser Playwright Chromium pada viewport Desktop dan Mobile.
Pengujian Black-Box menggunakan 3 teknik formal: Equivalence Partitioning (EP), Boundary Value Analysis (BVA), dan State Transition Testing.
-->

---
transition: view-transition
---

<SlideBrandHeader section="12 • Arsitektur Cloud" stepLabel="Zero-Cost Production" slideNum="13 / 16" />

<div v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { duration: 450 } }">

# Pipeline Cloud Tanpa Biaya.
## Integrasi GitHub, Vercel, Supabase, dan Firebase gratis.

</div>

<DeploymentPipeline />

<!--
Narasi Dosen (Slide 13 - Deployment):
Alur deployment dirancang efisien dan bebas biaya langganan bulanan:
Setiap push ke repositori GitHub (rynnxz/rentGO) otomatis memicu build produksi Next.js 15 di Vercel Hobby Plan.
Aplikasi terhubung secara aman melalui variabel lingkungan server ke Supabase PostgreSQL (Free Tier), Firebase Authentication (Spark Plan), Midtrans QRIS Sandbox, dan Google Gemini API Free Tier.
Kami juga menyediakan mekanisme Dual-Mode Repository agar aplikasi tetap dapat berjalan secara lokal meskipun sedang tanpa koneksi internet.
-->

---
transition: view-transition
---

<SlideBrandHeader section="13 • Kesimpulan" stepLabel="RentGo Medan v1.2.0" slideNum="14 / 16" />

<div v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { duration: 450 } }">

# Siap Beroperasi Secara Nyata.
## Fondasi perangkat lunak rental modern untuk Kota Medan.

</div>

<KeynoteSummaryCard />

<!--
Narasi Dosen (Slide 14 - Kesimpulan):
Sebagai kesimpulan, RentGo Medan v1.2.0 berhasil menjawab keempat permasalahan operasional rental kendaraan melalui metodologi SDLC Incremental, arsitektur Single-Domain 1x Login, kunci transaksi atomik anti double-booking, pembayaran QRIS Midtrans Sandbox, rekomendasi AI Gemini, peta lokasi Haversine, serta lulus 100% pada 49 pengujian otomatis dan black-box.
Selanjutnya, mari kita masuk ke portal aplikasi web asli.
-->

---
transition: view-transition
---

<GameLoadingScreen />

<!--
Narasi Dosen (Slide 15 - Transisi Loading Game ke Web Asli):
Transisi ini menyiapkan koneksi ke server aplikasi web RentGo Medan sebelum kita menjalankan demo live secara langsung di slide berikutnya.
-->

---
transition: view-transition
---

<SlideBrandHeader section="14 • Live Web Application" stepLabel="https://rentgo.my.id" slideNum="16 / 16" />

<div v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { duration: 450 } }">

# Portal Live rentgo.my.id.
## Interaksi langsung di atas aplikasi web produksi yang sudah online.

</div>

<LiveDemoEmbed />

<!--
Narasi Dosen (Slide 16 - Slide Demo Live):
Pada slide terakhir ini, aplikasi web RentGo Medan dimuat langsung di dalam iframe interaktif karena header Content-Security-Policy (frame-ancestors) telah dikonfigurasi untuk mengizinkan embed dari origin presentasi.
Bapak/Ibu Dosen juga dapat menekan tombol Buka Tab Baru atau memindai QR Code cadangan untuk menguji langsung permukaan Landing (/), Booking (/book), maupun Panel Admin (/admin). Terima kasih.
-->
