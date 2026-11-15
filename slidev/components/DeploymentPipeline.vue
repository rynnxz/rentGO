<script setup lang="ts">
const cloudNodes = [
  {
    name: 'Supabase Cloud',
    project: 'honhszsloegvpbmczkqf',
    role: 'PostgreSQL 7 Tabel + RPC Lock + Storage',
    plan: 'Free Tier • Rp 0',
    color: 'border-teal-500/60 bg-teal-950/40 text-teal-300',
  },
  {
    name: 'Firebase Auth-Only',
    project: 'rentgo-medan',
    role: 'Google OAuth & Email/Pass (1x Login)',
    plan: 'Spark Plan • Rp 0',
    color: 'border-amber-500/60 bg-amber-950/40 text-amber-300',
  },
  {
    name: 'Midtrans & Gemini AI',
    project: 'rentgo-test + flash',
    role: 'QRIS Dinamis Sandbox & AI Limit 10/Mnt',
    plan: 'Sandbox/Free • Rp 0',
    color: 'border-blue-500/60 bg-blue-950/40 text-blue-300',
  },
]
</script>

<template>
  <div class="flex flex-col gap-3 mt-1 select-none">
    <!-- Main Pipeline Visual -->
    <div class="relative rounded-2xl border border-slate-700/80 bg-slate-950/90 p-4 shadow-2xl">
      <div class="grid grid-cols-12 gap-3 items-center relative z-10">
        <!-- Source: GitHub -->
        <div class="col-span-3 rounded-xl border border-slate-600 bg-slate-900 p-3.5 text-center shadow-lg">
          <span class="rounded bg-slate-800 px-2 py-0.5 font-mono text-[9px] font-bold text-slate-300">
            SOURCE CONTROL
          </span>
          <div class="mt-2 text-base font-black text-white">GitHub Repo</div>
          <div class="font-mono text-[10px] text-teal-300 mt-0.5">rynnxz/rentGO</div>
          <div class="mt-2 rounded bg-slate-950 px-2 py-1 font-mono text-[9px] text-slate-400">
            git push origin main
          </div>
        </div>

        <!-- Animated Arrow 1 -->
        <div class="col-span-1 flex flex-col items-center">
          <svg viewBox="0 0 60 24" class="w-full h-6">
            <line x1="2" y1="12" x2="52" y2="12" stroke="#3B82F6" stroke-width="3" stroke-dasharray="5 4" class="deploy-flow" />
            <polygon points="50,6 60,12 50,18" fill="#3B82F6" />
          </svg>
          <span class="font-mono text-[8px] text-blue-300">CI/CD</span>
        </div>

        <!-- Compute Hub: Vercel -->
        <div class="col-span-3 rounded-xl border-2 border-blue-500 bg-blue-950/45 p-3.5 text-center shadow-[0_0_28px_rgba(59,130,246,0.28)]">
          <span class="rounded bg-blue-600 px-2 py-0.5 font-mono text-[9px] font-black text-white">
            HOBBY PLAN • RP 0
          </span>
          <div class="mt-2 text-base font-black text-white">▲ Vercel Cloud</div>
          <div class="font-mono text-[10px] text-blue-200 mt-0.5">rentgo.my.id</div>
          <div class="mt-2 rounded bg-slate-950/90 px-2 py-1 font-mono text-[9px] text-teal-300">
            Next.js 15 Edge + Cron
          </div>
        </div>

        <!-- Animated Arrow 2 -->
        <div class="col-span-1 flex flex-col items-center">
          <svg viewBox="0 0 60 24" class="w-full h-6">
            <line x1="2" y1="12" x2="52" y2="12" stroke="#14B8A6" stroke-width="3" stroke-dasharray="5 4" class="deploy-flow" />
            <polygon points="50,6 60,12 50,18" fill="#14B8A6" />
          </svg>
          <span class="font-mono text-[8px] text-teal-300">HTTPS</span>
        </div>

        <!-- Managed Cloud Services Stack -->
        <div class="col-span-4 space-y-2">
          <div
            v-for="node in cloudNodes"
            :key="node.name"
            class="rounded-xl border px-3 py-2 flex items-center justify-between"
            :class="node.color"
          >
            <div>
              <div class="text-xs font-extrabold text-white">{{ node.name }}</div>
              <div class="font-mono text-[9px] text-slate-300">{{ node.role }}</div>
            </div>
            <span class="rounded bg-black/50 px-2 py-0.5 font-mono text-[9px] font-bold text-white shrink-0">
              {{ node.plan }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Cost & Reliability Summary Bar -->
    <div class="keynote-glass px-4 py-2.5 flex items-center justify-between text-xs">
      <div class="flex items-center gap-2.5">
        <span class="rounded bg-teal-400 px-2.5 py-0.5 font-mono text-[10px] font-black text-slate-950">
          TOTAL BIAYA CLOUD: RP 0 / BULAN
        </span>
        <span class="text-slate-200">
          Seluruh layanan berjalan di tier gratis resmi dengan fallback lokal otomatis (<code class="text-amber-300">Dual-Mode Repository</code>).
        </span>
      </div>
      <span class="font-mono text-[10px] font-bold text-teal-300">100% Serverless Ready</span>
    </div>
  </div>
</template>

<style scoped>
@keyframes deployDash {
  to {
    stroke-dashoffset: -18;
  }
}
.deploy-flow {
  animation: deployDash 0.9s linear infinite;
}
</style>
