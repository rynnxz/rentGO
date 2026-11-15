"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronDown,
  Download,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { formatDateId, formatRupiah } from "@/lib/utils";
import {
  getAllowedNextStatuses,
  getDisplayStatus,
} from "@/lib/booking-state";
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

const COMPACT_PRIMARY_LABELS: Partial<Record<BookingStatus, string>> = {
  confirmed: "Konfirmasi",
  ongoing: "Mulai Sewa",
  completed: "Selesaikan",
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

  useEffect(() => {
    setBookings(initialBookings);
  }, [initialBookings]);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== "all") {
        const display = getDisplayStatus(b.status, b.payment?.status);
        if (
          statusFilter !== b.status &&
          statusFilter !== display.key
        ) {
          return false;
        }
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
            <option value="pending">Semua Pending</option>
            <option value="pending_unpaid">Menunggu Pembayaran (Belum Bayar)</option>
            <option value="pending_paid">Menunggu Konfirmasi Admin (Lunas)</option>
            <option value="confirmed">Siap Diambil (Confirmed)</option>
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
                  className="px-3 py-3 font-semibold"
                >
                  Pesanan & Penyewa
                </th>
                <th className="px-2.5 py-3 font-semibold">Kendaraan</th>
                <th className="px-2.5 py-3 font-semibold">Tanggal & Lokasi</th>
                <th className="px-2.5 py-3 text-right font-semibold">Tagihan</th>
                <th className="px-2.5 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 text-right font-semibold">
                  Transisi Status & Menu Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
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
                  const primaryNext = allowedNext.find(
                    (item) =>
                      item.status === "confirmed" ||
                      item.status === "ongoing" ||
                      item.status === "completed",
                  );
                  const extraActionCount =
                    allowedNext.length - (primaryNext ? 1 : 0);

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
                        className="px-3 py-2.5 font-normal"
                      >
                        <p className="font-mono text-xs font-extrabold">
                          {b.booking_code}
                        </p>
                        <p className="text-xs font-semibold leading-snug">
                          {b.user_name}
                        </p>
                        <p
                          style={{ color: "var(--slate-600)" }}
                          className="text-[11px]"
                        >
                          {b.user_phone || b.user_email}
                        </p>
                      </th>
                      <td className="max-w-[150px] px-2.5 py-2.5">
                        <p
                          style={{ color: "var(--navy-900)" }}
                          className="truncate font-semibold leading-snug"
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
                      <td className="max-w-[165px] px-2.5 py-2.5 text-xs tabular-nums">
                        <p className="font-semibold leading-snug">
                          {formatDateId(b.start_date)} -{" "}
                          {formatDateId(b.end_date)} ({b.total_days} hr)
                        </p>
                        <p
                          style={{ color: "var(--slate-600)" }}
                          className="truncate"
                        >
                          {b.pickup_location}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-2.5 py-2.5 text-right font-bold tabular-nums">
                        {formatRupiah(b.total_price)}
                      </td>
                      <td className="whitespace-nowrap px-2.5 py-2.5">
                        <div className="flex flex-col items-start gap-1">
                          <BookingStatusBadge
                            status={b.status}
                            paymentStatus={b.payment?.status}
                          />
                          {b.payment ? (
                            <PaymentStatusBadge status={b.payment.status} />
                          ) : null}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-2.5 py-2.5 text-right">
                        <div className="inline-flex items-center justify-end gap-1 whitespace-nowrap">
                          {b.payment &&
                          b.payment.status !== "paid" &&
                          b.status !== "cancelled" &&
                          b.status !== "rejected" &&
                          b.status !== "expired" ? (
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() =>
                                handlePaymentVerification(b, "paid")
                              }
                              data-testid={`verify-paid-${b.booking_code}`}
                              style={{
                                backgroundColor: "var(--secondary-50)",
                                color: "var(--secondary-700)",
                                borderColor: "var(--secondary-600)",
                                borderRadius: "var(--radius-control)",
                              }}
                              className="inline-flex min-h-[34px] items-center gap-1 border px-2 py-1 text-[11px] font-bold whitespace-nowrap shadow-2xs transition-opacity hover:opacity-90"
                            >
                              <CheckCircle2
                                className="h-3 w-3 shrink-0"
                                aria-hidden="true"
                              />
                              <span>Set Lunas</span>
                            </button>
                          ) : null}

                          {primaryNext ? (
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() =>
                                handleStatusTransition(b, primaryNext.status)
                              }
                              data-testid={`transition-${b.booking_code}-${primaryNext.status}`}
                              style={{
                                backgroundColor: "var(--primary-600)",
                                color: "var(--on-dark-fg)",
                                borderColor: "var(--primary-700)",
                                borderRadius: "var(--radius-control)",
                              }}
                              className="inline-flex min-h-[34px] items-center border px-2.5 py-1 text-[11px] font-bold whitespace-nowrap shadow-2xs transition-opacity hover:opacity-90"
                            >
                              {COMPACT_PRIMARY_LABELS[primaryNext.status] ??
                                STATUS_ACTION_LABELS[primaryNext.status]}
                            </button>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => openDetail(b)}
                            data-testid={`open-actions-${b.booking_code}`}
                            style={{
                              backgroundColor: "var(--brand-navy-deep)",
                              color: "var(--on-dark-fg)",
                              borderColor: "var(--navy-800)",
                              borderRadius: "var(--radius-control)",
                            }}
                            className="inline-flex min-h-[34px] items-center gap-1 border px-2 py-1 text-[11px] font-bold whitespace-nowrap shadow-2xs transition-opacity hover:opacity-90"
                            title="Buka modal detail pesanan dan semua menu aksi transisi status"
                          >
                            <MoreHorizontal
                              style={{ color: "var(--accent-500)" }}
                              className="h-3.5 w-3.5 shrink-0"
                              aria-hidden="true"
                            />
                            <span>
                              {extraActionCount > 0
                                ? `Semua Aksi (+${extraActionCount})`
                                : "Semua Aksi"}
                            </span>
                            <ChevronDown
                              className="h-3 w-3 shrink-0 opacity-80"
                              aria-hidden="true"
                            />
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

      {/* Native <dialog> for Booking Detail, Full Action Menu & Payment Verification */}
      <dialog
        ref={detailDialogRef}
        aria-labelledby="booking-detail-dialog-title"
        style={{
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-elevated)",
        }}
        className="m-auto w-full max-w-2xl overflow-hidden border p-0 text-left"
      >
        {selected ? (
          <div>
            {/* Modal Sticky Header */}
            <div
              style={{
                backgroundColor: "var(--brand-navy-deep)",
                color: "var(--on-dark-fg)",
              }}
              className="flex items-start justify-between gap-3 border-b px-6 py-4"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                    <span
                      style={{
                        backgroundColor: "var(--accent-500)",
                        color: "var(--on-amber-fg)",
                        borderRadius: "var(--radius-badge)",
                      }}
                      className="px-2 py-0.5 text-[10px] font-extrabold uppercase"
                    >
                      Menu Aksi & Detail Pesanan
                    </span>
                    <BookingStatusBadge
                      status={selected.status}
                      paymentStatus={selected.payment?.status}
                    />
                  </div>
                <h2
                  id="booking-detail-dialog-title"
                  className="mt-1.5 font-mono text-lg font-extrabold"
                >
                  {selected.booking_code}
                </h2>
                <p className="text-xs opacity-85">
                  {selected.vehicle_brand} {selected.vehicle_model} (
                  {selected.vehicle_plate})
                </p>
              </div>
              <button
                type="button"
                onClick={() => detailDialogRef.current?.close()}
                aria-label="Tutup Modal"
                style={{
                  backgroundColor: "rgb(255 255 255 / 0.12)",
                  color: "var(--on-dark-fg)",
                  borderRadius: "var(--radius-control)",
                }}
                className="inline-flex h-9 w-9 items-center justify-center hover:bg-white/20"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {/* 1. Semua Menu Aksi Transisi Status (Collapsible overflow actions placed neatly inside modal) */}
              <div
                style={{
                  backgroundColor: "var(--primary-50)",
                  borderColor: "var(--primary-600)",
                  borderRadius: "var(--radius-card)",
                }}
                className="space-y-3 border p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p
                    style={{ color: "var(--navy-900)" }}
                    className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider"
                  >
                    <SlidersHorizontal
                      className="h-3.5 w-3.5"
                      style={{ color: "var(--primary-600)" }}
                      aria-hidden="true"
                    />
                    <span>Semua Menu Aksi Transisi Status Booking</span>
                  </p>
                  <span
                    style={{ color: "var(--slate-600)" }}
                    className="text-[11px] font-semibold"
                  >
                    Status Saat Ini:{" "}
                    {
                      getDisplayStatus(
                        selected.status,
                        selected.payment?.status,
                      ).label
                    }
                  </span>
                </div>

                {getAllowedNextStatuses(selected.status, "admin").length ===
                0 ? (
                  <p style={{ color: "var(--slate-600)" }} className="text-xs">
                    Pesanan ini berada pada status terminal (
                    <strong>{selected.status.toUpperCase()}</strong>) sehingga
                    tidak ada transisi status lanjutan.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {getAllowedNextStatuses(selected.status, "admin").map(
                      (nextItem) => {
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
                              handleStatusTransition(
                                selected,
                                nextItem.status,
                                adminNotes,
                              )
                            }
                            data-testid={`modal-transition-${selected.booking_code}-${nextItem.status}`}
                            style={{
                              backgroundColor: isPrimary
                                ? "var(--primary-600)"
                                : "var(--danger-bg)",
                              color: isPrimary
                                ? "var(--surface-white)"
                                : "var(--danger-text)",
                              borderColor: isPrimary
                                ? "var(--primary-700)"
                                : "var(--danger)",
                              borderRadius: "var(--radius-control)",
                            }}
                            className="inline-flex min-h-[40px] items-center gap-1.5 border px-3.5 py-2 text-xs font-bold shadow-2xs transition-opacity hover:opacity-90"
                          >
                            <span>{STATUS_ACTION_LABELS[nextItem.status]}</span>
                          </button>
                        );
                      },
                    )}
                  </div>
                )}
              </div>

              {/* 2. Ringkasan Data Pelanggan & Unit */}
              <div
                style={{
                  backgroundColor: "var(--slate-50)",
                  borderRadius: "var(--radius-control)",
                }}
                className="grid gap-3 border p-4 text-xs sm:grid-cols-2"
              >
                <div>
                  <p style={{ color: "var(--slate-600)" }}>Nama Pelanggan</p>
                  <p className="font-bold">{selected.user_name}</p>
                  <p style={{ color: "var(--slate-600)" }}>
                    {selected.user_email}
                  </p>
                </div>
                <div>
                  <p style={{ color: "var(--slate-600)" }}>Nomor HP / SIM</p>
                  <p className="font-mono font-bold">
                    {selected.user_phone || "-"} /{" "}
                    {selected.user_license_no || "-"}
                  </p>
                </div>
                <div>
                  <p style={{ color: "var(--slate-600)" }}>
                    Lokasi Ambil & Kembali
                  </p>
                  <p className="font-bold">
                    {selected.pickup_location} → {selected.return_location}
                  </p>
                </div>
                <div>
                  <p style={{ color: "var(--slate-600)" }}>
                    Total Tagihan & Durasi
                  </p>
                  <p className="font-extrabold tabular-nums">
                    {formatRupiah(selected.total_price)} ({selected.total_days}{" "}
                    hari)
                  </p>
                </div>
              </div>

              {/* 3. Aksi & Bukti Pembayaran QRIS */}
              {selected.payment ? (
                <div className="space-y-3 rounded-lg border p-4 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold">
                      Metode Pembayaran:{" "}
                      {selected.payment.method.toUpperCase()} (Midtrans Sandbox)
                    </span>
                    <PaymentStatusBadge status={selected.payment.status} />
                  </div>
                  {selected.payment.proof_url ? (
                    <div className="mt-2">
                      <p
                        style={{ color: "var(--slate-600)" }}
                        className="mb-1.5 font-semibold"
                      >
                        Bukti Pembayaran Pelanggan:
                      </p>
                      <img
                        src={selected.payment.proof_url}
                        alt="Bukti pembayaran"
                        width={260}
                        height={160}
                        className="max-h-40 rounded border bg-slate-50 object-contain p-1"
                      />
                    </div>
                  ) : (
                    <p style={{ color: "var(--slate-600)" }}>
                      Pelanggan belum mengunggah tangkapan layar bukti bayar.
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        handlePaymentVerification(selected, "paid")
                      }
                      style={{
                        backgroundColor: "var(--secondary-50)",
                        color: "var(--secondary-700)",
                        borderColor: "var(--secondary-600)",
                        borderRadius: "var(--radius-control)",
                      }}
                      className="inline-flex min-h-[40px] items-center gap-1.5 border px-3.5 py-2 text-xs font-bold"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Tandai Lunas (Paid)</span>
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
                        borderColor: "var(--info)",
                        borderRadius: "var(--radius-control)",
                      }}
                      className="inline-flex min-h-[40px] items-center border px-3.5 py-2 text-xs font-bold"
                    >
                      Tandai Refund
                    </button>
                  </div>
                </div>
              ) : null}

              {/* 4. Catatan Internal Admin */}
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-notes-input"
                  className="block text-xs font-bold"
                >
                  Catatan Internal Admin
                </label>
                <textarea
                  id="admin-notes-input"
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Catatan serah terima kunci, kondisi BBM, atau alasan pembatalan/penolakan..."
                  style={{ borderRadius: "var(--radius-control)" }}
                  className="w-full border px-3 py-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={() => detailDialogRef.current?.close()}
                  style={{
                    backgroundColor: "var(--slate-100)",
                    color: "var(--slate-900)",
                    borderRadius: "var(--radius-control)",
                  }}
                  className="min-h-[42px] px-4 py-2 text-xs font-bold"
                >
                  Tutup Modal
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </dialog>
    </div>
  );
}
