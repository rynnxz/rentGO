<script setup lang="ts">
const pillars = [
  {
    tag: 'METODOLOGI',
    value: 'SDLC Incremental',
    detail: '5 rilis bertahap (v0.1.0 → v1.2.0) dengan artefak teruji.',
    accent: 'border-blue-500/50 bg-blue-950/40 text-blue-300',
  },
  {
    tag: 'ARSITEKTUR',
    value: 'Single-Domain 1x Login',
    detail: '3 permukaan (/, /book, /admin) berbagi 1 cookie __session.',
    accent: 'border-teal-500/50 bg-teal-950/40 text-teal-300',
  },
  {
    tag: 'TRANSAKSI DB',
    value: 'Anti Double-Booking',
    detail: 'Kunci atomik SELECT FOR UPDATE & GiST menolak bentrok 409.',
    accent: 'border-amber-500/50 bg-amber-950/40 text-amber-300',
  },
  {
    tag: 'PEMBAYARAN & AI',
    value: 'QRIS + Gemini Flash',
    detail: 'Simulasi lunas QRIS rentgo-test & asisten AI limit 10/menit.',
    accent: 'border-indigo-500/50 bg-indigo-950/40 text-indigo-300',
  },
  {
    tag: 'GEOLOKASI & UI',
    value: 'Peta Medan & 2 Tema',
    detail: '3 titik jemput Haversine + desain Triadik Light & Dark.',
    accent: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300',
  },
  {
    tag: 'KUALITAS UJI',
    value: '100% Lulus Verifikasi',
    detail: '21 Unit Test Vitest + 20 Black-Box + 8 E2E Playwright PASS.',
    accent: 'border-amber-400/60 bg-slate-900/80 text-amber-300',
  },
]
</script>

<template>
  <div class="flex flex-col gap-3 mt-1 select-none">
    <!-- 6-Cell Apple Keynote Summary Bento -->
    <div class="grid grid-cols-3 gap-3">
      <div
        v-for="item in pillars"
        :key="item.tag"
        class="rounded-xl border p-3.5 shadow-lg flex flex-col justify-between"
        :class="item.accent"
      >
        <div class="font-mono text-[10px] font-bold uppercase tracking-wider opacity-85">
          {{ item.tag }}
        </div>
        <div class="my-1 text-lg font-black tracking-tight text-white">
          {{ item.value }}
        </div>
        <p class="text-xs text-slate-200 leading-snug">
          {{ item.detail }}
        </p>
      </div>
    </div>

    <!-- Bottom Signature Strip -->
    <div class="keynote-glass px-4 py-2.5 flex items-center justify-between text-xs">
      <div class="flex items-center gap-2.5">
        <span class="h-2.5 w-2.5 rounded-full bg-teal-400" />
        <span class="font-bold text-white">RentGo Medan v1.2.0</span>
        <span class="text-slate-400">• Akbar Riansyah • Proyek Individu No. 2 • TRPL Semester III PWBI</span>
      </div>
      <a
        href="https://rentgo.my.id"
        target="_blank"
        rel="noopener noreferrer"
        class="font-mono text-[10px] font-bold text-amber-400 hover:underline"
      >
        🌐 Live: https://rentgo.my.id →
      </a>
    </div>
  </div>
</template>
