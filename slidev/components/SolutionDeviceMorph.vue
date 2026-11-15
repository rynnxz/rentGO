<script setup lang="ts">
import { ref } from 'vue'

const activeSurface = ref<'landing' | 'book' | 'admin'>('book')

const surfaces = {
  landing: {
    url: 'rentgo.my.id/',
    label: 'Landing Publik',
    screen: '/screens/01-landing-hero.png',
    badge: 'SEO + Tarif Transparan',
  },
  book: {
    url: 'rentgo.my.id/book',
    label: 'Katalog + AI + QRIS',
    screen: '/screens/04-book-ai-recommend.png',
    badge: 'Anti Double-Booking',
  },
  admin: {
    url: 'rentgo.my.id/admin',
    label: 'Panel Operasional Admin',
    screen: '/screens/07-admin-dashboard.png',
    badge: 'RBAC Admin + KPI',
  },
}
</script>

<template>
  <div
    style="view-transition-name: rentgo-stage"
    class="grid grid-cols-12 gap-4 items-center mt-1 select-none"
  >
    <!-- Laptop Mockup (8 Columns) -->
    <div class="col-span-8 flex flex-col">
      <div class="rounded-t-2xl border border-slate-700/80 bg-slate-900/95 p-2 shadow-2xl">
        <!-- Browser Top Bar -->
        <div class="flex items-center justify-between gap-2 pb-2 px-1 border-b border-slate-800">
          <div class="flex items-center gap-1.5">
            <span class="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span class="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span class="h-2.5 w-2.5 rounded-full bg-teal-400/80" />
          </div>

          <div class="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-950 px-3 py-0.5 font-mono text-[10px] text-teal-300">
            <span>🔒 https://{{ surfaces[activeSurface].url }}</span>
            <span class="rounded bg-teal-500/20 px-1.5 text-[9px] text-teal-300 font-bold">1x LOGIN</span>
          </div>

          <!-- Surface Switcher Pills -->
          <div class="flex gap-1">
            <button
              v-for="(val, key) in surfaces"
              :key="key"
              type="button"
              class="rounded px-2 py-0.5 font-mono text-[9px] font-bold transition cursor-pointer"
              :class="activeSurface === key ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'"
              @click="activeSurface = key"
            >
              /{{ key === 'landing' ? '' : key }}
            </button>
          </div>
        </div>

        <!-- Screen Viewport -->
        <div class="relative mt-1.5 h-[245px] overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
          <img
            :src="surfaces[activeSurface].screen"
            :alt="surfaces[activeSurface].label"
            width="640"
            height="360"
            class="h-full w-full object-cover object-top transition-all duration-500"
          />
          <div class="absolute bottom-2 left-2 right-2 flex items-center justify-between rounded-lg border border-slate-700/80 bg-slate-950/90 px-3 py-1.5 backdrop-blur">
            <span class="text-xs font-bold text-white">{{ surfaces[activeSurface].label }}</span>
            <span class="rounded-full border border-teal-400/40 bg-teal-950/80 px-2.5 py-0.5 font-mono text-[10px] font-bold text-teal-300">
              {{ surfaces[activeSurface].badge }}
            </span>
          </div>
        </div>
      </div>
      <!-- Laptop Base Lip -->
      <div class="mx-auto h-2.5 w-[104%] -ml-[2%] rounded-b-xl bg-gradient-to-r from-slate-700 via-slate-500 to-slate-700 shadow-lg" />
    </div>

    <!-- Mobile Phone Mockup (4 Columns) with Morphed Car Card -->
    <div class="col-span-4 flex flex-col items-center">
      <div class="w-[235px] rounded-[28px] border-2 border-slate-600/90 bg-slate-950 p-3 shadow-2xl">
        <!-- Dynamic Island Notch -->
        <div class="mx-auto mb-2.5 h-3.5 w-20 rounded-full bg-slate-800 flex items-center justify-end pr-2">
          <span class="h-1.5 w-1.5 rounded-full bg-teal-400" />
        </div>

        <!-- Mobile Header -->
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <span class="font-black text-xs text-white">RENT<span class="italic text-amber-400">GO</span><span class="text-teal-400">.</span></span>
          <span class="rounded bg-teal-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-teal-300">WIB LIVE</span>
        </div>

        <!-- Morphing Vehicle Card (from Slide 2 Collision -> Slide 3 Safe Lock) -->
        <div
          style="view-transition-name: rentgo-car-card"
          class="mt-2.5 rounded-xl border border-teal-500/50 bg-slate-900/95 p-2.5 shadow-lg"
        >
          <div class="flex items-center justify-between text-[9px] font-mono">
            <span class="text-teal-300 font-bold">✓ TERKUNCI ATOMIK</span>
            <span class="text-amber-400 font-bold">BK 1124 AAB</span>
          </div>
          <img
            src="/vehicles/Honda-Brio-Satya-RS.jfif"
            alt="Honda Brio Satya RS"
            width="190"
            height="100"
            class="mt-1.5 h-24 w-full rounded-lg object-cover border border-slate-800"
          />
          <div class="mt-2 flex items-baseline justify-between">
            <div>
              <div class="text-xs font-extrabold text-white">Honda Brio RS</div>
              <div class="text-[10px] text-slate-400">20–22 Nov (3 Hari)</div>
            </div>
            <div class="text-right">
              <div class="font-mono text-xs font-black text-teal-300 tabular-nums">Rp 1.050rb</div>
              <div class="text-[9px] text-slate-400">QRIS Instan</div>
            </div>
          </div>
        </div>

        <!-- Bottom Status Pill -->
        <div class="mt-2.5 rounded-lg bg-blue-600 py-1.5 text-center text-[10px] font-extrabold text-white shadow">
          1 Sesi Cookie • 3 Permukaan Web
        </div>
      </div>
    </div>
  </div>
</template>
