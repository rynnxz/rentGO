---
theme: default
title: "RentGo Medan - Sistem Manajemen Penyewaan Kendaraan (UTS MMPRPL)"
info: |
  Presentasi Ujian Tengah Semester (UTS)
  Mata Kuliah: Metode Model Pengembangan Perangkat Lunak
  Mahasiswa: Akbar Riansyah
  Proyek Individu No. 2: Sistem Manajemen Penyewaan Kendaraan (RentGo)
  TRPL Semester III - Politeknik Wilmar Bisnis Indonesia
colorSchema: light
transition: slide-left
mdc: true
---

# RentGo Medan
## Sistem Manajemen Penyewaan Kendaraan Berbasis Web dengan Metodologi SDLC Incremental

<div class="mt-6 grid grid-cols-2 gap-4 text-sm">
  <div class="rentgo-card">
    <p class="font-bold text-xs uppercase" style="color: var(--primary-600)">Identitas Akademik UTS</p>
    <p class="mt-1"><strong>Nama Mahasiswa:</strong> Akbar Riansyah</p>
    <p><strong>Proyek Individu:</strong> No. 2 - Penyewaan Kendaraan</p>
    <p><strong>Mata Kuliah:</strong> Metode Model Pengembangan Perangkat Lunak</p>
    <p><strong>Program Studi:</strong> TRPL Semester III - Politeknik Wilmar Bisnis Indonesia</p>
  </div>
  <div class="rentgo-card">
    <p class="font-bold text-xs uppercase" style="color: var(--primary-600)">Ekosistem Subdomain Tunggal</p>
    <p class="mt-1"><code>rentgo.my.id</code> : Landing & Transparansi Tarif</p>
    <p><code>book.rentgo.my.id</code> : Katalog Real-Time, AI, & Checkout</p>
    <p><code>admin.rentgo.my.id</code> : Dasbor KPI, Armada, & Servis</p>
  </div>
</div>

---

# 1. Latar Belakang & Rumusan Masalah

Operasional usaha rental mobil dan motor di Kota Medan (Bandara Kualanamu, Stasiun Medan, dan rute wisata Danau Toba) sering menghadapi 4 kendala utama ketika masih dikelola via buku tulis atau spreadsheet terpisah:

<div class="mt-4 grid grid-cols-2 gap-4 text-sm">
  <div class="rentgo-card">
    <h3 class="text-base">1. Risiko Double-Booking</h3>
    <p class="mt-1 text-xs" style="color: var(--slate-600)">Dua pelanggan memesan unit plat BK yang sama pada tanggal beririsan karena pencatatan jadwal tidak terkunci secara atomik.</p>
  </div>
  <div class="rentgo-card">
    <h3 class="text-base">2. Ketidaksinkronan Jadwal Bengkel</h3>
    <p class="mt-1 text-xs" style="color: var(--slate-600)">Kendaraan yang sedang ganti oli atau servis rem tetap ditawarkan ke pelanggan karena data bengkel terpisah dari katalog.</p>
  </div>
  <div class="rentgo-card">
    <h3 class="text-base">3. Ketidakpastian Perhitungan Tarif</h3>
    <p class="mt-1 text-xs" style="color: var(--slate-600)">Perhitungan durasi hari sewa inklusif dan verifikasi bukti transfer tidak memiliki riwayat status (state machine) yang baku.</p>
  </div>
  <div class="rentgo-card">
    <h3 class="text-base">4. Kebingungan Memilih Armada</h3>
    <p class="mt-1 text-xs" style="color: var(--slate-600)">Wisatawan sering kesulitan menentukan unit yang tepat antara City Car, MPV 7 kursi, SUV tanjakan Berastagi, atau Hiace rombongan.</p>
  </div>
</div>

---

# 2. Alasan Pemilihan Metodologi SDLC Incremental

Mengapa **Incremental Model** dipilih dibandingkan Waterfall, Prototype, atau Scrum penuh untuk proyek individu ini?

| Kriteria Evaluasi | Waterfall | Prototype | Agile Scrum | **SDLC Incremental (Dipilih)** |
| :--- | :--- | :--- | :--- | :--- |
| **Pengiriman Perangkat Lunak Kerja** | Hanya di akhir proyek | Fokus UI semu | Tiap sprint (butuh tim) | **Bertahap tiap Increment (`v0.1.0`..`v1.0.0`)** |
| **Mitigasi Risiko Anti Double-Booking** | Terlambat diuji | Tidak menguji transaksi DB | Baik | **Diuji penuh sejak Increment 2 (`v0.3.0`)** |
| **Kesesuaian Proyek Individu UTS** | Terlalu kaku | Kurang kokoh di backend | Overhead seremonial tim | **Ideal untuk pengembang tunggal terstruktur** |

<div class="mt-4 rentgo-card text-xs">
  <strong>Prinsip Utama:</strong> Setiap increment menghasilkan tambahan fungsionalitas yang terintegrasi penuh, melewati pemeriksaan tipe TypeScript, unit test Vitest, dan ditandai dengan Git tag rilis resmi.
</div>

---

# 3. Peta Jalan 5 Increment (`v0.1.0` s/d `v1.0.0`)

```mermaid
flowchart LR
    I0["Increment 0 (v0.1.0)\nFoundation, Host Routing,\nSupabase Schema & Auth"] --> I1["Increment 1 (v0.2.0)\nAdmin Panel, CRUD Armada,\nKategori, Servis & RBAC"]
    I1 --> I2["Increment 2 (v0.3.0)\nBooking Engine, Anti Double-Booking,\nHarga WIB & Bukti Bayar"]
    I2 --> I3["Increment 3 (v0.4.0)\nLanding 10 Bagian, AI Gemini,\nDasbor KPI & Cron"]
    I3 --> I4["Increment 4 (v1.0.0)\nUnit + E2E Playwright,\nScreenshots, Docs & Slidev"]
```

<div class="mt-4 grid grid-cols-5 gap-2 text-xs">
  <div class="rentgo-card"><strong>Inc 0</strong><br/>Middleware 3 subdomain, 7 tabel SQL, cookie <code>__session</code></div>
  <div class="rentgo-card"><strong>Inc 1</strong><br/>CRUD Kategori, Kendaraan (soft delete), Perawatan, Pelanggan</div>
  <div class="rentgo-card"><strong>Inc 2</strong><br/>Katalog WIB, checkout, state machine booking, WhatsApp</div>
  <div class="rentgo-card"><strong>Inc 3</strong><br/>Landing publik, AI "Bantu Saya Pilih", laporan CSV</div>
  <div class="rentgo-card"><strong>Inc 4</strong><br/>21 Unit Test, 6 E2E Suite, 10 Screenshot, Dek Slidev</div>
</div>

---

# 4. Arsitektur Satu Deployment - 3 Subdomain

Satu proyek **Next.js 15 App Router** melayani tiga permukaan melalui `src/middleware.ts`:

```mermaid
flowchart TD
    Req["HTTP Request Masuk"] --> Block{"Path dimulai /site/* ?"}
    Block -->|"Ya"| E404["Rewrite ke /_not-found (HTTP 404)"]
    Block -->|"Tidak"| Host{"Resolusi Host / ?site="}
    Host -->|"rentgo.my.id"| S1["Rewrite ke /site/landing"]
    Host -->|"book.rentgo.my.id"| S2["Rewrite ke /site/book"]
    Host -->|"admin.rentgo.my.id"| S3["Rewrite ke /site/admin"]
```

- **Keamanan Path Internal:** Permintaan langsung browser ke `/site/admin` otomatis dikembalikan **HTTP 404**.
- **Berbagi Sesi Lintas Subdomain:** Cookie HTTP-only `__session` menggunakan `domain: .rentgo.my.id` di produksi.
- **Efisiensi Biaya Rp0:** Hanya menggunakan 1 slot proyek pada Vercel Hobby Plan + Supabase Free + Firebase Spark.

---

# 5. Perancangan Basis Data (7 Tabel) & State Machine

<div class="grid grid-cols-2 gap-4 text-xs">
  <div class="rentgo-card">
    <h3 class="text-sm">7 Tabel Inti PostgreSQL (`0001_init.sql`)</h3>
    <ol class="mt-2 space-y-1 list-decimal pl-4">
      <li><code>users</code> : Profil pengguna Google & role (<code>customer</code> / <code>admin</code>)</li>
      <li><code>vehicle_categories</code> : 5 kategori armada</li>
      <li><code>vehicles</code> : 12 unit plat BK Medan + <code>deleted_at</code></li>
      <li><code>bookings</code> : Transaksi sewa + snapshot tarif harian</li>
      <li><code>payments</code> : Bukti bayar & status verifikasi (<code>unpaid</code>/<code>paid</code>/<code>refunded</code>)</li>
      <li><code>maintenance_logs</code> : Jadwal servis bengkel pengunci unit</li>
      <li><code>ai_recommendation_logs</code> : Audit & kuota harian AI (10x/hari)</li>
    </ol>
  </div>
  <div class="rentgo-card">
    <h3 class="text-sm">Aturan State Machine Booking</h3>
    <ul class="mt-2 space-y-1.5 list-disc pl-4">
      <li><code>pending -> confirmed</code> (Admin setelah cek bukti bayar)</li>
      <li><code>pending -> cancelled</code> (Customer mandiri / Admin)</li>
      <li><code>pending -> rejected</code> (Admin dengan alasan)</li>
      <li><code>pending -> expired</code> (Cron otomatis lewat 24 jam)</li>
      <li><code>confirmed -> ongoing</code> (Admin saat serah terima kunci)</li>
      <li><code>ongoing -> completed</code> (Admin saat unit kembali)</li>
    </ul>
  </div>
</div>

---

# 6. Mesin Anti Double-Booking & Kalkulasi Harga Server-Side

<div class="grid grid-cols-2 gap-4 text-xs">
  <div class="rentgo-card">
    <h3 class="text-sm">1. Rumus Irisan Tanggal Inklusif (WIB)</h3>
    <p class="mt-2">Dua rentang tanggal <code>[existing.start, existing.end]</code> dan <code>[req.start, req.end]</code> dinyatakan bentrok apabila:</p>
    <pre class="mt-2 p-2 rounded bg-slate-100 font-mono text-[11px]">existing.start_date &lt;= req.end_date
AND existing.end_date &gt;= req.start_date</pre>
    <p class="mt-2">Berlaku baik terhadap <code>bookings</code> aktif (<code>pending</code>, <code>confirmed</code>, <code>ongoing</code>) maupun <code>maintenance_logs</code> (<code>scheduled</code>, <code>in_progress</code>).</p>
  </div>
  <div class="rentgo-card">
    <h3 class="text-sm">2. Kalkulasi Harga & Kunci Transaksional</h3>
    <p class="mt-2">Harga dari klien tidak pernah dipercaya; server menghitung ulang:</p>
    <pre class="mt-2 p-2 rounded bg-slate-100 font-mono text-[11px]">total_days  = (end_date - start_date) + 1
total_price = total_days * vehicle.daily_price</pre>
    <p class="mt-2">Di PostgreSQL dikunci dengan <code>SELECT ... FOR UPDATE</code> pada fungsi RPC <code>create_booking_safe</code>; di repositori lokal dikunci dengan mutex asinkron <code>withStoreTransaction</code>.</p>
  </div>
</div>

---

# 7. Permukaan 1: Landing Page (`rentgo.my.id`)

<div class="grid grid-cols-12 gap-4 items-center">
  <div class="col-span-7">
    <img src="/screens/01-landing-hero.png" alt="Tangkapan Layar Landing Hero RentGo" class="rounded border shadow-sm w-full" />
  </div>
  <div class="col-span-5 space-y-2 text-xs">
    <div class="rentgo-card">
      <h3 class="text-sm">10 Bagian Terstruktur</h3>
      <ul class="mt-1 space-y-1 list-disc pl-4">
        <li>Sticky Navbar & CTA Aplikasi Booking</li>
        <li>Split-Hero + Quick Date Search WIB</li>
        <li>Gambar LCP berprioritas tinggi (<code>fetchpriority="high"</code>)</li>
        <li>4 Keunggulan Operasional Nyata</li>
        <li>Armada Unggulan langsung dari Database</li>
        <li>Tabel Transparansi Tarif & FAQ Medan</li>
        <li>Structured Data JSON-LD <code>AutoRental</code></li>
      </ul>
    </div>
  </div>
</div>

---

# 8. Permukaan 2: Katalog Booking & Rekomendasi AI (`book.rentgo.my.id`)

<div class="grid grid-cols-2 gap-4 items-start">
  <div>
    <img src="/screens/04-book-ai-recommend.png" alt="Panel Rekomendasi AI Bantu Saya Pilih" class="rounded border shadow-sm w-full" />
  </div>
  <div class="space-y-2 text-xs">
    <div class="rentgo-card">
      <h3 class="text-sm">Asisten AI "Bantu Saya Pilih"</h3>
      <p class="mt-1">Menggunakan <strong>Google Gemini SDK (<code>@google/genai</code>)</strong> dengan skema JSON terstruktur:</p>
      <ul class="mt-1.5 space-y-1 list-disc pl-4">
        <li><strong>Bebas Halusinasi:</strong> AI hanya diberi kandidat kendaraan yang nyata dan tersedia pada tanggal pilihan pelanggan.</li>
        <li><strong>Validasi Server:</strong> Setiap <code>vehicle_id</code> diverifikasi ulang terhadap daftar unit tersedia.</li>
        <li><strong>Fallback Deterministik:</strong> Tetap bekerja 100% menggunakan algoritma skor aturan jika kuota API habis atau kunci belum diisi.</li>
      </ul>
    </div>
  </div>
</div>

---

# 9. Checkout Pelanggan, Bukti Bayar, & Konfirmasi WhatsApp

<div class="grid grid-cols-2 gap-4 items-start">
  <div>
    <img src="/screens/05-book-checkout.png" alt="Halaman Detail Kendaraan dan Checkout" class="rounded border shadow-sm w-full" />
  </div>
  <div>
    <img src="/screens/06-book-my-bookings.png" alt="Halaman Pesanan Saya" class="rounded border shadow-sm w-full" />
  </div>
</div>

<div class="mt-3 rentgo-card text-xs">
  Pelanggan memilih titik serah terima (<strong>Bandara Kualanamu</strong>, <strong>Stasiun Medan</strong>, atau <strong>Kantor RentGo Medan</strong>), mengunggah bukti transfer/QRIS, dapat membatalkan pesanan selama masih <code>pending</code>, dan mengirim pesan konfirmasi otomatis ke WhatsApp Admin.
</div>

---

# 10. Permukaan 3: Panel Operasional Admin (`admin.rentgo.my.id`)

<div class="grid grid-cols-2 gap-4 items-start">
  <div>
    <img src="/screens/07-admin-dashboard.png" alt="Dasbor Operasional Admin RentGo" class="rounded border shadow-sm w-full" />
  </div>
  <div>
    <img src="/screens/09-admin-bookings.png" alt="Manajemen Pesanan dan Pembayaran Admin" class="rounded border shadow-sm w-full" />
  </div>
</div>

<div class="mt-3 rentgo-card text-xs">
  Dilengkapi proteksi RBAC ketat (<code>HTTP 403</code> bagi non-admin), 6 kartu KPI real-time, grafik pendapatan 6 bulan, matriks ketersediaan 7 hari, CRUD Kategori/Kendaraan/Perawatan, verifikasi pembayaran, dan ekspor laporan CSV.
</div>

---

# 11. Hasil Pengujian & Kesimpulan

<div class="grid grid-cols-3 gap-3 text-xs">
  <div class="rentgo-card">
    <h3 class="text-sm">1. Unit Test (Vitest)</h3>
    <p class="mt-1 font-bold" style="color: var(--primary-600)">21 / 21 Test PASS</p>
    <p class="mt-1">Mencakup kalkulasi harga inklusif, state machine booking, validasi Zod, resolusi subdomain, simulasi balapan konkuren, dan fallback AI.</p>
  </div>
  <div class="rentgo-card">
    <h3 class="text-sm">2. Black-Box Testing</h3>
    <p class="mt-1 font-bold" style="color: var(--primary-600)">20 / 20 Skenario PASS</p>
    <p class="mt-1">Seluruh kebutuhan fungsional <code>FR-01</code> s/d <code>FR-19</code> terverifikasi pada tabel uji <code>TC-001</code> s/d <code>TC-020</code>.</p>
  </div>
  <div class="rentgo-card">
    <h3 class="text-sm">3. E2E Playwright</h3>
    <p class="mt-1 font-bold" style="color: var(--primary-600)">6 / 6 Suite E2E PASS</p>
    <p class="mt-1">Menguji alur nyata di Chromium headless: RBAC 403/404, CRUD Admin, siklus penuh booking, pembatalan, kunci servis, dan rekomendasi AI.</p>
  </div>
</div>

<div class="mt-4 rentgo-card text-xs">
  <strong>Kesimpulan:</strong> Penerapan <strong>SDLC Incremental</strong> memungkinkan pembangunan sistem penyewaan kendaraan <strong>RentGo Medan</strong> secara bertahap dari fondasi multi-subdomain (`v0.1.0`) hingga rilis produksi (`v1.0.0`) yang bebas double-booking, teruji secara otomatis, dan beroperasi penuh dengan biaya infrastruktur Rp0.
</div>
