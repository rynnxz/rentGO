<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useSlideContext } from '@slidev/client'

const { $slidev } = useSlideContext()
const themeMode = ref<'dark' | 'light'>('dark')
const selectedHub = ref(0)

watch(
  () => $slidev?.nav?.clicks,
  (clicks) => {
    if (typeof clicks === 'number') {
      themeMode.value = clicks % 2 === 1 ? 'light' : 'dark'
    }
  }
)

function toggleTheme() {
  themeMode.value = themeMode.value === 'dark' ? 'light' : 'dark'
}

const hubs = [
  {
    name: 'Bandara Kualanamu (KNO)',
    badge: 'TERDEKAT • 23.4 km',
    coords: '3.6422° N, 98.8853° E',
    hours: '05.00 – 24.00 WIB',
    address: 'Lobi Kedatangan Domestik & Internasional KNO, Deli Serdang',
    pinX: 305,
    pinY: 58,
    triad: 'Triad I • Cobalt',
  },
  {
    name: 'Stasiun Kereta Api Medan',
    badge: 'PUSAT KOTA • 2.1 km',
    coords: '3.5917° N, 98.6783° E',
    hours: '06.00 – 22.00 WIB',
    address: 'Pintu Timur Railink City Check-In / Lapangan Merdeka',
    pinX: 165,
    pinY: 112,
    triad: 'Triad II • Emerald-Teal',
  },
  {
    name: 'Kantor & Garasi RentGo',
    badge: 'GARASI UTAMA • 0.8 km',
    coords: '3.5902° N, 98.6598° E',
    hours: '07.00 – 22.00 WIB',
    address: 'Jl. Gatot Subroto No. 88 (Simpang Iskandar Muda), Medan Baru',
    pinX: 92,
    pinY: 138,
    triad: 'Triad III • Warm Amber',
  },
]

const currentHub = computed(() => hubs[selectedHub.value])
</script>

<template>
  <div class="flex flex-col gap-3 mt-1 select-none">
    <!-- Live Theme Preview Container (Morphs between Dark & Light) -->
    <div
      class="rounded-2xl border p-4 transition-all duration-500 shadow-2xl"
      :class="
        themeMode === 'light'
          ? 'border-slate-300 bg-[#F8FAFC] text-[#0F172A]'
          : 'border-slate-700/80 bg-[#081226] text-[#F8FAFC]'
      "
    >
      <!-- Top Bar with Live Theme Toggle Switch -->
      <div
        class="flex items-center justify-between pb-3 mb-3 border-b transition-colors duration-500"
        :class="themeMode === 'light' ? 'border-slate-200' : 'border-slate-800'"
      >
        <div class="flex items-center gap-2.5">
          <span
            class="rounded-md px-2 py-0.5 font-mono text-[10px] font-extrabold uppercase"
            :class="
              themeMode === 'light'
                ? 'bg-[#0B1D3A] text-white'
                : 'bg-blue-500/20 text-blue-300 border border-blue-400/40'
            "
          >
            {{ themeMode === 'light' ? '☀️ TEMA TERANG (LIGHT)' : '🌙 TEMA GELAP (DARK)' }}
          </span>
          <span
            class="text-xs font-bold"
            :class="themeMode === 'light' ? 'text-slate-700' : 'text-slate-300'"
          >
            Token CSS Triadik (60% Cobalt • 30% Teal • 10% Amber)
          </span>
        </div>

        <!-- Interactive Toggle Button -->
        <button
          type="button"
          class="flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-extrabold transition-all duration-300 cursor-pointer shadow"
          :class="
            themeMode === 'light'
              ? 'border-[#0B1D3A] bg-[#0B1D3A] text-amber-400 hover:bg-slate-800'
              : 'border-amber-400/60 bg-amber-400 text-slate-950 hover:bg-amber-300'
          "
          @click="toggleTheme"
        >
          <span>{{ themeMode === 'light' ? 'Ganti ke Dark Mode 🌙' : 'Ganti ke Light Mode ☀️' }}</span>
        </button>
      </div>

      <!-- 2-Column Content: 3 Medan Location Cards + Interactive Map -->
      <div class="grid grid-cols-12 gap-4 items-stretch">
        <!-- Left: 3 Pickup Locations -->
        <div class="col-span-5 flex flex-col justify-between gap-2">
          <button
            v-for="(hub, idx) in hubs"
            :key="hub.name"
            type="button"
            class="rounded-xl border p-2.5 text-left transition-all duration-300 cursor-pointer"
            :class="[
              selectedHub === idx
                ? themeMode === 'light'
                  ? 'border-[#1D4ED8] bg-[#EFF6FF] shadow-md ring-2 ring-[#1D4ED8]/30'
                  : 'border-teal-400 bg-slate-900 shadow-lg ring-2 ring-teal-400/30'
                : themeMode === 'light'
                  ? 'border-slate-200 bg-white hover:border-slate-300'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700',
            ]"
            @click="selectedHub = idx"
          >
            <div class="flex items-center justify-between">
              <span
                class="font-mono text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded"
                :class="
                  themeMode === 'light'
                    ? 'bg-teal-100 text-teal-800'
                    : 'bg-teal-950 text-teal-300'
                "
              >
                {{ hub.badge }}
              </span>
              <span
                class="font-mono text-[9px]"
                :class="themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'"
              >
                {{ hub.hours }}
              </span>
            </div>
            <div
              class="mt-1 text-xs font-extrabold"
              :class="themeMode === 'light' ? 'text-[#0B1D3A]' : 'text-white'"
            >
              {{ hub.name }}
            </div>
            <div
              class="font-mono text-[10px]"
              :class="themeMode === 'light' ? 'text-[#1D4ED8]' : 'text-amber-300'"
            >
              {{ hub.coords }}
            </div>
          </button>
        </div>

        <!-- Right: Interactive Leaflet/OSM Map Simulation -->
        <div
          class="col-span-7 relative rounded-xl border overflow-hidden p-3 flex flex-col justify-between transition-colors duration-500"
          :class="
            themeMode === 'light'
              ? 'border-slate-300 bg-[#E2E8F0]'
              : 'border-slate-700 bg-[#050B16]'
          "
        >
          <!-- SVG Corridor Map -->
          <svg viewBox="0 0 400 185" class="absolute inset-0 h-full w-full" aria-hidden="true">
            <!-- Grid lines -->
            <g
              :stroke="themeMode === 'light' ? '#CBD5E1' : '#1E293B'"
              stroke-width="1"
            >
              <line x1="0" y1="45" x2="400" y2="45" />
              <line x1="0" y1="95" x2="400" y2="95" />
              <line x1="0" y1="145" x2="400" y2="145" />
              <line x1="100" y1="0" x2="100" y2="185" />
              <line x1="200" y1="0" x2="200" y2="185" />
              <line x1="300" y1="0" x2="300" y2="185" />
            </g>

            <!-- Toll Road Corridor: Medan Baru -> Stasiun -> Kualanamu -->
            <path
              d="M 92 138 Q 130 125, 165 112 T 305 58"
              :stroke="themeMode === 'light' ? '#1D4ED8' : '#38BDF8'"
              stroke-width="4"
              stroke-dasharray="7 5"
              fill="none"
            />

            <!-- 3 Location Markers -->
            <g
              v-for="(hub, idx) in hubs"
              :key="hub.name"
              class="cursor-pointer"
              @click="selectedHub = idx"
            >
              <circle
                :cx="hub.pinX"
                :cy="hub.pinY"
                :r="selectedHub === idx ? 14 : 7"
                :fill="selectedHub === idx ? '#F59E0B' : '#0D9488'"
                :opacity="selectedHub === idx ? 0.28 : 0.7"
              />
              <circle
                :cx="hub.pinX"
                :cy="hub.pinY"
                :r="selectedHub === idx ? 7 : 5"
                :fill="selectedHub === idx ? '#F59E0B' : '#0D9488'"
                stroke="#FFFFFF"
                stroke-width="2"
              />
            </g>
          </svg>

          <!-- Top Map Overlay -->
          <div class="relative z-10 flex items-center justify-between">
            <span
              class="rounded-md px-2 py-0.5 font-mono text-[10px] font-bold shadow"
              :class="
                themeMode === 'light'
                  ? 'bg-white/95 text-[#0B1D3A] border border-slate-300'
                  : 'bg-slate-900/95 text-teal-300 border border-slate-700'
              "
            >
              Leaflet + OpenStreetMap • Haversine Formula
            </span>
            <span
              class="rounded-md px-2 py-0.5 font-mono text-[10px] font-bold"
              :class="
                themeMode === 'light'
                  ? 'bg-[#0B1D3A] text-amber-300'
                  : 'bg-amber-400 text-slate-950'
              "
            >
              {{ currentHub.triad }}
            </span>
          </div>

          <!-- Bottom Active Hub Details Card -->
          <div
            class="relative z-10 rounded-lg border p-2.5 shadow-lg transition-colors duration-500"
            :class="
              themeMode === 'light'
                ? 'border-slate-300 bg-white/95 text-[#0F172A]'
                : 'border-slate-700 bg-slate-900/95 text-white'
            "
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold">📍 {{ currentHub.name }}</span>
              <span
                class="font-mono text-[10px] font-bold"
                :class="themeMode === 'light' ? 'text-[#0D9488]' : 'text-teal-300'"
              >
                Google Maps Directions ↗
              </span>
            </div>
            <p
              class="mt-0.5 text-[10px]"
              :class="themeMode === 'light' ? 'text-slate-600' : 'text-slate-300'"
            >
              {{ currentHub.address }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
