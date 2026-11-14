# Backlog Pengembangan Lanjutan (Post-MVP / Out of Scope UTS)

Sesuai aturan `RENTGO_MASTER_PROMPT.md` ("Jangan menambah scope di luar dokumen ini. Kalau ada ide bagus, taruh di `docs/BACKLOG.md`"), daftar fitur di bawah ini sengaja tidak dimasukkan ke dalam rilis MVP `v1.0.0` agar cakupan tetap fokus dan teruji penuh:

1. **Integrasi Payment Gateway Otomatis (Midtrans / Xendit):**
   - Saat ini verifikasi pembayaran dilakukan secara manual oleh Admin melalui unggahan bukti transfer/QRIS atau pembayaran tunai di lokasi.
2. **Notifikasi Transaksional via WhatsApp Cloud API / Email (Resend):**
   - Saat ini konfirmasi pesanan menggunakan tautan langsung WhatsApp (`wa.me`) dengan teks pesan yang sudah terisi kode booking.
3. **Mode Multi-Mitra (Marketplace Pemilik Kendaraan):**
   - Mengizinkan pemilik kendaraan pihak ketiga di Medan mendaftarkan armada mereka dengan sistem bagi hasil/komisi platform.
4. **Perhitungan Denda Keterlambatan Otomatis Berbasis Jam & Odometer:**
   - Mencatat kilometer awal/akhir serta foto kondisi bodi kendaraan saat serah terima (`ongoing`) dan pengembalian (`completed`).
5. **Sistem Kupon Diskon, Poin Loyalitas, dan Ulasan Pelanggan Terverifikasi:**
   - Memberikan potongan harga untuk sewa mingguan/bulanan serta ulasan bintang dari pelanggan yang telah menyelesaikan pesanan (`completed`).
6. **Aplikasi Mobile Native (Flutter / React Native) untuk Sopir & Petugas Lapangan:**
   - Memudahkan petugas pengantar kendaraan di Bandara Kualanamu atau Stasiun Medan memperbarui status serah terima langsung dari ponsel.
