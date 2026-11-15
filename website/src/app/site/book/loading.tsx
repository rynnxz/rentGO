import {
  CatalogCardSkeleton,
  LoadingBar,
  LoadingStatusBanner,
} from "@/components/ui/loading";

export default function BookCatalogLoading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8"
    >
      <div
        style={{
          backgroundColor: "var(--navy-900)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-elevated)",
        }}
        className="overflow-hidden border border-slate-800"
      >
        <LoadingBar
          tone="accent"
          height="4px"
          label="Memuat katalog armada dan ketersediaan tanggal sewa"
        />
        <div className="space-y-4 p-6 sm:p-8">
          <div className="h-7 w-72 animate-pulse rounded bg-slate-800" />
          <div className="h-4 w-96 max-w-full animate-pulse rounded bg-slate-800/80" />
          <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }, (_, idx) => (
              <div
                key={idx}
                className="h-12 animate-pulse rounded-lg bg-slate-800/90"
              />
            ))}
          </div>
        </div>
      </div>

      <LoadingStatusBanner
        title="Menyinkronkan katalog armada dan kalender sewa real-time..."
        description="Mengambil data unit aktif, tarif harian, serta memfilter jadwal yang sedang dipesan."
        tone="primary"
      />

      <div
        style={{
          backgroundColor: "var(--secondary-50)",
          borderColor: "var(--secondary-600)",
          borderRadius: "var(--radius-card)",
        }}
        className="h-32 animate-pulse border p-6"
      />

      <CatalogCardSkeleton count={6} />
    </div>
  );
}
