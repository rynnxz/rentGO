# Bukti Verifikasi Build Produksi & Smoke Test Deployment (`deploy-smoke-test.md`)

- **Tanggal Verifikasi:** 15 November 2026
- **Versi Aplikasi:** RentGo Medan `v1.2.0`
- **Target Domain Produksi:** `https://rentgo.my.id` (`/`, `/book`, `/admin`)

---

## 1. Hasil Verifikasi Production Build Lokal (`npm run build`)

Eksekusi `npm run build` (`next build`) pada direktori `website/` berhasil lulus 100% (`Exit Code: 0`) dengan rincian rute sebagai berikut:

```text
▲ Next.js 15.5.29
✓ Compiled successfully in 11.3s
✓ Linting and checking validity of types
✓ Generating static pages (15/15)

Route (app)                                 Size  First Load JS
┌ ○ /_not-found                            183 B         103 kB
├ ƒ /api/ai/recommend                      183 B         103 kB
├ ƒ /api/auth/logout                       183 B         103 kB
├ ƒ /api/auth/session                      183 B         103 kB
├ ƒ /api/bookings                          183 B         103 kB
├ ƒ /api/bookings/[id]                     183 B         103 kB
├ ƒ /api/categories                        183 B         103 kB
├ ƒ /api/categories/[id]                   183 B         103 kB
├ ƒ /api/cron/housekeeping                 183 B         103 kB
├ ƒ /api/maintenance                       183 B         103 kB
├ ƒ /api/maintenance/[id]                  183 B         103 kB
├ ƒ /api/payments/[bookingId]              183 B         103 kB
├ ƒ /api/upload                            183 B         103 kB
├ ƒ /api/users                             183 B         103 kB
├ ƒ /api/users/[id]                        183 B         103 kB
├ ƒ /api/vehicles                          183 B         103 kB
├ ƒ /api/vehicles/[id]                     183 B         103 kB
├ ○ /robots.txt                            183 B         103 kB
├ ƒ /site/admin                            167 B         106 kB
├ ƒ /site/admin/bookings                 6.78 kB         117 kB
├ ƒ /site/admin/categories               3.74 kB         107 kB
├ ƒ /site/admin/customers                3.24 kB         106 kB
├ ƒ /site/admin/maintenance              5.36 kB         115 kB
├ ƒ /site/admin/vehicles                 7.44 kB         117 kB
├ ƒ /site/book                           6.72 kB         120 kB
├ ƒ /site/book/bookings                    183 B         148 kB
├ ƒ /site/book/bookings/[id]             5.98 kB         161 kB
├ ƒ /site/book/profile                   1.64 kB         146 kB
├ ƒ /site/book/vehicles/[id]             5.42 kB         160 kB
├ ƒ /site/landing                          170 B         144 kB
└ ○ /sitemap.xml                           183 B         103 kB
ƒ Middleware                             36.8 kB
```

---

## 2. Daftar Periksa Smoke Test Rute & Keamanan (Lokal Terverifikasi vs Produksi Cloud)

| No | Endpoint / Rute Uji | Perilaku yang Diharapkan | Status Lokal (`localhost:3000`) | Status Domain Publik (`rentgo.my.id`) |
| :--- | :--- | :--- | :--- | :--- |
| **1** | `GET /` | Merender Landing Page publik (Hero, Armada Unggulan, Tarif, FAQ) dengan `HTTP 200` | **PASS (`HTTP 200`)** | `[BELUM DIVERIFIKASI - Menunggu Deploy Vercel]` |
| **2** | `GET /book` | Merender Katalog Pemesanan, Filter Tanggal WIB, & Panel AI Gemini dengan `HTTP 200` | **PASS (`HTTP 200`)** | `[BELUM DIVERIFIKASI - Menunggu Deploy Vercel]` |
| **3** | `GET /admin` (Tanpa Login) | Menampilkan gerbang `Autentikasi Administrator Diperlukan` (`admin-login-gate`) | **PASS (`HTTP 200` Gate)** | `[BELUM DIVERIFIKASI - Menunggu Deploy Vercel]` |
| **4** | `GET /admin` (Login Customer) | Menampilkan halaman `HTTP 403 - Akses Ditolak` (`admin-access-denied`) | **PASS (`HTTP 403` View)** | `[BELUM DIVERIFIKASI - Menunggu Deploy Vercel]` |
| **5** | `GET /site/admin` & `GET /site/book` | Diblokir langsung oleh `src/middleware.ts` dengan `HTTP 404 Not Found` | **PASS (`HTTP 404`)** | `[BELUM DIVERIFIKASI - Menunggu Deploy Vercel]` |
| **6** | `GET /api/vehicles?start_date=2026-11-15&end_date=2026-11-16` | Mengembalikan JSON daftar unit tersedia (menyembunyikan `BK 7099 AAL` yang sedang servis) | **PASS (`HTTP 200`, 9 unit)** | `[BELUM DIVERIFIKASI - Menunggu Deploy Vercel]` |
| **7** | `POST /api/ai/recommend` (`"motor yang cocok untuk touring bareng pacar, budget 200rb maksimal"`) | Mengembalikan rekomendasi motor (`Yamaha NMAX 155 Connected` & `Honda Vario 160 ABS`) di bawah Rp 200.000/hari | **PASS (`HTTP 200`)** | `[BELUM DIVERIFIKASI - Menunggu Deploy Vercel]` |

> **Catatan Deployment Vercel:** Panduan lengkap pengaturan *Environment Variables* dan *Custom Domain* di Vercel telah didokumentasikan di [docs/MANUAL_STEPS.md](file:///c:/uts-mmprpl/rentgo/docs/MANUAL_STEPS.md).
