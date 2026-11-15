<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const fullWord = 'RENTGO.'
const typedText = ref('RENTGO.')
const caretVisible = ref(true)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  if (prefersReduced) {
    typedText.value = fullWord
    return
  }

  typedText.value = ''
  let i = 0
  timer = setInterval(() => {
    if (i < fullWord.length) {
      typedText.value = fullWord.slice(0, i + 1)
      i++
    } else if (timer) {
      clearInterval(timer)
      setTimeout(() => {
        caretVisible.value = false
      }, 900)
    }
  }, 115)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="relative flex flex-col items-center justify-between h-full py-4 text-center select-none">
    <!-- Subtle Ambient Keynote Spotlight -->
    <div
      class="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-64 w-[520px] rounded-full opacity-35 blur-3xl"
      style="background: radial-gradient(circle, #1D4ED8 0%, #0D9488 55%, transparent 80%);"
    />

    <!-- Top Minimal Keynote Pill -->
    <div class="relative z-10 flex items-center gap-2 rounded-full border border-teal-500/50 bg-slate-900/90 px-4 py-1 text-[11px] font-medium text-slate-200 shadow-lg">
      <span class="h-2 w-2 rounded-full bg-teal-400 animate-ping" />
      <span>Keynote Presentasi UTS • v1.2.0 •</span>
      <a
        href="https://rentgo.my.id"
        target="_blank"
        rel="noopener noreferrer"
        class="font-mono font-extrabold text-teal-300 underline decoration-teal-400/60 hover:text-amber-300"
      >
        https://rentgo.my.id ↗
      </a>
    </div>

    <!-- Centerpiece Morphing Logo & Tagline -->
    <div class="relative z-10 flex flex-col items-center my-auto">
      <div
        style="view-transition-name: rentgo-brand"
        class="inline-flex items-center gap-4 px-6 py-3 rounded-2xl border border-slate-800/80 bg-slate-950/60 shadow-2xl"
      >
        <!-- Triadic Speed Bars -->
        <span class="inline-flex items-end gap-1.5 py-1" aria-hidden="true">
          <span class="h-14 w-3 -skew-x-16 rounded-[3px] bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]" />
          <span class="h-11 w-3 -skew-x-16 rounded-[3px] bg-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.5)]" />
          <span class="h-8 w-3 -skew-x-16 rounded-[3px] bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)]" />
        </span>

        <!-- Typing / Morphing Wordmark -->
        <div class="flex items-baseline tracking-tighter">
          <span class="text-6xl font-black tracking-tighter text-white">
            {{ typedText.slice(0, 4) }}
          </span>
          <span class="text-6xl font-black italic tracking-tighter text-amber-400">
            {{ typedText.slice(4, 6) }}
          </span>
          <span class="text-6xl font-black text-teal-400">
            {{ typedText.slice(6, 7) }}
          </span>
          <span
            v-if="caretVisible"
            class="ml-1 inline-block h-12 w-1 bg-amber-400 animate-pulse"
          />
          <span class="ml-3 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 font-mono text-xs font-extrabold tracking-widest text-slate-200">
            MDN
          </span>
        </div>
      </div>

      <!-- Concise Apple-style Tagline (<= 12 words) -->
      <p class="mt-5 text-3xl font-extrabold tracking-tight text-slate-100">
        Satu Domain. <span class="text-teal-400">Nol Bentrok.</span> <span class="text-amber-400">Siap Jalan.</span>
      </p>
      <p class="mt-1.5 text-sm font-medium text-slate-400">
        Platform Rental Mobil &amp; Motor Real-Time Kota Medan
      </p>

      <!-- Morph Anchor Vehicle Pill (morphs into Slide 2 & 3) -->
      <div
        style="view-transition-name: rentgo-car-card"
        class="mt-5 inline-flex items-center gap-3 rounded-xl border border-blue-500/30 bg-slate-900/80 px-3.5 py-2 text-xs text-slate-300 shadow-lg"
      >
        <img
          src="/vehicles/Honda-Brio-Satya-RS.jfif"
          alt="Honda Brio Satya RS"
          width="48"
          height="32"
          class="h-8 w-12 rounded object-cover border border-slate-700"
        />
        <div class="text-left leading-tight">
          <div class="font-bold text-white">Honda Brio Satya RS • BK 1124 AAB</div>
          <div class="font-mono text-[10px] text-teal-400">rentgo.my.id • Single-Domain 1x Login</div>
        </div>
      </div>
    </div>

    <!-- Small Academic UTS Identity Bar -->
    <footer class="relative z-10 w-full max-w-3xl rounded-xl border border-slate-800/90 bg-slate-900/75 px-5 py-2.5 backdrop-blur">
      <div class="grid grid-cols-4 gap-3 text-left text-[11px]">
        <div>
          <div class="font-mono text-[9px] uppercase tracking-wider text-slate-400">Mahasiswa</div>
          <div class="font-bold text-white">Akbar Riansyah</div>
        </div>
        <div>
          <div class="font-mono text-[9px] uppercase tracking-wider text-slate-400">Proyek Individu</div>
          <div class="font-bold text-amber-400">No. 2 • Rental Kendaraan</div>
        </div>
        <div>
          <div class="font-mono text-[9px] uppercase tracking-wider text-slate-400">Program Studi</div>
          <div class="font-bold text-teal-300">TRPL Semester III</div>
        </div>
        <div>
          <div class="font-mono text-[9px] uppercase tracking-wider text-slate-400">Institusi &amp; MK</div>
          <div class="font-bold text-blue-300">PWBI • MMPRPL</div>
        </div>
      </div>
    </footer>
  </div>
</template>
