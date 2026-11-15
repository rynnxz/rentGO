<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSlideContext } from '@slidev/client'

const { $slidev } = useSlideContext()
const selectedIdx = ref<number | null>(null)

const unlockedIdx = computed(() => {
  if ($slidev?.nav?.isPrintMode) return 4
  if (selectedIdx.value !== null) return selectedIdx.value
  const clicks = $slidev?.nav?.clicks ?? 0
  return Math.min(4, Math.max(0, clicks))
})

const increments = [
  {
    ver: 'v0.1.0',
    inc: 'Increment 0',
    title: 'Foundation & Auth',
    summary: 'Single-Domain routing, skema 7 tabel Supabase, Firebase Auth-Only.',
    metrics: ['3 Surface Path', '7 Tabel SQL', 'Cookie __session'],
    accent: 'border-blue-500/60 bg-blue-950/45 text-blue-300',
  },
  {
    ver: 'v0.2.0',
    inc: 'Increment 1',
    title: 'Admin & Armada',
    summary: 'CRUD kendaraan, kategori, log bengkel, soft-delete, RBAC Admin 403.',
    metrics: ['10 Unit Seed', 'Soft-Delete', 'Jadwal Servis'],
    accent: 'border-teal-500/60 bg-teal-950/45 text-teal-300',
  },
  {
    ver: 'v0.3.0',
    inc: 'Increment 2',
    title: 'Anti Double-Booking',
    summary: 'Kunci atomik SELECT FOR UPDATE, tarif inklusif WIB, QRIS Midtrans.',
    metrics: ['HTTP 409 Lock', 'QRIS Dinamis', 'State Machine'],
    accent: 'border-amber-500/60 bg-amber-950/45 text-amber-300',
  },
  {
    ver: 'v0.4.0',
    inc: 'Increment 3',
    title: 'AI Gemini & Peta',
    summary: 'Rekomendasi Gemini Flash (limit 10/mnt), peta Leaflet & Haversine.',
    metrics: ['Limit 10/Mnt', '3 Titik Peta', 'Anti-Halusinasi'],
    accent: 'border-blue-400/60 bg-indigo-950/45 text-blue-200',
  },
  {
    ver: 'v1.2.0',
    inc: 'Increment 4',
    title: 'Triadic & Full QA',
    summary: 'Teori warna Triadik (Light/Dark), 21 Unit, 20 Black-Box, 8 E2E.',
    metrics: ['21 Unit PASS', '20 Black-Box', '8 E2E Chromium'],
    accent: 'border-teal-400/80 bg-teal-950/60 text-teal-200',
  },
]
</script>

<template>
  <div class="flex flex-col gap-2.5 mt-1 select-none">
    <!-- Timeline Progress Track -->
    <div class="relative px-1">
      <div class="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
        <div
          class="h-full rounded-full bg-gradient-to-r from-blue-500 via-teal-400 to-amber-400 transition-all duration-500"
          :style="{ width: `${((unlockedIdx + 1) / 5) * 100}%` }"
        />
      </div>

      <!-- 5 Increment Cards that "Bloom" (Mekar) -->
      <div class="mt-2.5 grid grid-cols-5 gap-2">
        <button
          v-for="(item, idx) in increments"
          :key="item.ver"
          type="button"
          class="text-left rounded-xl border p-2.5 transition-all duration-500 cursor-pointer flex flex-col justify-between"
          :class="[
            idx <= unlockedIdx
              ? `${item.accent} opacity-100 scale-100 shadow-lg`
              : 'border-slate-800 bg-slate-900/40 text-slate-500 opacity-45 scale-90',
            idx === unlockedIdx ? 'ring-2 ring-amber-400/80 -translate-y-0.5' : '',
          ]"
          @click="selectedIdx = idx"
        >
          <div>
            <div class="flex items-center justify-between">
              <span class="font-mono text-[9px] font-bold uppercase tracking-wider opacity-85">
                {{ item.inc }}
              </span>
              <span class="rounded bg-black/40 px-1.5 py-0.2 font-mono text-[9px] font-extrabold text-white">
                {{ item.ver }}
              </span>
            </div>

            <h3 class="mt-1 text-xs font-extrabold text-white leading-tight">
              {{ item.title }}
            </h3>

            <!-- Blooming Details -->
            <p
              class="mt-1 text-[10px] leading-snug text-slate-200 transition-all duration-500"
              :class="idx <= unlockedIdx ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'"
            >
              {{ item.summary }}
            </p>
          </div>

          <div
            class="mt-2 flex flex-wrap gap-1 pt-1.5 border-t border-white/10"
            :class="idx <= unlockedIdx ? 'opacity-100' : 'opacity-0'"
          >
            <span
              v-for="tag in item.metrics"
              :key="tag"
              class="rounded bg-slate-950/70 px-1.5 py-0.2 font-mono text-[8px] font-semibold text-slate-200"
            >
              {{ tag }}
            </span>
          </div>
        </button>
      </div>
    </div>

    <!-- Single-line comparison reason why NOT Waterfall / Prototype / Agile -->
    <div class="keynote-glass px-3.5 py-2 flex items-center justify-between text-[11px]">
      <div class="flex items-center gap-2">
        <span class="rounded bg-amber-400 px-2 py-0.5 font-mono text-[9px] font-black uppercase text-slate-950">
          KENAPA INCREMENTAL?
        </span>
        <span class="text-slate-200 font-medium">
          <strong>Waterfall</strong> menguji transaksi terlalu akhir •
          <strong>Prototype</strong> hanya UI semu •
          <strong>Agile Scrum</strong> butuh seremoni tim.
        </span>
      </div>
      <span class="font-mono text-[10px] font-bold text-teal-300 tabular-nums">
        Rilis: {{ increments[unlockedIdx].ver }} ({{ unlockedIdx + 1 }}/5)
      </span>
    </div>
  </div>
</template>
