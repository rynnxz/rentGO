<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import { useSlideContext } from '@slidev/client'

const { $slidev } = useSlideContext()
const manualStep = ref<number | null>(null)
const isAutoPlaying = ref(false)
const clickPulse = ref(false)
let autoTimer: ReturnType<typeof setInterval> | null = null

const currentStep = computed(() => {
  if ($slidev?.nav?.isPrintMode) return 7
  if (manualStep.value !== null) return manualStep.value
  const clicks = $slidev?.nav?.clicks ?? 0
  return Math.min(7, Math.max(1, clicks + 1))
})

function setStep(s: number) {
  manualStep.value = Math.min(7, Math.max(1, s))
}

function nextStep() {
  setStep(currentStep.value < 7 ? currentStep.value + 1 : 1)
}

function prevStep() {
  setStep(currentStep.value > 1 ? currentStep.value - 1 : 7)
}

function toggleAutoPlay() {
  if (isAutoPlaying.value) {
    isAutoPlaying.value = false
    if (autoTimer) clearInterval(autoTimer)
    return
  }
  isAutoPlaying.value = true
  manualStep.value = 1
  autoTimer = setInterval(() => {
    if ((manualStep.value ?? 1) < 7) {
      manualStep.value = (manualStep.value ?? 1) + 1
    } else {
      isAutoPlaying.value = false
      if (autoTimer) clearInterval(autoTimer)
    }
  }, 1900)
}

watch(currentStep, () => {
  clickPulse.value = false
  setTimeout(() => {
    clickPulse.value = true
  }, 520)
})

onUnmounted(() => {
  if (autoTimer) clearInterval(autoTimer)
})

const stepsMeta = [
  {
    step: 1,
    short: '1. Cari Tanggal',
    url: 'rentgo.my.id/book',
    cursorX: '78%',
    cursorY: '66%',
    cursorLabel: 'Klik Cari Armada',
  },
  {
    step: 2,
    short: '2. AI Mengetik',
    url: 'rentgo.my.id/book?ai=true',
    cursorX: '72%',
    cursorY: '72%',
    cursorLabel: 'AI Pilih Avanza CVT',
  },
  {
    step: 3,
    short: '3. Pilih Unit',
    url: 'rentgo.my.id/book/vehicles/avanza-cvt',
    cursorX: '80%',
    cursorY: '78%',
    cursorLabel: 'Klik Pilih Unit',
  },
  {
    step: 4,
    short: '4. Peta Lokasi',
    url: 'rentgo.my.id/book/vehicles/avanza-cvt#map',
    cursorX: '64%',
    cursorY: '54%',
    cursorLabel: 'Drop Pin Kualanamu',
  },
  {
    step: 5,
    short: '5. Bayar QRIS',
    url: 'rentgo.my.id/book/bookings/RG-20261120-7741',
    cursorX: '75%',
    cursorY: '76%',
    cursorLabel: 'Klik Sudah Bayar QRIS',
  },
  {
    step: 6,
    short: '6. Tunggu Admin',
    url: 'rentgo.my.id/book/bookings/RG-20261120-7741',
    cursorX: '68%',
    cursorY: '56%',
    cursorLabel: 'Status: Menunggu Admin',
  },
  {
    step: 7,
    short: '7. Siap Diambil',
    url: 'rentgo.my.id/admin/bookings',
    cursorX: '81%',
    cursorY: '64%',
    cursorLabel: 'Admin Klik Konfirmasi',
  },
]

const activeMeta = computed(() => stepsMeta[currentStep.value - 1])
</script>

<template>
  <div
    style="view-transition-name: rentgo-stage"
    class="flex flex-col gap-2 mt-0.5 select-none"
  >
    <!-- Browser Window Mockup -->
    <div class="relative rounded-2xl border border-slate-700/90 bg-slate-950 shadow-2xl overflow-hidden">
      <!-- Top Browser Chrome -->
      <div class="flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-3.5 py-2">
        <div class="flex items-center gap-1.5">
          <span class="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span class="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span class="h-2.5 w-2.5 rounded-full bg-teal-400/80" />
          <span class="ml-2 font-mono text-[10px] font-bold text-slate-400">
            Langkah {{ currentStep }} / 7
          </span>
        </div>

        <!-- Dynamic URL Bar -->
        <div class="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-950 px-3 py-0.5 font-mono text-[10px]">
          <span class="text-teal-400">🔒 https://{{ activeMeta.url }}</span>
          <span class="rounded bg-blue-500/20 px-1.5 py-0.2 text-[9px] font-bold text-blue-300">
            __session (1x Login)
          </span>
        </div>

        <!-- Step Controls in Header -->
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-200 hover:bg-slate-700 cursor-pointer"
            aria-label="Langkah sebelumnya"
            @click="prevStep"
          >
            ◀
          </button>
          <button
            type="button"
            class="rounded border border-teal-500/50 bg-teal-600 px-2.5 py-0.5 font-mono text-[10px] font-bold text-white hover:bg-teal-500 cursor-pointer"
            @click="nextStep"
          >
            Langkah Berikutnya ▶
          </button>
          <button
            type="button"
            class="rounded border border-amber-500/50 bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300 hover:bg-amber-500/30 cursor-pointer"
            @click="toggleAutoPlay"
          >
            {{ isAutoPlaying ? '⏸ Pause' : '▶ Auto' }}
          </button>
        </div>
      </div>

      <!-- Interactive Stage Viewport -->
      <div class="relative h-[265px] p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
        <!-- STEP 1: Cari Tanggal -->
        <div v-if="currentStep === 1" class="grid grid-cols-12 gap-4 h-full items-center">
          <div class="col-span-5 space-y-2">
            <span class="rounded bg-blue-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-300">
              LANGKAH 1 • QUICK DATE SEARCH WIB
            </span>
            <h3 class="text-lg font-extrabold text-white">Pilih Rentang Tanggal Sewa</h3>
            <p class="text-xs text-slate-300">
              Sistem menghitung durasi hari secara inklusif di zona waktu <code class="text-teal-300">Asia/Jakarta (WIB)</code>.
            </p>
          </div>
          <div class="col-span-7 rounded-xl border border-blue-500/40 bg-slate-900/90 p-3.5 shadow-xl">
            <div class="grid grid-cols-2 gap-2.5 text-xs">
              <div class="rounded-lg border border-slate-700 bg-slate-950 p-2.5">
                <div class="font-mono text-[9px] text-slate-400">TANGGAL MULAI (WIB)</div>
                <div class="mt-1 font-mono text-sm font-bold text-white">20 Nov 2026</div>
              </div>
              <div class="rounded-lg border border-slate-700 bg-slate-950 p-2.5">
                <div class="font-mono text-[9px] text-slate-400">TANGGAL SELESAI (WIB)</div>
                <div class="mt-1 font-mono text-sm font-bold text-white">22 Nov 2026</div>
              </div>
            </div>
            <div class="mt-3 flex items-center justify-between rounded-lg bg-slate-950/90 px-3 py-2 border border-slate-800">
              <span class="font-mono text-xs text-teal-300">Durasi Inklusif: <strong>3 Hari Sewa</strong></span>
              <span class="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-extrabold text-white shadow-lg ring-2 ring-blue-400">
                Cari Armada Tersedia →
              </span>
            </div>
          </div>
        </div>

        <!-- STEP 2: Rekomendasi AI Mengetik -->
        <div v-else-if="currentStep === 2" class="grid grid-cols-12 gap-4 h-full items-center">
          <div class="col-span-5 space-y-2">
            <span class="rounded bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300">
              LANGKAH 2 • GEMINI FLASH AI (10/MNT)
            </span>
            <h3 class="text-lg font-extrabold text-white">Asisten AI Mengetik Rekomendasi</h3>
            <p class="text-xs text-slate-300">
              Mengekstrak jumlah penumpang, rute wisata, dan batas anggaran terhadap stok nyata.
            </p>
          </div>
          <div class="col-span-7 space-y-2.5 rounded-xl border border-amber-500/40 bg-slate-900/90 p-3.5 shadow-xl">
            <div class="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-amber-300">
              <span class="text-slate-400">Prompt: </span>
              <span class="typewriter-line">"Mobil keluarga 6 orang ke Berastagi, budget 500rb/hari"</span>
            </div>
            <div class="rounded-lg border border-teal-500/50 bg-teal-950/40 p-2.5 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <img
                  src="/vehicles/Toyota-Avanza-1.5-G-CVT.png"
                  alt="Toyota Avanza 1.5 G CVT"
                  width="64"
                  height="42"
                  class="h-11 w-16 rounded object-cover border border-teal-400/40 bg-slate-900"
                />
                <div>
                  <div class="flex items-center gap-1.5">
                    <span class="rounded bg-amber-400 px-1.5 py-0.2 font-mono text-[9px] font-black text-slate-950">TOP MATCH AI</span>
                    <span class="font-mono text-[10px] text-teal-300">BK 1829 AAC</span>
                  </div>
                  <div class="text-xs font-extrabold text-white mt-0.5">Toyota Avanza 1.5 G CVT (7 Kursi)</div>
                  <div class="text-[10px] text-slate-300">Torsi kuat tanjakan Berastagi • Rp 420.000/hari</div>
                </div>
              </div>
              <span class="rounded-lg bg-teal-500 px-2.5 py-1 font-mono text-[10px] font-black text-slate-950">
                Pilih Unit
              </span>
            </div>
          </div>
        </div>

        <!-- STEP 3: Pilih Unit -->
        <div v-else-if="currentStep === 3" class="grid grid-cols-12 gap-4 h-full items-center">
          <div class="col-span-5 space-y-2">
            <span class="rounded bg-teal-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-teal-300">
              LANGKAH 3 • KATALOG ARMADA REAL-TIME
            </span>
            <h3 class="text-lg font-extrabold text-white">Pilih Unit &amp; Kunci Jadwal</h3>
            <p class="text-xs text-slate-300">
              Unit yang sedang servis bengkel (<code class="text-amber-300">BK 7099 AAL</code>) otomatis disembunyikan.
            </p>
          </div>
          <div class="col-span-7 rounded-xl border border-teal-500/50 bg-slate-900/90 p-3.5 shadow-xl flex items-center justify-between gap-4">
            <img
              src="/vehicles/Toyota-Avanza-1.5-G-CVT.png"
              alt="Toyota Avanza 1.5 G CVT"
              width="150"
              height="96"
              class="h-28 w-40 rounded-lg object-cover border border-slate-700 bg-slate-950"
            />
            <div class="flex-1 space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="rounded bg-teal-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-teal-300">MPV • MATIC CVT</span>
                <span class="font-mono text-xs font-bold text-amber-400">BK 1829 AAC</span>
              </div>
              <div class="text-base font-extrabold text-white">Toyota Avanza 1.5 G CVT</div>
              <div class="font-mono text-xs text-slate-300 tabular-nums">
                3 Hari × Rp 420.000 = <strong class="text-teal-300">Rp 1.260.000</strong>
              </div>
              <div class="pt-1 flex justify-end">
                <span class="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-extrabold text-white ring-2 ring-blue-400">
                  Lanjut Pilih Lokasi Jemput →
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 4: Pilih Lokasi di Peta (Pin Terbang) -->
        <div v-else-if="currentStep === 4" class="grid grid-cols-12 gap-4 h-full items-center">
          <div class="col-span-5 space-y-2">
            <span class="rounded bg-blue-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-300">
              LANGKAH 4 • PETA LEAFLET + HAVERSINE
            </span>
            <h3 class="text-lg font-extrabold text-white">Pin Terbang ke Titik Jemput</h3>
            <p class="text-xs text-slate-300">
              Memilih <strong>Bandara Internasional Kualanamu (KNO)</strong> dengan koordinat GPS dan jam operasional.
            </p>
          </div>
          <div class="col-span-7 relative h-[210px] rounded-xl border border-blue-500/50 bg-slate-900 overflow-hidden p-3">
            <!-- Stylized Map Grid & Road Corridor -->
            <svg viewBox="0 0 420 180" class="absolute inset-0 h-full w-full opacity-40" aria-hidden="true">
              <path d="M 20 140 Q 150 90, 290 65 T 400 40" stroke="#3B82F6" stroke-width="4" fill="none" stroke-dasharray="6 4" />
              <circle cx="95" cy="122" r="5" fill="#14B8A6" />
              <circle cx="155" cy="102" r="5" fill="#F59E0B" />
            </svg>

            <!-- Flying Pin Animation on Kualanamu Airport -->
            <div class="relative z-10 flex h-full flex-col justify-between">
              <div class="flex justify-between items-start">
                <span class="rounded bg-slate-950/90 border border-slate-700 px-2 py-0.5 font-mono text-[10px] text-slate-300">
                  OpenStreetMap • Koridor Medan–KNO
                </span>
                <span class="rounded bg-teal-500/20 border border-teal-400/40 px-2 py-0.5 font-mono text-[10px] font-bold text-teal-300">
                  Haversine: 23.4 km
                </span>
              </div>

              <!-- Flying Pin Target -->
              <div class="mx-auto flex flex-col items-center flying-pin">
                <div class="rounded-full bg-amber-400 px-2.5 py-0.5 font-mono text-[10px] font-black text-slate-950 shadow-lg">
                  📍 Bandara Kualanamu (KNO)
                </div>
                <div class="h-3 w-0.5 bg-amber-400" />
                <div class="h-4 w-4 rounded-full bg-amber-400 ring-8 ring-amber-400/30 animate-ping" />
              </div>

              <div class="rounded-lg border border-slate-700 bg-slate-950/90 px-3 py-1.5 flex items-center justify-between text-[11px]">
                <span class="text-white font-bold">Area Pick-Up Kedatangan KNO (05.00–24.00 WIB)</span>
                <span class="text-teal-300 font-mono font-bold">3.6422° N, 98.8853° E</span>
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 5: Bayar QRIS Midtrans -->
        <div v-else-if="currentStep === 5" class="grid grid-cols-12 gap-4 h-full items-center">
          <div class="col-span-5 space-y-2">
            <span class="rounded bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300">
              LANGKAH 5 • QRIS MIDTRANS SANDBOX
            </span>
            <h3 class="text-lg font-extrabold text-white">Scan &amp; Simulasi Bayar QRIS</h3>
            <p class="text-xs text-slate-300">
              Payload QRIS dinamis (<code class="text-amber-300">rentgo-test</code>) terkunci untuk kode pesanan <code class="text-teal-300">RG-20261120-7741</code>.
            </p>
          </div>
          <div class="col-span-7 rounded-xl border border-amber-500/50 bg-slate-900/95 p-3.5 flex items-center justify-between gap-4">
            <!-- SVG QR Matrix -->
            <div class="rounded-xl bg-white p-2.5 shadow-lg shrink-0">
              <svg viewBox="0 0 80 80" class="h-24 w-24 fill-slate-950" aria-label="QRIS Code">
                <rect x="4" y="4" width="24" height="24" rx="2" fill="none" stroke="#0F172A" stroke-width="4" />
                <rect x="10" y="10" width="12" height="12" />
                <rect x="52" y="4" width="24" height="24" rx="2" fill="none" stroke="#0F172A" stroke-width="4" />
                <rect x="58" y="10" width="12" height="12" />
                <rect x="4" y="52" width="24" height="24" rx="2" fill="none" stroke="#0F172A" stroke-width="4" />
                <rect x="10" y="58" width="12" height="12" />
                <rect x="34" y="12" width="6" height="6" />
                <rect x="34" y="26" width="12" height="6" />
                <rect x="12" y="36" width="14" height="6" />
                <rect x="34" y="36" width="12" height="12" fill="#0D9488" />
                <rect x="52" y="36" width="8" height="14" />
                <rect x="66" y="40" width="8" height="10" />
                <rect x="36" y="56" width="10" height="8" />
                <rect x="52" y="56" width="22" height="8" />
                <rect x="44" y="68" width="28" height="8" />
              </svg>
            </div>

            <div class="flex-1 space-y-1.5">
              <div class="font-mono text-[10px] text-amber-300 font-bold">MERCHANT: rentgo-test (QRIS)</div>
              <div class="text-sm font-extrabold text-white">Total Tagihan: Rp 1.260.000</div>
              <div class="font-mono text-[10px] text-slate-400">Kode: RG-20261120-7741 • Status: UNPAID</div>
              <div class="pt-1">
                <span class="inline-block rounded-lg bg-teal-500 px-3 py-1.5 font-mono text-xs font-black text-slate-950 shadow-lg ring-2 ring-teal-300">
                  ✓ Sudah Bayar (Simulasi QRIS)
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 6: Status Menunggu Konfirmasi Admin -->
        <div v-else-if="currentStep === 6" class="grid grid-cols-12 gap-4 h-full items-center">
          <div class="col-span-5 space-y-2">
            <span class="rounded bg-teal-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-teal-300">
              LANGKAH 6 • STATE MACHINE TRANSITION
            </span>
            <h3 class="text-lg font-extrabold text-white">Menunggu Konfirmasi Admin</h3>
            <p class="text-xs text-slate-300">
              Pembayaran otomatis tercatat <code class="text-teal-300">paid</code> dan pesanan masuk antrean verifikasi Admin.
            </p>
          </div>
          <div class="col-span-7 rounded-xl border border-amber-400/50 bg-slate-900/95 p-4 space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
              <span class="font-mono text-xs font-bold text-white">Pesanan #RG-20261120-7741</span>
              <span class="rounded-full bg-teal-500/20 border border-teal-400 px-2.5 py-0.5 font-mono text-[10px] font-extrabold text-teal-300">
                PEMBAYARAN: LUNAS (PAID)
              </span>
            </div>
            <div class="flex items-center justify-between rounded-lg border border-amber-400/40 bg-amber-950/40 p-3">
              <div>
                <div class="font-mono text-[10px] text-amber-300">STATUS PESANAN SAAT INI</div>
                <div class="text-sm font-extrabold text-white mt-0.5">⏳ Menunggu Konfirmasi Admin</div>
              </div>
              <span class="rounded bg-amber-400 px-2.5 py-1 font-mono text-[10px] font-black text-slate-950">
                PENDING REVIEW
              </span>
            </div>
          </div>
        </div>

        <!-- STEP 7: Admin Konfirmasi -> Siap Diambil -->
        <div v-else class="grid grid-cols-12 gap-4 h-full items-center">
          <div class="col-span-5 space-y-2">
            <span class="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300">
              LANGKAH 7 • PANEL ADMIN (/admin/bookings)
            </span>
            <h3 class="text-lg font-extrabold text-white">Admin Konfirmasi → Siap Diambil!</h3>
            <p class="text-xs text-slate-300">
              Admin mengklik <strong>Konfirmasi</strong> dan status berubah menjadi <code class="text-teal-300">confirmed (Siap Diambil)</code>.
            </p>
          </div>
          <div class="col-span-7 rounded-xl border-2 border-teal-400 bg-slate-900/95 p-3.5 shadow-[0_0_30px_rgba(20,184,166,0.25)] space-y-2.5">
            <div class="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
              <span class="font-bold text-white">Tabel Operasional Admin • RG-20261120-7741</span>
              <span class="font-mono text-[10px] text-teal-300">Toyota Avanza CVT • BK 1829 AAC</span>
            </div>
            <div class="flex items-center justify-between rounded-lg bg-teal-950/60 border border-teal-400/50 p-3">
              <div>
                <div class="font-mono text-[10px] text-teal-300">STATUS AKHIR PESANAN</div>
                <div class="text-base font-black text-white mt-0.5">✅ SIAP DIAMBIL (CONFIRMED)</div>
                <div class="text-[10px] text-slate-300">Lokasi: Bandara Kualanamu (KNO) • 20–22 Nov 2026</div>
              </div>
              <span class="rounded-lg bg-teal-400 px-3 py-1.5 font-mono text-xs font-black text-slate-950 shadow-lg">
                ✓ Terkonfirmasi
              </span>
            </div>
          </div>
        </div>

        <!-- Animated Autonomous Fake Cursor -->
        <div
          class="pointer-events-none absolute z-30 transition-all duration-700 ease-out"
          :style="{ left: activeMeta.cursorX, top: activeMeta.cursorY }"
        >
          <!-- Click Ripple Effect -->
          <span
            v-if="clickPulse"
            class="absolute -left-3 -top-3 h-8 w-8 rounded-full border-2 border-amber-400 opacity-80 animate-ping"
          />
          <!-- Cursor Arrow SVG -->
          <svg viewBox="0 0 24 24" class="h-6 w-6 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
            <path
              d="M4 2l16 10-7 2-3 7L4 2z"
              fill="#FBBF24"
              stroke="#0F172A"
              stroke-width="1.8"
            />
          </svg>
          <span class="ml-3 -mt-1 inline-block rounded bg-amber-400 px-1.5 py-0.5 font-mono text-[9px] font-black text-slate-950 shadow whitespace-nowrap">
            {{ activeMeta.cursorLabel }}
          </span>
        </div>
      </div>

      <!-- Bottom 7-Step Progress Pills -->
      <div class="grid grid-cols-7 gap-1 border-t border-slate-800 bg-slate-900/90 px-2.5 py-1.5">
        <button
          v-for="item in stepsMeta"
          :key="item.step"
          type="button"
          class="rounded px-1.5 py-1 font-mono text-[9px] font-bold transition cursor-pointer truncate"
          :class="
            currentStep === item.step
              ? 'bg-blue-600 text-white shadow'
              : currentStep > item.step
                ? 'bg-teal-950/80 text-teal-300 border border-teal-500/30'
                : 'bg-slate-950 text-slate-400 hover:text-white'
          "
          @click="setStep(item.step)"
        >
          {{ item.short }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes pinDrop {
  0% {
    transform: translateY(-42px) scale(0.8);
    opacity: 0;
  }
  70% {
    transform: translateY(4px) scale(1.05);
    opacity: 1;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}
.flying-pin {
  animation: pinDrop 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
</style>
