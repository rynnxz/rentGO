# Sistem Desain (Design System) RentGo Medan - Teori Warna Triadik

> **Design Read (`antislop` Mode `during`):**  
> *Reading this as: Multi-surface vehicle rental platform for Medan travelers and rental operators, built on a 120-degree Triadic Color Theory (Cobalt/Navy + Emerald-Teal + Warm Amber-Gold), dial `ENERGY 2 / RHYTHM 2 / MOTION 1`.*

Dokumen ini mendefinisikan **Teori Warna Triadik** yang digunakan di seluruh permukaan **RentGo Medan**, perancangan logo baru, tipografi, aturan kontras aksesibilitas WCAG AA, responsivitas navigasi sticky, dan strategi penggunaan foto kendaraan asli (`public/vehicles/`).

---

## 1. Teori Warna Triadik (Triadic Color Theory - Proporsi 60 : 30 : 10)

Palet warna **RentGo Medan** menggunakan skema **Triadik (3 titik berjarak ~120 derajat pada roda warna)** yang dikunci di `src/styles/tokens.css`:

1. **Triad I - Dominan 60% (`220 deg` Cobalt & Deep Navy):** `#0B1D3A` (`--navy-900`), `#112A52` (`--navy-800`), `#1D4ED8` (`--primary-600`). Mewakili keandalan transportasi, struktur navigasi sticky, sidebar Admin, dan tombol aksi utama.
2. **Triad II - Sekunder 30% (`172 deg` Emerald-Teal):** `#0D9488` (`--secondary-600`), `#0F766E` (`--secondary-700`), `#F0FDFA` (`--secondary-50`). Mewakili status unit tersedia secara real-time, verifikasi pembayaran lunas QRIS Midtrans Sandbox, dan indikator operasional aktif.
3. **Triad III - Aksen 10% (`38 deg` Warm Amber-Gold):** `#F59E0B` (`--accent-500`), `#B45309` (`--accent-600`), `#FFFBEB` (`--accent-50`). Mewakili sorotan konversi utama, emblem perisai logo, asisten AI Gemini, dan tombol Edit armada.

| Token CSS | Nilai Hex | Peran Triadik | Rasio Kontras & Kepatuhan WCAG AA |
| :--- | :--- | :--- | :--- |
| `--navy-900` | `#0B1D3A` | Triad I (Dominan) | **16.82:1** vs `#FFFFFF` (AAA) - Judul utama, sidebar Admin, dan teks di atas tombol Amber. |
| `--primary-600` | `#1D4ED8` | Triad I (Interaktif) | **6.70:1** vs `#FFFFFF` (AA) - Tombol primer, border fokus `:focus-visible`, dan indikator navigasi aktif. |
| `--secondary-600` | `#0D9488` | Triad II (Sekunder) | **5.40:1** (`#0F766E` di `#F0FDFA`) - Badge ketersediaan unit, QRIS Midtrans Sandbox, dan tombol Verifikasi Lunas. |
| `--secondary-700` | `#0F766E` | Triad II (Teks/Hover) | **5.62:1** vs `#FFFFFF` (AA) - Teks dan border tegas pada komponen sekunder Emerald-Teal. |
| `--accent-500` | `#F59E0B` | Triad III (Aksen) | **8.96:1** vs `#0B1D3A` (AAA) - Emblem logo, CTA sorotan, dan penanda status `pending`. |
| `--accent-600` | `#B45309` | Triad III (Teks Aksen) | **5.02:1** vs `#FFFBEB` (AA) - Teks aksen hangat pada badge fitur dan tombol Edit. |
| `--slate-50` | `#F8FAFC` | Netral Latar | **18.10:1** vs `#0F172A` - Latar dasar halaman agar kartu putih (`#FFFFFF`) terpisah bersih. |
| `--slate-600` | `#475569` | Netral Teks Sekunder | **7.58:1** vs `#FFFFFF` (AAA) - Teks metadata spesifikasi, label form, dan keterangan waktu WIB. |

---

## 2. Identitas Logo Otomotif Triadik (`src/components/shared/logo.tsx`)

Logo **RentGo Medan** dirancang ulang menggunakan vektor SVG presisi tinggi yang menggabungkan ketiga warna Triadik:
- **Perisai Gradien Cobalt-Navy (Triad I):** Melambangkan keamanan perjalanan dan proteksi transaksi anti double-booking.
- **Jalur Kecepatan Emerald-Teal (Triad II):** Melambangkan kelancaran mobilitas rute Bandara Kualanamu - Medan - Danau Toba.
- **Lencana Puncak & Pin Lokasi Amber-Gold (Triad III):** Melambangkan layanan tepat waktu di titik penjemputan pilihan pelanggan.
- **Tipografi Dua Warna (`Rent` + `Go`) dengan Badge Surface:** Menampilkan penanda konteks permukaan (`MEDAN`, `BOOKING`, atau `ADMIN PANEL`).

---

## 3. Strategi Foto Kendaraan Asli vs Placeholder SVG (`public/vehicles/`)

Untuk memastikan tampilan katalog dan landing page tampak nyata dan meyakinkan bagi pelanggan:
- **Foto Kendaraan Asli (Utama):** Enam unit armada utama menggunakan foto kendaraan asli di `website/public/vehicles/`:
  1. `Honda-Brio-Satya-RS.jfif` (`Honda Brio Satya RS` - `BK 1124 AAB`)
  2. `Toyota-Agya-GR-Sport.jpg` (`Toyota Agya GR Sport` - `BK 1482 AAC`)
  3. `Toyota-Avanza-1.5-G-CVT.png` (`Toyota Avanza 1.5 G CVT` - `BK 1750 AAD`)
  4. `Daihatsu-Xenia-1.3-R-MT.png` (`Daihatsu Xenia 1.3 R MT` - `BK 1310 AAG`)
  5. `yamaha-nmax-155-connected.png` (`Yamaha NMAX 155 Connected` - `BK 4112 AAM`)
  6. `honda-vario-160-abs.jfif` (`Honda Vario 160 ABS` - `BK 4288 AAN`)
- **Ilustrasi SVG (`city-car.svg`, `mpv.svg`, `suv.svg`, `van.svg`, `scooter.svg`):** Dipertahankan khusus sebagai *fallback placeholder* apabila unit kendaraan baru belum memiliki unggahan foto kamera atau terjadi kegagalan muat gambar (`onError`).

---

## 4. Responsivitas Navigasi Sticky & Toolbar Aksi Tabel Admin

1. **Sticky Navbar di Seluruh Permukaan (`sticky top-0 z-40`):**
   - Baik pada `rentgo.my.id`, `book.rentgo.my.id`, maupun `admin.rentgo.my.id`, bilah navigasi atas dikunci menggunakan `sticky top-0` dengan efek `backdrop-blur-md` sehingga selalu mudah dijangkau saat halaman di-scroll.
2. **Sticky Sidebar Desktop & Laci Mobile Admin (`src/components/admin/admin-shell.tsx`):**
   - Pada layar desktop (`lg:`), sidebar Admin menggunakan `lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto` sehingga tidak ikut tergulung ketika melihat tabel pesanan atau armada yang panjang.
   - Pada layar mobile/tablet, tersedia tombol menu pembuka laci (*slide-over drawer*) serta bar navigasi cepat horizontal.
   - Tautan mati *Panduan Desain* (`/_styleguide`) telah dihapus sepenuhnya agar seluruh menu di sidebar Admin fungsional 100%.
3. **Toolbar Tombol Aksi (Action Buttons) Tabel Admin yang Responsif:**
   - Seluruh kolom **Aksi** pada 5 tabel Admin (`BookingsManager`, `VehiclesManager`, `MaintenanceManager`, `CustomersManager`, `CategoriesManager`) menggunakan kontainer `inline-flex flex-wrap items-center justify-end gap-1.5` dengan tinggi konsisten `min-h-[38px]`, garis tepi (`border`) tegas, bayangan halus (`shadow-2xs`), dan pengkodean warna Triadik.
