# Bab 6: Naskah Presentasi UTS, Alur Demo, & Tanya-Jawab Penguji - RentGo Medan

- **Mahasiswa:** Akbar Riansyah
- **Proyek Individu:** No. 2 - Sistem Manajemen Penyewaan Kendaraan (**RentGo**)
- **Mata Kuliah:** Metode Model Pengembangan Perangkat Lunak (UTS)
- **Program Studi:** Teknologi Rekayasa Perangkat Lunak (TRPL) Semester III - Politeknik Wilmar Bisnis Indonesia

---

## 6.1 Naskah Alur Demo Langsung (7 Langkah - Durasi 5 s/d 7 Menit)

### Langkah 1: Demonstrasi Arsitektur Multi-Subdomain & Halaman Landing (`rentgo.my.id`)
1. Buka permukaan Landing (`http://localhost:3000/?site=landing` atau `https://rentgo.my.id`).
2. Tunjukkan 10 bagian terstruktur: Navbar sticky, Hero split-layout dengan pencarian cepat WIB, 4 keunggulan operasional, katalog armada nyata dari database, 3 langkah menyewa, tabel transparansi harga, FAQ Medan, dan JSON-LD `AutoRental`.
3. Tunjukkan bahwa akses langsung ke path internal `http://localhost:3000/site/admin` diblokir oleh middleware dengan status **HTTP 404**.

### Langkah 2: Pencarian Ketersediaan Real-Time & Eksklusi Unit Servis (`book.rentgo.my.id`)
1. Gunakan formulir pencarian cepat di Hero atau buka `http://localhost:3000/?site=book`.
2. Pilih tanggal `2026-11-15` s/d `2026-11-16`. Tunjukkan bahwa unit **Toyota Rush GR (`BK 1601 RGO`)** otomatis disembunyikan karena sedang memiliki catatan perawatan berstatus `in_progress` pada tanggal tersebut.

### Langkah 3: Fitur Rekomendasi Kendaraan Cerdas ("Bantu Saya Pilih" - AI)
1. Pada panel **"Bantu Saya Pilih Kendaraan (Asisten AI RentGo)"**, masukkan kueri bahasa alami:
   > *"Saya butuh mobil keluarga 7 kursi matic yang nyaman untuk perjalanan dari Medan ke Danau Toba selama 3 hari dengan budget sekitar 500rb per hari."*
2. Klik **"Cari Rekomendasi AI"**. Tunjukkan bahwa sistem menampilkan 3 unit kendaraan nyata yang tersedia pada tanggal tersebut beserta skor kecocokan (`fit_score`) dan alasan rekomendasi dalam Bahasa Indonesia.

### Langkah 4: Login Google (Customer), Kalkulator Harga Server-Side, & Checkout
1. Klik **"Pilih Unit Ini"** pada salah satu unit rekomendasi (misalnya Toyota Avanza G `BK 1401 RGO`).
2. Klik **"Masuk dengan Google"** dan pilih akun pelanggan **Nadia Siregar (`nadia.siregar@gmail.com`)**.
3. Pilih lokasi pengambilan **Bandara Kualanamu**, isi nomor HP & nomor SIM A, lalu tunjukkan kalkulator harga inklusif dan instruksi rekening bank beserta batas waktu pembayaran 24 jam.
4. Klik **"Konfirmasi & Buat Pesanan Sekarang"**. Sistem membuat kode booking `RG-YYMMDD-XXXX` dengan status `pending`.

### Langkah 5: Unggah Bukti Pembayaran & Konfirmasi WhatsApp
1. Pada halaman detail pesanan, klik tombol unggah bukti transfer (atau **"Gunakan Bukti Struk Contoh"**).
2. Tunjukkan bukti bayar langsung tercatat dan klik **"Konfirmasi via WhatsApp Admin Medan"** yang membuka tautan `wa.me` dengan rincian kode booking, nama unit, tanggal sewa, dan total tagihan Rupiah.

### Langkah 6: Proteksi RBACCross-Role (`HTTP 403`)
1. Saat masih login sebagai pelanggan (`Nadia Siregar`), coba buka permukaan Admin (`http://localhost:3000/?site=admin`).
2. Tunjukkan bahwa sistem menolak akses dengan halaman **HTTP 403 - Akses Ditolak** karena akun pelanggan tidak memiliki hak Administrator.

### Langkah 7: Dasbor Operasional Admin, Verifikasi Lunas, & State Machine (`admin.rentgo.my.id`)
1. Keluar dari akun pelanggan, lalu masuk sebagai Administrator **Akbar Riansyah (`akbarriansyah339@gmail.com`)**.
2. Tunjukkan **Dasbor Utama Admin**: 6 kartu KPI, grafik pendapatan 6 bulan terakhir, Top 5 unit terlaris, dan matriks kalender ketersediaan 7 hari.
3. Buka menu **Pesanan & Pembayaran**, klik **"Set Lunas"** pada pesanan baru, lalu jalankan tombol transisi state machine secara bertahap: **Konfirmasi (`confirmed`) -> Mulai Sewa (`ongoing`) -> Selesaikan Sewa (`completed`)**.
4. Klik **"Ekspor Laporan CSV"** untuk mengunduh laporan transaksi.

---

## 6.2 Jawaban Lengkap 6 Pertanyaan Wajib Dosen Penguji

### Pertanyaan 1: Mengapa memilih model SDLC Incremental dibanding Waterfall, Prototype, atau Agile Scrum penuh untuk proyek RentGo ini?
**Jawaban:**
- **Dibandingkan Waterfall:** Waterfall menuntut seluruh fitur selesai di akhir sebelum ada perangkat lunak yang dapat diuji. Pada sistem penyewaan kendaraan yang memiliki aturan bisnis kritis (anti double-booking dan kalkulasi harga), menunda pengujian integrasi hingga akhir sangat berisiko. Dengan **SDLC Incremental**, setiap increment menghasilkan produk kerja (*working software*) yang teruji: Increment 0 membangun fondasi routing & autentikasi, Increment 1 menyerahkan inventaris armada Admin, Increment 2 menyerahkan mesin transaksi booking bebas bentrok, Increment 3 menambahkan halaman pemasaran & asisten AI, dan Increment 4 melakukan penguatan pengujian E2E.
- **Dibandingkan Prototype:** Model Prototype berfokus pada eksplorasi antarmuka semu yang sering kali dibuang (*throwaway*). Pada RentGo, skema basis data, aturan irisan tanggal, dan kontrol akses dirancang matang sejak Increment 0 sehingga setiap increment memperkuat kode produksi nyata.
- **Dibandingkan Agile Scrum penuh:** Scrum membutuhkan tim lintas fungsi (Product Owner, Scrum Master, beberapa Developer) dengan seremonial harian. Untuk proyek individu UTS dengan tenggat waktu terukur dan spesifikasi akademik yang tegas, **SDLC Incremental** memberikan disiplin arsitektur yang kuat sekaligus pengiriman bertahap yang terverifikasi lewat tag Git `v0.1.0` hingga `v1.0.0`.

---

### Pertanyaan 2: Bagaimana cara kerja arsitektur satu proyek Next.js untuk melayani 3 subdomain (`rentgo.my.id`, `book.rentgo.my.id`, dan `admin.rentgo.my.id`)?
**Jawaban:**
1. Seluruh subdomain diarahkan pada tingkat DNS Cloudflare ke satu proyek Vercel yang sama.
2. Setiap request HTTP yang masuk dicegat terlebih dahulu oleh `src/middleware.ts`.
3. Middleware membaca header `Host` dan memetakan URL secara transparan menggunakan `NextResponse.rewrite()` tanpa mengubah URL di bilah alamat browser pengguna:
   - `admin.rentgo.my.id/<path>` ditulis ulang secara internal ke `/site/admin/<path>`.
   - `book.rentgo.my.id/<path>` ditulis ulang secara internal ke `/site/book/<path>`.
   - `rentgo.my.id/<path>` ditulis ulang secara internal ke `/site/landing/<path>`.
4. Jika pengguna mencoba mengakses `/site/admin` atau `/site/book` secara langsung dari browser, middleware memblokirnya dan menulis ulang ke `/_not-found` (HTTP 404) agar struktur folder internal tidak terekspos.
5. Di lingkungan pengembangan lokal atau preview Vercel, middleware mendukung parameter `?site=landing|book|admin` yang disimpan ke cookie `__site`, namun fitur override ini dinonaktifkan secara ketat pada domain produksi utama.

---

### Pertanyaan 3: Bagaimana mekanisme teknis sistem mencegah terjadinya *double-booking* (dua pelanggan memesan mobil yang sama di tanggal yang beririsan)?
**Jawaban:**
Pencegahan *double-booking* diterapkan secara berlapis (*defense-in-depth*):
1. **Rumus Irisan Tanggal Inklusif:** Dua rentang tanggal `[existing.start_date, existing.end_date]` dan `[req.start_date, req.end_date]` dinyatakan bentrok apabila:
   `existing.start_date <= req.end_date AND existing.end_date >= req.start_date`.
2. **Pemeriksaan Status Aktif & Jadwal Servis:** Sebuah kendaraan hanya dapat dipesan jika berstatus `active`, tidak dihapus (`deleted_at IS NULL`), tidak memiliki booking berstatus `pending`, `confirmed`, atau `ongoing` yang beririsan tanggalnya, dan tidak memiliki jadwal `maintenance_logs` berstatus `scheduled` atau `in_progress` pada tanggal tersebut.
3. **Penguncian Transaksional (Row-Level Locking & Mutex):**
   - Pada PostgreSQL Supabase (`0001_init.sql`), fungsi RPC `create_booking_safe` menjalankan `SELECT ... FROM vehicles WHERE id = p_vehicle_id FOR UPDATE` yang mengunci baris kendaraan selama transaksi berlangsung. Jika ada dua request paralel di milidetik yang sama, transaksi kedua wajib menunggu transaksi pertama selesai lalu otomatis gagal karena melihat booking yang baru saja dibuat.
   - Pada repositori lokal (`src/lib/repository.ts`), seluruh mutasi dibungkus dalam antrean mutex asinkron `withStoreTransaction` yang telah dibuktikan oleh pengujian unit konkuren `tests/unit/availability-and-concurrency.test.ts`.

---

### Pertanyaan 4: Bagaimana cara sistem berbagi sesi login Google antara `rentgo.my.id`, `book.rentgo.my.id`, dan `admin.rentgo.my.id` serta bagaimana penetapan hak akses Admin dilakukan?
**Jawaban:**
1. Pengguna masuk menggunakan Google Sign-In melalui Firebase Authentication di sisi klien dan memperoleh `idToken`.
2. Klien mengirim `idToken` ke `POST /api/auth/session`. Server memverifikasi token tersebut menggunakan Firebase Admin SDK dan menukarnya menjadi session cookie berumur 5 hari.
3. Server menyimpan cookie bernama `__session` dengan atribut keamanan:
   - `httpOnly: true` (tidak dapat dibaca oleh JavaScript/XSS)
   - `secure: true` (wajib HTTPS di produksi)
   - `sameSite: "lax"`
   - `domain: ".rentgo.my.id"` (memungkinkan browser mengirim cookie yang sama ke `rentgo.my.id`, `book.rentgo.my.id`, dan `admin.rentgo.my.id`).
4. Saat sesi dibuat, server melakukan *upsert* ke tabel `users`. Apabila alamat email pengguna terdaftar di dalam daftar putih variabel lingkungan `ADMIN_EMAILS`, maka kolom `role` ditetapkan sebagai `'admin'`; seluruh email lain ditetapkan sebagai `'customer'`.
5. Setiap endpoint API admin (`/api/vehicles`, `/api/categories`, `/api/maintenance`, `/api/users`) memanggil fungsi `requireAdminUser()` di sisi server sehingga manipulasi UI tidak pernah dapat menembus otorisasi server.

---

### Pertanyaan 5: Bagaimana fitur Rekomendasi AI ("Bantu Saya Pilih") bekerja dan bagaimana cara mencegah AI mengalami halusinasi (merekomendasikan mobil fiktif atau mobil yang sedang disewa)?
**Jawaban:**
1. Ketika pelanggan mengirim kueri bahasa alami ke `POST /api/ai/recommend`, server terlebih dahulu menjalankan fungsi `listVehicles({ onlyAvailable: true, startDate, endDate })` untuk mengambil daftar kendaraan nyata yang **benar-benar tersedia** pada tanggal tersebut.
2. Hanya katalog kendaraan yang tersedia inilah (beserta `id`, merek, model, kategori, transmisi, kursi, dan harga harian) yang dikirim ke model Gemini (`gemini-3.5-flash-lite`) melalui `@google/genai` dengan skema JSON terstruktur (`response_format`).
3. Setelah Gemini mengembalikan JSON rekomendasi, server memvalidasi setiap `vehicle_id` yang dikembalikan terhadap himpunan ID kendaraan yang tersedia (`availableById.get(item.vehicle_id)`). Jika ada ID yang tidak dikenal atau duplikat, item tersebut langsung dibuang.
4. Apabila kunci API Gemini tidak tersedia, kuota habis, waktu tunggu melewati 8 detik, atau hasil validasi kosong, sistem secara otomatis beralih ke **Mesin Rekomendasi Deterministik (`buildDeterministicRecommendation`)** yang menghitung skor kecocokan berdasarkan kata kunci kapasitas penumpang, transmisi, kategori/rute, dan anggaran harian. Dengan demikian, fitur rekomendasi dijamin 100% bebas halusinasi dan tidak pernah gagal.

---

### Pertanyaan 6: Apa saja keterbatasan sistem saat ini dan bagaimana rencana pengembangan berikutnya pada Increment pasca-UTS?
**Jawaban:**
Sesuai dokumentasi pada `website/docs/BACKLOG.md`, keterbatasan saat ini yang sengaja dijaga agar fokus pada keandalan inti UTS serta rencana pengembangannya meliputi:
1. **Verifikasi Pembayaran Semi-Manual:** Saat ini pelanggan mengunggah bukti transfer/QRIS dan Admin memverifikasi status `paid`. Pada iterasi berikutnya (`BL-01`), sistem akan diintegrasikan dengan webhook otomatis Payment Gateway (Midtrans / Xendit).
2. **Sewa Lepas Kunci vs Dengan Sopir:** Saat ini tarif dihitung per unit per hari. Iterasi berikutnya (`BL-03`) akan menambahkan opsi tambahan jasa pengemudi profesional beserta biaya akomodasi luar kota.
3. **Checklist Serah Terima Fisik:** Iterasi berikutnya (`BL-06`) akan menambahkan formulir inspeksi kondisi bodi kendaraan dan persentase BBM saat status berubah dari `confirmed` ke `ongoing` dan dari `ongoing` ke `completed`.
