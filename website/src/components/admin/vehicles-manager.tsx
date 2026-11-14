"use client";

import React, { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Plus, Search, Trash2, Upload } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { VehicleStatusBadge } from "@/components/ui/badge";
import type {
  FuelType,
  TransmissionType,
  VehicleCategoryRecord,
  VehicleStatus,
  VehicleWithCategory,
} from "@/lib/types";

export function VehiclesManager({
  initialVehicles,
  categories,
}: {
  initialVehicles: VehicleWithCategory[];
  categories: VehicleCategoryRecord[];
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [transmissionFilter, setTransmissionFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Form state
  const [editing, setEditing] = useState<VehicleWithCategory | null>(null);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [plateNumber, setPlateNumber] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(2024);
  const [color, setColor] = useState("Putih");
  const [transmission, setTransmission] =
    useState<TransmissionType>("automatic");
  const [fuel, setFuel] = useState<FuelType>("bensin");
  const [seats, setSeats] = useState(7);
  const [dailyPrice, setDailyPrice] = useState(400000);
  const [status, setStatus] = useState<VehicleStatus>("active");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("/vehicles/mpv.svg");

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      if (categoryFilter !== "all" && v.category_id !== categoryFilter) {
        return false;
      }
      if (statusFilter !== "all" && v.status !== statusFilter) {
        return false;
      }
      if (
        transmissionFilter !== "all" &&
        v.transmission !== transmissionFilter
      ) {
        return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay =
          `${v.brand} ${v.model} ${v.plate_number} ${v.category_name}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [vehicles, categoryFilter, statusFilter, transmissionFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  function openAddDialog() {
    setEditing(null);
    setCategoryId(categories[0]?.id ?? "");
    setPlateNumber("");
    setBrand("");
    setModel("");
    setYear(2024);
    setColor("Putih Mutiara");
    setTransmission("automatic");
    setFuel("bensin");
    setSeats(7);
    setDailyPrice(420000);
    setStatus("active");
    setDescription("");
    setImageUrl("/vehicles/mpv.svg");
    setErrorMsg(null);
    dialogRef.current?.showModal();
  }

  function openEditDialog(v: VehicleWithCategory) {
    setEditing(v);
    setCategoryId(v.category_id);
    setPlateNumber(v.plate_number);
    setBrand(v.brand);
    setModel(v.model);
    setYear(v.year);
    setColor(v.color ?? "");
    setTransmission(v.transmission);
    setFuel(v.fuel);
    setSeats(v.seats);
    setDailyPrice(v.daily_price);
    setStatus(v.status);
    setDescription(v.description ?? "");
    setImageUrl(v.image_url ?? "/vehicles/mpv.svg");
    setErrorMsg(null);
    dialogRef.current?.showModal();
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "vehicles");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal mengunggah foto kendaraan.");
      }
      setImageUrl(json.url);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal mengunggah foto.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setFeedback(null);
    try {
      const endpoint = editing
        ? `/api/vehicles/${editing.id}`
        : "/api/vehicles";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          category_id: categoryId,
          plate_number: plateNumber.trim().toUpperCase(),
          brand: brand.trim(),
          model: model.trim(),
          year: Number(year),
          color: color.trim() || null,
          transmission,
          fuel,
          seats: Number(seats),
          daily_price: Number(dailyPrice),
          status,
          description: description.trim() || null,
          image_url: imageUrl.trim() || "/vehicles/mpv.svg",
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal menyimpan data kendaraan.");
      }
      if (editing) {
        setVehicles((prev) =>
          prev.map((v) => (v.id === editing.id ? json.data : v)),
        );
        setFeedback(
          `Data kendaraan ${json.data.brand} ${json.data.model} (${json.data.plate_number}) berhasil diperbarui.`,
        );
      } else {
        setVehicles((prev) => [json.data, ...prev]);
        setFeedback(
          `Unit kendaraan baru ${json.data.brand} ${json.data.model} (${json.data.plate_number}) berhasil ditambahkan.`,
        );
      }
      dialogRef.current?.close();
      router.refresh();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal menyimpan data kendaraan.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(v: VehicleWithCategory) {
    setLoading(true);
    setErrorMsg(null);
    setFeedback(null);
    try {
      const res = await fetch(`/api/vehicles/${v.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal menghapus kendaraan.");
      }
      setVehicles((prev) => prev.filter((item) => item.id !== v.id));
      setFeedback(
        `Kendaraan ${v.brand} ${v.model} (${v.plate_number}) berhasil dinonaktifkan (soft delete).`,
      );
      router.refresh();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal menghapus kendaraan.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6" data-testid="admin-vehicles-view">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            style={{ color: "var(--navy-900)" }}
            className="text-2xl font-bold sm:text-3xl"
          >
            Manajemen Data Armada Kendaraan
          </h1>
          <p style={{ color: "var(--slate-600)" }} className="mt-1 text-sm">
            Tambah, perbarui harga sewa harian, ubah status unit, atau lakukan soft delete kendaraan.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddDialog}
          data-testid="add-vehicle-button"
          style={{
            backgroundColor: "var(--primary-600)",
            color: "var(--surface-white)",
            borderRadius: "var(--radius-control)",
          }}
          className="inline-flex min-h-[44px] items-center gap-2 px-4 py-2 text-sm font-semibold"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Tambah Kendaraan</span>
        </button>
      </div>

      {feedback ? (
        <div
          role="status"
          data-testid="vehicle-feedback-banner"
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

      {errorMsg && !dialogRef.current?.open ? (
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

      {/* Filter Bar */}
      <div
        style={{
          backgroundColor: "var(--surface-white)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-card)",
        }}
        className="grid gap-3 border p-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="relative">
          <label htmlFor="vehicle-search" className="block text-xs font-semibold">
            Pencarian Unit / Plat
          </label>
          <Search
            style={{ color: "var(--slate-400)" }}
            className="pointer-events-none absolute left-3 top-9 h-4 w-4"
            aria-hidden="true"
          />
          <input
            id="vehicle-search"
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Avanza, BK 1201..."
            style={{ borderRadius: "var(--radius-control)" }}
            className="mt-1 min-h-[44px] w-full border pl-9 pr-3 py-2 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="vehicle-category-filter"
            className="block text-xs font-semibold"
          >
            Kategori
          </label>
          <select
            id="vehicle-category-filter"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            style={{ borderRadius: "var(--radius-control)" }}
            className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="vehicle-status-filter"
            className="block text-xs font-semibold"
          >
            Status Operasional
          </label>
          <select
            id="vehicle-status-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            style={{ borderRadius: "var(--radius-control)" }}
            className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="maintenance">Perawatan</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="vehicle-trans-filter"
            className="block text-xs font-semibold"
          >
            Transmisi
          </label>
          <select
            id="vehicle-trans-filter"
            value={transmissionFilter}
            onChange={(e) => {
              setTransmissionFilter(e.target.value);
              setPage(1);
            }}
            style={{ borderRadius: "var(--radius-control)" }}
            className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm"
          >
            <option value="all">Semua Transmisi</option>
            <option value="automatic">Otomatis (AT)</option>
            <option value="manual">Manual (MT)</option>
          </select>
        </div>
      </div>

      {/* Responsive Table */}
      <div
        style={{
          backgroundColor: "var(--surface-white)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-card)",
        }}
        className="overflow-hidden border"
      >
        <div
          className="overflow-x-auto"
          role="region"
          aria-label="Tabel Data Kendaraan"
          tabIndex={0}
        >
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr
                style={{
                  backgroundColor: "var(--slate-100)",
                  color: "var(--slate-600)",
                }}
                className="border-b text-xs uppercase"
              >
                <th
                  style={{ backgroundColor: "var(--slate-100)" }}
                  className="sticky left-0 z-10 px-4 py-3 font-semibold"
                >
                  Unit Kendaraan
                </th>
                <th className="px-4 py-3 font-semibold">Plat Nomor</th>
                <th className="px-4 py-3 font-semibold">Kategori</th>
                <th className="px-4 py-3 font-semibold">Spesifikasi</th>
                <th className="px-4 py-3 text-right font-semibold">Tarif / Hari</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{ color: "var(--slate-600)" }}
                    className="px-4 py-8 text-center text-sm"
                  >
                    Tidak ada kendaraan yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                paginated.map((v) => (
                  <tr key={v.id} data-testid={`vehicle-row-${v.plate_number}`}>
                    <th
                      scope="row"
                      style={{
                        backgroundColor: "var(--surface-white)",
                        color: "var(--navy-900)",
                      }}
                      className="sticky left-0 z-10 whitespace-nowrap px-4 py-3 font-semibold"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={v.image_url || "/vehicles/mpv.svg"}
                          alt={`${v.brand} ${v.model}`}
                          width={56}
                          height={38}
                          className="h-9 w-14 rounded border object-cover"
                        />
                        <div>
                          <p className="font-bold">
                            {v.brand} {v.model}
                          </p>
                          <p
                            style={{ color: "var(--slate-600)" }}
                            className="text-xs font-normal"
                          >
                            Tahun {v.year} - {v.color || "Standar"}
                          </p>
                        </div>
                      </div>
                    </th>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-bold">
                      {v.plate_number}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs font-semibold">
                      {v.category_name}
                    </td>
                    <td
                      style={{ color: "var(--slate-600)" }}
                      className="whitespace-nowrap px-4 py-3 text-xs"
                    >
                      {v.transmission === "automatic" ? "Otomatis" : "Manual"} -{" "}
                      {v.seats} Kursi - {v.fuel.toUpperCase()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-bold tabular-nums">
                      {formatRupiah(v.daily_price)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <VehicleStatusBadge status={v.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditDialog(v)}
                          data-testid={`edit-vehicle-${v.plate_number}`}
                          style={{
                            backgroundColor: "var(--slate-100)",
                            color: "var(--slate-900)",
                            borderRadius: "var(--radius-control)",
                          }}
                          className="inline-flex min-h-[44px] items-center gap-1.5 px-3 py-2 text-xs font-semibold"
                        >
                          <Edit2 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(v)}
                          disabled={loading}
                          data-testid={`delete-vehicle-${v.plate_number}`}
                          style={{
                            backgroundColor: "var(--danger-bg)",
                            color: "var(--danger-text)",
                            borderRadius: "var(--radius-control)",
                          }}
                          className="inline-flex min-h-[44px] items-center gap-1.5 px-3 py-2 text-xs font-semibold"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div
          style={{ backgroundColor: "var(--slate-50)" }}
          className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-xs"
        >
          <span style={{ color: "var(--slate-600)" }} className="tabular-nums">
            Menampilkan {paginated.length} dari {filtered.length} unit kendaraan
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                backgroundColor: "var(--surface-white)",
                borderRadius: "var(--radius-control)",
              }}
              className="min-h-[38px] border px-3 py-1.5 font-semibold disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <span className="font-semibold tabular-nums">
              Halaman {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{
                backgroundColor: "var(--surface-white)",
                borderRadius: "var(--radius-control)",
              }}
              className="min-h-[38px] border px-3 py-1.5 font-semibold disabled:opacity-50"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>

      {/* Native <dialog> for Create/Edit Vehicle */}
      <dialog
        ref={dialogRef}
        aria-labelledby="vehicle-dialog-title"
        style={{
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-elevated)",
        }}
        className="m-auto w-full max-w-2xl border p-6 text-left"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <h2
            id="vehicle-dialog-title"
            style={{ color: "var(--navy-900)" }}
            className="text-lg font-bold"
          >
            {editing
              ? `Edit Kendaraan (${editing.plate_number})`
              : "Tambah Unit Kendaraan Baru"}
          </h2>

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

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="v-category"
                className="block text-xs font-semibold"
              >
                Kategori Armada
              </label>
              <select
                id="v-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                style={{ borderRadius: "var(--radius-control)" }}
                className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="v-plate" className="block text-xs font-semibold">
                Nomor Plat (Sumatera Utara / BK)
              </label>
              <input
                id="v-plate"
                type="text"
                required
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder="BK 1999 RGO"
                style={{ borderRadius: "var(--radius-control)" }}
                className="mt-1 min-h-[44px] w-full border px-3 py-2 font-mono text-sm uppercase"
              />
            </div>

            <div>
              <label htmlFor="v-brand" className="block text-xs font-semibold">
                Merek (Brand)
              </label>
              <input
                id="v-brand"
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Toyota"
                style={{ borderRadius: "var(--radius-control)" }}
                className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="v-model" className="block text-xs font-semibold">
                Model Kendaraan
              </label>
              <input
                id="v-model"
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Innova Zenix G"
                style={{ borderRadius: "var(--radius-control)" }}
                className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="v-year" className="block text-xs font-semibold">
                Tahun Produksi
              </label>
              <input
                id="v-year"
                type="number"
                required
                min={2010}
                max={2027}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                style={{ borderRadius: "var(--radius-control)" }}
                className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm tabular-nums"
              />
            </div>

            <div>
              <label htmlFor="v-color" className="block text-xs font-semibold">
                Warna Bodi
              </label>
              <input
                id="v-color"
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Hitam Metalik"
                style={{ borderRadius: "var(--radius-control)" }}
                className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="v-transmission"
                className="block text-xs font-semibold"
              >
                Transmisi
              </label>
              <select
                id="v-transmission"
                value={transmission}
                onChange={(e) =>
                  setTransmission(e.target.value as TransmissionType)
                }
                style={{ borderRadius: "var(--radius-control)" }}
                className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm"
              >
                <option value="automatic">Otomatis (AT)</option>
                <option value="manual">Manual (MT)</option>
              </select>
            </div>

            <div>
              <label htmlFor="v-fuel" className="block text-xs font-semibold">
                Bahan Bakar
              </label>
              <select
                id="v-fuel"
                value={fuel}
                onChange={(e) => setFuel(e.target.value as FuelType)}
                style={{ borderRadius: "var(--radius-control)" }}
                className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm"
              >
                <option value="bensin">Bensin</option>
                <option value="diesel">Diesel</option>
                <option value="hybrid">Hybrid</option>
                <option value="listrik">Listrik (EV)</option>
              </select>
            </div>

            <div>
              <label htmlFor="v-seats" className="block text-xs font-semibold">
                Kapasitas Kursi
              </label>
              <input
                id="v-seats"
                type="number"
                required
                min={2}
                max={20}
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                style={{ borderRadius: "var(--radius-control)" }}
                className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm tabular-nums"
              />
            </div>

            <div>
              <label htmlFor="v-price" className="block text-xs font-semibold">
                Tarif Sewa Harian (Rp)
              </label>
              <input
                id="v-price"
                type="number"
                required
                min={50000}
                step={5000}
                value={dailyPrice}
                onChange={(e) => setDailyPrice(Number(e.target.value))}
                style={{ borderRadius: "var(--radius-control)" }}
                className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm tabular-nums"
              />
            </div>

            <div>
              <label htmlFor="v-status" className="block text-xs font-semibold">
                Status Operasional
              </label>
              <select
                id="v-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as VehicleStatus)}
                style={{ borderRadius: "var(--radius-control)" }}
                className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm"
              >
                <option value="active">Aktif</option>
                <option value="maintenance">Perawatan</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>

            <div>
              <label htmlFor="v-image" className="block text-xs font-semibold">
                Ilustrasi / Foto Kendaraan
              </label>
              <div className="mt-1 flex items-center gap-2">
                <select
                  id="v-image"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  style={{ borderRadius: "var(--radius-control)" }}
                  className="min-h-[44px] flex-1 border px-3 py-2 text-sm"
                >
                  <option value="/vehicles/city-car.svg">Ilustrasi City Car</option>
                  <option value="/vehicles/mpv.svg">Ilustrasi MPV Keluarga</option>
                  <option value="/vehicles/suv.svg">Ilustrasi SUV</option>
                  <option value="/vehicles/van.svg">Ilustrasi Van / Hiace</option>
                  <option value="/vehicles/scooter.svg">Ilustrasi Motor Matik</option>
                </select>
                <label
                  style={{
                    backgroundColor: "var(--slate-100)",
                    color: "var(--slate-900)",
                    borderRadius: "var(--radius-control)",
                  }}
                  className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 border px-3 py-2 text-xs font-semibold"
                >
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{uploading ? "..." : "Upload"}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="v-desc" className="block text-xs font-semibold">
              Deskripsi Fasilitas Unit
            </label>
            <textarea
              id="v-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: AC double blower dingin, head unit Android Auto, siap rute Bandara Kualanamu..."
              style={{ borderRadius: "var(--radius-control)" }}
              className="mt-1 w-full border px-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
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
              disabled={loading || uploading}
              data-testid="submit-vehicle-button"
              style={{
                backgroundColor: "var(--primary-600)",
                color: "var(--surface-white)",
                borderRadius: "var(--radius-control)",
              }}
              className="min-h-[44px] px-4 py-2 text-xs font-semibold"
            >
              {loading ? "Menyimpan..." : "Simpan Kendaraan"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
