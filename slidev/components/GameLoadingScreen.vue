<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useSlideContext } from '@slidev/client'

const { $slidev } = useSlideContext()

const progress = ref(100)
const tipIndex = ref(0)
const flashActive = ref(false)
let intervalId: ReturnType<typeof setInterval> | null = null
let tipTimer: ReturnType<typeof setInterval> | null = null

const tips = [
  'Mengunci jadwal armada di Supabase Cloud…',
  'Menghubungkan domain produksi https://rentgo.my.id…',
  'Menyiapkan peta Haversine 3 titik jemput Medan…',
  'Memuat asisten AI Gemini (limit 10/menit)…',
  'Menginisialisasi gateway QRIS Midtrans Sandbox…',
  'Sistem siap. Membuka portal live https://rentgo.my.id…',
]

const currentTip = computed(() => tips[tipIndex.value % tips.length])

function startLoadingSequence() {
  if ($slidev?.nav?.isPrintMode) {
    progress.value = 100
    tipIndex.value = tips.length - 1
    return
  }

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  if (prefersReduced) {
    progress.value = 100
    tipIndex.value = tips.length - 1
    return
  }

  if (intervalId) clearInterval(intervalId)
  if (tipTimer) clearInterval(tipTimer)

  progress.value = 0
  tipIndex.value = 0
  flashActive.value = false

  tipTimer = setInterval(() => {
    if (tipIndex.value < tips.length - 1) {
      tipIndex.value++
    }
  }, 520)

  intervalId = setInterval(() => {
    if (progress.value < 100) {
      const step = progress.value < 60 ? 4 : progress.value < 90 ? 3 : 2
      progress.value = Math.min(100, progress.value + step)
    } else {
      if (intervalId) clearInterval(intervalId)
      if (tipTimer) clearInterval(tipTimer)
      tipIndex.value = tips.length - 1
      flashActive.value = true
      setTimeout(() => {
        flashActive.value = false
      }, 420)
    }
  }, 85)
}

function enterLiveDemo() {
  if ($slidev?.nav?.next) {
    $slidev.nav.next()
  }
}

onMounted(() => {
  startLoadingSequence()
})

watch(
  () => $slidev?.nav?.currentPage,
  (page) => {
    if (page === 15) {
      startLoadingSequence()
    }
  }
)

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
  if (tipTimer) clearInterval(tipTimer)
})
</script>

<template>
  <div class="relative flex flex-col items-center justify-between h-full py-6 px-8 rounded-2xl bg-[#02050C] border border-slate-800/90 overflow-hidden select-none">
    <!-- Flash Transition Overlay when 100% completes -->
    <div
      class="pointer-events-none absolute inset-0 z-40 bg-white transition-opacity duration-300"
      :class="flashActive ? 'opacity-75' : 'opacity-0'"
    />

    <!-- Ambient Game HUD Glow -->
    <div
      class="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-[540px] rounded-full blur-3xl transition-opacity duration-500"
      :class="progress >= 100 ? 'opacity-55' : 'opacity-30'"
      style="background: radial-gradient(circle, #14B8A6 0%, #1D4ED8 50%, transparent 75%);"
    />

    <!-- Top Game HUD Telemetry Bar -->
    <div class="relative z-10 w-full flex items-center justify-between font-mono text-[10px] text-slate-400">
      <div class="flex items-center gap-2">
        <span class="h-2 w-2 rounded-full bg-teal-400 animate-ping" />
        <span>LIVE PRODUCTION: HTTPS://RENTGO.MY.ID</span>
      </div>
      <div class="flex items-center gap-2">
        <span>REGION: ASIA/JAKARTA (WIB)</span>
        <button
          type="button"
          class="rounded border border-slate-700 bg-slate-900 px-2 py-0.5 text-[9px] text-slate-300 hover:text-white cursor-pointer"
          @click="startLoadingSequence"
        >
          ↻ Replay
        </button>
      </div>
    </div>

    <!-- Center Pulsing RENTGO. Logo -->
    <div class="relative z-10 flex flex-col items-center my-auto">
      <div
        style="view-transition-name: rentgo-brand"
        class="inline-flex items-center gap-4 px-7 py-4 rounded-2xl border border-teal-500/40 bg-slate-950/90 shadow-[0_0_50px_rgba(20,184,166,0.3)] logo-pulse"
      >
        <span class="inline-flex items-end gap-1.5 py-1" aria-hidden="true">
          <span class="h-12 w-2.5 -skew-x-16 rounded-[3px] bg-blue-500 shadow-[0_0_16px_#3B82F6]" />
          <span class="h-9 w-2.5 -skew-x-16 rounded-[3px] bg-teal-400 shadow-[0_0_16px_#14B8A6]" />
          <span class="h-6 w-2.5 -skew-x-16 rounded-[3px] bg-amber-400 shadow-[0_0_16px_#F59E0B]" />
        </span>

        <div class="flex items-baseline tracking-tighter">
          <span class="text-5xl font-black text-white">RENT</span>
          <span class="text-5xl font-black italic text-amber-400">GO</span>
          <span class="text-5xl font-black text-teal-400">.</span>
          <span class="ml-2.5 rounded border border-teal-500/40 bg-teal-950/60 px-2 py-0.5 font-mono text-xs font-extrabold tracking-widest text-teal-300">
            MDN
          </span>
        </div>
      </div>

      <!-- Dynamic Game Loading Tip -->
      <div class="mt-5 h-6 flex items-center justify-center">
        <p class="font-mono text-xs font-bold tracking-wide text-teal-300">
          {{ currentTip }}
        </p>
      </div>
    </div>

    <!-- Bottom Game Progress Bar & Enter Web CTA -->
    <div class="relative z-10 w-full max-w-2xl space-y-2.5">
      <div class="flex items-baseline justify-between font-mono">
        <span class="text-[10px] uppercase tracking-widest text-slate-400">
          {{ progress < 100 ? 'LOADING SYSTEM MODULES...' : 'READY TO LAUNCH LIVE WEB' }}
        </span>
        <span class="text-xl font-black text-amber-400 tabular-nums">
          {{ progress }}%
        </span>
      </div>

      <!-- Progress Bar Track -->
      <div class="h-3.5 w-full rounded-full border border-slate-700 bg-slate-900 p-0.5 overflow-hidden shadow-inner">
        <div
          class="h-full rounded-full bg-gradient-to-r from-blue-600 via-teal-400 to-amber-400 transition-all duration-100 shadow-[0_0_20px_rgba(20,184,166,0.8)]"
          :style="{ width: `${progress}%` }"
        />
      </div>

      <!-- Action Button when ready -->
      <div class="pt-1 flex justify-center">
        <button
          type="button"
          class="rounded-xl border border-teal-400/80 bg-gradient-to-r from-blue-600 via-teal-500 to-amber-500 px-6 py-2 font-mono text-xs font-black uppercase tracking-wider text-slate-950 shadow-[0_0_30px_rgba(20,184,166,0.5)] hover:scale-105 transition cursor-pointer"
          @click="enterLiveDemo"
        >
          ⚡ Masuk ke Web Live https://rentgo.my.id (Slide 16) →
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes gamePulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
}
.logo-pulse {
  animation: gamePulse 2.2s ease-in-out infinite;
}
</style>
