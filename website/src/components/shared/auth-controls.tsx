"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  KeyRound,
  LogIn,
  LogOut,
  Mail,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import {
  getFirebaseAuthErrorMessage,
  registerWithEmailPasswordClient,
  resolveFirebaseClientConfig,
  signInWithEmailPasswordClient,
  signInWithGooglePopupClient,
} from "@/lib/firebase-client";
import { LoadingSpinner, LoadingStatusBanner } from "@/components/ui/loading";
import type { UserRecord } from "@/lib/types";

export function AuthControls({
  user,
  variant = "light",
}: {
  user: UserRecord | null;
  variant?: "light" | "dark";
}) {
  const router = useRouter();
  const instanceId = React.useId();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [authAction, setAuthAction] = useState<
    "google" | "email" | "logout" | null
  >(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

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
        throw new Error(data.error || "Gagal masuk ke sesi RentGo.");
      }
      dialogRef.current?.close();
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal masuk.");
    } finally {
      setLoading(false);
      setAuthAction(null);
    }
  }

  function handleOpenAuthModal() {
    setErrorMsg(null);
    dialogRef.current?.showModal();
  }

  async function handleLiveGooglePopup() {
    setErrorMsg(null);
    setAuthAction("google");
    setLoading(true);
    try {
      const token = await signInWithGooglePopupClient();
      await completeSessionLogin(token);
    } catch (err) {
      setLoading(false);
      setAuthAction(null);
      setErrorMsg(getFirebaseAuthErrorMessage(err, "google"));
    }
  }

  async function handleEmailPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || password.length < 6) {
      setErrorMsg("Masukkan email yang valid dan kata sandi minimal 6 karakter.");
      return;
    }
    setAuthAction("email");
    setLoading(true);
    setErrorMsg(null);

    const config = await resolveFirebaseClientConfig();
    if (!config) {
      if (process.env.NODE_ENV !== "production") {
        const cleanEmail = email.trim().toLowerCase();
        await completeSessionLogin(
          `firebase-email:${JSON.stringify({
            uid: `fb-email-${cleanEmail.replace(/[^a-z0-9]/g, "-")}`,
            email: cleanEmail,
            name: fullName.trim() || cleanEmail.split("@")[0],
          })}`,
        );
        return;
      }
      setLoading(false);
      setAuthAction(null);
      setErrorMsg(
        "Konfigurasi Firebase Auth belum tersedia pada server produksi.",
      );
      return;
    }

    try {
      const token =
        authMode === "register"
          ? await registerWithEmailPasswordClient(email, password, fullName)
          : await signInWithEmailPasswordClient(email, password);
      await completeSessionLogin(token);
    } catch (err) {
      setLoading(false);
      setAuthAction(null);
      setErrorMsg(getFirebaseAuthErrorMessage(err, "email"));
    }
  }

  async function handleLogout() {
    setAuthAction("logout");
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
      setAuthAction(null);
    }
  }

  if (user) {
    const isDark = variant === "dark";
    return (
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 whitespace-nowrap">
        <div
          style={{
            backgroundColor: isDark
              ? "rgb(255 255 255 / 0.1)"
              : "var(--primary-50)",
            color: isDark ? "var(--on-dark-fg)" : "var(--fg)",
            borderColor: isDark
              ? "rgb(255 255 255 / 0.2)"
              : "var(--primary-100)",
            borderRadius: "var(--radius-control)",
          }}
          className="inline-flex min-h-[40px] items-center gap-1.5 border px-2.5 py-1.5 text-xs font-semibold"
          data-testid="active-user-pill"
        >
          {user.role === "admin" ? (
            <ShieldCheck
              className="h-3.5 w-3.5 shrink-0"
              style={{ color: "var(--accent-500)" }}
              aria-hidden="true"
            />
          ) : (
            <UserIcon
              className="h-3.5 w-3.5 shrink-0"
              style={{ color: "var(--secondary)" }}
              aria-hidden="true"
            />
          )}
          <span className=" font-semibold">
            {user.full_name}
          </span>
          <span
            style={{
              backgroundColor:
                user.role === "admin"
                  ? "var(--accent-500)"
                  : "var(--secondary-100)",
              color:
                user.role === "admin"
                  ? "var(--on-amber-fg)"
                  : "var(--secondary-700)",
              borderRadius: "var(--radius-badge)",
            }}
            className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase"
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
              : "var(--surface-elevated)",
            color: isDark ? "var(--on-dark-fg)" : "var(--fg)",
            borderColor: isDark
              ? "rgb(255 255 255 / 0.2)"
              : "var(--border)",
            borderRadius: "var(--radius-control)",
          }}
          className="inline-flex min-h-[40px] items-center gap-1.5 border px-2.5 py-1.5 text-xs font-semibold transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:opacity-60"
        >
          {authAction === "logout" ? (
            <LoadingSpinner
              size="xs"
              tone={isDark ? "light" : "primary"}
              label="Keluar dari sesi"
            />
          ) : (
            <LogOut className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          )}
          <span>{authAction === "logout" ? "Keluar..." : "Keluar"}</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpenAuthModal}
        disabled={loading}
        data-testid="login-google-button"
        style={{
          backgroundColor:
            variant === "dark" ? "var(--on-dark-fg)" : "var(--primary-600)",
          color:
            variant === "dark" ? "var(--brand-navy-deep)" : "var(--primary-fg)",
          borderRadius: "var(--radius-control)",
        }}
        className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 text-xs font-bold shadow-[var(--shadow-xs)] transition-all hover:opacity-95 disabled:opacity-70"
      >
        {loading ? (
          <LoadingSpinner
            size="xs"
            tone={variant === "dark" ? "primary" : "light"}
            label="Memproses autentikasi"
          />
        ) : (
          <LogIn className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        )}
        <span>{loading ? "Memproses..." : "Masuk / Daftar"}</span>
      </button>

      {/* Native HTML <dialog> for Firebase Auth (Email/Password + Google Sign-In) */}
      <dialog
        ref={dialogRef}
        aria-labelledby={`${instanceId}-dialog-title`}
        style={{
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-elevated)",
        }}
        className="m-auto w-[calc(100vw-2rem)] max-w-md overscroll-contain border p-6 text-left"
      >
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span
                style={{
                  backgroundColor: "var(--secondary-50)",
                  color: "var(--secondary-700)",
                  borderColor: "var(--secondary-100)",
                  borderRadius: "var(--radius-badge)",
                }}
                className="inline-block border px-2 py-0.5 text-[10px] font-bold uppercase"
              >
                Firebase Auth • rentgo-medan
              </span>
              <h2
                id={`${instanceId}-dialog-title`}
                style={{ color: "var(--fg)" }}
                className="mt-1 text-lg font-extrabold"
              >
                Masuk ke Ekosistem RentGo Medan
              </h2>
              <p style={{ color: "var(--fg-secondary)" }} className="mt-0.5 text-xs">
                Satu kali login berlaku otomatis untuk seluruh halaman (<code>/</code>, <code>/book</code>, dan <code>/admin</code>).
              </p>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              disabled={loading}
              style={{
                backgroundColor: "var(--bg-subtle)",
                color: "var(--fg-secondary)",
                borderRadius: "var(--radius-control)",
              }}
              className="px-2.5 py-1 text-xs font-bold hover:text-[var(--fg)] disabled:opacity-50"
            >
              Tutup
            </button>
          </div>

          {loading ? (
            <LoadingStatusBanner
              title={
                authAction === "google"
                  ? "Memverifikasi autentikasi Google OAuth..."
                  : "Memverifikasi kredensial dan membuat sesi aman..."
              }
              description="Menyinkronkan sesi login lintas domain (/ , /book, /admin)."
              tone="primary"
              testId="auth-loading-banner"
            />
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
              className="border p-3 text-xs font-medium"
            >
              {errorMsg}
            </div>
          ) : null}

          {/* 1. Live Google OAuth Popup Button */}
          <button
            type="button"
            disabled={loading}
            onClick={handleLiveGooglePopup}
            style={{
              backgroundColor: "var(--brand-navy-deep)",
              color: "var(--on-dark-fg)",
              borderRadius: "var(--radius-control)",
            }}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 border border-white/10 px-4 py-2.5 text-xs font-bold transition-opacity hover:opacity-95 disabled:opacity-60"
          >
            {authAction === "google" ? (
              <LoadingSpinner
                size="xs"
                tone="light"
                label="Memproses Google OAuth"
              />
            ) : (
              <LogIn
                className="h-4 w-4"
                style={{ color: "var(--accent-500)" }}
                aria-hidden="true"
              />
            )}
            <span>
              {authAction === "google"
                ? "Menghubungkan ke Google OAuth..."
                : "Lanjutkan dengan Google OAuth (rentgo-medan)"}
            </span>
          </button>

          {/* 2. Email & Password Authentication Form */}
          <form
            onSubmit={handleEmailPasswordSubmit}
            className="space-y-3 rounded-[var(--radius-md)] border p-3.5"
            style={{ backgroundColor: "var(--bg)" }}
          >
            <div className="flex items-center justify-between">
              <span
                style={{ color: "var(--fg)" }}
                className="inline-flex items-center gap-1.5 text-xs font-bold"
              >
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                <span>
                  {authMode === "login"
                    ? "Masuk dengan Email & Password"
                    : "Daftar Akun Email Baru"}
                </span>
              </span>
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  setAuthMode((m) => (m === "login" ? "register" : "login"))
                }
                style={{ color: "var(--primary)" }}
                className="text-xs font-bold underline disabled:opacity-50"
              >
                {authMode === "login" ? "Daftar Baru" : "Sudah Punya Akun?"}
              </button>
            </div>

            {authMode === "register" ? (
              <div>
                <label
                  htmlFor={`${instanceId}-fullname-input`}
                  className="block text-xs font-semibold"
                >
                  Nama Lengkap Sesuai SIM
                </label>
                <input
                  id={`${instanceId}-fullname-input`}
                  type="text"
                  disabled={loading}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  style={{
                    backgroundColor: "var(--surface-elevated)",
                    borderRadius: "var(--radius-control)",
                  }}
                  className="mt-1 min-h-[40px] w-full border px-3 py-1.5 text-xs disabled:opacity-60"
                />
              </div>
            ) : null}

            <div className="grid gap-2.5 *:min-w-0 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={`${instanceId}-email-input`}
                  className="block text-xs font-semibold"
                >
                  Alamat Email
                </label>
                <input
                  id={`${instanceId}-email-input`}
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@gmail.com"
                  style={{
                    backgroundColor: "var(--surface-elevated)",
                    borderRadius: "var(--radius-control)",
                  }}
                  className="mt-1 min-h-[40px] w-full border px-3 py-1.5 text-xs disabled:opacity-60"
                />
              </div>
              <div>
                <label
                  htmlFor={`${instanceId}-password-input`}
                  className="block text-xs font-semibold"
                >
                  Kata Sandi
                </label>
                <input
                  id={`${instanceId}-password-input`}
                  type="password"
                  required
                  minLength={6}
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 karakter"
                  style={{
                    backgroundColor: "var(--surface-elevated)",
                    borderRadius: "var(--radius-control)",
                  }}
                  className="mt-1 min-h-[40px] w-full border px-3 py-1.5 text-xs disabled:opacity-60"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim() || password.length < 6}
              style={{
                backgroundColor: "var(--primary-600)",
                color: "var(--primary-fg)",
                borderRadius: "var(--radius-control)",
              }}
              className="flex min-h-[40px] w-full items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold disabled:opacity-50"
            >
              {authAction === "email" ? (
                <LoadingSpinner
                  size="xs"
                  tone="light"
                  label="Memverifikasi email dan kata sandi"
                />
              ) : (
                <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>
                {authAction === "email"
                  ? authMode === "login"
                    ? "Memverifikasi Akun..."
                    : "Mendaftarkan Akun..."
                  : authMode === "login"
                    ? "Masuk dengan Email"
                    : "Daftar & Masuk Sekarang"}
              </span>
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
}
