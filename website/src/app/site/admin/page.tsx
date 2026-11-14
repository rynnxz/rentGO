import React from "react";
import Link from "next/link";
import {
  getAdminDashboardStats,
  listBookings,
  listMaintenanceLogs,
  listVehicles,
} from "@/lib/repository";
import { isDateRangeOverlapping } from "@/lib/availability";
import {
  addDaysIso,
  formatDateId,
  formatRupiah,
  getTodayWib,
} from "@/lib/utils";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const todayWib = getTodayWib();
  const stats = await getAdminDashboardStats(todayWib);
  const vehicles = await listVehicles();
  const bookings = await listBookings();
  const maintenanceLogs = await listMaintenanceLogs();

  const timelineDates = Array.from({ length: 7 }, (_, i) =>
    addDaysIso(todayWib, i),
  );

  const maxMonthlyRevenue = Math.max(
    1,
    ...stats.revenueByMonth.map((m) => m.revenue),
  );

  return (
    <div className="space-y-8" data-testid="admin-dashboard-view">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span
            style={{
              backgroundColor: "var(--primary-50)",
              color: "var(--primary-700)",
              borderRadius: "var(--radius-badge)",
            }}
            className="inline-block px-2.5 py-1 text-xs font-semibold"
          >
            Tanggal Operasional WIB: {formatDateId(todayWib)}
          </span>
          <h1
            style={{ color: "var(--navy-900)" }}
            className="mt-2 text-2xl font-bold sm:text-3xl"
          >
            Dasbor Operasional RentGo Medan
          </h1>
          <p style={{ color: "var(--slate-600)" }} className="mt-1 text-sm">
            Ringkasan real-time ketersediaan unit, status pesanan, jadwal servis, dan arus kas pembayaran.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/vehicles"
            style={{
              backgroundColor: "var(--primary-600)",
              color: "var(--surface-white)",
              borderRadius: "var(--radius-control)",
            }}
            className="inline-flex min-h-[44px] items-center px-4 py-2 text-xs font-semibold sm:text-sm"
          >
            + Kelola Unit Armada
          </Link>
          <Link
            href="/bookings"
            style={{
              backgroundColor: "var(--surface-white)",
              color: "var(--navy-900)",
              borderRadius: "var(--radius-control)",
            }}
            className="inline-flex min-h-[44px] items-center border px-4 py-2 text-xs font-semibold sm:text-sm"
          >
            Verifikasi Pesanan ({stats.pendingBookingsCount})
          </Link>
        </div>
      </div>

      {/* 6 KPI Cards */}
      <section aria-label="Indikator Kinerja Utama" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          style={{
            backgroundColor: "var(--surface-white)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-card)",
          }}
          className="border p-5"
        >
          <p style={{ color: "var(--slate-600)" }} className="text-xs font-semibold uppercase">
            Total Armada Aktif
          </p>
          <p
            style={{ color: "var(--navy-900)" }}
            className="mt-2 text-3xl font-extrabold tabular-nums"
            data-testid="kpi-total-fleet"
          >
            {stats.totalFleet} <span className="text-base font-semibold">Unit</span>
          </p>
          <p style={{ color: "var(--slate-600)" }} className="mt-1 text-xs">
            Seluruh mobil dan motor terdaftar di garasi Medan
          </p>
        </div>

        <div
          style={{
            backgroundColor: "var(--surface-white)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-card)",
          }}
          className="border p-5"
        >
          <p style={{ color: "var(--slate-600)" }} className="text-xs font-semibold uppercase">
            Tersedia Hari Ini
          </p>
          <p
            style={{ color: "var(--success-text)" }}
            className="mt-2 text-3xl font-extrabold tabular-nums"
            data-testid="kpi-available-today"
          >
            {stats.availableToday} <span className="text-base font-semibold">Unit</span>
          </p>
          <p style={{ color: "var(--slate-600)" }} className="mt-1 text-xs">
            Siap disewa hari ini ({todayWib}) tanpa bentrok jadwal
          </p>
        </div>

        <div
          style={{
            backgroundColor: "var(--surface-white)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-card)",
          }}
          className="border p-5"
        >
          <p style={{ color: "var(--slate-600)" }} className="text-xs font-semibold uppercase">
            Dalam Perawatan / Servis
          </p>
          <p
            style={{ color: "var(--warning-text)" }}
            className="mt-2 text-3xl font-extrabold tabular-nums"
            data-testid="kpi-maintenance"
          >
            {stats.inMaintenanceCount} <span className="text-base font-semibold">Unit</span>
          </p>
          <p style={{ color: "var(--slate-600)" }} className="mt-1 text-xs">
            Otomatis dikunci dari katalog pencarian pelanggan
          </p>
        </div>

        <div
          style={{
            backgroundColor: "var(--surface-white)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-card)",
          }}
          className="border p-5"
        >
          <p style={{ color: "var(--slate-600)" }} className="text-xs font-semibold uppercase">
            Booking Aktif (Confirmed & Ongoing)
          </p>
          <p
            style={{ color: "var(--primary-600)" }}
            className="mt-2 text-3xl font-extrabold tabular-nums"
            data-testid="kpi-active-bookings"
          >
            {stats.activeBookingsCount} <span className="text-base font-semibold">Pesanan</span>
          </p>
          <p style={{ color: "var(--slate-600)" }} className="mt-1 text-xs">
            Unit sedang terjadwal keluar atau sedang digunakan penyewa
          </p>
        </div>

        <div
          style={{
            backgroundColor: "var(--surface-white)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-card)",
          }}
          className="border p-5"
        >
          <p style={{ color: "var(--slate-600)" }} className="text-xs font-semibold uppercase">
            Menunggu Verifikasi (Pending)
          </p>
          <p
            style={{ color: "var(--accent-600)" }}
            className="mt-2 text-3xl font-extrabold tabular-nums"
            data-testid="kpi-pending-bookings"
          >
            {stats.pendingBookingsCount} <span className="text-base font-semibold">Pesanan</span>
          </p>
          <p style={{ color: "var(--slate-600)" }} className="mt-1 text-xs">
            Batas waktu pembayaran otomatis 24 jam sejak checkout
          </p>
        </div>

        <div
          style={{
            backgroundColor: "var(--surface-white)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-card)",
          }}
          className="border p-5"
        >
          <p style={{ color: "var(--slate-600)" }} className="text-xs font-semibold uppercase">
            Pendapatan Lunas Bulan Ini
          </p>
          <p
            style={{ color: "var(--navy-900)" }}
            className="mt-2 text-2xl font-extrabold tabular-nums sm:text-3xl"
            data-testid="kpi-monthly-revenue"
          >
            {formatRupiah(stats.monthlyRevenue)}
          </p>
          <p style={{ color: "var(--slate-600)" }} className="mt-1 text-xs">
            Akumulasi pembayaran berstatus Lunas pada bulan berjalan
          </p>
        </div>
      </section>

      {/* Revenue 6-Month Bar Chart + Top 5 Vehicles */}
      <div className="grid gap-6 lg:grid-cols-12">
        <section
          aria-labelledby="chart-revenue-heading"
          style={{
            backgroundColor: "var(--surface-white)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-card)",
          }}
          className="border p-6 lg:col-span-7"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2
                id="chart-revenue-heading"
                style={{ color: "var(--navy-900)" }}
                className="text-lg font-bold"
              >
                Grafik Pendapatan Sewa 6 Bulan Terakhir
              </h2>
              <p style={{ color: "var(--slate-600)" }} className="text-xs">
                Berdasarkan pembayaran terverifikasi (Status: Lunas)
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-6 items-end gap-3 pt-4" style={{ minHeight: "210px" }}>
            {stats.revenueByMonth.map((item) => {
              const ratio = Math.max(
                0.08,
                Math.min(1, item.revenue / maxMonthlyRevenue),
              );
              const barHeightPx = Math.round(ratio * 140);
              return (
                <div
                  key={item.month}
                  className="flex flex-col items-center justify-end gap-2 text-center"
                >
                  <span
                    style={{ color: "var(--slate-600)" }}
                    className="text-[11px] font-semibold tabular-nums"
                  >
                    {item.revenue > 0
                      ? `${Math.round(item.revenue / 1000)}rb`
                      : "Rp 0"}
                  </span>
                  <div
                    style={{
                      height: `${barHeightPx}px`,
                      backgroundColor:
                        item.revenue > 0
                          ? "var(--primary-600)"
                          : "var(--slate-200)",
                      borderRadius: "var(--radius-badge)",
                    }}
                    className="w-full max-w-[48px] transition-all"
                    title={`${item.month}: ${formatRupiah(item.revenue)}`}
                  />
                  <span
                    style={{ color: "var(--navy-900)" }}
                    className="text-xs font-semibold"
                  >
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section
          aria-labelledby="top-vehicles-heading"
          style={{
            backgroundColor: "var(--surface-white)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-card)",
          }}
          className="border p-6 lg:col-span-5"
        >
          <h2
            id="top-vehicles-heading"
            style={{ color: "var(--navy-900)" }}
            className="text-lg font-bold"
          >
            Top 5 Unit Kendaraan Terlaris
          </h2>
          <p style={{ color: "var(--slate-600)" }} className="text-xs">
            Peringkat berdasarkan frekuensi pesanan aktif dan selesai
          </p>

          <div className="mt-4 divide-y">
            {stats.topVehicles.map((v, idx) => (
              <div
                key={v.id}
                className="flex items-center justify-between gap-3 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span
                    style={{
                      backgroundColor:
                        idx === 0 ? "var(--accent-500)" : "var(--primary-50)",
                      color:
                        idx === 0 ? "var(--navy-900)" : "var(--primary-700)",
                      borderRadius: "var(--radius-badge)",
                    }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center text-xs font-bold tabular-nums"
                  >
                    #{idx + 1}
                  </span>
                  <div>
                    <p
                      style={{ color: "var(--navy-900)" }}
                      className="font-semibold"
                    >
                      {v.name}
                    </p>
                    <p
                      style={{ color: "var(--slate-600)" }}
                      className="font-mono text-xs"
                    >
                      {v.plate_number}
                    </p>
                  </div>
                </div>
                <div className="text-right tabular-nums">
                  <p
                    style={{ color: "var(--navy-900)" }}
                    className="font-bold"
                  >
                    {v.bookings_count}x Sewa
                  </p>
                  <p
                    style={{ color: "var(--slate-600)" }}
                    className="text-xs"
                  >
                    {formatRupiah(v.total_revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 7-Day Operational Availability Matrix */}
      <section
        aria-labelledby="availability-matrix-heading"
        style={{
          backgroundColor: "var(--surface-white)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-card)",
        }}
        className="border p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2
              id="availability-matrix-heading"
              style={{ color: "var(--navy-900)" }}
              className="text-lg font-bold"
            >
              Kalender Ketersediaan Armada (7 Hari ke Depan)
            </h2>
            <p style={{ color: "var(--slate-600)" }} className="text-xs">
              Matriks ketersediaan harian setiap unit kendaraan berdasarkan jadwal booking dan perawatan.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5">
              <span
                style={{ backgroundColor: "var(--success-bg)", borderColor: "var(--success)" }}
                className="inline-block h-3 w-3 rounded border"
              />
              Tersedia
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                style={{ backgroundColor: "var(--info-bg)", borderColor: "var(--info)" }}
                className="inline-block h-3 w-3 rounded border"
              />
              Terpesan
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                style={{ backgroundColor: "var(--warning-bg)", borderColor: "var(--warning)" }}
                className="inline-block h-3 w-3 rounded border"
              />
              Perawatan
            </span>
          </div>
        </div>

        <div
          className="mt-4 overflow-x-auto border"
          style={{ borderRadius: "var(--radius-control)" }}
          role="region"
          aria-labelledby="availability-matrix-heading"
          tabIndex={0}
        >
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr
                style={{
                  backgroundColor: "var(--slate-100)",
                  color: "var(--slate-600)",
                }}
                className="border-b uppercase"
              >
                <th
                  style={{ backgroundColor: "var(--slate-100)" }}
                  className="sticky left-0 z-10 px-3 py-2.5 font-semibold"
                >
                  Unit Armada
                </th>
                {timelineDates.map((d) => (
                  <th key={d} className="px-3 py-2.5 text-center font-semibold tabular-nums">
                    {formatDateId(d)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {vehicles.slice(0, 8).map((v) => (
                <tr key={v.id}>
                  <th
                    scope="row"
                    style={{
                      backgroundColor: "var(--surface-white)",
                      color: "var(--navy-900)",
                    }}
                    className="sticky left-0 z-10 whitespace-nowrap px-3 py-2.5 font-semibold"
                  >
                    {v.brand} {v.model}{" "}
                    <span
                      style={{ color: "var(--slate-600)" }}
                      className="block font-mono text-[11px] font-normal"
                    >
                      {v.plate_number}
                    </span>
                  </th>
                  {timelineDates.map((day) => {
                    const hasMaint =
                      v.status === "maintenance" ||
                      maintenanceLogs.some(
                        (m) =>
                          m.vehicle_id === v.id &&
                          (m.status === "scheduled" || m.status === "in_progress") &&
                          isDateRangeOverlapping(m.start_date, m.end_date, day, day),
                      );
                    const hasBook = bookings.some(
                      (b) =>
                        b.vehicle_id === v.id &&
                        (b.status === "pending" ||
                          b.status === "confirmed" ||
                          b.status === "ongoing") &&
                        isDateRangeOverlapping(b.start_date, b.end_date, day, day),
                    );

                    const cellBg = hasMaint
                      ? "var(--warning-bg)"
                      : hasBook
                        ? "var(--info-bg)"
                        : "var(--success-bg)";
                    const cellColor = hasMaint
                      ? "var(--warning-text)"
                      : hasBook
                        ? "var(--info-text)"
                        : "var(--success-text)";
                    const cellLabel = hasMaint
                      ? "Servis"
                      : hasBook
                        ? "Dipesan"
                        : "Tersedia";

                    return (
                      <td key={day} className="px-2 py-2 text-center">
                        <span
                          style={{
                            backgroundColor: cellBg,
                            color: cellColor,
                            borderRadius: "var(--radius-badge)",
                          }}
                          className="inline-block w-full px-2 py-1 text-[11px] font-semibold"
                        >
                          {cellLabel}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Bookings Table */}
      <section
        aria-labelledby="recent-bookings-heading"
        style={{
          backgroundColor: "var(--surface-white)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-card)",
        }}
        className="border p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2
              id="recent-bookings-heading"
              style={{ color: "var(--navy-900)" }}
              className="text-lg font-bold"
            >
              Transaksi Penyewaan Terbaru
            </h2>
            <p style={{ color: "var(--slate-600)" }} className="text-xs">
              Daftar pesanan terakhir beserta status pembayaran dan periode sewa
            </p>
          </div>
          <Link
            href="/bookings"
            style={{ color: "var(--primary-600)" }}
            className="inline-flex min-h-[44px] items-center text-xs font-semibold underline"
          >
            Lihat Semua Pesanan
          </Link>
        </div>

        <div
          className="mt-4 overflow-x-auto border"
          style={{ borderRadius: "var(--radius-control)" }}
          role="region"
          aria-labelledby="recent-bookings-heading"
          tabIndex={0}
        >
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr
                style={{
                  backgroundColor: "var(--slate-100)",
                  color: "var(--slate-600)",
                }}
                className="border-b text-xs uppercase"
              >
                <th
                  style={{ backgroundColor: "var(--slate-100)" }}
                  className="sticky left-0 z-10 px-4 py-3 font-semibold"
                >
                  Kode Booking
                </th>
                <th className="px-4 py-3 font-semibold">Pelanggan</th>
                <th className="px-4 py-3 font-semibold">Unit Kendaraan</th>
                <th className="px-4 py-3 font-semibold">Periode Sewa</th>
                <th className="px-4 py-3 text-right font-semibold">Total Tagihan</th>
                <th className="px-4 py-3 font-semibold">Status Booking</th>
                <th className="px-4 py-3 font-semibold">Pembayaran</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stats.recentBookings.map((b) => (
                <tr key={b.id}>
                  <th
                    scope="row"
                    style={{
                      backgroundColor: "var(--surface-white)",
                      color: "var(--navy-900)",
                    }}
                    className="sticky left-0 z-10 whitespace-nowrap px-4 py-3 font-mono text-xs font-bold"
                  >
                    {b.booking_code}
                  </th>
                  <td className="px-4 py-3">
                    <p style={{ color: "var(--navy-900)" }} className="font-semibold">
                      {b.user_name}
                    </p>
                    <p style={{ color: "var(--slate-600)" }} className="text-xs">
                      {b.user_email}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p style={{ color: "var(--navy-900)" }} className="font-semibold">
                      {b.vehicle_brand} {b.vehicle_model}
                    </p>
                    <p
                      style={{ color: "var(--slate-600)" }}
                      className="font-mono text-xs"
                    >
                      {b.vehicle_plate}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs tabular-nums">
                    {formatDateId(b.start_date)} - {formatDateId(b.end_date)} (
                    {b.total_days} hari)
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums">
                    {formatRupiah(b.total_price)}
                  </td>
                  <td className="px-4 py-3">
                    <BookingStatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-3">
                    {b.payment ? (
                      <PaymentStatusBadge status={b.payment.status} />
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
