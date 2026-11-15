"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  MessageCircle,
  QrCode,
  ShieldCheck,
  Upload,
  XCircle,
} from "lucide-react";
import {
  buildWhatsAppBookingUrl,
  formatDateId,
  formatRupiah,
} from "@/lib/utils";
import { getDisplayStatus } from "@/lib/booking-state";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/ui/badge";
import { LoadingSpinner, LoadingStatusBanner } from "@/components/ui/loading";
import { PickupMap } from "@/components/shared/pickup-map";
import type { BookingDetailView } from "@/lib/types";

/**
 * Generates a deterministic 21x21 QR matrix for the Midtrans Sandbox QRIS card
 * based on booking_code and total_price.
 */
function buildQrisMatrix(seedText: string): boolean[][] {
  const size = 21;
  const grid: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false),
  );

  function drawFinder(r0: number, c0: number) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[r0 + r]![c0 + c] = isBorder || isInner;
      }
    }
  }

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  let hash = 2166136261;
  for (let i = 0; i < seedText.length; i++) {
    hash ^= seedText.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      const inCenterLogo = r >= 8 && r <= 12 && c >= 8 && c <= 12;
      if (inTopLeft || inTopRight || inBottomLeft || inCenterLogo) continue;

      hash ^= (r * 31 + c * 17) & 0xff;
      hash = Math.imul(hash, 16777619);
      grid[r]![c] = (Math.abs(hash) % 10) < 5;
    }
  }

  return grid;
}

export function BookingDetailClient({
  initialBooking,
  whatsappNumber,
}: {
  initialBooking: BookingDetailView;
  bankInfo?: string;
  whatsappNumber: string;
}) {
  const router = useRouter();
  const [booking, setBooking] = useState(initialBooking);
  const [simulatingPayment, setSimulatingPayment] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const uploading = simulatingPayment || uploadingProof;

  useEffect(() => {
    setBooking(initialBooking);
  }, [initialBooking]);

  const qrMatrix = useMemo(
    () =>
      buildQrisMatrix(
        `rentgo-test:${booking.booking_code}:${booking.total_price}`,
      ),
    [booking.booking_code, booking.total_price],
  );

  const paymentStatus = booking.payment?.status ?? "unpaid";
  const isPaid = paymentStatus === "paid";
  const isUnpaid = paymentStatus === "unpaid";
  const displayStatus = getDisplayStatus(booking.status, paymentStatus);

  const whatsappUrl = buildWhatsAppBookingUrl({
    whatsappNumber,
    bookingCode: booking.booking_code,
    vehicleName: `${booking.vehicle_brand} ${booking.vehicle_model} (${booking.vehicle_plate})`,
    startDate: booking.start_date,
    endDate: booking.end_date,
    totalPrice: booking.total_price,
    customerName: booking.user_name,
  });

  async function handleSimulateQrisPaid() {
    setSimulatingPayment(true);
    setErrorMsg(null);
    setFeedback(null);
    try {
      const res = await fetch(`/api/payments/${booking.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status: "paid",
          method: "qris",
          proof_url: "/vehicles/receipt-placeholder.svg",
          note: `Lunas via Simulasi QRIS Midtrans Sandbox (Merchant: rentgo-test, Ref: MID-QRIS-${booking.booking_code})`,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal memproses pembayaran QRIS Sandbox.");
      }
      setBooking(json.data);
      setFeedback(
        "Pembayaran QRIS Midtrans Sandbox (rentgo-test) berhasil dikonfirmasi! Status pembayaran Anda kini LUNAS.",
      );
      router.refresh();
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Gagal memproses simulasi pembayaran QRIS.",
      );
    } finally {
      setSimulatingPayment(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingProof(true);
    setErrorMsg(null);
    setFeedback(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "payment-proofs");
      const upRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const upJson = await upRes.json();
      if (!upRes.ok) {
        throw new Error(upJson.error || "Gagal mengunggah file bukti bayar.");
      }
      const res = await fetch(`/api/payments/${booking.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          method: "qris",
          proof_url: upJson.url,
          note: "Bukti tangkapan layar QRIS diunggah oleh pelanggan",
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal menyimpan bukti pembayaran.");
      }
      setBooking(json.data);
      setFeedback(
        "Bukti tangkapan layar QRIS berhasil diunggah. Anda juga dapat menekan tombol 'Sudah Bayar' untuk penyelesaian instan di mode Sandbox.",
      );
      router.refresh();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal mengunggah bukti bayar.",
      );
    } finally {
      setUploadingProof(false);
    }
  }

  async function handleCancelBooking() {
    setCancelling(true);
    setErrorMsg(null);
    setFeedback(null);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal membatalkan pesanan.");
      }
      setBooking(json.data);
      setFeedback("Pesanan Anda berhasil dibatalkan.");
      router.refresh();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal membatalkan pesanan.",
      );
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="space-y-6" data-testid="booking-detail-view">
      <div>
        <Link
          href="/book/bookings"
          style={{ color: "var(--primary-600)" }}
          className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Kembali ke Daftar Pesanan Saya</span>
        </Link>
      </div>

      {uploading || cancelling ? (
        <LoadingStatusBanner
          title={
            cancelling
              ? "Membatalkan pesanan dan membuka kunci jadwal armada..."
              : simulatingPayment
                ? "Memverifikasi penyelesaian pembayaran QRIS Midtrans Sandbox..."
                : "Mengunggah bukti tangkapan layar QRIS ke Cloud Storage..."
          }
          description="Menyinkronkan status pesanan terbaru dengan server operasional Medan."
          tone={cancelling ? "accent" : "secondary"}
          testId="booking-detail-loading-banner"
        />
      ) : null}

      {feedback ? (
        <div
          role="status"
          data-testid="booking-detail-feedback"
          style={{
            backgroundColor: "var(--success-bg)",
            color: "var(--success-text)",
            borderColor: "var(--success)",
            borderRadius: "var(--radius-control)",
          }}
          className="border p-3.5 text-xs font-semibold"
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
          className="border p-3.5 text-xs font-semibold"
        >
          {errorMsg}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Booking Info */}
        <section
          aria-labelledby="booking-summary-heading"
          style={{
            backgroundColor: "var(--surface-white)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-card)",
          }}
          className="space-y-5 border p-6 lg:col-span-7"
        >
          <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-4">
            <div>
              <p
                style={{ color: "var(--slate-600)" }}
                className="text-xs font-semibold uppercase"
              >
                Kode Booking Resmi
              </p>
              <h1
                id="booking-summary-heading"
                style={{ color: "var(--navy-900)" }}
                className="mt-1 font-mono text-2xl font-extrabold"
                data-testid="detail-booking-code"
              >
                {booking.booking_code}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <BookingStatusBadge
                status={booking.status}
                paymentStatus={paymentStatus}
              />
              {booking.payment ? (
                <PaymentStatusBadge status={booking.payment.status} />
              ) : null}
            </div>
          </div>

          <p
            style={{ color: "var(--slate-600)" }}
            className="text-xs font-medium"
            data-testid="booking-status-description"
          >
            {displayStatus.description}
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <img
              src={booking.vehicle_image || "/vehicles/mpv.svg"}
              alt={`${booking.vehicle_brand} ${booking.vehicle_model}`}
              width={160}
              height={100}
              className="h-24 w-40 rounded border object-contain p-2"
            />
            <div>
              <h2
                style={{ color: "var(--navy-900)" }}
                className="text-lg font-bold"
              >
                {booking.vehicle_brand} {booking.vehicle_model}
              </h2>
              <p
                style={{ color: "var(--slate-600)" }}
                className="font-mono text-xs font-semibold"
              >
                Plat Nomor: {booking.vehicle_plate}
              </p>
              <p style={{ color: "var(--slate-600)" }} className="mt-1 text-xs">
                Transmisi:{" "}
                {booking.vehicle_transmission === "automatic"
                  ? "Otomatis (AT)"
                  : "Manual (MT)"}{" "}
                - {booking.vehicle_seats} Kursi
              </p>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "var(--slate-50)",
              borderRadius: "var(--radius-control)",
            }}
            className="grid gap-3 border p-4 text-xs sm:grid-cols-2"
          >
            <div>
              <p style={{ color: "var(--slate-600)" }}>Tanggal Mulai Sewa</p>
              <p className="font-bold tabular-nums">
                {formatDateId(booking.start_date)}
              </p>
            </div>
            <div>
              <p style={{ color: "var(--slate-600)" }}>Tanggal Selesai Sewa</p>
              <p className="font-bold tabular-nums">
                {formatDateId(booking.end_date)} ({booking.total_days} Hari)
              </p>
            </div>
            <div>
              <p style={{ color: "var(--slate-600)" }}>Lokasi Pengambilan</p>
              <p className="font-bold">{booking.pickup_location}</p>
            </div>
            <div>
              <p style={{ color: "var(--slate-600)" }}>Lokasi Pengembalian</p>
              <p className="font-bold">{booking.return_location}</p>
            </div>
            <div>
              <p style={{ color: "var(--slate-600)" }}>Tarif Harian (Snapshot)</p>
              <p className="font-bold tabular-nums">
                {formatRupiah(booking.daily_price_snapshot)} / hari
              </p>
            </div>
            <div>
              <p style={{ color: "var(--slate-600)" }}>Total Tagihan QRIS</p>
              <p
                style={{ color: "var(--primary-600)" }}
                className="text-sm font-extrabold tabular-nums"
              >
                {formatRupiah(booking.total_price)}
              </p>
            </div>
          </div>

          {booking.admin_notes ? (
            <div
              style={{
                backgroundColor: "var(--info-bg)",
                color: "var(--info-text)",
                borderRadius: "var(--radius-control)",
              }}
              className="p-3.5 text-xs"
            >
              <p className="font-bold">Catatan dari Admin RentGo:</p>
              <p className="mt-1">{booking.admin_notes}</p>
            </div>
          ) : null}

          <div
            data-testid="booking-detail-map-block"
            className="space-y-3 border-t pt-4"
          >
            <div>
              <h3
                style={{ color: "var(--navy-900)" }}
                className="text-sm font-bold"
              >
                Peta Lokasi Pengambilan & Pengembalian
              </h3>
              <p style={{ color: "var(--slate-600)" }} className="text-xs">
                Titik Ambil: <strong className="text-[var(--fg)]">{booking.pickup_location}</strong> · Titik Kembali: <strong className="text-[var(--fg)]">{booking.return_location}</strong>
              </p>
            </div>
            <PickupMap
              pickupLocationName={booking.pickup_location}
              returnLocationName={booking.return_location}
              compact
            />
          </div>

          {booking.status === "pending" ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <p style={{ color: "var(--slate-600)" }} className="text-xs">
                Ingin mengubah rencana perjalanan? Pesanan berstatus Menunggu dapat dibatalkan kapan saja.
              </p>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelBooking}
                data-testid="cancel-booking-button"
                style={{
                  backgroundColor: "var(--danger-bg)",
                  color: "var(--danger-text)",
                  borderColor: "var(--danger)",
                  borderRadius: "var(--radius-control)",
                }}
                className="inline-flex min-h-[44px] items-center gap-1.5 border px-4 py-2 text-xs font-semibold disabled:opacity-65"
              >
                {cancelling ? (
                  <LoadingSpinner
                    size="xs"
                    tone="danger"
                    label="Membatalkan pesanan"
                  />
                ) : (
                  <XCircle className="h-4 w-4" aria-hidden="true" />
                )}
                <span>
                  {cancelling ? "Membatalkan..." : "Batalkan Pesanan Ini"}
                </span>
              </button>
            </div>
          ) : null}
        </section>

        {/* Right: Midtrans Sandbox QRIS Payment Card + "Sudah Bayar" Button */}
        <section
          aria-labelledby="payment-section-heading"
          style={{
            backgroundColor: "var(--surface-white)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-elevated)",
          }}
          className="space-y-5 border p-6 lg:col-span-5"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <span
                style={{
                  backgroundColor: "var(--secondary-50)",
                  color: "var(--secondary-700)",
                  borderColor: "var(--secondary-100)",
                  borderRadius: "var(--radius-badge)",
                }}
                className="inline-block border px-2 py-0.5 text-[10px] font-extrabold uppercase"
              >
                Midtrans Sandbox • Merchant: rentgo-test
              </span>
              <h2
                id="payment-section-heading"
                style={{ color: "var(--navy-900)" }}
                className="mt-1 text-lg font-extrabold"
              >
                Pembayaran QRIS Instan
              </h2>
              <p style={{ color: "var(--slate-600)" }} className="text-xs">
                Pindai kode QRIS di bawah atau klik tombol <strong>&ldquo;Sudah Bayar&rdquo;</strong> untuk simulasi pembayaran di mode Sandbox.
              </p>
            </div>
            <QrCode
              className="h-6 w-6 shrink-0"
              style={{ color: "var(--secondary-600)" }}
              aria-hidden="true"
            />
          </div>

          {/* Interactive QRIS Code Box */}
          <div
            data-testid="qris-sandbox-card"
            style={{
              backgroundColor: "var(--slate-50)",
              borderColor: isPaid
                ? "var(--success)"
                : "var(--secondary-600)",
              borderRadius: "var(--radius-card)",
            }}
            className="space-y-3 border-2 p-4 text-center"
          >
            <div className="flex items-center justify-between border-b pb-2 text-left text-xs">
              <div>
                <p
                  style={{ color: "var(--navy-900)" }}
                  className="font-extrabold uppercase"
                >
                  QRIS • PT RentGo Transportasi Medan
                </p>
                <p
                  style={{ color: "var(--slate-600)" }}
                  className="font-mono text-[10px]"
                >
                  NMID: ID1026000998801 • Ref: MID-QRIS-{booking.booking_code}
                </p>
              </div>
              <span
                style={{
                  backgroundColor: isPaid
                    ? "var(--success-bg)"
                    : "var(--accent-100)",
                  color: isPaid
                    ? "var(--success-text)"
                    : "var(--warning-text)",
                  borderRadius: "var(--radius-badge)",
                }}
                className="px-2 py-0.5 text-[10px] font-extrabold uppercase"
              >
                {isPaid ? "LUNAS (SETTLED)" : "SANDBOX AKTIF"}
              </span>
            </div>

            {/* SVG QRIS Matrix (Always high-contrast light canvas for camera scanning) */}
            <div
              style={{ backgroundColor: "#FFFFFF" }}
              className="relative mx-auto flex h-56 w-56 items-center justify-center rounded-xl border p-3 shadow-xs"
            >
              <svg
                viewBox="0 0 21 21"
                width="196"
                height="196"
                aria-label={`Kode QRIS Midtrans Sandbox untuk ${booking.booking_code}`}
                className="h-full w-full"
                shapeRendering="crispEdges"
              >
                <rect width="21" height="21" fill="#FFFFFF" />
                {qrMatrix.map((row, rIdx) =>
                  row.map((cell, cIdx) =>
                    cell ? (
                      <rect
                        key={`${rIdx}-${cIdx}`}
                        x={cIdx}
                        y={rIdx}
                        width={1}
                        height={1}
                        fill="#0B1D3A"
                      />
                    ) : null,
                  ),
                )}
                {/* Center QRIS Brand Pill */}
                <rect
                  x="7.5"
                  y="8.5"
                  width="6"
                  height="4"
                  rx="0.8"
                  fill="#1D4ED8"
                />
                <text
                  x="10.5"
                  y="11.1"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="2.1"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  QRIS
                </text>
              </svg>

              {uploading ? (
                <div
                  style={{
                    backgroundColor: "rgb(11 29 58 / 0.82)",
                    color: "var(--on-dark-fg)",
                  }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl p-4 text-center"
                >
                  <LoadingSpinner
                    size="md"
                    tone="light"
                    label="Memverifikasi transaksi QRIS"
                  />
                  <p className="text-xs font-extrabold uppercase">
                    {simulatingPayment
                      ? "Memverifikasi Midtrans QRIS..."
                      : "Mengunggah Bukti Bayar..."}
                  </p>
                </div>
              ) : isPaid ? (
                <div
                  style={{
                    backgroundColor: "rgb(20 83 45 / 0.88)",
                    color: "var(--on-dark-fg)",
                  }}
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-xl p-4 text-center"
                >
                  <CheckCircle2
                    className="h-10 w-10"
                    style={{ color: "var(--accent-500)" }}
                    aria-hidden="true"
                  />
                  <p className="mt-2 text-sm font-extrabold uppercase">
                    QRIS Terbayar Lunas
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] opacity-90">
                    Midtrans Sandbox Settlement
                  </p>
                </div>
              ) : null}
            </div>

            <div className="space-y-0.5 pt-1">
              <p style={{ color: "var(--slate-600)" }} className="text-xs">
                Total Nominal QRIS:
              </p>
              <p
                style={{ color: "var(--primary-600)" }}
                className="text-xl font-extrabold tabular-nums"
              >
                {formatRupiah(booking.total_price)}
              </p>
            </div>
          </div>

          {isUnpaid &&
          booking.status !== "cancelled" &&
          booking.status !== "rejected" &&
          booking.status !== "expired" ? (
            <div className="space-y-3">
              {/* Primary Sandbox "Sudah Bayar" Action Button — only shown when payment is unpaid */}
              <button
                type="button"
                disabled={uploading}
                onClick={handleSimulateQrisPaid}
                data-testid="simulate-upload-proof-button"
                style={{
                  backgroundColor: "var(--primary-600)",
                  color: "var(--on-dark-fg)",
                  borderRadius: "var(--radius-control)",
                }}
                className="flex min-h-[48px] w-full items-center justify-center gap-2 px-4 py-3 text-sm font-extrabold shadow-sm transition-opacity hover:opacity-95 disabled:opacity-65"
              >
                {simulatingPayment ? (
                  <LoadingSpinner
                    size="xs"
                    tone="light"
                    label="Memverifikasi pembayaran Midtrans Sandbox"
                  />
                ) : (
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                )}
                <span>
                  {simulatingPayment
                    ? "Memverifikasi Midtrans Sandbox..."
                    : "Sudah Bayar (Simulasi QRIS Midtrans Sandbox)"}
                </span>
              </button>

              {/* Optional manual screenshot upload */}
              <label
                style={{
                  backgroundColor: "var(--slate-50)",
                  color: "var(--slate-600)",
                  borderColor: "var(--slate-200)",
                  borderRadius: "var(--radius-control)",
                }}
                className="flex min-h-[42px] w-full cursor-pointer items-center justify-center gap-2 border px-3 py-2 text-xs font-semibold hover:opacity-90"
              >
                {uploadingProof ? (
                  <LoadingSpinner
                    size="xs"
                    tone="primary"
                    label="Mengunggah bukti ke Cloud Storage"
                  />
                ) : (
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>
                  {uploadingProof
                    ? "Mengunggah Bukti ke Cloud Storage..."
                    : "Opsional: Unggah Screenshot Bukti QRIS (Cloud Storage)"}
                </span>
                <input
                  type="file"
                  disabled={uploading}
                  accept="image/jpeg,image/png,image/webp,image/jfif"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>
            </div>
          ) : isPaid ? (
            <div
              data-testid="paid-status-callout"
              style={{
                backgroundColor: "var(--success-bg)",
                color: "var(--success-text)",
                borderColor: "var(--success)",
                borderRadius: "var(--radius-control)",
              }}
              className="flex items-center gap-2.5 border p-3.5 text-xs font-semibold"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                Pembayaran QRIS Lunas • Status pesanan:{" "}
                <strong>{displayStatus.label}</strong>
              </span>
            </div>
          ) : null}

          <div className="border-t pt-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="whatsapp-confirm-link"
              style={{
                backgroundColor: "var(--success)",
                color: "var(--on-dark-fg)",
                borderRadius: "var(--radius-control)",
              }}
              className="flex min-h-[46px] w-full items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold sm:text-sm"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <span>Konfirmasi via WhatsApp Admin Medan</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
