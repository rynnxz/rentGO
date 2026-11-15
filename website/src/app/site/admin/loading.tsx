import {
  LoadingStatusBanner,
  TableRowsSkeleton,
} from "@/components/ui/loading";

export default function AdminLoading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="space-y-6"
    >
      <LoadingStatusBanner
        title="Memuat data operasional panel Admin RentGo..."
        description="Mengambil metrik armada, transaksi sewa, jadwal servis, dan laporan terbaru dari database."
        tone="primary"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: "var(--surface-white)",
              borderRadius: "var(--radius-card)",
              boxShadow: "var(--shadow-card)",
            }}
            className="space-y-2 border p-5"
          >
            <div
              style={{ backgroundColor: "var(--slate-100)" }}
              className="h-3.5 w-28 animate-pulse rounded"
            />
            <div
              style={{ backgroundColor: "var(--slate-200)" }}
              className="h-7 w-36 animate-pulse rounded"
            />
          </div>
        ))}
      </div>

      <TableRowsSkeleton rows={6} columns={6} />
    </div>
  );
}
