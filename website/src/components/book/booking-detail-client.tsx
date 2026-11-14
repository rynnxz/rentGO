"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  MessageCircle,
  Upload,
  XCircle,
} from "lucide-react";
import {
  buildWhatsAppBookingUrl,
  formatDateId,
  formatRupiah,
} from "@/lib/utils";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/ui/badge";
import type { BookingDetailView } from "@/lib/types";

export function BookingDetailClient({
  initialBooking,
  bankInfo,
  whatsappNumber,
}: {
  initialBooking: BookingDetailView;
  bankInfo: string;
  whatsappNumber: string;
}) {
  const router = useRouter();
  const [booking, setBooking] = useState(initialBooking);
  const [uploading, setUploading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const whatsappUrl = buildWhatsAppBookingUrl({
    whatsappNumber,
    bookingCode: booking.booking_code,
    vehicleName: `${booking.vehicle_brand} ${booking.vehicle_model} (${booking.vehicle_plate})`,
    startDate: booking.start_date,
    endDate: booking.end_date,
    totalPrice: booking.total_price,
    customerName: booking.user_name,
  });

  async function saveProofUrl(proofUrl: string) {
    const res = await fetch(`/api/payments/${booking.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        proof_url: proofUrl,
        note: "Bukti pembayaran diunggah oleh pelanggan",
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || "Gagal menyimpan bukti pembayaran.");
    }
    setBooking(json.data);
    setFeedback(
      "Bukti pembayaran berhasil diunggah. Petugas Admin RentGo akan segera memverifikasi pesanan Anda.",
    );
    router.refresh();
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
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
      await saveProofUrl(upJson.url);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal mengunggah bukti bayar.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleSimulateSampleReceipt() {
    setUploading(true);
    setErrorMsg(null);
    setFeedback(null);
    try {
      await saveProofUrl("/vehicles/receipt-placeholder.svg");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal menyimpan bukti bayar.",
      );
    } finally {
      setUploading(false);
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
          href="/bookings"
          style={{ color: "var(--primary-600)" }}
          className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Kembali ke Daftar Pesanan Saya</span>
        </Link>
      </div>

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
            <div className="flex items-center gap-2">
              <BookingStatusBadge status={booking.status} />
              {booking.payment ? (
                <PaymentStatusBadge status={booking.payment.status} />
              ) : null}
            </div>
          </div>

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
              <p style={{ color: "var(--slate-600)" }}>Total Tagihan</p>
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
                className="inline-flex min-h-[44px] items-center gap-1.5 border px-4 py-2 text-xs font-semibold"
              >
                <XCircle className="h-4 w-4" aria-hidden="true" />
                <span>
                  {cancelling ? "Membatalkan..." : "Batalkan Pesanan Ini"}
                </span>
              </button>
            </div>
          ) : null}
        </section>

        {/* Right: Payment Proof Upload & WhatsApp Confirmation */}
        <section
          aria-labelledby="payment-section-heading"
          style={{
            backgroundColor: "var(--surface-white)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-card)",
          }}
          className="space-y-5 border p-6 lg:col-span-5"
        >
          <div>
            <h2
              id="payment-section-heading"
              style={{ color: "var(--navy-900)" }}
              className="text-lg font-bold"
            >
              Instruksi Pembayaran & Konfirmasi
            </h2>
            <p style={{ color: "var(--slate-600)" }} className="text-xs">
              Unggah bukti transfer/QRIS Anda atau kirim konfirmasi langsung ke WhatsApp Admin RentGo Medan.
            </p>
          </div>

          <div
            style={{
              backgroundColor: "var(--slate-50)",
              borderRadius: "var(--radius-control)",
            }}
            className="space-y-1.5 border p-4 text-xs"
          >
            <p style={{ color: "var(--slate-600)" }} className="font-semibold">
              Tujuan Pembayaran Resmi:
            </p>
            <p
              style={{ color: "var(--navy-900)" }}
              className="font-mono text-sm font-bold"
            >
              {bankInfo}
            </p>
            <p style={{ color: "var(--slate-600)" }} className="pt-1">
              Nominal Transfer:{" "}
              <strong style={{ color: "var(--primary-600)" }}>
                {formatRupiah(booking.total_price)}
              </strong>
            </p>
          </div>

          {booking.payment?.proof_url ? (
            <div className="space-y-2">
              <p
                style={{ color: "var(--success-text)" }}
                className="flex items-center gap-1.5 text-xs font-bold"
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                <span>Bukti Pembayaran Tercatat:</span>
              </p>
              <img
                src={booking.payment.proof_url}
                alt="Bukti pembayaran"
                width={280}
                height={170}
                className="max-h-44 rounded border object-contain"
              />
            </div>
          ) : null}

          {booking.status !== "cancelled" &&
          booking.status !== "rejected" &&
          booking.status !== "expired" ? (
            <div className="space-y-3 border-t pt-4">
              <label
                style={{
                  backgroundColor: "var(--primary-50)",
                  color: "var(--primary-700)",
                  borderColor: "var(--primary-600)",
                  borderRadius: "var(--radius-control)",
                }}
                className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 border px-4 py-2.5 text-xs font-bold"
              >
                <Upload className="h-4 w-4" aria-hidden="true" />
                <span>
                  {uploading
                    ? "Mengunggah Bukti..."
                    : "Pilih File Bukti Transfer (JPG/PNG/WebP)"}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>

              <button
                type="button"
                disabled={uploading}
                onClick={handleSimulateSampleReceipt}
                data-testid="simulate-upload-proof-button"
                style={{
                  backgroundColor: "var(--slate-100)",
                  color: "var(--slate-900)",
                  borderRadius: "var(--radius-control)",
                }}
                className="flex min-h-[44px] w-full items-center justify-center px-4 py-2 text-xs font-semibold"
              >
                Gunakan Bukti Struk Contoh (Demo Cepat)
              </button>
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
                color: "var(--surface-white)",
                borderRadius: "var(--radius-control)",
              }}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 px-4 py-3 text-sm font-bold"
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
