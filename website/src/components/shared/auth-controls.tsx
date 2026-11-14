"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";
import {
  hasFirebaseClientConfig,
  signInWithGooglePopupClient,
} from "@/lib/firebase-client";
import type { UserRecord } from "@/lib/types";

export function AuthControls({
  user,
  variant = "light",
}: {
  user: UserRecord | null;
  variant?: "light" | "dark";
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");

  async function completeSessionLogin(idToken: string) {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal masuk.");
      }
      dialogRef.current?.close();
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal masuk.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLoginClick() {
    setErrorMsg(null);
    if (hasFirebaseClientConfig()) {
      try {
        setLoading(true);
        const token = await signInWithGooglePopupClient();
        await completeSessionLogin(token);
      } catch (err) {
        setLoading(false);
        setErrorMsg(
          err instanceof Error
            ? err.message
            : "Popup login Google dibatalkan atau gagal.",
        );
      }
      return;
    }

    // Open native <dialog> for Firebase Auth Emulator / Local Development Account Picker
    dialogRef.current?.showModal();
  }

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (user) {
    const isDark = variant === "dark";
    return (
      <div className="flex flex-wrap items-center gap-2">
        <div
          style={{
            backgroundColor: isDark
              ? "rgb(255 255 255 / 0.1)"
              : "var(--primary-50)",
            color: isDark ? "var(--surface-white)" : "var(--navy-900)",
            borderRadius: "var(--radius-control)",
          }}
          className="inline-flex min-h-[44px] items-center gap-2 border px-3 py-1.5 text-xs font-semibold"
          data-testid="active-user-pill"
        >
          {user.role === "admin" ? (
            <ShieldCheck
              className="h-4 w-4 shrink-0"
              style={{ color: "var(--accent-500)" }}
              aria-hidden="true"
            />
          ) : (
            <UserIcon
              className="h-4 w-4 shrink-0"
              style={{ color: "var(--primary-600)" }}
              aria-hidden="true"
            />
          )}
          <span className="max-w-[150px] truncate">{user.full_name}</span>
          <span
            style={{
              backgroundColor:
                user.role === "admin"
                  ? "var(--accent-500)"
                  : "var(--primary-100)",
              color:
                user.role === "admin"
                  ? "var(--navy-900)"
                  : "var(--primary-700)",
              borderRadius: "var(--radius-badge)",
            }}
            className="px-1.5 py-0.5 text-[11px] font-bold uppercase"
          >
            {user.role}
          </span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loading}
          data-testid="logout-button"
          style={{
            backgroundColor: isDark
              ? "rgb(255 255 255 / 0.12)"
              : "var(--surface-white)",
            color: isDark ? "var(--surface-white)" : "var(--slate-900)",
            borderRadius: "var(--radius-control)",
          }}
          className="inline-flex min-h-[44px] items-center gap-1.5 border px-3 py-2 text-xs font-semibold transition-colors hover:opacity-90"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span>Keluar</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleGoogleLoginClick}
        disabled={loading}
        data-testid="login-google-button"
        style={{
          backgroundColor:
            variant === "dark" ? "var(--surface-white)" : "var(--primary-600)",
          color:
            variant === "dark" ? "var(--navy-900)" : "var(--surface-white)",
          borderRadius: "var(--radius-control)",
        }}
        className="inline-flex min-h-[44px] items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors hover:opacity-95"
      >
        <LogIn className="h-4 w-4" aria-hidden="true" />
        <span>{loading ? "Memproses..." : "Masuk dengan Google"}</span>
      </button>

      {/* Native HTML <dialog> following modern-web-guidance (no redundant role/aria-modal) */}
      <dialog
        ref={dialogRef}
        aria-labelledby="google-auth-dialog-title"
        style={{
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-elevated)",
        }}
        className="m-auto w-full max-w-md border p-6 text-left"
      >
        <div className="space-y-4">
          <div>
            <h2
              id="google-auth-dialog-title"
              style={{ color: "var(--navy-900)" }}
              className="text-lg font-bold"
            >
              Masuk dengan Akun Google (Firebase Auth Emulator)
            </h2>
            <p style={{ color: "var(--slate-600)" }} className="mt-1 text-sm">
              Pilih akun simulasi Google Sign-In untuk lingkungan lokal atau masukkan akun Google Anda. Sesi disimpan di cookie{" "}
              <code>__session</code> lintas subdomain.
            </p>
          </div>

          {errorMsg ? (
            <div
              role="alert"
              style={{
                backgroundColor: "var(--danger-bg)",
                color: "var(--danger-text)",
                borderColor: "var(--danger)",
                borderRadius: "var(--radius-control)",
              }}
              className="border p-3 text-xs font-medium"
            >
              {errorMsg}
            </div>
          ) : null}

          <div className="space-y-2">
            <button
              type="button"
              data-testid="emulator-login-customer"
              disabled={loading}
              onClick={() =>
                completeSessionLogin(
                  `emulator-google:${JSON.stringify({
                    uid: "firebase-cust-nadia",
                    email: "nadia.siregar@gmail.com",
                    name: "Nadia Siregar",
                  })}`,
                )
              }
              style={{
                backgroundColor: "var(--primary-50)",
                color: "var(--navy-900)",
                borderColor: "var(--primary-600)",
                borderRadius: "var(--radius-control)",
              }}
              className="flex min-h-[48px] w-full items-center justify-between border px-4 py-2.5 text-left text-sm font-semibold hover:opacity-90"
            >
              <span>
                Nadia Siregar{" "}
                <span
                  style={{ color: "var(--slate-600)" }}
                  className="block text-xs font-normal"
                >
                  nadia.siregar@gmail.com
                </span>
              </span>
              <span
                style={{
                  backgroundColor: "var(--primary-100)",
                  color: "var(--primary-700)",
                  borderRadius: "var(--radius-badge)",
                }}
                className="px-2 py-0.5 text-xs font-bold"
              >
                Customer
              </span>
            </button>

            <button
              type="button"
              data-testid="emulator-login-admin"
              disabled={loading}
              onClick={() =>
                completeSessionLogin(
                  `emulator-google:${JSON.stringify({
                    uid: "firebase-admin-akbar",
                    email: "akbarriansyah339@gmail.com",
                    name: "Akbar Riansyah",
                  })}`,
                )
              }
              style={{
                backgroundColor: "var(--accent-50)",
                color: "var(--navy-900)",
                borderColor: "var(--accent-500)",
                borderRadius: "var(--radius-control)",
              }}
              className="flex min-h-[48px] w-full items-center justify-between border px-4 py-2.5 text-left text-sm font-semibold hover:opacity-90"
            >
              <span>
                Akbar Riansyah{" "}
                <span
                  style={{ color: "var(--slate-600)" }}
                  className="block text-xs font-normal"
                >
                  akbarriansyah339@gmail.com
                </span>
              </span>
              <span
                style={{
                  backgroundColor: "var(--accent-500)",
                  color: "var(--navy-900)",
                  borderRadius: "var(--radius-badge)",
                }}
                className="px-2 py-0.5 text-xs font-bold"
              >
                Admin
              </span>
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!customEmail.trim()) return;
              completeSessionLogin(
                `emulator-google:${JSON.stringify({
                  email: customEmail.trim(),
                  name: customName.trim() || customEmail.split("@")[0],
                })}`,
              );
            }}
            className="space-y-3 border-t pt-3"
          >
            <div>
              <label
                htmlFor="emulator-custom-email"
                className="block text-xs font-semibold"
              >
                Atau masuk dengan email Google lain
              </label>
              <input
                id="emulator-custom-email"
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="nama@gmail.com"
                style={{ borderRadius: "var(--radius-control)" }}
                className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="emulator-custom-name"
                className="block text-xs font-semibold"
              >
                Nama Lengkap
              </label>
              <input
                id="emulator-custom-name"
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Nama Anda"
                style={{ borderRadius: "var(--radius-control)" }}
                className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                style={{
                  backgroundColor: "var(--slate-100)",
                  color: "var(--slate-900)",
                  borderRadius: "var(--radius-control)",
                }}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || !customEmail.trim()}
                style={{
                  backgroundColor: "var(--primary-600)",
                  color: "var(--surface-white)",
                  borderRadius: "var(--radius-control)",
                }}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold disabled:opacity-50"
              >
                Masuk
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
