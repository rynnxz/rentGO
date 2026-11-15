import { LoadingStatusBanner } from "@/components/ui/loading";

export default function MyBookingsLoading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8"
    >
      <LoadingStatusBanner
        title="Memuat daftar pesanan dan riwayat sewa Anda..."
        description="Mengambil status pembayaran QRIS, jadwal aktif, dan kode booking terbaru dari server."
        tone="primary"
      />

      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: "var(--surface-white)",
              borderRadius: "var(--radius-card)",
              boxShadow: "var(--shadow-card)",
            }}
            className="flex flex-col justify-between gap-4 border p-5 sm:flex-row sm:items-center"
          >
            <div className="space-y-2.5">
              <div
                style={{ backgroundColor: "var(--slate-200)" }}
                className="h-5 w-52 animate-pulse rounded"
              />
              <div
                style={{ backgroundColor: "var(--slate-100)" }}
                className="h-4 w-72 animate-pulse rounded"
              />
              <div
                style={{ backgroundColor: "var(--slate-100)" }}
                className="h-4 w-40 animate-pulse rounded"
              />
            </div>
            <div className="flex items-center gap-3">
              <div
                style={{ backgroundColor: "var(--slate-200)" }}
                className="h-7 w-28 animate-pulse rounded"
              />
              <div
                style={{ backgroundColor: "var(--primary-100)" }}
                className="h-10 w-36 animate-pulse rounded-lg"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
