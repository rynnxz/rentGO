import {
  CatalogCardSkeleton,
  LoadingStatusBanner,
} from "@/components/ui/loading";

export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="space-y-6">
        <LoadingStatusBanner
          title="Memuat halaman dan ketersediaan armada RentGo Medan..."
          description="Menghubungkan ke server operasional Sumatera Utara dan memeriksa jadwal sewa."
          tone="primary"
        />
        <CatalogCardSkeleton count={3} />
      </div>
    </main>
  );
}
