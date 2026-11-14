# 00 - Inventarisasi Kapabilitas (Skills, MCP, & Tools)

Dokumen ini mencatat hasil inventarisasi Fase 0 untuk memastikan seluruh kebutuhan pengembangan **RentGo** terpetakan ke skill, MCP server, atau fallback lokal yang teruji.

## 1. Tabel Pemetaan Kebutuhan

| Kebutuhan | Skill / MCP / Tool yang Dipakai | Status | Catatan & Strategi Fallback |
|---|---|---|---|
| Frontend / UI Design System | `antislop`, `antislop-ui`, `antislop-human`, `antislop-layoutmobile`, `antislop-copywriting`, `antislop-code`, `modern-web-guidance` | **Aktif** | Seluruh aturan `antislop` (mode `during`, session override dari spesifikasi master) diterapkan: token warna terkunci, kontras WCAG AA, tap target minimal 44x44px, tanpa em dash, dan state lengkap (`empty`, `loading`, `error`). |
| Next.js / React Best Practices | `modern-web-guidance`, Next.js 15 App Router + TypeScript strict | **Aktif** | Menggunakan `src/middleware.ts` untuk host-based rewrite (`rentgo.my.id`, `book.rentgo.my.id`, `admin.rentgo.my.id`), Server Components untuk pembacaan data, dan Route Handlers untuk mutasi. |
| Supabase / Postgres | `.agents/skills/supabase`, `.agents/skills/supabase-postgres-best-practices` | **Aktif (Skill) / Fallback Lokal** | Kredensial `SUPABASE_SERVICE_ROLE_KEY` belum terisi di environment lokal. **Fallback:** Migrasi SQL penuh (`0001_init.sql`) dan `seed.sql` disiapkan sesuai standar Postgres/Supabase (`btree_gist` exclusion constraint + RLS deny-all), dilengkapi repositori transaksional lokal (`src/lib/db/`) yang mengimplementasikan logika anti double-booking dan blokir perawatan yang identik agar pengujian unit/e2e berjalan 100% tanpa blokir. |
| Firebase Auth | MCP `firebase` (login: `akbarriansyah339@gmail.com`) + `firebase-auth-basics` | **Aktif** | MCP `firebase` aktif dan terhubung. SDK `firebase` (client) dan `firebase-admin` (server) disiapkan dengan dukungan penuh untuk Firebase Auth Google Sign-In, Firebase Auth Emulator (`FIREBASE_AUTH_EMULATOR_HOST`), serta token verifikasi teruji untuk e2e Playwright. |
| Gemini API | MCP `gemini-api_gemini-api-docs` + `gemini-api-dev` | **Aktif** | Dokumentasi resmi diverifikasi melalui MCP `gemini_get_doc`: menggunakan SDK resmi `@google/genai` (`>=3.2.0`) dengan `ai.interactions.create`, `response_format` JSON schema, dan model default `gemini-3.5-flash-lite` beserta fallback heuristik deterministik ketika API key belum diisi atau kuota habis. |
| Browser Agent / Playwright | Subagent `browser` + `@playwright/test` | **Aktif** | Digunakan untuk pengujian E2E lintas surface (`localhost:3000`, `book.localhost:3000`, `admin.localhost:3000`) dan pembuatan screenshot otomatis ke `website/docs/screenshots/` melalui `npm run docs:screens`. |
| Testing (Unit & E2E) | `vitest`, `@playwright/test`, `test-driven-development`, `verification-before-completion` | **Aktif** | Vitest untuk pengujian unit (`pricing`, `booking-state`, `availability`, `validators`, `ai`, konkurensi) dan Playwright untuk pengujian end-to-end 8 skenario utama. |
| GitHub & CI/CD | `git` CLI (`v2.56.0`), `gh` CLI (`v2.103.3`, login: `rynnxz`), GitHub Actions | **Aktif** | Branch per increment (`inc-0-foundation` s/d `inc-4-hardening-release`), merge ke `main`, tag `v0.1.0` s/d `v1.0.0`, dan workflow CI di `.github/workflows/ci.yml`. |
| Vercel Deployment & Cron | Konfigurasi `vercel.json` + dokumentasi `05-deployment.md` & `SETUP_MANUAL.md` | **Fallback Terdokumentasi** | CLI `vercel` tidak terpasang secara global. **Fallback:** Konfigurasi `vercel.json` (termasuk jadwal Vercel Cron `/api/cron/housekeeping`) disiapkan di repo sehingga saat repo dihubungkan ke dashboard Vercel, deployment dan 3 domain langsung berjalan. |
| Document / Markdown Writing | `writing-plans`, Mermaid diagram, GFM | **Aktif** | Seluruh dokumen analisis, SDLC incremental, perancangan (ERD & sequence diagram), pengujian, deployment, dan presentasi ditulis dalam Bahasa Indonesia di `website/docs/`. |
| Slidev Presentation | `@slidev/cli`, `@slidev/theme-default`, `playwright-chromium` | **Aktif** | Project mandiri di `rentgo/slidev/` dengan palet warna RentGo (`style.css`), sinkronisasi screenshot (`npm run sync:screens`), dan ekspor PDF (`slidev/dist/RentGo-UTS.pdf`). |
| Security Review | `firebase-security-rules-auditor`, `.agents/skills/supabase` security checklist | **Aktif** | Audit RLS deny-all, validasi Zod di server, kalkulasi harga server-side, proteksi IDOR, cookie `HttpOnly; Secure; SameSite=Lax`, rate limit AI & auth, dan `npm audit`. |

## 2. Verifikasi Lingkungan Lokal

- **OS:** Windows (PowerShell)
- **Node.js:** `v26.12.0`
- **npm / npx:** `11.20.0`
- **Git:** `2.56.0.windows.2`
- **GitHub CLI (`gh`):** `2.103.3` (terautentikasi sebagai `rynnxz`)
- **MCP Servers Aktif:** `firebase`, `gemini-api_gemini-api-docs`
