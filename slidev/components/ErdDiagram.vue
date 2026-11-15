<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSlideContext } from '@slidev/client'

const { $slidev } = useSlideContext()
const manualPhase = ref<number | null>(null)

const activePhase = computed(() => {
  if ($slidev?.nav?.isPrintMode) return 3
  if (manualPhase.value !== null) return manualPhase.value
  const clicks = $slidev?.nav?.clicks ?? 0
  return Math.min(3, Math.max(1, clicks + 1))
})

const relationsSummary = [
  { id: 'cat-veh', label: 'categories → vehicles', rule: '1:N • RESTRICT' },
  { id: 'veh-book', label: 'vehicles → bookings', rule: '1:N • GiST Lock' },
  { id: 'usr-book', label: 'users → bookings', rule: '1:N • FK user_id' },
  { id: 'book-pay', label: 'bookings → payments', rule: '1:1 • UNIQUE' },
  { id: 'veh-maint', label: 'vehicles → maintenance', rule: '1:N • Blokir Tgl' },
  { id: 'usr-ai', label: 'users → ai_logs', rule: '1:N • 10/menit' },
]
</script>

<template>
  <div class="flex flex-col gap-1.5 mt-0.5 select-none">
    <!-- Top Legend & Phase Controls -->
    <div class="flex items-center justify-between text-[10px] font-mono">
      <div class="flex items-center gap-3 text-slate-300">
        <span class="inline-flex items-center gap-1.5">
          <span class="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3B82F6]" />
          <span>Grup 1: Master &amp; Identitas</span>
        </span>
        <span class="inline-flex items-center gap-1.5">
          <span class="h-2.5 w-2.5 rounded-full bg-teal-400 shadow-[0_0_8px_#14B8A6]" />
          <span>Grup 2: Transaksi Inti &amp; QRIS</span>
        </span>
        <span class="inline-flex items-center gap-1.5">
          <span class="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
          <span>Grup 3: Bengkel &amp; Audit AI</span>
        </span>
      </div>

      <div class="flex items-center gap-1">
        <button
          v-for="p in 3"
          :key="p"
          type="button"
          class="rounded border px-2 py-0.5 cursor-pointer transition"
          :class="
            activePhase >= p
              ? 'border-teal-400 bg-teal-950/80 text-teal-200 font-bold'
              : 'border-slate-700 bg-slate-900 text-slate-400'
          "
          @click="manualPhase = p"
        >
          Tahap {{ p }}
        </button>
      </div>
    </div>

    <!-- Exact Coordinate ERD Board (916 x 316) -->
    <div class="relative w-[916px] h-[316px] rounded-xl border border-slate-700/90 bg-[#050B16] overflow-hidden shadow-2xl">
      <!-- Subtle Blueprint Grid Background -->
      <div
        class="pointer-events-none absolute inset-0 opacity-15"
        style="background-image: radial-gradient(#334155 1px, transparent 1px); background-size: 16px 16px;"
      />

      <!-- LAYER 1: Precision SVG Connectors & Port Dots (Zero SVG <text> so Slidev CSS never enlarges fonts) -->
      <svg
        viewBox="0 0 916 316"
        class="pointer-events-none absolute inset-0 z-20 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#60A5FA" />
          </marker>
          <marker id="arrow-teal" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#2DD4BF" />
          </marker>
          <marker id="arrow-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#FBBF24" />
          </marker>
        </defs>

        <!-- PHASE 1: vehicle_categories (1) -> (N) vehicles: (260, 50) -> (331, 50) -->
        <g v-if="activePhase >= 1">
          <line x1="260" y1="50" x2="331" y2="50" stroke="#1E3A8A" stroke-width="3" />
          <line
            x1="260"
            y1="50"
            x2="331"
            y2="50"
            stroke="#60A5FA"
            stroke-width="2.2"
            stroke-dasharray="5 4"
            marker-end="url(#arrow-blue)"
            class="erd-line"
          />
          <circle cx="260" cy="50" r="4" fill="#60A5FA" stroke="#050B16" stroke-width="1.5" />
        </g>

        <!-- PHASE 2: Transactional Core (vehicles->bookings, users->bookings, bookings->payments) -->
        <g v-if="activePhase >= 2">
          <!-- 2A. vehicles (1) -> (N) bookings: (582, 50) -> (650, 50) -->
          <line x1="582" y1="50" x2="650" y2="50" stroke="#115E59" stroke-width="3" />
          <line
            x1="582"
            y1="50"
            x2="650"
            y2="50"
            stroke="#2DD4BF"
            stroke-width="2.4"
            stroke-dasharray="5 4"
            marker-end="url(#arrow-teal)"
            class="erd-line"
          />
          <circle cx="582" cy="50" r="4" fill="#2DD4BF" stroke="#050B16" stroke-width="1.5" />

          <!-- 2B. users (1) -> (N) bookings across open middle corridor: (260, 150) -> (650, 150) -->
          <line x1="260" y1="150" x2="650" y2="150" stroke="#115E59" stroke-width="3" />
          <line
            x1="260"
            y1="150"
            x2="650"
            y2="150"
            stroke="#2DD4BF"
            stroke-width="2.2"
            stroke-dasharray="6 4"
            marker-end="url(#arrow-teal)"
            class="erd-line"
          />
          <circle cx="260" cy="150" r="4" fill="#2DD4BF" stroke="#050B16" stroke-width="1.5" />

          <!-- 2C. bookings (1) -> (1) payments vertical: (778, 174) -> (778, 211) -->
          <line x1="778" y1="174" x2="778" y2="211" stroke="#0F766E" stroke-width="3" />
          <line
            x1="778"
            y1="174"
            x2="778"
            y2="211"
            stroke="#2DD4BF"
            stroke-width="2.4"
            stroke-dasharray="4 3"
            marker-end="url(#arrow-teal)"
            class="erd-line"
          />
          <circle cx="778" cy="174" r="4" fill="#2DD4BF" stroke="#050B16" stroke-width="1.5" />
        </g>

        <!-- PHASE 3: Operational & Audit (vehicles->maintenance_logs, users->ai_logs) -->
        <g v-if="activePhase >= 3">
          <!-- 3A. vehicles (1) -> (N) maintenance_logs vertical with schematic bridge hop at y=150 -->
          <path
            d="M 458 108 L 458 142 A 8 8 0 0 1 458 158 L 458 211"
            stroke="#78350F"
            stroke-width="3"
            fill="none"
          />
          <path
            d="M 458 108 L 458 142 A 8 8 0 0 1 458 158 L 458 211"
            stroke="#FBBF24"
            stroke-width="2.2"
            stroke-dasharray="5 4"
            fill="none"
            marker-end="url(#arrow-amber)"
            class="erd-line"
          />
          <circle cx="458" cy="108" r="4" fill="#FBBF24" stroke="#050B16" stroke-width="1.5" />

          <!-- 3B. users (1) -> (N) ai_recommendation_logs vertical: (137, 194) -> (137, 224) -->
          <line x1="137" y1="194" x2="137" y2="224" stroke="#78350F" stroke-width="3" />
          <line
            x1="137"
            y1="194"
            x2="137"
            y2="224"
            stroke="#FBBF24"
            stroke-width="2.2"
            stroke-dasharray="4 3"
            marker-end="url(#arrow-amber)"
            class="erd-line"
          />
          <circle cx="137" cy="194" r="4" fill="#FBBF24" stroke="#050B16" stroke-width="1.5" />
        </g>
      </svg>

      <!-- LAYER 2: Crisp HTML Cardinality Badges on Connectors (Immune to SVG font scaling) -->
      <!-- Badge 1: categories -> vehicles -->
      <div
        v-if="activePhase >= 1"
        style="left: 277px; top: 30px;"
        class="pointer-events-none absolute z-30 rounded border border-blue-500 bg-slate-950 px-1.5 py-0.5 font-mono text-[8.5px] font-extrabold leading-none text-blue-300 shadow"
      >
        1 : N
      </div>

      <!-- Badge 2A: vehicles -> bookings -->
      <div
        v-if="activePhase >= 2"
        style="left: 598px; top: 30px;"
        class="pointer-events-none absolute z-30 rounded border border-teal-400 bg-teal-950 px-1.5 py-0.5 font-mono text-[8.5px] font-extrabold leading-none text-teal-200 shadow"
      >
        1 : N
      </div>

      <!-- Badge 2B: users -> bookings (corridor) -->
      <div
        v-if="activePhase >= 2"
        style="left: 338px; top: 131px;"
        class="pointer-events-none absolute z-30 rounded border border-teal-400 bg-teal-950 px-2 py-0.5 font-mono text-[8.5px] font-extrabold leading-none text-teal-200 shadow"
      >
        1 : N • FK user_id
      </div>

      <!-- Badge 2C: bookings -> payments -->
      <div
        v-if="activePhase >= 2"
        style="left: 788px; top: 186px;"
        class="pointer-events-none absolute z-30 rounded border border-teal-400 bg-teal-950 px-1.5 py-0.5 font-mono text-[8.5px] font-extrabold leading-none text-teal-200 shadow"
      >
        1 : 1 UNIQUE
      </div>

      <!-- Badge 3A: vehicles -> maintenance_logs -->
      <div
        v-if="activePhase >= 3"
        style="left: 468px; top: 175px;"
        class="pointer-events-none absolute z-30 rounded border border-amber-400 bg-amber-950 px-2 py-0.5 font-mono text-[8.5px] font-extrabold leading-none text-amber-200 shadow"
      >
        1 : N • FK vehicle_id
      </div>

      <!-- Badge 3B: users -> ai_recommendation_logs -->
      <div
        v-if="activePhase >= 3"
        style="left: 147px; top: 202px;"
        class="pointer-events-none absolute z-30 rounded border border-amber-400 bg-amber-950 px-2 py-0.5 font-mono text-[8.5px] font-extrabold leading-none text-amber-200 shadow"
      >
        1 : N • FK user_id
      </div>

      <!-- LAYER 3: 7 Relational Table Cards at Exact Coordinates -->

      <!-- [COL 1 - TOP] Table 2: vehicle_categories (x:14..260, y:10..92) -->
      <div
        style="left: 14px; top: 10px; width: 246px; height: 82px;"
        class="absolute z-10 rounded-lg border border-blue-500/70 bg-slate-900/95 px-2.5 py-1.5 shadow-lg transition-all duration-300"
        :class="activePhase >= 1 ? 'opacity-100' : 'opacity-25'"
      >
        <div class="flex items-center justify-between border-b border-slate-800 pb-0.5">
          <span class="font-mono text-[10.5px] font-extrabold text-blue-300">2. vehicle_categories</span>
          <span class="rounded bg-blue-500/20 px-1.5 font-mono text-[8px] font-bold text-blue-300">MASTER KATEGORI</span>
        </div>
        <div class="mt-1 space-y-0.5 font-mono text-[9px] text-slate-300">
          <div class="flex justify-between">
            <span><b class="text-amber-400">PK</b> id (uuid)</span>
            <span class="text-blue-300">──► vehicles (1:N)</span>
          </div>
          <div class="flex justify-between">
            <span><b class="text-teal-300">UK</b> name (text)</span>
            <span><b class="text-teal-300">UK</b> slug (text)</span>
          </div>
          <div class="flex justify-between text-slate-400">
            <span>description</span>
            <span class="text-rose-300">ON DELETE RESTRICT</span>
          </div>
        </div>
      </div>

      <!-- [COL 1 - MID] Table 1: users (x:14..260, y:108..194) -->
      <div
        style="left: 14px; top: 108px; width: 246px; height: 86px;"
        class="absolute z-10 rounded-lg border border-blue-500/70 bg-slate-900/95 px-2.5 py-1.5 shadow-lg transition-all duration-300"
        :class="activePhase >= 1 ? 'opacity-100' : 'opacity-25'"
      >
        <div class="flex items-center justify-between border-b border-slate-800 pb-0.5">
          <span class="font-mono text-[10.5px] font-extrabold text-blue-300">1. users</span>
          <span class="rounded bg-blue-500/20 px-1.5 font-mono text-[8px] font-bold text-blue-300">FIREBASE UID</span>
        </div>
        <div class="mt-1 space-y-0.5 font-mono text-[9px] text-slate-300">
          <div class="flex justify-between">
            <span><b class="text-amber-400">PK</b> id (uuid)</span>
            <span class="text-teal-300">──► bookings (1:N)</span>
          </div>
          <div class="flex justify-between">
            <span><b class="text-teal-300">UK</b> firebase_uid</span>
            <span><b class="text-teal-300">UK</b> email (text)</span>
          </div>
          <div class="flex justify-between">
            <span>role (customer|admin)</span>
            <span>driver_license_no</span>
          </div>
        </div>
      </div>

      <!-- [COL 1 - BOT] Table 7: ai_recommendation_logs (x:14..260, y:227..308) -->
      <div
        style="left: 14px; top: 227px; width: 246px; height: 81px;"
        class="absolute z-10 rounded-lg border border-amber-500/70 bg-slate-900/95 px-2.5 py-1.5 shadow-lg transition-all duration-300"
        :class="activePhase >= 3 ? 'opacity-100' : 'opacity-25'"
      >
        <div class="flex items-center justify-between border-b border-slate-800 pb-0.5">
          <span class="font-mono text-[10.5px] font-extrabold text-amber-300">7. ai_recommendation_logs</span>
          <span class="rounded bg-amber-500/20 px-1.5 font-mono text-[8px] font-bold text-amber-300">LIMIT 10/MNT</span>
        </div>
        <div class="mt-1 space-y-0.5 font-mono text-[9px] text-slate-300">
          <div class="flex justify-between">
            <span><b class="text-amber-400">PK</b> id (uuid)</span>
            <span><b class="text-blue-300">FK</b> user_id ◄── users</span>
          </div>
          <div class="flex justify-between">
            <span>query_text (text)</span>
            <span>model (gemini-flash)</span>
          </div>
          <div class="flex justify-between text-slate-400">
            <span>latency_ms (int)</span>
            <span>created_at (timestamptz)</span>
          </div>
        </div>
      </div>

      <!-- [COL 2 - TOP] Table 3: vehicles (x:334..582, y:10..108) -->
      <div
        style="left: 334px; top: 10px; width: 248px; height: 98px;"
        class="absolute z-10 rounded-lg border-2 border-blue-400/80 bg-slate-900/95 px-2.5 py-1.5 shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all duration-300"
        :class="activePhase >= 1 ? 'opacity-100' : 'opacity-25'"
      >
        <div class="flex items-center justify-between border-b border-slate-800 pb-0.5">
          <span class="font-mono text-[10.5px] font-extrabold text-white">3. vehicles</span>
          <span class="rounded bg-teal-500/20 px-1.5 font-mono text-[8px] font-bold text-teal-300">SOFT-DELETE</span>
        </div>
        <div class="mt-1 space-y-0.5 font-mono text-[9px] text-slate-300">
          <div class="flex justify-between">
            <span><b class="text-amber-400">PK</b> id (uuid)</span>
            <span class="text-teal-300">──► bookings (1:N)</span>
          </div>
          <div class="flex justify-between">
            <span><b class="text-blue-300">◄ FK</b> category_id</span>
            <span><b class="text-teal-300">UK</b> plate_number (BK)</span>
          </div>
          <div class="flex justify-between">
            <span>daily_price (numeric)</span>
            <span>seats • transmission</span>
          </div>
          <div class="flex justify-between">
            <span>status (active|maint)</span>
            <span class="text-amber-300">deleted_at (tz)</span>
          </div>
        </div>
      </div>

      <!-- [COL 2 - BOT] Table 6: maintenance_logs (x:334..582, y:214..308) -->
      <div
        style="left: 334px; top: 214px; width: 248px; height: 94px;"
        class="absolute z-10 rounded-lg border border-amber-500/70 bg-slate-900/95 px-2.5 py-1.5 shadow-lg transition-all duration-300"
        :class="activePhase >= 3 ? 'opacity-100' : 'opacity-25'"
      >
        <div class="flex items-center justify-between border-b border-slate-800 pb-0.5">
          <span class="font-mono text-[10.5px] font-extrabold text-amber-300">6. maintenance_logs</span>
          <span class="rounded bg-amber-500/20 px-1.5 font-mono text-[8px] font-bold text-amber-300">BLOKIR TANGGAL</span>
        </div>
        <div class="mt-1 space-y-0.5 font-mono text-[9px] text-slate-300">
          <div class="flex justify-between">
            <span><b class="text-amber-400">PK</b> id (uuid)</span>
            <span><b class="text-blue-300">FK</b> vehicle_id ◄──</span>
          </div>
          <div class="flex justify-between">
            <span>start_date (date)</span>
            <span>end_date (date)</span>
          </div>
          <div class="flex justify-between">
            <span>status (in_progress)</span>
            <span>cost (numeric)</span>
          </div>
          <div class="flex justify-between text-slate-400">
            <span>title (Servis Rem/Oli)</span>
            <span class="text-amber-300">ON DELETE CASCADE</span>
          </div>
        </div>
      </div>

      <!-- [COL 3 - TOP] Table 4: bookings (x:653..902, y:10..174) -->
      <div
        style="left: 653px; top: 10px; width: 249px; height: 164px;"
        class="absolute z-10 rounded-lg border-2 border-teal-400/90 bg-slate-900/95 px-2.5 py-1.5 shadow-[0_0_24px_rgba(20,184,166,0.25)] transition-all duration-300"
        :class="activePhase >= 2 ? 'opacity-100' : 'opacity-25'"
      >
        <div class="flex items-center justify-between border-b border-slate-800 pb-0.5">
          <span class="font-mono text-[10.5px] font-extrabold text-teal-300">4. bookings</span>
          <span class="rounded bg-teal-500/30 px-1.5 font-mono text-[8px] font-bold text-white">GIST EXCLUDE LOCK</span>
        </div>
        <div class="mt-1 space-y-1 font-mono text-[9px] text-slate-300">
          <div class="flex justify-between">
            <span><b class="text-amber-400">PK</b> id (uuid)</span>
            <span><b class="text-teal-300">UK</b> booking_code</span>
          </div>
          <div class="flex justify-between rounded bg-teal-950/60 px-1.5 py-0.5 border border-teal-500/30">
            <span><b class="text-teal-300">◄ FK</b> vehicle_id</span>
            <span class="text-slate-400">ref: vehicles.id</span>
          </div>
          <div class="flex justify-between">
            <span>start_date (date)</span>
            <span>end_date (date)</span>
          </div>
          <div class="flex justify-between">
            <span>total_days (gen)</span>
            <span>total_price (numeric)</span>
          </div>
          <div class="flex justify-between">
            <span class="text-teal-300">status (7 states)</span>
            <span>expires_at (+24h)</span>
          </div>
          <div class="flex justify-between rounded bg-blue-950/60 px-1.5 py-0.5 border border-blue-500/30">
            <span><b class="text-blue-300">◄ FK</b> user_id</span>
            <span class="text-slate-400">ref: users.id</span>
          </div>
        </div>
      </div>

      <!-- [COL 3 - BOT] Table 5: payments (x:653..902, y:214..308) -->
      <div
        style="left: 653px; top: 214px; width: 249px; height: 94px;"
        class="absolute z-10 rounded-lg border border-teal-500/80 bg-slate-900/95 px-2.5 py-1.5 shadow-lg transition-all duration-300"
        :class="activePhase >= 2 ? 'opacity-100' : 'opacity-25'"
      >
        <div class="flex items-center justify-between border-b border-slate-800 pb-0.5">
          <span class="font-mono text-[10.5px] font-extrabold text-teal-300">5. payments</span>
          <span class="rounded bg-amber-500/20 px-1.5 font-mono text-[8px] font-bold text-amber-300">1 : 1 UNIQUE</span>
        </div>
        <div class="mt-1 space-y-0.5 font-mono text-[9px] text-slate-300">
          <div class="flex justify-between">
            <span><b class="text-amber-400">PK</b> id (uuid)</span>
            <span><b class="text-teal-300">FK_UK</b> booking_id ◄──</span>
          </div>
          <div class="flex justify-between">
            <span>amount (numeric)</span>
            <span class="text-amber-300">method (qris)</span>
          </div>
          <div class="flex justify-between">
            <span>status (unpaid|paid)</span>
            <span>paid_at (timestamptz)</span>
          </div>
          <div class="flex justify-between text-slate-400">
            <span>proof_url (storage)</span>
            <span class="text-teal-300">ON DELETE CASCADE</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom 6-Relationship Matrix Pill Bar -->
    <div class="grid grid-cols-6 gap-1.5 font-mono text-[8.5px]">
      <div
        v-for="rel in relationsSummary"
        :key="rel.id"
        class="rounded-md border border-slate-800 bg-slate-900/90 px-1.5 py-1 text-center"
      >
        <div class="font-bold text-teal-300">{{ rel.label }}</div>
        <div class="text-[8px] text-slate-400">{{ rel.rule }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes erdFlow {
  to {
    stroke-dashoffset: -18;
  }
}
.erd-line {
  animation: erdFlow 0.9s linear infinite;
}
</style>
