<script setup lang="ts">
defineProps<{
  section: string
  stepLabel?: string
  slideNum?: string
}>()
</script>

<template>
  <header class="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-800/80 select-none">
    <!-- Morphing Brand Mark across all slides -->
    <div
      style="view-transition-name: rentgo-brand"
      class="inline-flex items-center gap-2"
    >
      <span class="inline-flex items-end gap-0.5 py-0.5" aria-hidden="true">
        <span class="h-4 w-1 -skew-x-16 rounded-[1.5px] bg-blue-500" />
        <span class="h-3.5 w-1 -skew-x-16 rounded-[1.5px] bg-teal-400" />
        <span class="h-2.5 w-1 -skew-x-16 rounded-[1.5px] bg-amber-400" />
      </span>
      <div class="flex items-baseline tracking-tighter leading-none">
        <span class="text-sm font-black tracking-tight text-white">RENT</span>
        <span class="text-sm font-black italic tracking-tight text-amber-400">GO</span>
        <span class="text-base font-black text-teal-400 leading-none">.</span>
        <span class="ml-1.5 rounded border border-slate-700 bg-slate-900/90 px-1.5 py-0.5 font-mono text-[8px] font-bold tracking-widest text-slate-300">
          MDN
        </span>
      </div>
    </div>

    <!-- Section Pill & Slide Number -->
    <div class="flex items-center gap-2">
      <span class="rounded-full border border-blue-500/30 bg-blue-950/60 px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase text-blue-300">
        {{ section }}
      </span>
      <span
        v-if="stepLabel"
        class="rounded-full border border-teal-500/30 bg-teal-950/50 px-2 py-0.5 font-mono text-[10px] font-semibold text-teal-300"
      >
        {{ stepLabel }}
      </span>
      <span
        v-if="slideNum"
        class="font-mono text-[10px] font-bold text-slate-500 tabular-nums"
      >
        {{ slideNum }}
      </span>
    </div>
  </header>
</template>
