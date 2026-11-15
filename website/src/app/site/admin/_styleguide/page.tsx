import { notFound } from "next/navigation";
import {
  BookingStatusBadge,
  MaintenanceStatusBadge,
  PaymentStatusBadge,
  VehicleStatusBadge,
} from "@/components/ui/badge";
import { RentGoLogo } from "@/components/shared/logo";
import { formatRupiah } from "@/lib/utils";

export default function StyleguidePage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const tokens = [
    { name: "--navy-900", hex: "HEX 0B1F3A", role: "Judul, Sidebar Admin, Footer" },
    { name: "--primary-600", hex: "HEX 1D4ED8", role: "Tombol Utama, Link, Fokus" },
    { name: "--primary-700", hex: "HEX 1E40AF", role: "Hover Tombol Utama" },
    { name: "--primary-100", hex: "HEX DBEAFE", role: "Latar Badge Confirmed" },
    { name: "--primary-50", hex: "HEX EFF6FF", role: "Latar Section Lembut" },
    { name: "--accent-500", hex: "HEX F59E0B", role: "CTA Aksen & Highlight" },
    { name: "--accent-600", hex: "HEX D97706", role: "Hover Aksen" },
    { name: "--accent-50", hex: "HEX FFFBEB", role: "Latar Peringatan" },
    { name: "--slate-50", hex: "HEX F8FAFC", role: "Latar Halaman" },
    { name: "--slate-200", hex: "HEX E2E8F0", role: "Border & Divider" },
    { name: "--slate-400", hex: "HEX 94A3B8", role: "Elemen Non-Teks Redup" },
    { name: "--slate-600", hex: "HEX 475569", role: "Teks Sekunder" },
    { name: "--slate-900", hex: "HEX 0F172A", role: "Teks Utama" },
    { name: "--success", hex: "HEX 16A34A", role: "Tersedia, Lunas, Completed" },
    { name: "--danger", hex: "HEX DC2626", role: "Ditolak, Error, Hapus" },
    { name: "--info", hex: "HEX 0D9488", role: "Ongoing (Sedang Disewa)" },
  ];

  return (
    <div className="space-y-10 py-4" data-testid="styleguide-view">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
        <div>
          <RentGoLogo subtitle="Design System & Styleguide" variant="light" />
          <h1
            style={{ color: "var(--navy-900)" }}
            className="mt-3 text-2xl font-bold"
          >
            RentGo Design System Tokens &amp; Komponen
          </h1>
          <p style={{ color: "var(--slate-600)" }} className="text-sm">
            Halaman internal pengembangan (`/_styleguide`). Palet warna dikunci sesuai Bagian 4 spesifikasi.
          </p>
        </div>
      </header>

      <section aria-labelledby="palette-heading" className="space-y-4">
        <h2
          id="palette-heading"
          style={{ color: "var(--navy-900)" }}
          className="text-lg font-bold"
        >
          1. Token Warna Terkunci (`src/styles/tokens.css`)
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {tokens.map((t) => (
            <div
              key={t.name}
              style={{
                backgroundColor: "var(--surface-white)",
                borderRadius: "var(--radius-card)",
              }}
              className="border p-4"
            >
              <div
                style={{
                  backgroundColor: `var(${t.name})`,
                  borderRadius: "var(--radius-control)",
                }}
                className="h-14 w-full border"
              />
              <p
                style={{ color: "var(--navy-900)" }}
                className="mt-2 font-mono text-xs font-bold"
              >
                {t.name} ({t.hex})
              </p>
              <p style={{ color: "var(--slate-600)" }} className="text-xs">
                {t.role}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="badges-heading" className="space-y-4">
        <h2
          id="badges-heading"
          style={{ color: "var(--navy-900)" }}
          className="text-lg font-bold"
        >
          2. Badge Status Booking, Pembayaran, Armada, &amp; Perawatan
        </h2>
        <div
          style={{
            backgroundColor: "var(--surface-white)",
            borderRadius: "var(--radius-card)",
          }}
          className="space-y-4 border p-6"
        >
          <div className="flex flex-wrap gap-2">
            <BookingStatusBadge status="pending" paymentStatus="unpaid" />
            <BookingStatusBadge status="pending" paymentStatus="paid" />
            <BookingStatusBadge status="confirmed" paymentStatus="paid" />
            <BookingStatusBadge status="ongoing" paymentStatus="paid" />
            <BookingStatusBadge status="completed" paymentStatus="paid" />
            <BookingStatusBadge status="cancelled" />
            <BookingStatusBadge status="rejected" />
            <BookingStatusBadge status="expired" />
          </div>
          <div className="flex flex-wrap gap-2 border-t pt-4">
            <PaymentStatusBadge status="unpaid" />
            <PaymentStatusBadge status="paid" />
            <PaymentStatusBadge status="refunded" />
            <VehicleStatusBadge status="active" />
            <VehicleStatusBadge status="maintenance" />
            <VehicleStatusBadge status="inactive" />
            <MaintenanceStatusBadge status="scheduled" />
            <MaintenanceStatusBadge status="in_progress" />
            <MaintenanceStatusBadge status="done" />
          </div>
        </div>
      </section>

      <section aria-labelledby="typography-heading" className="space-y-4">
        <h2
          id="typography-heading"
          style={{ color: "var(--navy-900)" }}
          className="text-lg font-bold"
        >
          3. Tipografi (Plus Jakarta Sans) &amp; Format Rupiah
        </h2>
        <div
          style={{
            backgroundColor: "var(--surface-white)",
            borderRadius: "var(--radius-card)",
          }}
          className="space-y-3 border p-6"
        >
          <p
            style={{ color: "var(--navy-900)" }}
            className="text-3xl font-extrabold"
          >
            Heading 1: Sewa Kendaraan Medan Tanpa Jadwal Bentrok
          </p>
          <p style={{ color: "var(--navy-900)" }} className="text-xl font-bold">
            Heading 2: Tarif Harian Mulai {formatRupiah(350000)} / hari
          </p>
          <p style={{ color: "var(--slate-900)" }} className="text-base">
            Body Text: Seluruh kalkulasi harga sewa dihitung di sisi server berdasarkan tanggal ambil dan tanggal kembali inklusif pada zona waktu Asia/Jakarta (WIB).
          </p>
        </div>
      </section>
    </div>
  );
}
