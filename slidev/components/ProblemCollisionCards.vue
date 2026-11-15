<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSlideContext } from '@slidev/client'

const { $slidev } = useSlideContext()
const manualStep = ref<number | null>(null)
const collisionShake = ref(true)

const activeCount = computed(() => {
  if ($slidev?.nav?.isPrintMode) return 4
  if (manualStep.value !== null) return manualStep.value
  const clicks = $slidev?.nav?.clicks ?? 0
  return Math.min(4, Math.max(1, clicks + 1))
})

function triggerCollision() {
  collisionShake.value = false
  setTimeout(() => {
    collisionShake.value = true
  }, 40)
}

const problems = [
  {
    id: 1,
    code: 'ERR_OVERLAP',
    title: '1. Double-Booking Plat Sama',
    short: 'Dua pelanggan memesan BK 1124 AAB di tanggal beririsan.',
    badge: 'Bentrok Jadwal',
    color: 'border-red-500/60 bg-red-950/35 text-red-300',
    tilt: '-rotate-1 translate-x-1',
  },
  {
    id: 2,
    code: 'ERR_WORKSHOP',
    title: '2. Jadwal Bengkel Terpisah',
    short: 'Unit sedang servis rem & oli tetap tampil siap sewa.',
    badge: 'Stok Semu',
    color: 'border-amber-500/60 bg-amber-950/35 text-amber-300',
    tilt: 'rotate-1 -translate-x-1',
  },
  {
    id: 3,
    code: 'ERR_PAYMENT',
    title: '3. Tarif & Bukti Bayar Manual',
    short: 'Hitungan hari inklusif & cek resi chat rawan salah hitung.',
    badge: 'Tanpa State Machine',
    color: 'border-blue-500/60 bg-blue-950/35 text-blue-300',
    tilt: 'rotate-1 translate-x-1',
  },
  {
    id: 4,
    code: 'ERR_MISMATCH',
    title: '4. Bingung Pilih Spesifikasi Unit',
    short: 'Wisatawan salah pilih mobil untuk rute tanjakan Berastagi.',
    badge: 'Tanpa Asisten AI',
    color: 'border-teal-500/60 bg-teal-950/35 text-teal-300',
    tilt: '-rotate-1 -translate-x-1',
  },
]
</script>

<template>
  <div class="flex flex-col gap-2 mt-0.5 select-none">
    <!-- Visual Double-Booking Crash Stage -->
    <div
      style="view-transition-name: rentgo-stage"
      class="relative overflow-hidden rounded-xl border border-red-500/40 bg-slate-950/90 px-3.5 py-2 shadow-xl"
    >
      <div class="flex items-center justify-between gap-2">
        <!-- Customer A Ticket -->
        <div
          class="flex-1 rounded-lg border border-blue-500/50 bg-blue-950/50 px-2.5 py-1.5 transition-transform duration-500"
          :class="collisionShake ? 'translate-x-2 -rotate-1' : ''"
        >
          <div class="flex items-center justify-between text-[9px] font-mono text-blue-300">
            <span>BUKU MANUAL #A1</span>
            <span class="rounded bg-blue-500/30 px-1.5 py-0.2 font-bold">20–22 NOV</span>
          </div>
          <div class="mt-0.5 text-xs font-bold text-white">Pelanggan A (Via WhatsApp)</div>
          <div class="text-[10px] text-slate-300">Klaim Unit: <strong class="text-amber-300">BK 1124 AAB</strong></div>
        </div>

        <!-- Center Colliding Car Unit -->
        <div
          style="view-transition-name: rentgo-car-card"
          class="relative z-10 flex flex-col items-center rounded-xl border-2 border-red-500 bg-slate-900 px-3 py-1.5 shadow-[0_0_24px_rgba(239,68,68,0.45)] cursor-pointer"
          role="button"
          tabindex="0"
          aria-label="Simulasikan bentrok jadwal"
          @click="triggerCollision"
          @keydown.enter="triggerCollision"
        >
          <span class="rounded-full bg-red-600 px-2 py-0.2 font-mono text-[8px] font-black uppercase tracking-wider text-white">
            ⚡ BENTROK 2 PESANAN!
          </span>
          <div class="mt-1 flex items-center gap-2">
            <img
              src="/vehicles/Honda-Brio-Satya-RS.jfif"
              alt="Honda Brio Satya RS"
              width="40"
              height="26"
              class="h-6 w-10 rounded object-cover border border-red-400/50"
            />
            <div class="text-left leading-tight">
              <div class="text-[11px] font-extrabold text-white">Honda Brio RS</div>
              <div class="font-mono text-[9px] font-bold text-amber-400">BK 1124 AAB</div>
            </div>
          </div>
        </div>

        <!-- Customer B Ticket -->
        <div
          class="flex-1 rounded-lg border border-amber-500/50 bg-amber-950/50 px-2.5 py-1.5 text-right transition-transform duration-500"
          :class="collisionShake ? '-translate-x-2 rotate-1' : ''"
        >
          <div class="flex items-center justify-between text-[9px] font-mono text-amber-300">
            <span class="rounded bg-amber-500/30 px-1.5 py-0.2 font-bold">20–22 NOV</span>
            <span>SPREADSHEET #B2</span>
          </div>
          <div class="mt-0.5 text-xs font-bold text-white">Pelanggan B (Walk-In KNO)</div>
          <div class="text-[10px] text-slate-300">Klaim Unit: <strong class="text-amber-300">BK 1124 AAB</strong></div>
        </div>
      </div>
    </div>

    <!-- 4 Colliding Problem Cards (One by One via v-click or Step Buttons) -->
    <div class="grid grid-cols-2 gap-2">
      <div
        v-for="item in problems"
        :key="item.id"
        class="rounded-xl border px-3 py-2 transition-all duration-500"
        :class="[
          item.color,
          item.id <= activeCount
            ? `opacity-100 scale-100 ${item.tilt}`
            : 'opacity-15 scale-95 translate-y-2 pointer-events-none',
        ]"
      >
        <div class="flex items-center justify-between">
          <span class="font-mono text-[9px] font-bold tracking-wider uppercase opacity-80">
            {{ item.code }}
          </span>
          <span class="rounded border border-current/30 bg-black/30 px-1.5 py-0.2 font-mono text-[8px] font-bold">
            {{ item.badge }}
          </span>
        </div>
        <h3 class="mt-0.5 text-xs font-extrabold text-white">{{ item.title }}</h3>
        <p class="mt-0.5 text-[11px] text-slate-200 leading-snug">{{ item.short }}</p>
      </div>
    </div>

    <!-- Interactive Step Bar -->
    <div class="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
      <span>Tekan Spasi atau klik nomor untuk memunculkan kendala ({{ activeCount }}/4)</span>
      <div class="flex gap-1">
        <button
          v-for="n in 4"
          :key="n"
          type="button"
          class="rounded border px-2 py-0.2 transition cursor-pointer"
          :class="activeCount >= n ? 'border-red-400 bg-red-950/60 text-white font-bold' : 'border-slate-700 bg-slate-900 text-slate-400'"
          @click="manualStep = n"
        >
          #{{ n }}
        </button>
      </div>
    </div>
  </div>
</template>
