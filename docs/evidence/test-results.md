# Bukti Hasil Pengujian Otomatis & Quality Gate (`test-results.md`)

- **Tanggal Eksekusi:** 15 November 2026
- **Versi Aplikasi:** RentGo Medan `v1.2.0`
- **Lingkungan Pengujian:** Windows 11, Node.js `v26.12.0`, npm `11.20.0`, Vitest `3.2.7`, Playwright Chromium (`chromium-1248`)

---

## 1. Pemeriksaan Tipe Statis TypeScript (`npm run typecheck`)

```text
> rentgo-website@1.0.0 typecheck
> tsc --noEmit

Exit Code: 0 (0 Errors)
```

---

## 2. Hasil Pengujian Unit & Konkurensi (`npm test` - Vitest)

**Ringkasan:** **5 File Uji Lulus (100%)**, **21 Kasus Uji Unit Lulus (100%)**.

```text
> rentgo-website@1.0.0 test
> vitest run

 RUN  v3.2.7 C:/uts-mmprpl/rentgo/website

 ✓ tests/unit/availability-and-concurrency.test.ts (4 tests) 83ms
 ✓ tests/unit/pricing.test.ts (6 tests) 58ms
 ✓ tests/unit/ai.test.ts (2 tests) 48ms
 ✓ tests/unit/validators-and-routing.test.ts (5 tests) 11ms
 ✓ tests/unit/booking-state.test.ts (4 tests) 7ms

 Test Files  5 passed (5)
      Tests  21 passed (21)
   Start at  18:51:58
   Duration  14.21s (transform 342ms, setup 0ms, collect 11.04s, tests 207ms, environment 1ms, prepare 1.39s)
```

### Rincian Cakupan 5 File Uji Unit:
1. **`tests/unit/pricing.test.ts` (6 tes):** Kalkulasi durasi sewa inklusif WIB (`total_days = (end - start) + 1`), kasus sewa 1 hari di tanggal yang sama (`start == end` -> `1 hari`), multi-hari, penolakan tanggal terbalik (`end < start`), dan penolakan tarif negatif/nol.
2. **`tests/unit/booking-state.test.ts` (4 tes):** Matriks *State Machine* 7 status pesanan (`pending -> confirmed -> ongoing -> completed`, cabang `cancelled`, `rejected`, `expired`), larangan transisi dari status terminal, dan batasan hak pelanggan hanya boleh membatalkan saat status `pending`.
3. **`tests/unit/availability-and-concurrency.test.ts` (4 tes):** Deteksi bentrok rentang tanggal inklusif, pemfilteran unit yang sedang perawatan bengkel (`scheduled`/`in_progress`), pembuatan pesanan sukses ketika jadwal kosong, serta simulasi **2 request paralel bersamaan (*concurrency race condition*)** di mana tepat 1 pesanan berhasil (`201 Created`) dan 1 pesanan ditolak (`409 Conflict`).
4. **`tests/unit/validators-and-routing.test.ts` (5 tes):** Validasi skema Zod (`createBookingSchema`), pembatas laju (*sliding window rate limiter*) 10 permintaan/menit pada `/api/ai/recommend`, serta resolusi rute **Single-Domain Multi-Surface** (`/`, `/book`, `/admin`).
5. **`tests/unit/ai.test.ts` (2 tes):** Ekstraksi niat bahasa alami (`"motor yang cocok untuk touring bareng pacar, budget 200rb maksimal"` -> menyaring khusus unit sepeda motor `Yamaha NMAX 155 Connected` & `Honda Vario 160 ABS` di bawah Rp 200.000/hari) serta sanitasi anti-halusinasi `vehicle_id`.

---

## 3. Hasil Pengujian End-to-End Browser (`npx playwright test` - Chromium)

**Ringkasan:** **6 Blok Uji Otomatis Lulus (100%)** yang mencakup **8 Skenario Logis E2E (`E2E-01` s/d `E2E-08`)**.

```text
Running 6 tests using 1 worker

  ok 1 [chromium] › tests\e2e\rentgo.spec.ts:13:3 › RentGo Medan E2E Verification Suite › E2E-01 & E2E-08: Direct /site/* blocked (404), unauthenticated admin gate, and customer 403 on admin surface (6.3s)
  ok 2 [chromium] › tests\e2e\rentgo.spec.ts:35:3 › RentGo Medan E2E Verification Suite › E2E-02: Admin creates a new vehicle and it appears on public booking catalog (7.8s)
  ok 3 [chromium] › tests\e2e\rentgo.spec.ts:65:3 › RentGo Medan E2E Verification Suite › E2E-03 & E2E-04: Customer creates booking -> appears in Pesanan Saya -> Admin transitions pending -> confirmed -> ongoing -> completed (25.5s)
  ok 4 [chromium] › tests\e2e\rentgo.spec.ts:140:3 › RentGo Medan E2E Verification Suite › E2E-05: Customer cancels a pending booking and vehicle becomes available again for those dates (7.3s)
  ok 5 [chromium] › tests\e2e\rentgo.spec.ts:168:3 › RentGo Medan E2E Verification Suite › E2E-06: Vehicle in active maintenance is automatically hidden from customer availability search (2.1s)
  ok 6 [chromium] › tests\e2e\rentgo.spec.ts:179:3 › RentGo Medan E2E Verification Suite › E2E-07: AI Smart Vehicle Recommendation ('Bantu Saya Pilih') returns valid available vehicles (7.6s)

  6 passed (1.2m)
```

---

## 4. Hasil Audit Dependensi Produksi (`npm audit --omit=dev`)

Pada pemeriksaan `npm audit --omit=dev`, tercatat 4 grup advisori pada pohon dependensi transitif yang **seluruh perbaikannya memerlukan *major breaking change* (`npm audit fix --force`)**:

| Paket Terdampak | Tingkat | Penyebab Transitif & Analisis Dampak pada RentGo Medan | Keputusan Mitigasi |
| :--- | :--- | :--- | :--- |
| `@grpc/grpc-js` (`<=1.13.5`) | High | Sub-dependensi dari `@firebase/firestore` di dalam paket `firebase`. **Tidak berdampak pada RentGo** karena kode aplikasi v1.2.0 adalah **Firebase Auth-Only** dan sama sekali tidak mengimpor atau mem-bundle `@firebase/firestore`. | Aman diabaikan; `npm audit fix --force` akan men-downgrade `firebase` ke `v9.14.0`. |
| `postcss` (`<=8.5.22`) | High | Sub-dependensi internal di dalam `next@15.5.29` yang hanya berjalan saat *build-time* pada file CSS tepercaya milik proyek sendiri (bukan input CSS dari pengguna). | Aman pada runtime produksi; upgrade paksa meminta migrasi major ke `next@16`. |
| `uuid` (`<11.1.1`) | Moderate | Sub-dependensi dari `@google-cloud/storage` / `@google-cloud/firestore` di dalam `firebase-admin`. RentGo hanya memakai `firebase-admin/auth` untuk verifikasi JWT dan menghasilkan UUID menggunakan `crypto.randomUUID()` bawaan Node.js. | Tidak tereksekusi di jalur kode aktif; upgrade paksa memerlukan `firebase-admin@14`. |
| `zod` (`<4.6.6`) | High | Advisori terkait validasi koleksi sangat besar. Di RentGo, seluruh input API adalah payload JSON kecil dan dilindungi batas ukuran body Next.js. | Dipertahankan pada `zod@3.24.2` demi menjaga stabilitas skema v3 tanpa breaking change `zod@4`. |
