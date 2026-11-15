<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSlideContext } from '@slidev/client'

const { $slidev } = useSlideContext()
const manualTier = ref<number | null>(null)

const activeTier = computed(() => {
  if ($slidev?.nav?.isPrintMode) return 4
  if (manualTier.value !== null) return manualTier.value
  const clicks = $slidev?.nav?.clicks ?? 0
  return Math.min(4, Math.max(1, clicks + 1))
})

const connectors = [
  {
    hop: '1. Browser → Middleware',
    proto: 'HTTPS + Cookie __session',
    detail: '1x Login di /, /book, /admin; blokir /site/* (404).',
  },
  {
    hop: '2. Middleware → API Routes',
    proto: 'Rewrite + Zod + RBAC',
    detail: 'Tolak non-admin (HTTP 403) & hitung tarif WIB.',
  },
  {
    hop: '3. API → Supabase PG',
    proto: 'SELECT ... FOR UPDATE',
    detail: 'Kunci baris unit atomik di DB & Cloud Storage.',
  },
  {
    hop: '4. API → Cloud Eksternal',
    proto: 'Firebase • QRIS • Gemini',
    detail: 'Verifikasi UID, QRIS rentgo-test, limit AI 10/mnt.',
  },
]
</script>

<template>
  <div class="flex flex-col gap-1.5 mt-0 select-none">
    <!-- 4-Tier Visual Pipeline with Animated SVG Connectors -->
    <div class="relative rounded-xl border border-slate-700/80 bg-slate-950/90 p-2 shadow-2xl">
      <div class="grid grid-cols-4 gap-2.5 items-stretch relative z-10">
        <!-- TIER 1: Presentation -->
        <div
          class="rounded-xl border p-2 transition-all duration-500 cursor-pointer flex flex-col justify-between"
          :class="activeTier >= 1 ? 'border-blue-500 bg-blue-950/45 shadow-[0_0_16px_rgba(59,130,246,0.2)]' : 'border-slate-800 bg-slate-900/50 opacity-50'"
          @click="manualTier = 1"
        >
          <div>
            <div class="flex items-center justify-between">
              <span class="rounded bg-blue-600 px-1.5 py-0.2 font-mono text-[8px] font-black text-white">TIER 1</span>
              <span class="font-mono text-[8px] text-teal-300 font-bold">1x LOGIN</span>
            </div>
            <h3 class="mt-1 text-xs font-extrabold text-white">Presentation Layer</h3>
            <p class="text-[9px] text-slate-300">Single-Domain 3 Surfaces</p>
          </div>

          <div class="mt-1.5 space-y-1 font-mono text-[9px]">
            <div class="rounded border border-blue-400/30 bg-slate-950/80 px-1.5 py-0.5 text-blue-200">
              / → Landing Publik
            </div>
            <div class="rounded border border-teal-400/30 bg-slate-950/80 px-1.5 py-0.5 text-teal-200">
              /book → Katalog &amp; AI
            </div>
            <div class="rounded border border-amber-400/30 bg-slate-950/80 px-1.5 py-0.5 text-amber-200">
              /admin → Dasbor KPI
            </div>
          </div>
        </div>

        <!-- TIER 2: Edge Middleware -->
        <div
          class="rounded-xl border p-2 transition-all duration-500 cursor-pointer flex flex-col justify-between"
          :class="activeTier >= 2 ? 'border-teal-500 bg-teal-950/45 shadow-[0_0_16px_rgba(20,184,166,0.2)]' : 'border-slate-800 bg-slate-900/50 opacity-40'"
          @click="manualTier = 2"
        >
          <div>
            <div class="flex items-center justify-between">
              <span class="rounded bg-teal-600 px-1.5 py-0.2 font-mono text-[8px] font-black text-white">TIER 2</span>
              <span class="font-mono text-[8px] text-amber-300 font-bold">EDGE GATE</span>
            </div>
            <h3 class="mt-1 text-xs font-extrabold text-white">Edge Middleware</h3>
            <p class="text-[9px] text-slate-300">src/middleware.ts</p>
          </div>

          <div class="mt-1.5 space-y-1 font-mono text-[9px]">
            <div class="rounded border border-teal-400/30 bg-slate-950/80 px-1.5 py-0.5 text-teal-200">
              Cookie: __session
            </div>
            <div class="rounded border border-slate-700 bg-slate-950/80 px-1.5 py-0.5 text-slate-200">
              Rewrite → /site/*
            </div>
            <div class="rounded border border-red-400/40 bg-red-950/50 px-1.5 py-0.5 text-red-300">
              Blokir /site/* (404)
            </div>
          </div>
        </div>

        <!-- TIER 3: Application & Domain Logic -->
        <div
          class="rounded-xl border p-2 transition-all duration-500 cursor-pointer flex flex-col justify-between"
          :class="activeTier >= 3 ? 'border-amber-500 bg-amber-950/40 shadow-[0_0_16px_rgba(245,158,11,0.2)]' : 'border-slate-800 bg-slate-900/50 opacity-40'"
          @click="manualTier = 3"
        >
          <div>
            <div class="flex items-center justify-between">
              <span class="rounded bg-amber-500 px-1.5 py-0.2 font-mono text-[8px] font-black text-slate-950">TIER 3</span>
              <span class="font-mono text-[8px] text-amber-300 font-bold">DOMAIN API</span>
            </div>
            <h3 class="mt-1 text-xs font-extrabold text-white">Route Handlers</h3>
            <p class="text-[9px] text-slate-300">Next.js 15 REST API</p>
          </div>

          <div class="mt-1.5 space-y-1 font-mono text-[9px]">
            <div class="rounded border border-amber-400/30 bg-slate-950/80 px-1.5 py-0.5 text-amber-200">
              POST /api/bookings
            </div>
            <div class="rounded border border-blue-400/30 bg-slate-950/80 px-1.5 py-0.5 text-blue-200">
              Zod + Tarif WIB
            </div>
            <div class="rounded border border-red-400/40 bg-red-950/50 px-1.5 py-0.5 text-red-300">
              RBAC Admin (HTTP 403)
            </div>
          </div>
        </div>

        <!-- TIER 4: Data & Cloud Services -->
        <div
          class="rounded-xl border p-2 transition-all duration-500 cursor-pointer flex flex-col justify-between"
          :class="activeTier >= 4 ? 'border-emerald-400 bg-emerald-950/45 shadow-[0_0_18px_rgba(16,185,129,0.25)]' : 'border-slate-800 bg-slate-900/50 opacity-40'"
          @click="manualTier = 4"
        >
          <div>
            <div class="flex items-center justify-between">
              <span class="rounded bg-emerald-500 px-1.5 py-0.2 font-mono text-[8px] font-black text-slate-950">TIER 4</span>
              <span class="font-mono text-[8px] text-emerald-300 font-bold">CLOUD DATA</span>
            </div>
            <h3 class="mt-1 text-xs font-extrabold text-white">Data &amp; Cloud</h3>
            <p class="text-[9px] text-slate-300">Managed Integrations</p>
          </div>

          <div class="mt-1.5 space-y-1 font-mono text-[9px]">
            <div class="rounded border border-emerald-400/40 bg-slate-950/80 px-1.5 py-0.5 text-emerald-200">
              Supabase PG (7 Tabel)
            </div>
            <div class="rounded border border-amber-400/30 bg-slate-950/80 px-1.5 py-0.5 text-amber-200">
              Firebase Auth-Only
            </div>
            <div class="rounded border border-sky-400/30 bg-slate-950/80 px-1.5 py-0.5 text-sky-200">
              QRIS + Gemini (10/mnt)
            </div>
          </div>
        </div>
      </div>

      <!-- Animated SVG Request Trace Bar Below Tiers -->
      <div class="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between gap-3">
        <span class="font-mono text-[9px] font-bold text-teal-300 shrink-0">
          ALIRAN REQUEST LIVE:
        </span>
        <svg viewBox="0 0 680 18" class="flex-1 h-4 overflow-visible" aria-label="Aliran Request dari Browser ke Database">
          <defs>
            <linearGradient id="reqFlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#3B82F6" />
              <stop offset="50%" stop-color="#14B8A6" />
              <stop offset="100%" stop-color="#F59E0B" />
            </linearGradient>
          </defs>
          <line x1="20" y1="9" x2="660" y2="9" stroke="#1E293B" stroke-width="3" stroke-linecap="round" />
          <line
            x1="20"
            y1="9"
            :x2="20 + ((activeTier - 1) / 3) * 640"
            y2="9"
            stroke="url(#reqFlowGrad)"
            stroke-width="3"
            stroke-linecap="round"
            stroke-dasharray="6 4"
            class="arch-flow-line"
          />
          <circle
            v-for="(pos, idx) in [20, 233, 446, 660]"
            :key="idx"
            :cx="pos"
            cy="9"
            r="5"
            :fill="idx + 1 <= activeTier ? '#14B8A6' : '#334155'"
            stroke="#0F172A"
            stroke-width="1.5"
          />
          <circle r="4" fill="#FBBF24">
            <animateMotion dur="2.5s" repeatCount="indefinite" path="M 20 9 L 660 9" />
          </circle>
        </svg>
        <span class="font-mono text-[9px] font-bold text-amber-300 shrink-0">
          Tier 1 → Tier {{ activeTier }}
        </span>
      </div>
    </div>

    <!-- Compact Non-Truncated Connector Grid -->
    <div class="grid grid-cols-4 gap-2">
      <div
        v-for="(conn, idx) in connectors"
        :key="conn.hop"
        class="rounded-lg border px-2.5 py-1.5 transition-all duration-300 cursor-pointer"
        :class="idx + 1 <= activeTier ? 'border-slate-700 bg-slate-900/85' : 'border-slate-800/60 bg-slate-950/50 opacity-50'"
        @click="manualTier = idx + 1"
      >
        <div class="font-mono text-[9px] font-bold text-amber-400">{{ conn.hop }}</div>
        <div class="font-mono text-[8px] text-teal-300">{{ conn.proto }}</div>
        <p class="mt-0.5 text-[9px] text-slate-300 leading-snug">{{ conn.detail }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes dashMove {
  to {
    stroke-dashoffset: -20;
  }
}
.arch-flow-line {
  animation: dashMove 1.1s linear infinite;
}
</style>
