import React from "react";
import { getCurrentSessionUser } from "@/lib/session";
import { ProfileForm } from "@/components/book/profile-form";
import { AuthControls } from "@/components/shared/auth-controls";

export const dynamic = "force-dynamic";

export default async function CustomerProfilePage() {
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
          Masuk untuk Mengatur Profil Penyewa
        </h1>
        <p style={{ color: "var(--slate-600)" }} className="text-sm">
          Lengkapi nomor WhatsApp dan nomor SIM Anda agar proses checkout kendaraan berjalan instan.
        </p>
        <div className="flex justify-center pt-2">
          <AuthControls user={null} variant="light" />
        </div>
      </div>
    );
  }

  return <ProfileForm user={user} />;
}
