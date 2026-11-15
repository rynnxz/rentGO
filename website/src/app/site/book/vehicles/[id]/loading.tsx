import { LoadingStatusBanner } from "@/components/ui/loading";

export default function VehicleCheckoutLoading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8"
    >
      <LoadingStatusBanner
        title="Memuat spesifikasi unit dan formulir sewa..."
        description="Memeriksa jadwal ketersediaan tanggal, titik jemput GPS Medan, dan kalkulator harga."
        tone="primary"
      />

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <div
            style={{
              backgroundColor: "var(--surface-white)",
              borderRadius: "var(--radius-card)",
              boxShadow: "var(--shadow-card)",
            }}
            className="overflow-hidden border"
          >
            <div
              style={{ backgroundColor: "var(--slate-100)" }}
              className="h-72 w-full animate-pulse border-b"
            />
            <div className="space-y-4 p-6">
              <div
                style={{ backgroundColor: "var(--slate-200)" }}
                className="h-7 w-64 animate-pulse rounded"
              />
              <div
                style={{ backgroundColor: "var(--slate-100)" }}
                className="h-4 w-full animate-pulse rounded"
              />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }, (_, idx) => (
                  <div
                    key={idx}
                    style={{ backgroundColor: "var(--slate-100)" }}
                    className="h-16 animate-pulse rounded-lg"
                  />
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "var(--surface-white)",
              borderRadius: "var(--radius-card)",
              boxShadow: "var(--shadow-card)",
            }}
            className="h-80 animate-pulse border p-6"
          />
        </div>

        <div className="lg:col-span-5">
          <div
            style={{
              backgroundColor: "var(--surface-white)",
              borderRadius: "var(--radius-card)",
              boxShadow: "var(--shadow-elevated)",
            }}
            className="space-y-4 border p-6"
          >
            <div
              style={{ backgroundColor: "var(--slate-200)" }}
              className="h-6 w-48 animate-pulse rounded"
            />
            {Array.from({ length: 5 }, (_, idx) => (
              <div
                key={idx}
                style={{ backgroundColor: "var(--slate-100)" }}
                className="h-12 w-full animate-pulse rounded-lg"
              />
            ))}
            <div
              style={{ backgroundColor: "var(--primary-100)" }}
              className="h-12 w-full animate-pulse rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
