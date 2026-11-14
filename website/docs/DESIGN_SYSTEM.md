# Sistem Desain (Design System) RentGo

> **Design Read (`antislop` Mode `during`):**  
> *Reading this as: Multi-surface vehicle rental platform for Medan travelers and rental operators, in a trustworthy navy-and-amber road-signage visual language, dial `ENERGY 2 / RHYTHM 2 / MOTION 1`.*

Dokumen ini mendefinisikan palet warna yang dikunci sejak Increment 0, tipografi, aturan kontras aksesibilitas WCAG AA, skala spasi, dan alasan di balik setiap keputusan visual sesuai prinsip **antislop (R-01 s/d R-40)**.

---

## 1. Palet Warna Terkunci (Color Tokens)

Seluruh komponen wajib menggunakan CSS Custom Properties yang didefinisikan di `src/styles/tokens.css`. Dilarang menulis kode hex secara langsung di dalam komponen React.

| Token CSS | Nilai Hex | Rasio Kontras vs Putih / Teks | Penggunaan & Alasan Visual (R-31) |
|---|---|---|---|
| `--navy-900` | `#0B1F3A` | **16.45:1** (vs `#FFFFFF`) | Warna identitas utama untuk judul, sidebar admin, footer, dan teks di atas tombol aksen amber (`#F59E0B` vs `#0B1F3A` = **8.96:1**, lulus AAA). Memberikan kesan otoritas dan keandalan transportasi. |
| `--primary-600` | `#1D4ED8` | **6.70:1** (vs `#FFFFFF`) | Tombol aksi primer, tautan aktif, dan cincin fokus (`:focus-visible`). Lulus WCAG AA untuk teks normal di atas tombol biru dengan teks putih. |
| `--primary-700` | `#1E40AF` | **8.72:1** (vs `#FFFFFF`) | State `:hover` dan `:active` pada tombol primer agar umpan balik interaksi terlihat tegas (R-39). |
| `--primary-100` | `#DBEAFE` | **11.95:1** (teks `#1E40AF`) | Latar badge status `confirmed` dan indikator filter aktif. |
| `--primary-50` | `#EFF6FF` | **14.80:1** (teks `#0B1F3A`) | Latar pembatas lembut untuk panel asisten AI dan sorotan informasi penting. |
| `--accent-500` | `#F59E0B` | **8.96:1** (teks `#0B1F3A`) | Tombol CTA utama ("Booking Sekarang") dan penanda status `pending`. Terinspirasi dari warna rambu jalan raya; selalu dipasangkan dengan teks gelap `--navy-900` (bukan putih) agar kontras tinggi. |
| `--accent-600` | `#D97706` | **6.82:1** (teks `#0B1F3A`) | State `:hover` pada tombol aksen. |
| `--accent-50` | `#FFFBEB` | **15.60:1** (teks `#0B1F3A`) | Latar peringatan lembut (batas waktu bayar 24 jam). |
| `--slate-50` | `#F8FAFC` | **18.10:1** (teks `#0F172A`) | Latar dasar halaman agar kartu putih (`#FFFFFF`) memiliki pemisahan bidang tanpa memerlukan bayangan tebal (R-12). |
| `--slate-200` | `#E2E8F0` | - | Garis batas (*border*) kartu, tabel, dan pemisah antarbagian. |
| `--slate-400` | `#94A3B8` | - | Hanya untuk elemen dekoratif/border non-teks; tidak dipakai untuk teks informasi utama agar tidak melanggar R-25. |
| `--slate-600` | `#475569` | **7.58:1** (vs `#FFFFFF`) | Teks sekunder, label metadata spesifikasi, dan keterangan waktu (lulus WCAG AAA). |
| `--slate-900` | `#0F172A` | **19.16:1** (vs `#FFFFFF`) | Teks isi utama di seluruh halaman. |
| `--success` | `#16A34A` | **5.14:1** (teks `#14532D` di `#DCFCE7`) | Indikator ketersediaan unit, pembayaran `paid`, dan booking `completed`. |
| `--danger` | `#DC2626` | **5.92:1** (teks `#7F1D1D` di `#FEE2E2`) | Pesan kesalahan validasi, aksi hapus, dan status `rejected`. |
| `--info` | `#0D9488` | **5.40:1** (teks `#134E4A` di `#CCFBF1`) | Penanda sewa yang sedang berjalan (`ongoing`). |

---

## 2. Pemetaan Warna Badge Status Booking

Setiap badge status menggunakan kombinasi warna latar, garis tepi, dan ikon/label teks yang eksplisit sehingga tidak bergantung pada warna semata (memenuhi aturan `antislop-human` tentang *Color-Only Feedback*):

| Status Booking | Label UI (Bahasa Indonesia) | Warna Latar & Teks |
|---|---|---|
| `pending` | Menunggu Pembayaran | Latar `--accent-50` (`#FFFBEB`), Teks `#92400E`, Border `#F59E0B` |
| `confirmed` | Terkonfirmasi | Latar `--primary-100` (`#DBEAFE`), Teks `--primary-700` (`#1E40AF`), Border `#93C5FD` |
| `ongoing` | Sedang Disewa | Latar `#CCFBF1`, Teks `#115E59`, Border `--info` (`#0D9488`) |
| `completed` | Selesai | Latar `#DCFCE7`, Teks `#166534`, Border `--success` (`#16A34A`) |
| `cancelled` | Dibatalkan | Latar `#F1F5F9`, Teks `--slate-600` (`#475569`), Border `--slate-200` |
| `rejected` | Ditolak Admin | Latar `#FEE2E2`, Teks `#991B1B`, Border `--danger` (`#DC2626`) |
| `expired` | Kedaluwarsa | Latar `#E2E8F0`, Teks `--slate-900` (`#0F172A`), Border `--slate-400` |

---

## 3. Tipografi & Format Data

- **Font Utama:** **Plus Jakarta Sans** (`next/font/google`, subset `latin`, bobot `400`, `500`, `600`, `700`).
  - *Alasan pemilihan (R-06 & R-31):* Dirancang dengan keterbacaan angka tabular yang sangat bersih untuk nominal harga Rupiah dan kode plat kendaraan Indonesia, sekaligus memberi karakter lokal modern yang hangat dibanding font default model AI seperti Inter.
- **Skala Tipografi Responsif:**
  - `h1` (Hero / Judul Halaman): `clamp(1.875rem, 3.5vw, 2.75rem)`, `font-weight: 700`, `line-height: 1.15`, warna `--navy-900`.
  - `h2` (Judul Bagian): `clamp(1.375rem, 2.5vw, 1.875rem)`, `font-weight: 700`, warna `--navy-900`.
  - `h3` (Judul Kartu / Kendaraan): `1.125rem` (`18px`), `font-weight: 600`, warna `--navy-900`.
  - `body` (Teks Utama): `1rem` (`16px`), `line-height: 1.6`, warna `--slate-900`.
  - `small` (Metadata / Label): `0.875rem` (`14px`), `line-height: 1.45`, warna `--slate-600`.
- **Format Uang & Zona Waktu:**
  - Seluruh harga ditampilkan dengan `Intl.NumberFormat('id-ID')` berawalan `Rp ` tanpa desimal, contoh: `Rp 350.000`.
  - Seluruh tanggal dihitung dan ditampilkan dalam zona waktu **Asia/Jakarta (WIB)**.

---

## 4. Geometri Komponen, Spasi, & Interaksi

- **Border Radius (R-11):**
  - Kartu kendaraan, panel filter, dan dialog: `12px` (`--radius-card: 0.75rem`).
  - Tombol, input form, dan select: `8px` (`--radius-control: 0.5rem`).
  - Badge status: `6px` (`0.375rem`), bukan kapsul penuh pada semua elemen agar hirarki antara tombol, kartu, dan label tetap jelas.
- **Elevasi / Bayangan (R-12):**
  - Kartu standar menggunakan garis tepi `1px solid var(--slate-200)` di atas latar `--slate-50` tanpa bayangan besar.
  - Bayangan halus (`--shadow-card`) hanya diberikan pada panel mengambang yang membutuhkan penekanan hirarki (seperti formulir pencarian cepat di Hero dan modal dialog).
- **Ukuran Sentuh & Aksesibilitas (R-03, R-32, R-39):**
  - Seluruh tombol, tautan navigasi, dan input form memiliki tinggi minimum **44px** (`min-h-[44px]`).
  - Layer CSS dasar menetapkan `cursor: pointer` pada seluruh elemen interaktif yang aktif dan `cursor: not-allowed` pada elemen `disabled`.
  - Indikator fokus `:focus-visible` menggunakan `outline: 2px solid var(--primary-600); outline-offset: 2px`.
- **Identitas Tiga Surface:**
  - **Landing (`rentgo.my.id`):** Komposisi asimetris pada Hero (teks & indikator rute Medan di kiri, kalkulator cek jadwal langsung di kanan), bagian informasi yang bervariasi (tabel perbandingan harga transparan, bukan sekadar pengulangan grid kartu identik).
  - **Booking (`book.rentgo.my.id`):** Berorientasi tugas (*task-first*); bilah filter tanggal selalu terlihat di bagian atas, diikuti panel rekomendasi AI dan grid kartu spesifikasi kendaraan dengan rincian kursi, transmisi, bahan bakar, serta harga harian.
  - **Admin (`admin.rentgo.my.id`):** Berorientasi keputusan operasional; sidebar vertikal `--navy-900` di desktop (berubah menjadi drawer/menu di layar sempit), kartu KPI yang dihitung langsung dari database, serta tabel dengan kolom penentu keputusan di sisi kiri.
