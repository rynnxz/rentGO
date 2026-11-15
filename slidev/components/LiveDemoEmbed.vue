<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSlideContext } from '@slidev/client'

const { $slidev } = useSlideContext()

type SurfaceKey = 'landing' | 'book' | 'admin'
const activeSurface = ref<SurfaceKey>('landing')
const showFallbackModal = ref(false)
const localEmbedAvailable = ref(false)
const iframeKey = ref(0)

const presets: Record<
  SurfaceKey,
  {
    label: string
    prodUrl: string
    localUrl: string
    backdrop: string
    badge: string
  }
> = {
  landing: {
    label: '🌐 rentgo.my.id/',
    prodUrl: 'https://rentgo.my.id/',
    localUrl: 'http://localhost:3000/',
    backdrop: '/screens/01-landing-hero.png',
    badge: 'Landing Publik • Single-Domain 1x Login',
  },
  book: {
    label: '🚗 rentgo.my.id/book',
    prodUrl: 'https://rentgo.my.id/book',
    localUrl: 'http://localhost:3000/book',
    backdrop: '/screens/04-book-ai-recommend.png',
    badge: 'Katalog Armada + AI Gemini + QRIS',
  },
  admin: {
    label: '🛡️ rentgo.my.id/admin',
    prodUrl: 'https://rentgo.my.id/admin',
    localUrl: 'http://localhost:3000/admin',
    backdrop: '/screens/07-admin-dashboard.png',
    badge: 'Panel Operasional Admin + KPI Real-Time',
  },
}

const currentPreset = computed(() => presets[activeSurface.value])

function selectSurface(key: SurfaceKey) {
  activeSurface.value = key
  iframeKey.value++
}

function openExternal(url: string) {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

onMounted(async () => {
  if ($slidev?.nav?.isPrintMode) {
    localEmbedAvailable.value = false
    return
  }
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 1200)
    await fetch('http://localhost:3000/favicon.ico', {
      mode: 'no-cors',
      signal: ctrl.signal,
    })
    clearTimeout(timer)
    localEmbedAvailable.value = true
  } catch {
    localEmbedAvailable.value = false
  }
})
</script>

<template>
  <div class="flex flex-col gap-2 mt-0.5 h-[380px] select-none">
    <!-- Single-Line Live Production Control Bar -->
    <div class="flex items-center justify-between gap-2 rounded-xl border border-slate-700/90 bg-slate-900/95 px-3 py-1.5 shadow-lg">
      <div class="flex items-center gap-1.5">
        <span class="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
        <button
          v-for="(item, key) in presets"
          :key="key"
          type="button"
          class="rounded-md px-2.5 py-0.5 font-mono text-[10px] font-bold transition cursor-pointer"
          :class="
            activeSurface === key
              ? 'bg-blue-600 text-white shadow'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          "
          @click="selectSurface(key)"
        >
          {{ item.label }}
        </button>
      </div>

      <div class="flex items-center gap-1.5">
        <button
          type="button"
          class="rounded-md border border-amber-400/50 bg-amber-500/20 px-2.5 py-0.5 font-mono text-[10px] font-bold text-amber-300 hover:bg-amber-500/30 cursor-pointer"
          @click="showFallbackModal = !showFallbackModal"
        >
          {{ showFallbackModal ? '✕ Tutup QR' : '📱 QR rentgo.my.id' }}
        </button>
        <button
          type="button"
          class="rounded-md bg-teal-500 px-3 py-0.5 font-mono text-[10px] font-black text-slate-950 hover:bg-teal-400 cursor-pointer shadow"
          @click="openExternal(currentPreset.prodUrl)"
        >
          🚀 Buka {{ currentPreset.prodUrl.replace('https://', '') }} ↗
        </button>
      </div>
    </div>

    <!-- Main Interactive Viewport Container -->
    <div class="relative flex-1 rounded-xl border border-slate-700/90 bg-slate-950 overflow-hidden shadow-2xl">
      <!-- High-Resolution Production Surface Preview (Always Crisp, Zero Gray Error Icon) -->
      <img
        :src="currentPreset.backdrop"
        :alt="currentPreset.label"
        width="920"
        height="340"
        class="h-full w-full object-cover object-top transition-all duration-300"
      />

      <!-- Live Interactive Iframe when Local Engine with CSP frame-ancestors is active -->
      <iframe
        v-if="localEmbedAvailable"
        :key="iframeKey"
        :src="currentPreset.localUrl"
        title="Demo Live Aplikasi Web Produksi RentGo Medan"
        width="920"
        height="340"
        class="absolute inset-0 z-10 h-full w-full border-0 bg-transparent"
        allow="geolocation; clipboard-write"
      />

      <!-- Bottom Floating Production Status & Quick Launch Dock (When Iframe is in Preview Mode) -->
      <div
        v-if="!localEmbedAvailable && !showFallbackModal"
        class="absolute bottom-3 left-3 right-3 z-15 flex items-center justify-between rounded-xl border border-teal-500/50 bg-slate-950/90 px-4 py-2 backdrop-blur-md shadow-2xl"
      >
        <div class="flex items-center gap-2.5">
          <span class="rounded bg-teal-400 px-2 py-0.5 font-mono text-[9px] font-black text-slate-950">
            ONLINE PRODUCTION
          </span>
          <span class="font-mono text-xs font-bold text-white">
            {{ currentPreset.prodUrl }}
          </span>
          <span class="text-[11px] text-slate-300">
            • {{ currentPreset.badge }}
          </span>
        </div>

        <button
          type="button"
          class="rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 px-3.5 py-1 font-mono text-[10px] font-black text-white shadow hover:scale-105 transition cursor-pointer"
          @click="openExternal(currentPreset.prodUrl)"
        >
          Buka Live di Tab Baru ↗
        </button>
      </div>

      <!-- QR Code & Direct Production Launcher Overlay -->
      <div
        v-if="showFallbackModal"
        class="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/92 p-5 backdrop-blur-md"
      >
        <div class="max-w-2xl w-full rounded-2xl border border-teal-500/50 bg-slate-900 p-4 shadow-2xl grid grid-cols-12 gap-4 items-center">
          <!-- Crisp SVG QR Code Backup -->
          <div class="col-span-4 flex flex-col items-center">
            <div class="rounded-xl bg-white p-2.5 shadow-lg">
              <svg viewBox="0 0 100 100" class="h-24 w-24 fill-slate-950" aria-label="QR Code https://rentgo.my.id">
                <rect x="6" y="6" width="28" height="28" fill="none" stroke="#0F172A" stroke-width="5" />
                <rect x="13" y="13" width="14" height="14" />
                <rect x="66" y="6" width="28" height="28" fill="none" stroke="#0F172A" stroke-width="5" />
                <rect x="73" y="13" width="14" height="14" />
                <rect x="6" y="66" width="28" height="28" fill="none" stroke="#0F172A" stroke-width="5" />
                <rect x="13" y="73" width="14" height="14" />
                <rect x="42" y="10" width="8" height="8" />
                <rect x="42" y="24" width="14" height="8" />
                <rect x="10" y="42" width="18" height="8" />
                <rect x="40" y="40" width="20" height="20" rx="3" fill="#0D9488" />
                <rect x="68" y="42" width="10" height="16" />
                <rect x="84" y="46" width="10" height="12" />
                <rect x="42" y="68" width="12" height="10" />
                <rect x="62" y="68" width="28" height="10" />
                <rect x="50" y="84" width="38" height="10" />
              </svg>
            </div>
            <span class="mt-1.5 font-mono text-[10px] font-bold text-teal-300">
              https://rentgo.my.id
            </span>
          </div>

          <!-- Direct Production Links -->
          <div class="col-span-8 space-y-2 text-left">
            <span class="rounded bg-teal-400 px-2 py-0.5 font-mono text-[9px] font-black text-slate-950">
              DOMAIN PRODUKSI AKTIF • HTTPS://RENTGO.MY.ID
            </span>
            <h3 class="text-sm font-extrabold text-white">
              Peluncur Cepat 3 Permukaan Web (Single-Domain 1x Login)
            </h3>
            <p class="text-[11px] text-slate-300">
              Aplikasi telah online di <code class="text-teal-300 font-bold">https://rentgo.my.id</code>. Pilih permukaan di bawah untuk membuka langsung di tab browser penuh:
            </p>
            <div class="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                class="rounded-lg bg-blue-600 px-3 py-1.5 font-mono text-[11px] font-bold text-white hover:bg-blue-500 cursor-pointer text-left"
                @click="openExternal('https://rentgo.my.id/')"
              >
                🌐 Landing (rentgo.my.id/) ↗
              </button>
              <button
                type="button"
                class="rounded-lg bg-teal-600 px-3 py-1.5 font-mono text-[11px] font-bold text-white hover:bg-teal-500 cursor-pointer text-left"
                @click="openExternal('https://rentgo.my.id/book')"
              >
                🚗 Katalog (rentgo.my.id/book) ↗
              </button>
              <button
                type="button"
                class="rounded-lg bg-amber-500 px-3 py-1.5 font-mono text-[11px] font-black text-slate-950 hover:bg-amber-400 cursor-pointer text-left"
                @click="openExternal('https://rentgo.my.id/admin')"
              >
                🛡️ Admin (rentgo.my.id/admin) ↗
              </button>
              <button
                type="button"
                class="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 font-mono text-[11px] font-bold text-slate-200 hover:bg-slate-700 cursor-pointer text-left"
                @click="showFallbackModal = false"
              >
                ✕ Kembali ke Tampilan Slide
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
