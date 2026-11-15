<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSlideContext } from '@slidev/client'

const { $slidev } = useSlideContext()
const manualMode = ref<'grid' | 'layers' | null>(null)

const isLayeredView = computed(() => {
  if ($slidev?.nav?.isPrintMode) return true
  if (manualMode.value) return manualMode.value === 'layers'
  return ($slidev?.nav?.clicks ?? 0) >= 7
})

const unlockedCount = computed(() => {
  if ($slidev?.nav?.isPrintMode) return 7
  const clicks = $slidev?.nav?.clicks ?? 0
  return Math.min(7, Math.max(1, clicks + 1))
})

const stackItems = [
  {
    id: 1,
    name: 'Next.js 15',
    badge: 'N15',
    layer: 'Layer 1 & 3 • Presentation & API Routes',
    purpose: 'Full-stack App Router, Single-Domain Middleware, dan REST API.',
    color: 'border-blue-500/50 bg-blue-950/40 text-blue-200',
    logoBg: 'bg-white text-slate-950',
  },
  {
    id: 2,
    name: 'Leaflet + OSM',
    badge: 'MAP',
    layer: 'Layer 1 • Interactive Geolocation UI',
    purpose: 'Peta interaktif 3 titik jemput Medan dan kalkulasi jarak Haversine.',
    color: 'border-teal-500/50 bg-teal-950/40 text-teal-200',
    logoBg: 'bg-emerald-500 text-slate-950',
  },
  {
    id: 3,
    name: 'Firebase Auth',
    badge: 'FBA',
    layer: 'Layer 2 • Identity & Session Gate',
    purpose: 'Khusus autentikasi Google OAuth dan Email (Auth-Only, 1x Login).',
    color: 'border-amber-500/50 bg-amber-950/40 text-amber-200',
    logoBg: 'bg-amber-400 text-slate-950',
  },
  {
    id: 4,
    name: 'Gemini AI',
    badge: 'AI',
    layer: 'Layer 3 • Smart Recommendation Engine',
    purpose: 'Asisten pemilihan armada kontekstual dengan rate limit 10/menit.',
    color: 'border-indigo-500/50 bg-indigo-950/40 text-indigo-200',
    logoBg: 'bg-indigo-400 text-slate-950',
  },
  {
    id: 5,
    name: 'Midtrans QRIS',
    badge: 'QR',
    layer: 'Layer 3 • Instant Payment Gateway',
    purpose: 'Penerbitan kode QRIS dinamis sandbox (rentgo-test) dan simulasi lunas.',
    color: 'border-sky-500/50 bg-sky-950/40 text-sky-200',
    logoBg: 'bg-sky-400 text-slate-950',
  },
  {
    id: 6,
    name: 'Supabase',
    badge: 'PG',
    layer: 'Layer 4 • Relational DB & Cloud Storage',
    purpose: 'Database PostgreSQL 7 tabel, kunci transaksi atomik, dan foto armada.',
    color: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-200',
    logoBg: 'bg-teal-400 text-slate-950',
  },
  {
    id: 7,
    name: 'Vercel Cloud',
    badge: 'VCL',
    layer: 'Layer 4 • Serverless Edge Deployment',
    purpose: 'Hosting produksi otomatis dari GitHub dengan Edge Network global.',
    color: 'border-slate-500/50 bg-slate-900/70 text-slate-200',
    logoBg: 'bg-slate-200 text-slate-950',
  },
]
</script>

<template>
  <div class="flex flex-col gap-2.5 mt-1 select-none">
    <!-- Top Mode Switcher Bar -->
    <div class="flex items-center justify-between text-[11px]">
      <span class="font-mono text-slate-400">
        {{ isLayeredView ? 'Mode: Susunan Layer Arsitektur (Morphed)' : `Mode: Kemunculan Logo (${unlockedCount}/7)` }}
      </span>
      <div class="flex gap-1.5">
        <button
          type="button"
          class="rounded-md border px-2.5 py-0.5 font-mono text-[10px] font-bold transition cursor-pointer"
          :class="!isLayeredView ? 'border-blue-400 bg-blue-600 text-white' : 'border-slate-700 bg-slate-900 text-slate-400'"
          @click="manualMode = 'grid'"
        >
          1. Grid Logo
        </button>
        <button
          type="button"
          class="rounded-md border px-2.5 py-0.5 font-mono text-[10px] font-bold transition cursor-pointer"
          :class="isLayeredView ? 'border-teal-400 bg-teal-600 text-white' : 'border-slate-700 bg-slate-900 text-slate-400'"
          @click="manualMode = 'layers'"
        >
          2. Morph Susunan Layer ✦
        </button>
      </div>
    </div>

    <!-- PHASE 1: Sequential Logo Grid -->
    <div v-if="!isLayeredView" class="grid grid-cols-4 gap-2.5">
      <div
        v-for="(item, idx) in stackItems"
        :key="item.id"
        class="rounded-xl border p-3 transition-all duration-500"
        :class="[
          item.color,
          item.id === 7 ? 'col-span-2' : '',
          idx < unlockedCount
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-15 scale-90 translate-y-3',
        ]"
      >
        <div class="flex items-center gap-2.5">
          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-black shadow"
            :class="item.logoBg"
          >
            {{ item.badge }}
          </div>
          <div>
            <div class="text-xs font-extrabold text-white">{{ item.name }}</div>
            <div class="font-mono text-[9px] text-slate-300">{{ item.layer.split('•')[0] }}</div>
          </div>
        </div>
        <p class="mt-2 text-[11px] leading-snug text-slate-200">
          {{ item.purpose }}
        </p>
      </div>
    </div>

    <!-- PHASE 2: Morphed Horizontal Architecture Stack Layers -->
    <div v-else class="flex flex-col gap-2 transition-all duration-500">
      <div
        v-for="item in stackItems"
        :key="item.id"
        class="flex items-center justify-between gap-3 rounded-lg border px-3.5 py-1.5 transition-all duration-500"
        :class="item.color"
      >
        <div class="flex items-center gap-2.5 min-w-[165px]">
          <span
            class="flex h-6 w-7 shrink-0 items-center justify-center rounded font-mono text-[10px] font-black"
            :class="item.logoBg"
          >
            {{ item.badge }}
          </span>
          <span class="text-xs font-extrabold text-white">{{ item.name }}</span>
        </div>

        <span class="text-[11px] text-slate-200 flex-1">
          {{ item.purpose }}
        </span>

        <span class="rounded bg-black/40 px-2 py-0.5 font-mono text-[9px] font-bold text-teal-300 shrink-0">
          {{ item.layer }}
        </span>
      </div>
    </div>
  </div>
</template>
