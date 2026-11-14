"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, Fuel, Gauge, Sparkles, Users } from "lucide-react";
import { formatDateId, formatRupiah } from "@/lib/utils";
import { calculateRentalDays } from "@/lib/pricing";
import type {
  AiRecommendationResponse,
  VehicleCategoryRecord,
  VehicleWithCategory,
} from "@/lib/types";

export function CatalogView({
  initialVehicles,
  categories,
  initialStartDate,
  initialEndDate,
  initialCategorySlug = "all",
}: {
  initialVehicles: VehicleWithCategory[];
  categories: VehicleCategoryRecord[];
  initialStartDate: string;
  initialEndDate: string;
  initialCategorySlug?: string;
}) {
  const [vehicles, setVehicles] =
    useState<VehicleWithCategory[]>(initialVehicles);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [categorySlug, setCategorySlug] = useState(initialCategorySlug);
  const [transmission, setTransmission] = useState("all");
  const [minSeats, setMinSeats] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "newest">(
    "price_asc",
  );
  const [loadingDates, setLoadingDates] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

  // AI Recommendation Panel State
  const [aiOpen, setAiOpen] = useState(true);
  const [aiQuery, setAiQuery] = useState(
    "Saya butuh mobil keluarga 7 kursi matic yang nyaman untuk perjalanan dari Medan ke Danau Toba selama 3 hari dengan budget sekitar 500rb per hari.",
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AiRecommendationResponse | null>(
    null,
  );

  const rentalDays = useMemo(() => {
    try {
      return calculateRentalDays(startDate, endDate);
    } catch {
      return 1;
    }
  }, [startDate, endDate]);

  async function refreshAvailabilityForDates(
    nextStart: string,
    nextEnd: string,
  ) {
    if (nextEnd < nextStart) {
      setDateError("Tanggal selesai tidak boleh sebelum tanggal mulai sewa.");
      return;
    }
    setDateError(null);
    setLoadingDates(true);
    try {
      const qs = new URLSearchParams({
        onlyAvailable: "true",
        startDate: nextStart,
        endDate: nextEnd,
      });
      const res = await fetch(`/api/vehicles?${qs.toString()}`);
      const json = await res.json();
      if (res.ok && Array.isArray(json.data)) {
        setVehicles(json.data);
      }
    } finally {
      setLoadingDates(false);
    }
  }

  async function handleAskAi(e: React.FormEvent) {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          query_text: aiQuery.trim(),
          start_date: startDate,
          end_date: endDate,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal meminta rekomendasi AI.");
      }
      setAiResult(json.data ?? json);
    } catch (err) {
      setAiError(
        err instanceof Error ? err.message : "Gagal memuat rekomendasi.",
      );
    } finally {
      setAiLoading(false);
    }
  }

  const filteredVehicles = useMemo(() => {
    const list = vehicles.filter((v) => {
      if (categorySlug !== "all" && v.category_slug !== categorySlug) {
        return false;
      }
      if (transmission !== "all" && v.transmission !== transmission) {
        return false;
      }
      if (minSeats > 0 && v.seats < minSeats) {
        return false;
      }
      if (maxPrice > 0 && v.daily_price > maxPrice) {
        return false;
      }
      return true;
    });

    if (sortBy === "price_asc") {
      list.sort((a, b) => a.daily_price - b.daily_price);
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => b.daily_price - a.daily_price);
    } else {
      list.sort((a, b) => b.year - a.year);
    }
    return list;
  }, [vehicles, categorySlug, transmission, minSeats, maxPrice, sortBy]);

  return (
    <div className="space-y-8" data-testid="book-catalog-view">
      {/* Top Banner + Date Availability Search */}
      <section
        aria-labelledby="catalog-search-heading"
        style={{
          backgroundColor: "var(--navy-900)",
          color: "var(--surface-white)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-elevated)",
        }}
        className="p-6 sm:p-8"
      >
        <div className="max-w-3xl space-y-2">
          <span
            style={{
              backgroundColor: "var(--accent-500)",
              color: "var(--navy-900)",
              borderRadius: "var(--radius-badge)",
            }}
            className="inline-block px-2.5 py-1 text-xs font-bold uppercase"
          >
            Ketersediaan Real-Time WIB
          </span>
          <h1
            id="catalog-search-heading"
            className="text-2xl font-extrabold sm:text-3xl"
          >
            Pilih Tanggal Sewa & Temukan Armada Siap Jalan di Medan
          </h1>
          <p className="text-sm opacity-85">
            Sistem otomatis menyembunyikan kendaraan yang sedang disewa atau berada dalam jadwal perawatan bengkel pada rentang tanggal pilihan Anda.
          </p>
        </div>

        <div
          style={{
            backgroundColor: "var(--surface-white)",
            color: "var(--slate-900)",
            borderRadius: "var(--radius-card)",
          }}
          className="mt-6 grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-6"
        >
          <div>
            <label
              htmlFor="search-start-date"
              className="block text-xs font-bold"
            >
              Tanggal Mulai (WIB)
            </label>
            <input
              id="search-start-date"
              data-testid="search-start-date"
              type="date"
              value={startDate}
              onChange={(e) => {
                const next = e.target.value;
                setStartDate(next);
                const adjustedEnd = endDate < next ? next : endDate;
                setEndDate(adjustedEnd);
                refreshAvailabilityForDates(next, adjustedEnd);
              }}
              style={{ borderRadius: "var(--radius-control)" }}
              className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm tabular-nums"
            />
          </div>

          <div>
            <label
              htmlFor="search-end-date"
              className="block text-xs font-bold"
            >
              Tanggal Selesai (WIB)
            </label>
            <input
              id="search-end-date"
              data-testid="search-end-date"
              type="date"
              min={startDate}
              value={endDate}
              onChange={(e) => {
                const next = e.target.value;
                setEndDate(next);
                refreshAvailabilityForDates(startDate, next);
              }}
              style={{ borderRadius: "var(--radius-control)" }}
              className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm tabular-nums"
            />
          </div>

          <div>
            <label
              htmlFor="filter-category"
              className="block text-xs font-bold"
            >
              Kategori
            </label>
            <select
              id="filter-category"
              data-testid="filter-category"
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              style={{ borderRadius: "var(--radius-control)" }}
              className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-transmission"
              className="block text-xs font-bold"
            >
              Transmisi
            </label>
            <select
              id="filter-transmission"
              data-testid="filter-transmission"
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
              style={{ borderRadius: "var(--radius-control)" }}
              className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm"
            >
              <option value="all">Semua Transmisi</option>
              <option value="automatic">Otomatis (AT)</option>
              <option value="manual">Manual (MT)</option>
            </select>
          </div>

          <div>
            <label htmlFor="filter-seats" className="block text-xs font-bold">
              Min. Kursi
            </label>
            <select
              id="filter-seats"
              data-testid="filter-seats"
              value={minSeats}
              onChange={(e) => setMinSeats(Number(e.target.value))}
              style={{ borderRadius: "var(--radius-control)" }}
              className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm"
            >
              <option value={0}>Semua Kapasitas</option>
              <option value={2}>Min. 2 Kursi</option>
              <option value={5}>Min. 5 Kursi</option>
              <option value={7}>Min. 7 Kursi (Keluarga)</option>
              <option value={12}>Min. 12 Kursi (Rombongan)</option>
            </select>
          </div>

          <div>
            <label htmlFor="filter-sort" className="block text-xs font-bold">
              Urutkan Harga
            </label>
            <select
              id="filter-sort"
              data-testid="filter-sort"
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as "price_asc" | "price_desc" | "newest",
                )
              }
              style={{ borderRadius: "var(--radius-control)" }}
              className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm"
            >
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
              <option value="newest">Tahun Terbaru</option>
            </select>
          </div>
        </div>

        {dateError ? (
          <p
            role="alert"
            style={{ color: "var(--accent-500)" }}
            className="mt-3 text-xs font-semibold"
          >
            {dateError}
          </p>
        ) : (
          <p className="mt-3 text-xs opacity-90 tabular-nums">
            Periode terpilih: <strong>{formatDateId(startDate)}</strong> s/d{" "}
            <strong>{formatDateId(endDate)}</strong> ({rentalDays} hari sewa
            inklusif) - {loadingDates ? "Memperbarui ketersediaan..." : `${filteredVehicles.length} unit tersedia`}.
          </p>
        )}
      </section>

      {/* AI Smart Vehicle Recommendation Panel ("Bantu Saya Pilih") */}
      <section
        aria-labelledby="ai-assistant-heading"
        style={{
          backgroundColor: "var(--surface-white)",
          borderColor: "var(--primary-600)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-card)",
        }}
        className="border-2 p-6"
        data-testid="ai-recommendation-panel"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              style={{
                backgroundColor: "var(--primary-50)",
                color: "var(--primary-600)",
                borderRadius: "var(--radius-control)",
              }}
              className="flex h-11 w-11 shrink-0 items-center justify-center"
            >
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="ai-assistant-heading"
                style={{ color: "var(--navy-900)" }}
                className="text-lg font-bold"
              >
                Bantu Saya Pilih Kendaraan (Asisten AI RentGo)
              </h2>
              <p style={{ color: "var(--slate-600)" }} className="text-xs">
                Ceritakan rute perjalanan Anda di Medan/Sumatera Utara, jumlah penumpang, dan anggaran harian. AI hanya merekomendasikan armada yang nyata dan tersedia pada tanggal pilihan Anda.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAiOpen((prev) => !prev)}
            style={{
              backgroundColor: "var(--slate-100)",
              color: "var(--slate-900)",
              borderRadius: "var(--radius-control)",
            }}
            className="min-h-[44px] px-3.5 py-2 text-xs font-semibold"
          >
            {aiOpen ? "Sembunyikan Panel AI" : "Buka Panel AI"}
          </button>
        </div>

        {aiOpen ? (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setAiQuery(
                    "Mobil keluarga 7 orang matic nyaman buat ke Danau Toba 3 hari budget 500rb/hari",
                  )
                }
                style={{
                  backgroundColor: "var(--primary-50)",
                  color: "var(--primary-700)",
                  borderRadius: "var(--radius-badge)",
                }}
                className="min-h-[36px] px-3 py-1 text-xs font-semibold"
              >
                Rute Keluarga Danau Toba (7 Kursi Matic)
              </button>
              <button
                type="button"
                onClick={() =>
                  setAiQuery(
                    "Mobil irit matic untuk jemput tamu di Bandara Kualanamu dan keliling Kota Medan budget 350rb/hari",
                  )
                }
                style={{
                  backgroundColor: "var(--primary-50)",
                  color: "var(--primary-700)",
                  borderRadius: "var(--radius-badge)",
                }}
                className="min-h-[36px] px-3 py-1 text-xs font-semibold"
              >
                Jemput Bandara Kualanamu (Hemat BBM)
              </button>
              <button
                type="button"
                onClick={() =>
                  setAiQuery(
                    "Rombongan kantor 12 orang kunjungan kerja di Medan dan Berastagi butuh kabin luas",
                  )
                }
                style={{
                  backgroundColor: "var(--primary-50)",
                  color: "var(--primary-700)",
                  borderRadius: "var(--radius-badge)",
                }}
                className="min-h-[36px] px-3 py-1 text-xs font-semibold"
              >
                Rombongan Dinas 12+ Orang (Hiace)
              </button>
            </div>

            <form
              onSubmit={handleAskAi}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="ai-query-input" className="sr-only">
                Kebutuhan perjalanan Anda
              </label>
              <input
                id="ai-query-input"
                data-testid="ai-query-input"
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Contoh: Saya butuh mobil keluarga 7 orang matic hemat ke Danau Toba..."
                style={{ borderRadius: "var(--radius-control)" }}
                className="min-h-[44px] flex-1 border px-3.5 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={aiLoading}
                data-testid="ai-submit-button"
                style={{
                  backgroundColor: "var(--primary-600)",
                  color: "var(--surface-white)",
                  borderRadius: "var(--radius-control)",
                }}
                className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 px-5 py-2 text-sm font-semibold disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span>
                  {aiLoading ? "Menganalisis Armada..." : "Cari Rekomendasi AI"}
                </span>
              </button>
            </form>

            {aiError ? (
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
                {aiError}
              </div>
            ) : null}

            {aiResult ? (
              <div
                data-testid="ai-recommendation-results"
                style={{
                  backgroundColor: "var(--slate-50)",
                  borderRadius: "var(--radius-card)",
                }}
                className="space-y-4 border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p
                    style={{ color: "var(--navy-900)" }}
                    className="text-sm font-semibold"
                  >
                    {aiResult.summary}
                  </p>
                  <span
                    style={{
                      backgroundColor: aiResult.used_fallback
                        ? "var(--info-bg)"
                        : "var(--success-bg)",
                      color: aiResult.used_fallback
                        ? "var(--info-text)"
                        : "var(--success-text)",
                      borderRadius: "var(--radius-badge)",
                    }}
                    className="px-2.5 py-1 text-[11px] font-bold uppercase"
                  >
                    Engine: {aiResult.model}
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {aiResult.recommendations.map((rec) => {
                    const v = rec.vehicle;
                    if (!v) return null;
                    return (
                      <div
                        key={rec.vehicle_id}
                        data-testid={`ai-rec-card-${rec.rank}`}
                        style={{
                          backgroundColor: "var(--surface-white)",
                          borderRadius: "var(--radius-card)",
                        }}
                        className="flex flex-col justify-between border p-4"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span
                              style={{
                                backgroundColor: "var(--accent-500)",
                                color: "var(--navy-900)",
                                borderRadius: "var(--radius-badge)",
                              }}
                              className="px-2 py-0.5 text-xs font-bold"
                            >
                              Pilihan #{rec.rank}
                            </span>
                            <span
                              style={{ color: "var(--primary-700)" }}
                              className="text-xs font-bold tabular-nums"
                            >
                              Kecocokan {rec.fit_score}%
                            </span>
                          </div>
                          <h3
                            style={{ color: "var(--navy-900)" }}
                            className="text-base font-bold"
                          >
                            {v.brand} {v.model}
                          </h3>
                          <p
                            style={{ color: "var(--slate-600)" }}
                            className="text-xs"
                          >
                            {rec.reason}
                          </p>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t pt-3">
                          <div className="tabular-nums">
                            <p
                              style={{ color: "var(--navy-900)" }}
                              className="text-sm font-extrabold"
                            >
                              {formatRupiah(v.daily_price)}
                              <span
                                style={{ color: "var(--slate-600)" }}
                                className="text-xs font-normal"
                              >
                                /hari
                              </span>
                            </p>
                          </div>
                          <Link
                            href={`/vehicles/${v.id}?start=${startDate}&end=${endDate}`}
                            style={{
                              backgroundColor: "var(--primary-600)",
                              color: "var(--surface-white)",
                              borderRadius: "var(--radius-control)",
                            }}
                            className="inline-flex min-h-[40px] items-center px-3 py-1.5 text-xs font-semibold"
                          >
                            Pilih Unit Ini
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      {/* Available Vehicle Cards Grid */}
      <section aria-labelledby="available-fleet-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2
              id="available-fleet-heading"
              style={{ color: "var(--navy-900)" }}
              className="text-xl font-bold"
            >
              Armada Tersedia ({filteredVehicles.length} Unit)
            </h2>
            <p style={{ color: "var(--slate-600)" }} className="text-xs">
              Seluruh harga di bawah adalah harga resmi harian tanpa biaya tersembunyi.
            </p>
          </div>
        </div>

        {filteredVehicles.length === 0 ? (
          <div
            style={{
              backgroundColor: "var(--surface-white)",
              borderRadius: "var(--radius-card)",
            }}
            className="border p-10 text-center"
            data-testid="empty-catalog-state"
          >
            <p
              style={{ color: "var(--navy-900)" }}
              className="text-base font-bold"
            >
              Tidak Ada Armada yang Cocok dengan Filter Anda
            </p>
            <p
              style={{ color: "var(--slate-600)" }}
              className="mx-auto mt-1 max-w-md text-xs"
            >
              Coba ubah rentang tanggal sewa atau atur ulang filter kategori dan transmisi untuk melihat pilihan unit lain.
            </p>
            <button
              type="button"
              onClick={() => {
                setCategorySlug("all");
                setTransmission("all");
                setMinSeats(0);
                setMaxPrice(0);
              }}
              style={{
                backgroundColor: "var(--primary-600)",
                color: "var(--surface-white)",
                borderRadius: "var(--radius-control)",
              }}
              className="mt-4 inline-flex min-h-[44px] items-center px-4 py-2 text-xs font-semibold"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVehicles.map((v) => {
              const estTotal = v.daily_price * rentalDays;
              return (
                <article
                  key={v.id}
                  data-testid={`catalog-card-${v.plate_number}`}
                  style={{
                    backgroundColor: "var(--surface-white)",
                    borderRadius: "var(--radius-card)",
                    boxShadow: "var(--shadow-card)",
                  }}
                  className="flex flex-col justify-between overflow-hidden border transition-shadow hover:shadow-md"
                >
                  <div>
                    <div
                      style={{ backgroundColor: "var(--slate-100)" }}
                      className="relative flex h-44 items-center justify-center border-b p-4"
                    >
                      <img
                        src={v.image_url || "/vehicles/mpv.svg"}
                        alt={`${v.brand} ${v.model}`}
                        width={320}
                        height={176}
                        className="max-h-36 w-auto object-contain"
                      />
                      <span
                        style={{
                          backgroundColor: "var(--navy-900)",
                          color: "var(--surface-white)",
                          borderRadius: "var(--radius-badge)",
                        }}
                        className="absolute left-3 top-3 px-2.5 py-1 text-[11px] font-semibold"
                      >
                        {v.category_name}
                      </span>
                      <span
                        style={{
                          backgroundColor: "var(--success-bg)",
                          color: "var(--success-text)",
                          borderRadius: "var(--radius-badge)",
                        }}
                        className="absolute right-3 top-3 px-2.5 py-1 text-[11px] font-bold"
                      >
                        Tersedia
                      </span>
                    </div>

                    <div className="space-y-3 p-5">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h3
                            style={{ color: "var(--navy-900)" }}
                            className="text-lg font-bold"
                          >
                            {v.brand} {v.model}
                          </h3>
                          <span
                            style={{ color: "var(--slate-600)" }}
                            className="font-mono text-xs font-semibold"
                          >
                            {v.plate_number}
                          </span>
                        </div>
                        <p
                          style={{ color: "var(--slate-600)" }}
                          className="mt-1 line-clamp-2 text-xs"
                        >
                          {v.description ||
                            `Unit tahun ${v.year} terawat siap jalan untuk area Medan dan Sumatera Utara.`}
                        </p>
                      </div>

                      <div
                        style={{
                          backgroundColor: "var(--slate-50)",
                          color: "var(--slate-600)",
                          borderRadius: "var(--radius-control)",
                        }}
                        className="grid grid-cols-3 gap-2 border p-2.5 text-center text-xs font-semibold"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>
                            {v.transmission === "automatic"
                              ? "Matic"
                              : "Manual"}
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <Users className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{v.seats} Kursi</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <Fuel className="h-3.5 w-3.5" aria-hidden="true" />
                          <span className="capitalize">{v.fuel}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t px-5 py-4">
                    <div className="tabular-nums">
                      <p
                        style={{ color: "var(--navy-900)" }}
                        className="text-lg font-extrabold"
                      >
                        {formatRupiah(v.daily_price)}
                        <span
                          style={{ color: "var(--slate-600)" }}
                          className="text-xs font-normal"
                        >
                          {" "}
                          / hari
                        </span>
                      </p>
                      <p
                        style={{ color: "var(--slate-600)" }}
                        className="flex items-center gap-1 text-[11px]"
                      >
                        <Calendar className="h-3 w-3" aria-hidden="true" />
                        <span>
                          Total {rentalDays} hari: {formatRupiah(estTotal)}
                        </span>
                      </p>
                    </div>

                    <Link
                      href={`/vehicles/${v.id}?start=${startDate}&end=${endDate}`}
                      data-testid={`select-vehicle-${v.plate_number}`}
                      style={{
                        backgroundColor: "var(--primary-600)",
                        color: "var(--surface-white)",
                        borderRadius: "var(--radius-control)",
                      }}
                      className="inline-flex min-h-[44px] items-center px-4 py-2 text-xs font-semibold transition-opacity hover:opacity-95"
                    >
                      Sewa Sekarang
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
