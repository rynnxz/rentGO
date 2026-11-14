"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import type { UserRecord } from "@/lib/types";

export function ProfileForm({ user }: { user: UserRecord }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(user.full_name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [driverLicenseNo, setDriverLicenseNo] = useState(
    user.driver_license_no ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setFeedback(null);
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim(),
          driver_license_no: driverLicenseNo.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal memperbarui profil.");
      }
      setFeedback(
        "Profil, Nomor HP, dan Nomor SIM berhasil disimpan untuk proses checkout otomatis.",
      );
      router.refresh();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal menyimpan profil.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-testid="profile-form"
      style={{
        backgroundColor: "var(--surface-white)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card)",
      }}
      className="mx-auto max-w-xl space-y-5 border p-6"
    >
      <div>
        <h1
          style={{ color: "var(--navy-900)" }}
          className="text-xl font-bold"
        >
          Profil Penyewa & Identitas SIM
        </h1>
        <p style={{ color: "var(--slate-600)" }} className="mt-1 text-xs">
          Data Nomor HP dan Nomor SIM A/C wajib diisi satu kali dan akan otomatis digunakan setiap kali Anda melakukan pemesanan armada.
        </p>
      </div>

      {feedback ? (
        <div
          role="status"
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

      <div>
        <label htmlFor="profile-email" className="block text-xs font-bold">
          Email Google Terverifikasi
        </label>
        <input
          id="profile-email"
          type="email"
          disabled
          value={user.email}
          style={{
            backgroundColor: "var(--slate-100)",
            color: "var(--slate-600)",
            borderRadius: "var(--radius-control)",
          }}
          className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="profile-name" className="block text-xs font-bold">
          Nama Lengkap Sesuai KTP/SIM
        </label>
        <input
          id="profile-name"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={{ borderRadius: "var(--radius-control)" }}
          className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="profile-phone" className="block text-xs font-bold">
          Nomor HP / WhatsApp Aktif
        </label>
        <input
          id="profile-phone"
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
        <label htmlFor="profile-sim" className="block text-xs font-bold">
          Nomor SIM A / SIM C
        </label>
        <input
          id="profile-sim"
          type="text"
          required
          value={driverLicenseNo}
          onChange={(e) => setDriverLicenseNo(e.target.value)}
          placeholder="1271082405990002"
          style={{ borderRadius: "var(--radius-control)" }}
          className="mt-1 min-h-[44px] w-full border px-3 py-2 font-mono text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        style={{
          backgroundColor: "var(--primary-600)",
          color: "var(--surface-white)",
          borderRadius: "var(--radius-control)",
        }}
        className="inline-flex min-h-[44px] items-center gap-2 px-5 py-2.5 text-sm font-semibold"
      >
        <Save className="h-4 w-4" aria-hidden="true" />
        <span>{saving ? "Menyimpan..." : "Simpan Perubahan Profil"}</span>
      </button>
    </form>
  );
}
