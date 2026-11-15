<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSlideContext } from '@slidev/client'

const { $slidev } = useSlideContext()
const hoveredIdx = ref<number | null>(null)

const activeStep = computed(() => {
  if ($slidev?.nav?.isPrintMode) return 6
  const clicks = $slidev?.nav?.clicks ?? 0
  return Math.min(6, Math.max(1, clicks + 1))
})

const features = [
  {
    id: 1,
    tag: 'ARMADA & BENGKEL',
    title: 'CRUD Armada & Soft-Delete',
    desc: 'Kelola unit, kategori, dan jadwal servis tanpa merusak histori.',
    color: 'border-blue-500/45 bg-blue-950/35',
    iconBg: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
    svgPath: 'M5 17h14v-5l-2-5H7L5 12v5zm2.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm12 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z',
  },
  {
    id: 2,
    tag: 'TRANSAKSI ATOMIK',
    title: 'Booking Anti Double-Booking',
    desc: 'Kunci baris tanggal sewa serentak dan tolak bentrok HTTP 409.',
    color: 'border-teal-500/45 bg-teal-950/35',
    iconBg: 'bg-teal-500/20 text-teal-300 border-teal-400/40',
    svgPath: 'M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 14l-4-4 1.41-1.41L11 13.17l5.59-5.59L18 9l-7 7z',
  },
  {
    id: 3,
    tag: 'PEMBAYARAN INSTAN',
    title: 'QRIS Midtrans Sandbox',
    desc: 'Terbitkan matriks QRIS dinamis per kode pesanan dengan pelunasan instan.',
    color: 'border-amber-500/45 bg-amber-950/35',
    iconBg: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    svgPath: 'M3 3h7v7H3V3zm2 2v3h3V5H5zm9-2h7v7h-7V3zm2 2v3h3V5h-3zM3 14h7v7H3v-7zm2 2v3h3v-3H5zm9-2h3v3h-3v-3zm4 4h3v3h-3v-3zm-4 0h2v3h-2v-3zm4-4h3v2h-3v-2z',
  },
  {
    id: 4,
    tag: 'ASISTEN CERDAS',
    title: 'Rekomendasi AI Gemini',
    desc: 'Saring armada sesuai penumpang dan anggaran dengan limit 10/menit.',
    color: 'border-blue-400/45 bg-indigo-950/35',
    iconBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40',
    svgPath: 'M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z',
  },
  {
    id: 5,
    tag: 'GEOLOKASI MEDAN',
    title: 'Peta Lokasi & Haversine',
    desc: 'Hitung jarak titik jemput Kualanamu, Stasiun, dan Garasi secara akurat.',
    color: 'border-teal-400/45 bg-emerald-950/35',
    iconBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    svgPath: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z',
  },
  {
    id: 6,
    tag: 'OPERASIONAL & RBAC',
    title: 'Dasbor KPI & 1x Login',
    desc: 'Pantau pendapatan lunas, utilisasi armada, dan proteksi peran Admin.',
    color: 'border-amber-400/45 bg-slate-900/75',
    iconBg: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    svgPath: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
  },
]
</script>

<template>
  <div
    style="view-transition-name: rentgo-stage"
    class="grid grid-cols-3 gap-2 mt-0.5 select-none"
  >
    <div
      v-for="(item, idx) in features"
      :key="item.id"
      class="rounded-xl border px-3 py-2 transition-all duration-500 flex flex-col justify-between"
      :class="[
        item.color,
        idx < activeStep
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-25 translate-y-2 scale-95',
        hoveredIdx === idx ? 'ring-2 ring-amber-400/70 -translate-y-0.5' : '',
      ]"
      @mouseenter="hoveredIdx = idx"
      @mouseleave="hoveredIdx = null"
    >
      <div>
        <div class="flex items-center justify-between">
          <!-- Custom SVG Icon Box -->
          <div
            class="flex h-7 w-7 items-center justify-center rounded-lg border"
            :class="item.iconBg"
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4 fill-current" aria-hidden="true">
              <path :d="item.svgPath" />
            </svg>
          </div>
          <span class="font-mono text-[8px] font-bold tracking-wider uppercase text-slate-300">
            {{ item.tag }}
          </span>
        </div>

        <h3 class="mt-1.5 text-xs font-extrabold text-white">
          {{ item.title }}
        </h3>
        <p class="mt-0.5 text-[10px] text-slate-200 leading-snug">
          {{ item.desc }}
        </p>
      </div>

      <div class="mt-1.5 pt-1 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-slate-400">
        <span>FR-0{{ item.id }} Verified</span>
        <span class="text-teal-300 font-bold">● Aktif</span>
      </div>
    </div>
  </div>
</template>
