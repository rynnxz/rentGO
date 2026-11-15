import Link from "next/link";
import { RentGoLogo } from "@/components/shared/logo";

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center px-4 py-16 text-center">
      <div
        style={{
          backgroundColor: "var(--surface-white)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-subtle)",
        }}
        className="w-full max-w-lg border p-8"
      >
        <div className="mb-4 flex justify-center">
          <RentGoLogo subtitle="Medan" />
        </div>
        <h1
          style={{ color: "var(--navy-900)" }}
          className="text-2xl font-bold tracking-tight"
        >
          Halaman Tidak Ditemukan (404)
        </h1>
        <p style={{ color: "var(--slate-600)" }} className="mt-2 text-sm">
          Alamat yang Anda tuju tidak tersedia atau akses langsung ke rute internal ditolak oleh sistem keamanan RentGo.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            style={{
              backgroundColor: "var(--primary-600)",
              color: "var(--on-dark-fg)",
              borderRadius: "var(--radius-control)",
            }}
            className="inline-flex min-h-[44px] items-center px-5 py-2.5 text-sm font-semibold"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
