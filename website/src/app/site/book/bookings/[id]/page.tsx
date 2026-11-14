import React from "react";
import { notFound } from "next/navigation";
import { getEnv } from "@/lib/env";
import { getBookingById } from "@/lib/repository";
import { getCurrentSessionUser } from "@/lib/session";
import { BookingDetailClient } from "@/components/book/booking-detail-client";
import { AuthControls } from "@/components/shared/auth-controls";

export const dynamic = "force-dynamic";

export default async function CustomerBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentSessionUser();

  if (!user) {
    return (
      <div
        style={{
          backgroundColor: "var(--surface-white)",
          borderRadius: "var(--radius-card)",
        }}
        className="mx-auto max-w-lg space-y-4 border p-8 text-center"
      >
        <h1
          style={{ color: "var(--navy-900)" }}
          className="text-xl font-bold"
        >
          Masuk untuk Melihat Detail Pesanan
        </h1>
        <div className="flex justify-center">
          <AuthControls user={null} variant="light" />
        </div>
      </div>
    );
  }

  const booking = await getBookingById(id);
  if (!booking) {
    notFound();
  }

  if (user.role !== "admin" && booking.user_id !== user.id) {
    return (
      <div
        data-testid="booking-cross-role-denied"
        style={{
          backgroundColor: "var(--surface-white)",
          borderRadius: "var(--radius-card)",
        }}
        className="mx-auto max-w-lg space-y-3 border p-8 text-center"
      >
        <span
          style={{
            backgroundColor: "var(--danger-bg)",
            color: "var(--danger-text)",
            borderRadius: "var(--radius-badge)",
          }}
          className="inline-block px-2.5 py-1 text-xs font-bold uppercase"
        >
          HTTP 403 - Akses Ditolak
        </span>
        <h1
          style={{ color: "var(--navy-900)" }}
          className="text-xl font-bold"
        >
          Pesanan Milik Pengguna Lain
        </h1>
        <p style={{ color: "var(--slate-600)" }} className="text-sm">
          Anda hanya dapat mengakses rincian pesanan yang terdaftar pada akun Anda sendiri.
        </p>
      </div>
    );
  }

  const env = getEnv();

  return (
    <BookingDetailClient
      initialBooking={booking}
      bankInfo={env.PAYMENT_BANK_INFO}
      whatsappNumber={env.WHATSAPP_NUMBER}
    />
  );
}
