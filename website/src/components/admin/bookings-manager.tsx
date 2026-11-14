"use client";

import React, { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Download, Eye, Search } from "lucide-react";
import { formatDateId, formatRupiah } from "@/lib/utils";
import { getAllowedNextStatuses } from "@/lib/booking-state";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/ui/badge";
import type {
  BookingDetailView,
  BookingStatus,
  PaymentStatus,
} from "@/lib/types";

const STATUS_ACTION_LABELS: Record<BookingStatus, string> = {
  pending: "Menunggu",
  confirmed: "Konfirmasi",
  ongoing: "Mulai Sewa (Ongoing)",
  completed: "Selesaikan Sewa",
  cancelled: "Batalkan",
  rejected: "Tolak",
  expired: "Kedaluwarsa",
};

export function BookingsManager({
  initialBookings,
}: {
  initialBookings: BookingDetailView[];
}) {
  const router = useRouter();
  const detailDialogRef = useRef<HTMLDialogElement | null>(null);
  const [bookings, setBookings] = useState(initialBookings);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<BookingDetailView | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay =
          `${b.booking_code} ${b.user_name} ${b.user_email} ${b.vehicle_brand} ${b.vehicle_model} ${b.vehicle_plate}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [bookings, statusFilter, search]);

  function openDetail(b: BookingDetailView) {
    setSelected(b);
    setAdminNotes(b.admin_notes ?? "");
    setErrorMsg(null);
    detailDialogRef.current?.showModal();
  }

  async function handleStatusTransition(
    booking: BookingDetailView,
    nextStatus: BookingStatus,
    notesOverride?: string,
  ) {
    setLoading(true);
    setErrorMsg(null);
    setFeedback(null);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          admin_notes: notesOverride ?? booking.admin_notes ?? null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal memperbarui status booking.");
      }
      setBookings((prev) =>
        prev.map((item) => (item.id === booking.id ? json.data : item)),
      );
      if (selected?.id === booking.id) {
        setSelected(json.data);
      }
      setFeedback(
        `Status pesanan ${booking.booking_code} berhasil diubah menjadi "${STATUS_ACTION_LABELS[nextStatus]}".`,
      );
      router.refresh();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal memperbarui status.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handlePaymentVerification(
    booking: BookingDetailView,
    paymentStatus: PaymentStatus,
  ) {
    setLoading(true);
    setErrorMsg(null);
    setFeedback(null);
    try {
      const res = await fetch(`/api/payments/${booking.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status: paymentStatus,
          note:
            paymentStatus === "paid"
              ? "Diverifikasi lunas oleh Admin RentGo"
              : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal memperbarui status pembayaran.");
      }
      setBookings((prev) =>
        prev.map((item) => (item.id === booking.id ? json.data : item)),
      );
      if (selected?.id === booking.id) {
        setSelected(json.data);
      }
      setFeedback(
        `Status pembayaran pesanan ${booking.booking_code} diperbarui menjadi "${paymentStatus.toUpperCase()}".`,
      );
      router.refresh();
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Gagal memperbarui status pembayaran.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6" data-testid="admin-bookings-view">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            style={{ color: "var(--navy-900)" }}
            className="text-2xl font-bold sm:text-3xl"
          >
            Manajemen Pesanan & Verifikasi Pembayaran
          </h1>
          <p style={{ color: "var(--slate-600)" }} className="mt-1 text-sm">
            Proses transisi status sewa (Pending, Dikonfirmasi, Berjalan, Selesai) dan verifikasi bukti pembayaran pelanggan.
          </p>
        </div>
        <a
          href="/api/bookings?format=csv"
          download
          data-testid="export-bookings-csv"
          style={{
            backgroundColor: "var(--surface-white)",
            color: "var(--navy-900)",
            borderRadius: "var(--radius-control)",
          }}
          className="inline-flex min-h-[44px] items-center gap-2 border px-4 py-2 text-sm font-semibold"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          <span>Ekspor Laporan CSV</span>
        </a>
      </div>

      {feedback ? (
        <div
          role="status"
          data-testid="booking-feedback-banner"
          style={{
            backgroundColor: "var(--success-bg)",
            color: "var(--success-text)",
            borderColor: "var(--success)",
            borderRadius: "var(--radius-control)",
          }}
          className="border p-3 text-xs font-semibold"
        >
          {feedback}
        </div>
      ) : null}

      {errorMsg ? (
        <div
          role="alert"
          style={{
            backgroundColor: "var(--danger-bg)",
            color: "var(--danger-text)",
            borderColor: "var(--danger)",
            borderRadius: "var(--radius-control)",
          }}
          className="border p-3 text-xs font-semibold"
        >
          {errorMsg}
        </div>
      ) : null}

      {/* Filter Bar */}
      <div
        style={{
          backgroundColor: "var(--surface-white)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-card)",
        }}
        className="grid gap-3 border p-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div className="relative lg:col-span-2">
          <label htmlFor="booking-search" className="block text-xs font-semibold">
            Cari Kode Booking, Nama Penyewa, atau Plat Nomor
          </label>
          <Search
            style={{ color: "var(--slate-400)" }}
            className="pointer-events-none absolute left-3 top-9 h-4 w-4"
            aria-hidden="true"
          />
          <input
            id="booking-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="RGO-20261115..., Nadia Siregar, BK 1201..."
            style={{ borderRadius: "var(--radius-control)" }}
            className="mt-1 min-h-[44px] w-full border pl-9 pr-3 py-2 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="booking-status-filter"
            className="block text-xs font-semibold"
          >
            Filter Status Booking
          </label>
          <select
            id="booking-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ borderRadius: "var(--radius-control)" }}
            className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu (Pending)</option>
            <option value="confirmed">Dikonfirmasi (Confirmed)</option>
            <option value="ongoing">Sedang Disewa (Ongoing)</option>
            <option value="completed">Selesai (Completed)</option>
            <option value="cancelled">Dibatalkan (Cancelled)</option>
            <option value="rejected">Ditolak (Rejected)</option>
            <option value="expired">Kedaluwarsa (Expired)</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div
        style={{
          backgroundColor: "var(--surface-white)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-card)",
        }}
        className="overflow-hidden border"
      >
        <div
          className="overflow-x-auto"
          role="region"
          aria-label="Tabel Pesanan Sewa Kendaraan"
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
                <th className="px-4 py-3 font-semibold">Penyewa</th>
                <th className="px-4 py-3 font-semibold">Kendaraan</th>
                <th className="px-4 py-3 font-semibold">Tanggal & Lokasi</th>
                <th className="px-4 py-3 text-right font-semibold">Total Tagihan</th>
                <th className="px-4 py-3 font-semibold">Status & Pembayaran</th>
                <th className="px-4 py-3 text-right font-semibold">
                  Transisi Status / Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{ color: "var(--slate-600)" }}
                    className="px-4 py-8 text-center text-sm"
                  >
                    Tidak ada transaksi pesanan yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => {
                  const allowedNext = getAllowedNextStatuses(
                    b.status,
                    "admin",
                  );
                  return (
                    <tr
                      key={b.id}
                      data-testid={`booking-row-${b.booking_code}`}
                    >
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
                        <p
                          style={{ color: "var(--navy-900)" }}
                          className="font-semibold"
                        >
                          {b.user_name}
                        </p>
                        <p
                          style={{ color: "var(--slate-600)" }}
                          className="text-xs"
                        >
                          {b.user_phone || b.user_email}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p
                          style={{ color: "var(--navy-900)" }}
                          className="font-semibold"
                        >
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
                        <p className="font-semibold">
                          {formatDateId(b.start_date)} -{" "}
                          {formatDateId(b.end_date)} ({b.total_days} hari)
                        </p>
                        <p style={{ color: "var(--slate-600)" }}>
                          Ambil: {b.pickup_location}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-bold tabular-nums">
                        {formatRupiah(b.total_price)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex flex-col items-start gap-1.5">
                          <BookingStatusBadge status={b.status} />
                          {b.payment ? (
                            <PaymentStatusBadge status={b.payment.status} />
                          ) : null}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          {b.payment && b.payment.status !== "paid" ? (
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() =>
                                handlePaymentVerification(b, "paid")
                              }
                              data-testid={`verify-paid-${b.booking_code}`}
                              style={{
                                backgroundColor: "var(--success-bg)",
                                color: "var(--success-text)",
                                borderColor: "var(--success)",
                                borderRadius: "var(--radius-control)",
                              }}
                              className="inline-flex min-h-[44px] items-center gap-1 border px-2.5 py-1.5 text-xs font-semibold"
                            >
                              <CheckCircle2
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                              />
                              <span>Set Lunas</span>
                            </button>
                          ) : null}

                          {allowedNext.map((nextItem) => {
                            const isPrimary =
                              nextItem.status === "confirmed" ||
                              nextItem.status === "ongoing" ||
                              nextItem.status === "completed";
                            return (
                              <button
                                key={nextItem.status}
                                type="button"
                                disabled={loading}
                                onClick={() =>
                                  handleStatusTransition(b, nextItem.status)
                                }
                                data-testid={`transition-${b.booking_code}-${nextItem.status}`}
                                style={{
                                  backgroundColor: isPrimary
                                    ? "var(--primary-600)"
                                    : "var(--danger-bg)",
                                  color: isPrimary
                                    ? "var(--surface-white)"
                                    : "var(--danger-text)",
                                  borderRadius: "var(--radius-control)",
                                }}
                                className="inline-flex min-h-[44px] items-center px-3 py-1.5 text-xs font-semibold"
                              >
                                {STATUS_ACTION_LABELS[nextItem.status]}
                              </button>
                            );
                          })}

                          <button
                            type="button"
                            onClick={() => openDetail(b)}
                            style={{
                              backgroundColor: "var(--slate-100)",
                              color: "var(--slate-900)",
                              borderRadius: "var(--radius-control)",
                            }}
                            className="inline-flex min-h-[44px] items-center gap-1 px-2.5 py-1.5 text-xs font-semibold"
                          >
                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Detail</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Native <dialog> for Booking Detail & Payment Verification */}
      <dialog
        ref={detailDialogRef}
        aria-labelledby="booking-detail-dialog-title"
        style={{
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-elevated)",
        }}
        className="m-auto w-full max-w-xl border p-6 text-left"
      >
        {selected ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  id="booking-detail-dialog-title"
                  style={{ color: "var(--navy-900)" }}
                  className="font-mono text-lg font-bold"
                >
                  {selected.booking_code}
                </h2>
                <p style={{ color: "var(--slate-600)" }} className="text-xs">
                  {selected.vehicle_brand} {selected.vehicle_model} (
                  {selected.vehicle_plate})
                </p>
              </div>
              <BookingStatusBadge status={selected.status} />
            </div>

            <div
              style={{
                backgroundColor: "var(--slate-50)",
                borderRadius: "var(--radius-control)",
              }}
              className="grid gap-3 border p-4 text-xs sm:grid-cols-2"
            >
              <div>
                <p style={{ color: "var(--slate-600)" }}>Nama Pelanggan</p>
                <p className="font-semibold">{selected.user_name}</p>
              </div>
              <div>
                <p style={{ color: "var(--slate-600)" }}>Nomor HP / SIM</p>
                <p className="font-mono font-semibold">
                  {selected.user_phone || "-"} /{" "}
                  {selected.user_license_no || "-"}
                </p>
              </div>
              <div>
                <p style={{ color: "var(--slate-600)" }}>Lokasi Ambil & Kembali</p>
                <p className="font-semibold">
                  {selected.pickup_location} → {selected.return_location}
                </p>
              </div>
              <div>
                <p style={{ color: "var(--slate-600)" }}>Total Tagihan</p>
                <p className="font-bold tabular-nums">
                  {formatRupiah(selected.total_price)} ({selected.total_days}{" "}
                  hari)
                </p>
              </div>
            </div>

            {selected.payment ? (
              <div className="space-y-2 border-t pt-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">
                    Metode Pembayaran:{" "}
                    {selected.payment.method.toUpperCase()}
                  </span>
                  <PaymentStatusBadge status={selected.payment.status} />
                </div>
                {selected.payment.proof_url ? (
                  <div className="mt-2">
                    <p
                      style={{ color: "var(--slate-600)" }}
                      className="mb-1 font-semibold"
                    >
                      Bukti Pembayaran Pelanggan:
                    </p>
                    <img
                      src={selected.payment.proof_url}
                      alt="Bukti pembayaran"
                      width={260}
                      height={160}
                      className="max-h-40 rounded border object-contain"
                    />
                  </div>
                ) : (
                  <p style={{ color: "var(--slate-600)" }}>
                    Pelanggan belum mengunggah bukti pembayaran.
                  </p>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handlePaymentVerification(selected, "paid")}
                    style={{
                      backgroundColor: "var(--success-bg)",
                      color: "var(--success-text)",
                      borderRadius: "var(--radius-control)",
                    }}
                    className="min-h-[44px] px-3 py-2 text-xs font-semibold"
                  >
                    Tandai Lunas (Paid)
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      handlePaymentVerification(selected, "refunded")
                    }
                    style={{
                      backgroundColor: "var(--info-bg)",
                      color: "var(--info-text)",
                      borderRadius: "var(--radius-control)",
                    }}
                    className="min-h-[44px] px-3 py-2 text-xs font-semibold"
                  >
                    Tandai Refund
                  </button>
                </div>
              </div>
            ) : null}

            <div className="space-y-2 border-t pt-3">
              <label
                htmlFor="admin-notes-input"
                className="block text-xs font-semibold"
              >
                Catatan Internal Admin
              </label>
              <textarea
                id="admin-notes-input"
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Catatan serah terima kunci, kondisi BBM, atau alasan penolakan..."
                style={{ borderRadius: "var(--radius-control)" }}
                className="w-full border px-3 py-2 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => detailDialogRef.current?.close()}
                style={{
                  backgroundColor: "var(--slate-100)",
                  color: "var(--slate-900)",
                  borderRadius: "var(--radius-control)",
                }}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </div>
  );
}
