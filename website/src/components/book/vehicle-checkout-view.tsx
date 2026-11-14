"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { calculateRentalDays } from "@/lib/pricing";
import {
  formatDateId,
  formatRupiah,
  PICKUP_LOCATIONS,
} from "@/lib/utils";
import { AuthControls } from "@/components/shared/auth-controls";
import type {
  PaymentMethod,
  UserRecord,
  VehicleWithCategory,
} from "@/lib/types";

export function VehicleCheckoutView({
  vehicle,
  blockedRanges,
  user,
  initialStartDate,
  initialEndDate,
  bankInfo,
}: {
  vehicle: VehicleWithCategory;
  blockedRanges: Array<{
    start_date: string;
    end_date: string;
    type: "booking" | "maintenance";
    label: string;
  }>;
  user: UserRecord | null;
  initialStartDate: string;
  initialEndDate: string;
  bankInfo: string;
}) {
  const router = useRouter();
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [pickupLocation, setPickupLocation] = useState<string>(
    PICKUP_LOCATIONS[0],
  );
  const [returnLocation, setReturnLocation] = useState<string>(
    PICKUP_LOCATIONS[0],
  );
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("transfer");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [driverLicenseNo, setDriverLicenseNo] = useState(
    user?.driver_license_no ?? "",
  );
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const rentalDays = useMemo(() => {
    try {
      return calculateRentalDays(startDate, endDate);
    } catch {
      return 1;
    }
  }, [startDate, endDate]);

  const totalPrice = rentalDays * vehicle.daily_price;

  const hasOverlapWithBlocked = useMemo(() => {
    return blockedRanges.some(
      (b) => startDate <= b.end_date && endDate >= b.start_date,
    );
  }, [blockedRanges, startDate, endDate]);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          vehicle_id: vehicle.id,
          start_date: startDate,
          end_date: endDate,
          pickup_location: pickupLocation,
          return_location: returnLocation,
          payment_method: paymentMethod,
          phone: phone.trim(),
          driver_license_no: driverLicenseNo.trim(),
          notes: notes.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal memproses pemesanan.");
      }
      router.push(`/bookings/${json.data.id}`);
      router.refresh();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal memproses pemesanan.",
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6" data-testid="vehicle-checkout-view">
      <div>
        <Link
          href={`/?start=${startDate}&end=${endDate}`}
          style={{ color: "var(--primary-600)" }}
          className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Kembali ke Katalog Armada</span>
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Vehicle Details + Blocked Dates */}
        <div className="space-y-6 lg:col-span-7">
          <section
            aria-labelledby="vehicle-detail-title"
            style={{
              backgroundColor: "var(--surface-white)",
              borderRadius: "var(--radius-card)",
              boxShadow: "var(--shadow-card)",
            }}
            className="overflow-hidden border"
          >
            <div
              style={{ backgroundColor: "var(--slate-100)" }}
              className="flex h-64 items-center justify-center border-b p-6"
            >
              <img
                src={vehicle.image_url || "/vehicles/mpv.svg"}
                alt={`${vehicle.brand} ${vehicle.model}`}
                width={420}
                height={230}
                className="max-h-52 w-auto object-contain"
              />
            </div>

            <div className="space-y-4 p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span
                    style={{
                      backgroundColor: "var(--primary-50)",
                      color: "var(--primary-700)",
                      borderRadius: "var(--radius-badge)",
                    }}
                    className="inline-block px-2.5 py-0.5 text-xs font-bold"
                  >
                    {vehicle.category_name}
                  </span>
                  <h1
                    id="vehicle-detail-title"
                    style={{ color: "var(--navy-900)" }}
                    className="mt-1.5 text-2xl font-extrabold"
                  >
                    {vehicle.brand} {vehicle.model}
                  </h1>
                  <p
                    style={{ color: "var(--slate-600)" }}
                    className="font-mono text-xs font-semibold"
                  >
                    Plat Sumatera Utara: {vehicle.plate_number} - Tahun{" "}
                    {vehicle.year} ({vehicle.color || "Standar"})
                  </p>
                </div>

                <div className="text-right tabular-nums">
                  <p
                    style={{ color: "var(--navy-900)" }}
                    className="text-2xl font-extrabold"
                  >
                    {formatRupiah(vehicle.daily_price)}
                  </p>
                  <p
                    style={{ color: "var(--slate-600)" }}
                    className="text-xs font-semibold"
                  >
                    Tarif Resmi / Hari
                  </p>
                </div>
              </div>

              <p style={{ color: "var(--slate-600)" }} className="text-sm">
                {vehicle.description ||
                  "Unit armada terawat siap jalan dengan pemeriksaan rutin bengkel resmi di Kota Medan."}
              </p>

              <div
                style={{
                  backgroundColor: "var(--slate-50)",
                  borderRadius: "var(--radius-control)",
                }}
                className="grid grid-cols-2 gap-3 border p-4 text-xs sm:grid-cols-4"
              >
                <div>
                  <p style={{ color: "var(--slate-600)" }}>Transmisi</p>
                  <p className="font-bold">
                    {vehicle.transmission === "automatic"
                      ? "Otomatis (AT)"
                      : "Manual (MT)"}
                  </p>
                </div>
                <div>
                  <p style={{ color: "var(--slate-600)" }}>Kapasitas</p>
                  <p className="font-bold">{vehicle.seats} Penumpang</p>
                </div>
                <div>
                  <p style={{ color: "var(--slate-600)" }}>Bahan Bakar</p>
                  <p className="font-bold capitalize">{vehicle.fuel}</p>
                </div>
                <div>
                  <p style={{ color: "var(--slate-600)" }}>Status Unit</p>
                  <p
                    style={{ color: "var(--success-text)" }}
                    className="font-bold"
                  >
                    {vehicle.status === "active"
                      ? "Siap Jalan"
                      : vehicle.status}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Blocked Ranges Calendar Info */}
          <section
            aria-labelledby="blocked-dates-heading"
            style={{
              backgroundColor: "var(--surface-white)",
              borderRadius: "var(--radius-card)",
              boxShadow: "var(--shadow-card)",
            }}
            className="space-y-3 border p-6"
          >
            <div className="flex items-center gap-2">
              <Calendar
                className="h-5 w-5"
                style={{ color: "var(--primary-600)" }}
                aria-hidden="true"
              />
              <h2
                id="blocked-dates-heading"
                style={{ color: "var(--navy-900)" }}
                className="text-base font-bold"
              >
                Jadwal Terkunci pada Unit Ini
              </h2>
            </div>

            {blockedRanges.length === 0 ? (
              <p style={{ color: "var(--slate-600)" }} className="text-xs">
                Unit ini tidak memiliki jadwal booking aktif maupun jadwal perawatan yang mengunci tanggal. Seluruh tanggal terbuka untuk dipesan.
              </p>
            ) : (
              <ul className="space-y-2 text-xs">
                {blockedRanges.map((b, i) => (
                  <li
                    key={`${b.start_date}-${i}`}
                    style={{
                      backgroundColor:
                        b.type === "maintenance"
                          ? "var(--warning-bg)"
                          : "var(--info-bg)",
                      color:
                        b.type === "maintenance"
                          ? "var(--warning-text)"
                          : "var(--info-text)",
                      borderRadius: "var(--radius-control)",
                    }}
                    className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 font-semibold tabular-nums"
                  >
                    <span>{b.label}</span>
                    <span>
                      {formatDateId(b.start_date)} s/d{" "}
                      {formatDateId(b.end_date)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Right Column: Price Calculator & Checkout Form */}
        <div className="lg:col-span-5">
          <section
            aria-labelledby="checkout-form-heading"
            style={{
              backgroundColor: "var(--surface-white)",
              borderRadius: "var(--radius-card)",
              boxShadow: "var(--shadow-elevated)",
            }}
            className="space-y-5 border p-6"
          >
            <div>
              <h2
                id="checkout-form-heading"
                style={{ color: "var(--navy-900)" }}
                className="text-lg font-bold"
              >
                Formulir Checkout & Kalkulator Biaya
              </h2>
              <p style={{ color: "var(--slate-600)" }} className="text-xs">
                Total biaya dihitung otomatis berdasarkan jumlah hari inklusif dan dikunci di sisi server.
              </p>
            </div>

            {!user ? (
              <div
                data-testid="checkout-login-prompt"
                style={{
                  backgroundColor: "var(--primary-50)",
                  borderColor: "var(--primary-600)",
                  borderRadius: "var(--radius-control)",
                }}
                className="space-y-3 border p-4 text-center"
              >
                <p
                  style={{ color: "var(--navy-900)" }}
                  className="text-sm font-bold"
                >
                  Masuk untuk Melanjutkan Pemesanan
                </p>
                <p style={{ color: "var(--slate-600)" }} className="text-xs">
                  Gunakan akun Google Anda untuk mengunci jadwal sewa kendaraan dan memantau status pesanan.
                </p>
                <div className="flex justify-center pt-1">
                  <AuthControls user={null} variant="light" />
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleCheckout}
                className="space-y-4"
                data-testid="checkout-form"
              >
                {errorMsg ? (
                  <div
                    role="alert"
                    data-testid="checkout-error-alert"
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

                {hasOverlapWithBlocked ? (
                  <div
                    role="alert"
                    style={{
                      backgroundColor: "var(--warning-bg)",
                      color: "var(--warning-text)",
                      borderColor: "var(--warning)",
                      borderRadius: "var(--radius-control)",
                    }}
                    className="border p-3 text-xs font-semibold"
                  >
                    Perhatian: Tanggal yang Anda pilih beririsan dengan jadwal terkunci unit ini. Silakan pilih tanggal lain.
                  </div>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="checkout-start-date"
                      className="block text-xs font-bold"
                    >
                      Tanggal Mulai (WIB)
                    </label>
                    <input
                      id="checkout-start-date"
                      data-testid="checkout-start-date"
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        if (endDate < e.target.value) {
                          setEndDate(e.target.value);
                        }
                      }}
                      style={{ borderRadius: "var(--radius-control)" }}
                      className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm tabular-nums"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="checkout-end-date"
                      className="block text-xs font-bold"
                    >
                      Tanggal Selesai (WIB)
                    </label>
                    <input
                      id="checkout-end-date"
                      data-testid="checkout-end-date"
                      type="date"
                      required
                      min={startDate}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      style={{ borderRadius: "var(--radius-control)" }}
                      className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm tabular-nums"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="checkout-pickup"
                      className="block text-xs font-bold"
                    >
                      <MapPin
                        className="mr-1 inline h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                      Lokasi Pengambilan
                    </label>
                    <select
                      id="checkout-pickup"
                      data-testid="checkout-pickup"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      style={{ borderRadius: "var(--radius-control)" }}
                      className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm"
                    >
                      {PICKUP_LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="checkout-return"
                      className="block text-xs font-bold"
                    >
                      <MapPin
                        className="mr-1 inline h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                      Lokasi Pengembalian
                    </label>
                    <select
                      id="checkout-return"
                      data-testid="checkout-return"
                      value={returnLocation}
                      onChange={(e) => setReturnLocation(e.target.value)}
                      style={{ borderRadius: "var(--radius-control)" }}
                      className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm"
                    >
                      {PICKUP_LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="checkout-phone"
                      className="block text-xs font-bold"
                    >
                      Nomor HP / WhatsApp Aktif
                    </label>
                    <input
                      id="checkout-phone"
                      data-testid="checkout-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="081260009988"
                      style={{ borderRadius: "var(--radius-control)" }}
                      className="mt-1 min-h-[44px] w-full border px-3 py-2 font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="checkout-sim"
                      className="block text-xs font-bold"
                    >
                      Nomor SIM A / SIM C
                    </label>
                    <input
                      id="checkout-sim"
                      data-testid="checkout-sim"
                      type="text"
                      required
                      value={driverLicenseNo}
                      onChange={(e) => setDriverLicenseNo(e.target.value)}
                      placeholder="1271082405990002"
                      style={{ borderRadius: "var(--radius-control)" }}
                      className="mt-1 min-h-[44px] w-full border px-3 py-2 font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="checkout-payment-method"
                    className="block text-xs font-bold"
                  >
                    <CreditCard
                      className="mr-1 inline h-3.5 w-3.5"
                      aria-hidden="true"
                    />
                    Metode Pembayaran
                  </label>
                  <select
                    id="checkout-payment-method"
                    data-testid="checkout-payment-method"
                    value={paymentMethod}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as PaymentMethod)
                    }
                    style={{ borderRadius: "var(--radius-control)" }}
                    className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm"
                  >
                    <option value="transfer">Transfer Bank (BCA / Mandiri)</option>
                    <option value="qris">QRIS RentGo Medan</option>
                    <option value="cash">Tunai di Kantor RentGo Medan</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="checkout-notes"
                    className="block text-xs font-bold"
                  >
                    Catatan Tambahan (Opsional)
                  </label>
                  <textarea
                    id="checkout-notes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Jemput di pintu kedatangan domestik Kualanamu pukul 10.00 WIB..."
                    style={{ borderRadius: "var(--radius-control)" }}
                    className="mt-1 w-full border px-3 py-2 text-xs"
                  />
                </div>

                {/* Price Breakdown Summary */}
                <div
                  style={{
                    backgroundColor: "var(--slate-50)",
                    borderRadius: "var(--radius-control)",
                  }}
                  className="space-y-2 border p-4 text-xs"
                >
                  <div className="flex justify-between">
                    <span style={{ color: "var(--slate-600)" }}>
                      Tarif Harian ({vehicle.brand} {vehicle.model})
                    </span>
                    <span className="font-semibold tabular-nums">
                      {formatRupiah(vehicle.daily_price)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--slate-600)" }}>
                      Durasi Sewa Inklusif
                    </span>
                    <span className="font-semibold tabular-nums">
                      {rentalDays} Hari
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-sm font-extrabold">
                    <span style={{ color: "var(--navy-900)" }}>
                      Total Pembayaran
                    </span>
                    <span
                      style={{ color: "var(--primary-600)" }}
                      className="tabular-nums"
                      data-testid="checkout-total-price"
                    >
                      {formatRupiah(totalPrice)}
                    </span>
                  </div>
                </div>

                {/* Bank Instructions + 24-hour Deadline */}
                <div
                  style={{
                    backgroundColor: "var(--info-bg)",
                    color: "var(--info-text)",
                    borderRadius: "var(--radius-control)",
                  }}
                  className="space-y-1.5 p-3.5 text-xs"
                >
                  <p className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    <span>Rekening Resmi Pembayaran:</span>
                  </p>
                  <p className="font-mono font-semibold">{bankInfo}</p>
                  <p className="flex items-center gap-1.5 pt-1 text-[11px]">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      Batas waktu unggah bukti bayar: 24 jam sejak pesanan dibuat (otomatis expired jika lewat).
                    </span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting || hasOverlapWithBlocked}
                  data-testid="submit-booking-button"
                  style={{
                    backgroundColor: "var(--primary-600)",
                    color: "var(--surface-white)",
                    borderRadius: "var(--radius-control)",
                  }}
                  className="flex min-h-[48px] w-full items-center justify-center gap-2 px-5 py-3 text-sm font-bold transition-opacity hover:opacity-95 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  <span>
                    {submitting
                      ? "Mengunci Jadwal & Membuat Pesanan..."
                      : "Konfirmasi & Buat Pesanan Sekarang"}
                  </span>
                </button>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
