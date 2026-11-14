import React from "react";
import Link from "next/link";
import { CalendarCheck2, Eye } from "lucide-react";
import { listBookings } from "@/lib/repository";
import { getCurrentSessionUser } from "@/lib/session";
import { formatDateId, formatRupiah } from "@/lib/utils";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/ui/badge";
import { AuthControls } from "@/components/shared/auth-controls";

export const dynamic = "force-dynamic";

export default async function CustomerBookingsListPage() {
  const user = await getCurrentSessionUser();

  if (!user) {
    return (
      <div
        style={{
          backgroundColor: "var(--surface-white)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-card)",
        }}
        className="mx-auto max-w-lg space-y-4 border p-8 text-center"
        data-testid="my-bookings-login-gate"
      >
        <h1
          style={{ color: "var(--navy-900)" }}
          className="text-xl font-bold"
        >
          Masuk untuk Melihat Pesanan Saya
        </h1>
        <p style={{ color: "var(--slate-600)" }} className="text-sm">
          Riwayat pemesanan kendaraan, status verifikasi pembayaran, dan bukti sewa disimpan sesuai akun Google Anda.
        </p>
        <div className="flex justify-center pt-2">
          <AuthControls user={null} variant="light" />
        </div>
      </div>
    );
  }

  const bookings = await listBookings({ userId: user.id });

  return (
    <div className="space-y-6" data-testid="my-bookings-view">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1
            style={{ color: "var(--navy-900)" }}
            className="text-2xl font-bold sm:text-3xl"
          >
            Pesanan Saya ({bookings.length})
          </h1>
          <p style={{ color: "var(--slate-600)" }} className="mt-1 text-sm">
            Pantau status verifikasi pesanan, unggah bukti pembayaran, atau batalkan pesanan yang masih berstatus Menunggu.
          </p>
        </div>
        <Link
          href="/"
          style={{
            backgroundColor: "var(--primary-600)",
            color: "var(--surface-white)",
            borderRadius: "var(--radius-control)",
          }}
          className="inline-flex min-h-[44px] items-center gap-2 px-4 py-2 text-xs font-semibold sm:text-sm"
        >
          <CalendarCheck2 className="h-4 w-4" aria-hidden="true" />
          <span>Sewa Kendaraan Lain</span>
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div
          style={{
            backgroundColor: "var(--surface-white)",
            borderRadius: "var(--radius-card)",
          }}
          className="border p-10 text-center"
          data-testid="empty-my-bookings"
        >
          <p
            style={{ color: "var(--navy-900)" }}
            className="text-base font-bold"
          >
            Anda Belum Memiliki Pesanan
          </p>
          <p style={{ color: "var(--slate-600)" }} className="mt-1 text-xs">
            Pilih unit kendaraan di katalog armada untuk membuat pesanan sewa pertama Anda.
          </p>
          <Link
            href="/"
            style={{
              backgroundColor: "var(--primary-600)",
              color: "var(--surface-white)",
              borderRadius: "var(--radius-control)",
            }}
            className="mt-4 inline-flex min-h-[44px] items-center px-4 py-2 text-xs font-semibold"
          >
            Jelajahi Katalog Armada
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((b) => (
            <article
              key={b.id}
              data-testid={`my-booking-card-${b.booking_code}`}
              style={{
                backgroundColor: "var(--surface-white)",
                borderRadius: "var(--radius-card)",
                boxShadow: "var(--shadow-card)",
              }}
              className="flex flex-col justify-between gap-4 border p-5 sm:flex-row sm:items-center"
            >
              <div className="flex items-start gap-4">
                <img
                  src={b.vehicle_image || "/vehicles/mpv.svg"}
                  alt={`${b.vehicle_brand} ${b.vehicle_model}`}
                  width={96}
                  height={64}
                  className="hidden h-16 w-24 rounded border object-contain p-1 sm:block"
                />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      style={{ color: "var(--navy-900)" }}
                      className="font-mono text-sm font-extrabold"
                    >
                      {b.booking_code}
                    </span>
                    <BookingStatusBadge status={b.status} />
                    {b.payment ? (
                      <PaymentStatusBadge status={b.payment.status} />
                    ) : null}
                  </div>
                  <h2
                    style={{ color: "var(--navy-900)" }}
                    className="text-base font-bold"
                  >
                    {b.vehicle_brand} {b.vehicle_model}{" "}
                    <span
                      style={{ color: "var(--slate-600)" }}
                      className="font-mono text-xs font-normal"
                    >
                      ({b.vehicle_plate})
                    </span>
                  </h2>
                  <p
                    style={{ color: "var(--slate-600)" }}
                    className="text-xs tabular-nums"
                  >
                    Periode: {formatDateId(b.start_date)} s/d{" "}
                    {formatDateId(b.end_date)} ({b.total_days} hari) - Ambil di{" "}
                    {b.pickup_location}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3 sm:border-t-0 sm:pt-0">
                <div className="text-left sm:text-right tabular-nums">
                  <p style={{ color: "var(--slate-600)" }} className="text-xs">
                    Total Tagihan
                  </p>
                  <p
                    style={{ color: "var(--navy-900)" }}
                    className="text-lg font-extrabold"
                  >
                    {formatRupiah(b.total_price)}
                  </p>
                </div>

                <Link
                  href={`/bookings/${b.id}`}
                  data-testid={`open-booking-detail-${b.booking_code}`}
                  style={{
                    backgroundColor: "var(--primary-600)",
                    color: "var(--surface-white)",
                    borderRadius: "var(--radius-control)",
                  }}
                  className="inline-flex min-h-[44px] items-center gap-1.5 px-4 py-2 text-xs font-semibold"
                >
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Detail & Pembayaran</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
