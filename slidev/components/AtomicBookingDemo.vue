<script setup lang="ts">
import { ref } from 'vue'

const raceState = ref<'ready' | 'locking' | 'resolved'>('resolved')

function replayRace() {
  raceState.value = 'ready'
  setTimeout(() => {
    raceState.value = 'locking'
  }, 350)
  setTimeout(() => {
    raceState.value = 'resolved'
  }, 1100)
}
</script>

<template>
  <div class="rounded-xl border border-slate-700/80 bg-slate-950/90 p-3 shadow-xl select-none">
    <div class="flex items-center justify-between border-b border-slate-800 pb-2">
      <div
        style="view-transition-name: rentgo-car-card"
        class="flex items-center gap-2"
      >
        <img
          src="/vehicles/Honda-Brio-Satya-RS.jfif"
          alt="Honda Brio Satya RS"
          width="40"
          height="26"
          class="h-6 w-10 rounded object-cover border border-slate-700"
        />
        <span class="text-xs font-extrabold text-white">Target Unit: BK 1124 AAB</span>
        <span class="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[9px] text-amber-300">20–22 Nov 2026</span>
      </div>

      <button
        type="button"
        class="rounded-md border border-teal-500/40 bg-teal-950/60 px-2.5 py-0.5 font-mono text-[10px] font-bold text-teal-300 hover:bg-teal-900/70 transition cursor-pointer"
        @click="replayRace"
      >
        ↻ Simulasikan Race Condition
      </button>
    </div>

    <!-- Dual Customer Transaction Race -->
    <div class="mt-2.5 space-y-2">
      <!-- Request A (Wins Lock) -->
      <div class="flex items-center justify-between gap-2 rounded-lg border border-teal-500/50 bg-teal-950/30 px-3 py-2">
        <div class="flex items-center gap-2">
          <span class="rounded bg-teal-500 px-1.5 py-0.5 font-mono text-[9px] font-black text-slate-950">T+0ms</span>
          <div>
            <div class="text-xs font-bold text-white">Pelanggan A (Raka)</div>
            <div class="font-mono text-[9px] text-teal-300">SELECT ... FOR UPDATE (Row Locked 🔒)</div>
          </div>
        </div>
        <span
          class="rounded-md px-2 py-0.5 font-mono text-[10px] font-black transition-all duration-300"
          :class="raceState === 'resolved' ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-300'"
        >
          {{ raceState === 'resolved' ? '✓ 201 CREATED' : 'LOCKING...' }}
        </span>
      </div>

      <!-- Request B (Blocked & Rejected 409) -->
      <div class="flex items-center justify-between gap-2 rounded-lg border border-red-500/50 bg-red-950/30 px-3 py-2">
        <div class="flex items-center gap-2">
          <span class="rounded bg-red-500 px-1.5 py-0.5 font-mono text-[9px] font-black text-white">T+4ms</span>
          <div>
            <div class="text-xs font-bold text-white">Pelanggan B (Sinta)</div>
            <div class="font-mono text-[9px] text-red-300">Menunggu Lock → Terdeteksi Irisan Tanggal</div>
          </div>
        </div>
        <span
          class="rounded-md px-2 py-0.5 font-mono text-[10px] font-black transition-all duration-300"
          :class="raceState === 'resolved' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-slate-800 text-slate-300'"
        >
          {{ raceState === 'resolved' ? '✕ 409 CONFLICT' : 'WAITING LOCK...' }}
        </span>
      </div>
    </div>

    <div class="mt-2 flex items-center justify-between font-mono text-[9px] text-slate-400">
      <span>Rumus WIB: existing.start &lt;= req.end AND existing.end &gt;= req.start</span>
      <span class="text-amber-300 font-bold">PostgreSQL GiST Constraint</span>
    </div>
  </div>
</template>
