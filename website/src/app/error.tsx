"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[80dvh] flex-col items-center justify-center px-4 py-16 text-center">
      <div
        role="alert"
        style={{
          backgroundColor: "var(--surface-white)",
          borderRadius: "var(--radius-card)",
        }}
        className="w-full max-w-lg border p-8"
      >
        <h1 style={{ color: "var(--danger)" }} className="text-xl font-bold">
          Terjadi Kendala saat Memuat Halaman
        </h1>
        <p style={{ color: "var(--slate-600)" }} className="mt-2 text-sm">
          {error.message ||
            "Permintaan tidak dapat diselesaikan saat ini. Silakan muat ulang halaman."}
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            backgroundColor: "var(--primary-600)",
            color: "var(--on-dark-fg)",
            borderRadius: "var(--radius-control)",
          }}
          className="mt-5 inline-flex min-h-[44px] items-center px-5 py-2.5 text-sm font-semibold"
        >
          Coba Lagi
        </button>
      </div>
    </main>
  );
}
