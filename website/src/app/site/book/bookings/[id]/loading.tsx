import { LoadingStatusBanner } from "@/components/ui/loading";

export default function BookingDetailLoading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8"
    >
      <LoadingStatusBanner
        title="Memuat detail kontrak sewa dan status pembayaran QRIS..."
        description="Memeriksa verifikasi pembayaran Midtrans Sandbox, lokasi serah-terima, dan rincian biaya."
        tone="secondary"
      />

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <div
            style={{
              backgroundColor: "var(--surface-white)",
              borderRadius: "var(--radius-card)",
              boxShadow: "var(--shadow-card)",
            }}
            className="space-y-4 border p-6"
          >
            <div
              style={{ backgroundColor: "var(--slate-200)" }}
              className="h-6 w-56 animate-pulse rounded"
            />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }, (_, idx) => (
                <div
                  key={idx}
                  style={{ backgroundColor: "var(--slate-100)" }}
                  className="h-16 animate-pulse rounded-lg"
                />
              ))}
            </div>
            <div
              style={{ backgroundColor: "var(--slate-100)" }}
              className="h-24 w-full animate-pulse rounded-lg"
            />
          </div>
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
              style={{ backgroundColor: "var(--secondary-100)" }}
              className="h-6 w-48 animate-pulse rounded"
            />
            <div
              style={{ backgroundColor: "var(--slate-100)" }}
              className="mx-auto h-52 w-52 animate-pulse rounded-xl"
            />
            <div
              style={{ backgroundColor: "var(--secondary-100)" }}
              className="h-11 w-full animate-pulse rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
