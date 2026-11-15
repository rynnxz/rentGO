"use client";

import React, { useState } from "react";
import { LoadingBar, LoadingSpinner } from "@/components/ui/loading";
import type { VehicleCategoryRecord } from "@/lib/types";

export function HeroSearchForm({
  bookUrl,
  today,
  tomorrow,
  categories,
}: {
  bookUrl: string;
  today: string;
  tomorrow: string;
  categories: VehicleCategoryRecord[];
}) {
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      action={bookUrl}
      method="GET"
      onSubmit={() => setSubmitting(true)}
      aria-busy={submitting}
      data-testid="hero-quick-search-form"
      style={{
        backgroundColor: "var(--surface-white)",
        color: "var(--slate-900)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-elevated)",
      }}
      className="overflow-hidden border"
    >
      {submitting ? (
        <LoadingBar
          tone="primary"
          height="4px"
          label="Memeriksa ketersediaan unit berdasarkan tanggal pilihan"
          testId="hero-search-loading-bar"
        />
      ) : null}

      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        {bookUrl.includes("?site=book") ? (
          <input type="hidden" name="site" value="book" />
        ) : null}

        <div>
          <label htmlFor="hero-start-date" className="block text-xs font-bold">
            Tanggal Mulai (WIB)
          </label>
          <input
            id="hero-start-date"
            name="start"
            type="date"
            defaultValue={today}
            style={{ borderRadius: "var(--radius-control)" }}
            className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm tabular-nums"
          />
        </div>

        <div>
          <label htmlFor="hero-end-date" className="block text-xs font-bold">
            Tanggal Selesai (WIB)
          </label>
          <input
            id="hero-end-date"
            name="end"
            type="date"
            defaultValue={tomorrow}
            style={{ borderRadius: "var(--radius-control)" }}
            className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm tabular-nums"
          />
        </div>

        <div>
          <label htmlFor="hero-category" className="block text-xs font-bold">
            Kategori Kendaraan
          </label>
          <select
            id="hero-category"
            name="category"
            defaultValue="all"
            style={{ borderRadius: "var(--radius-control)" }}
            className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={submitting}
            data-testid="hero-search-submit"
            style={{
              backgroundColor: "var(--primary-600)",
              color: "var(--primary-fg)",
              borderRadius: "var(--radius-control)",
            }}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold transition-opacity hover:opacity-95 disabled:opacity-75"
          >
            {submitting ? (
              <>
                <LoadingSpinner
                  size="xs"
                  tone="light"
                  label="Memeriksa ketersediaan armada"
                />
                <span>Memeriksa Armada...</span>
              </>
            ) : (
              <span>Cek Ketersediaan Unit</span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
