<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useSlideContext } from '@slidev/client'

const { $slidev } = useSlideContext()

const unitCount = ref(21)
const bbCount = ref(20)
const e2eCount = ref(8)
const passRate = ref(100)

function runCountUp() {
  if ($slidev?.nav?.isPrintMode) {
    unitCount.value = 21
    bbCount.value = 20
    e2eCount.value = 8
    passRate.value = 100
    return
  }

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  if (prefersReduced) {
    unitCount.value = 21
    bbCount.value = 20
    e2eCount.value = 8
    passRate.value = 100
    return
  }

  const duration = 1150
  const start = performance.now()

  function step(now: number) {
    const t = Math.min(1, (now - start) / duration)
    const ease = 1 - Math.pow(1 - t, 3)
    unitCount.value = Math.round(21 * ease)
    bbCount.value = Math.round(20 * ease)
    e2eCount.value = Math.round(8 * ease)
    passRate.value = Math.round(100 * ease)
    if (t < 1) {
      requestAnimationFrame(step)
    }
  }

  requestAnimationFrame(step)
}

onMounted(() => {
  runCountUp()
})

watch(
  () => $slidev?.nav?.currentPage,
  () => {
    runCountUp()
  }
)

const techniques = [
  {
    code: 'TEKNIK 1 • EP',
    name: 'Equivalence Partitioning',
    desc: 'Partisi valid vs invalid: akses /admin oleh customer (ditolak HTTP 403) vs admin (diterima HTTP 200).',
    badge: 'TC-003 & TC-018 PASS',
    color: 'border-blue-500/45 bg-blue-950/35 text-blue-300',
  },
  {
    code: 'TEKNIK 2 • BVA',
    name: 'Boundary Value Analysis',
    desc: 'Uji batas ekstrem: sewa 1 hari (start = end), irisan tanggal 1 hari (HTTP 409), dan request AI ke-11/menit (HTTP 429).',
    badge: 'TC-009 & TC-015 PASS',
    color: 'border-teal-500/45 bg-teal-950/35 text-teal-300',
  },
  {
    code: 'TEKNIK 3 • STATE',
    name: 'State Transition Testing',
    desc: 'Transisi siklus hidup: klik Sudah Bayar QRIS (unpaid → paid) lalu konfirmasi Admin (pending → confirmed).',
    badge: 'TC-011 & TC-013 PASS',
    color: 'border-amber-500/45 bg-amber-950/35 text-amber-300',
  },
]
</script>

<template>
  <div class="flex flex-col gap-2.5 mt-1 select-none">
    <!-- 3 Giant Apple-Keynote Count-Up Metric Cards -->
    <div class="grid grid-cols-3 gap-2.5">
      <!-- Unit Tests -->
      <div class="keynote-card-cobalt p-3 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="font-mono text-[9px] font-bold uppercase tracking-wider text-blue-300">
            VITEST • 5 FILE UJI
          </span>
          <span class="rounded bg-blue-500/20 px-1.5 py-0.2 font-mono text-[9px] font-bold text-blue-200 tabular-nums">
            {{ passRate }}% PASS
          </span>
        </div>
        <div class="my-1 flex items-baseline gap-2">
          <span class="text-4xl font-black tracking-tighter text-white tabular-nums">
            {{ unitCount }}
          </span>
          <span class="text-xs font-bold text-blue-300">Unit Test</span>
        </div>
        <p class="text-[10px] text-slate-300 leading-snug">
          Kalkulasi harga WIB, state machine, overlap tanggal, konkurensi, &amp; ekstraksi AI.
        </p>
      </div>

      <!-- Black-Box Tests -->
      <div class="keynote-card-teal p-3 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="font-mono text-[9px] font-bold uppercase tracking-wider text-teal-300">
            SPESIFIKASI FR-01..FR-19
          </span>
          <span class="rounded bg-teal-500/20 px-1.5 py-0.2 font-mono text-[9px] font-bold text-teal-200 tabular-nums">
            {{ passRate }}% PASS
          </span>
        </div>
        <div class="my-1 flex items-baseline gap-2">
          <span class="text-4xl font-black tracking-tighter text-white tabular-nums">
            {{ bbCount }}
          </span>
          <span class="text-xs font-bold text-teal-300">Black-Box</span>
        </div>
        <p class="text-[10px] text-slate-300 leading-snug">
          Kasus uji formal TC-001 s/d TC-020 pada antarmuka &amp; kontrak REST API.
        </p>
      </div>

      <!-- E2E Playwright Tests -->
      <div class="keynote-card-amber p-3 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="font-mono text-[9px] font-bold uppercase tracking-wider text-amber-300">
            PLAYWRIGHT CHROMIUM
          </span>
          <button
            type="button"
            class="rounded bg-amber-500/20 px-1.5 py-0.2 font-mono text-[9px] font-bold text-amber-200 hover:bg-amber-500/30 cursor-pointer"
            @click="runCountUp"
          >
            ↻ Count-Up
          </button>
        </div>
        <div class="my-1 flex items-baseline gap-2">
          <span class="text-4xl font-black tracking-tighter text-white tabular-nums">
            {{ e2eCount }}
          </span>
          <span class="text-xs font-bold text-amber-300">Skenario E2E</span>
        </div>
        <p class="text-[10px] text-slate-300 leading-snug">
          6 blok uji otomatis di browser Chromium nyata (Desktop 1440px &amp; Mobile 390px).
        </p>
      </div>
    </div>

    <!-- 3 Formal Testing Techniques -->
    <div class="grid grid-cols-3 gap-2.5">
      <div
        v-for="tech in techniques"
        :key="tech.code"
        class="rounded-xl border p-2.5 flex flex-col justify-between"
        :class="tech.color"
      >
        <div>
          <div class="flex items-center justify-between">
            <span class="font-mono text-[9px] font-extrabold">{{ tech.code }}</span>
            <span class="rounded bg-black/40 px-1.5 py-0.2 font-mono text-[8px] font-bold text-white">
              {{ tech.badge }}
            </span>
          </div>
          <h3 class="mt-1 text-xs font-extrabold text-white">{{ tech.name }}</h3>
          <p class="mt-0.5 text-[10px] text-slate-200 leading-snug">{{ tech.desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
