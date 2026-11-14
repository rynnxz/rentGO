"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { formatDateId, formatRupiah, getTodayWib } from "@/lib/utils";
import { MaintenanceStatusBadge } from "@/components/ui/badge";
import type {
  MaintenanceStatus,
  MaintenanceWithVehicle,
  VehicleWithCategory,
} from "@/lib/types";

export function MaintenanceManager({
  initialLogs,
  vehicles,
}: {
  initialLogs: MaintenanceWithVehicle[];
  vehicles: VehicleWithCategory[];
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [logs, setLogs] = useState(initialLogs);

  const today = getTodayWib();
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [cost, setCost] = useState(450000);
  const [status, setStatus] = useState<MaintenanceStatus>("scheduled");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  function openAddDialog() {
    setVehicleId(vehicles[0]?.id ?? "");
    setTitle("");
    setDescription("");
    setStartDate(today);
    setEndDate(today);
    setCost(450000);
    setStatus("scheduled");
    setErrorMsg(null);
    dialogRef.current?.showModal();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setFeedback(null);
    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          vehicle_id: vehicleId,
          title: title.trim(),
          description: description.trim() || null,
          start_date: startDate,
          end_date: endDate,
          cost: Number(cost),
          status,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal menyimpan jadwal perawatan.");
      }
      setLogs((prev) => [json.data, ...prev]);
      setFeedback(
        `Jadwal perawatan "${json.data.title}" (${json.data.vehicle_plate}) berhasil ditambahkan.`,
      );
      dialogRef.current?.close();
      router.refresh();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal menyimpan jadwal.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(
    log: MaintenanceWithVehicle,
    nextStatus: MaintenanceStatus,
  ) {
    setLoading(true);
    setErrorMsg(null);
    setFeedback(null);
    try {
      const res = await fetch(`/api/maintenance/${log.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal memperbarui status perawatan.");
      }
      setLogs((prev) =>
        prev.map((m) => (m.id === log.id ? json.data : m)),
      );
      setFeedback(
        `Status perawatan ${log.vehicle_plate} diperbarui menjadi "${nextStatus}".`,
      );
      router.refresh();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal memperbarui status.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(log: MaintenanceWithVehicle) {
    setLoading(true);
    setErrorMsg(null);
    setFeedback(null);
    try {
      const res = await fetch(`/api/maintenance/${log.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal menghapus catatan perawatan.");
      }
      setLogs((prev) => prev.filter((m) => m.id !== log.id));
      setFeedback(`Jadwal perawatan "${log.title}" berhasil dihapus.`);
      router.refresh();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal menghapus jadwal.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6" data-testid="admin-maintenance-view">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            style={{ color: "var(--navy-900)" }}
            className="text-2xl font-bold sm:text-3xl"
          >
            Jadwal Perawatan & Servis Armada
          </h1>
          <p style={{ color: "var(--slate-600)" }} className="mt-1 text-sm">
            Kendaraan yang memiliki jadwal servis berstatus Terjadwal atau Sedang Servis otomatis diblokir dari katalog tanggal sewa pelanggan.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddDialog}
          data-testid="add-maintenance-button"
          style={{
            backgroundColor: "var(--primary-600)",
            color: "var(--surface-white)",
            borderRadius: "var(--radius-control)",
          }}
          className="inline-flex min-h-[44px] items-center gap-2 px-4 py-2 text-sm font-semibold"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Catat Jadwal Servis</span>
        </button>
      </div>

      {feedback ? (
        <div
          role="status"
          data-testid="maintenance-feedback-banner"
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

      {/* Table */}
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
          aria-label="Tabel Jadwal Perawatan Armada"
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
                <th className="px-4 py-3 font-semibold">Pekerjaan Servis</th>
                <th className="px-4 py-3 font-semibold">Rentang Tanggal</th>
                <th className="px-4 py-3 text-right font-semibold">Biaya</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ color: "var(--slate-600)" }}
                    className="px-4 py-8 text-center text-sm"
                  >
                    Belum ada jadwal perawatan tercatat.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} data-testid={`maint-row-${log.vehicle_plate}`}>
                    <th
                      scope="row"
                      style={{
                        backgroundColor: "var(--surface-white)",
                        color: "var(--navy-900)",
                      }}
                      className="sticky left-0 z-10 whitespace-nowrap px-4 py-3 font-semibold"
                    >
                      <p>
                        {log.vehicle_brand} {log.vehicle_model}
                      </p>
                      <p
                        style={{ color: "var(--slate-600)" }}
                        className="font-mono text-xs font-normal"
                      >
                        {log.vehicle_plate}
                      </p>
                    </th>
                    <td className="max-w-xs px-4 py-3">
                      <p
                        style={{ color: "var(--navy-900)" }}
                        className="font-semibold"
                      >
                        {log.title}
                      </p>
                      <p
                        style={{ color: "var(--slate-600)" }}
                        className="text-xs"
                      >
                        {log.description || "-"}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs tabular-nums">
                      {formatDateId(log.start_date)} -{" "}
                      {formatDateId(log.end_date)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums">
                      {formatRupiah(log.cost)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <MaintenanceStatusBadge status={log.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {log.status === "scheduled" ? (
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() =>
                              handleStatusUpdate(log, "in_progress")
                            }
                            style={{
                              backgroundColor: "var(--warning-bg)",
                              color: "var(--warning-text)",
                              borderRadius: "var(--radius-control)",
                            }}
                            className="min-h-[44px] px-3 py-1.5 text-xs font-semibold"
                          >
                            Mulai Servis
                          </button>
                        ) : null}

                        {log.status !== "done" ? (
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => handleStatusUpdate(log, "done")}
                            style={{
                              backgroundColor: "var(--success-bg)",
                              color: "var(--success-text)",
                              borderRadius: "var(--radius-control)",
                            }}
                            className="min-h-[44px] px-3 py-1.5 text-xs font-semibold"
                          >
                            Selesai Servis
                          </button>
                        ) : null}

                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => handleDelete(log)}
                          style={{
                            backgroundColor: "var(--danger-bg)",
                            color: "var(--danger-text)",
                            borderRadius: "var(--radius-control)",
                          }}
                          className="inline-flex min-h-[44px] items-center gap-1 px-2.5 py-1.5 text-xs font-semibold"
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
      </div>

      {/* Native <dialog> for Create Maintenance */}
      <dialog
        ref={dialogRef}
        aria-labelledby="maint-dialog-title"
        style={{
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-elevated)",
        }}
        className="m-auto w-full max-w-lg border p-6 text-left"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <h2
            id="maint-dialog-title"
            style={{ color: "var(--navy-900)" }}
            className="text-lg font-bold"
          >
            Catat Jadwal Servis / Perawatan Armada
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

          <div>
            <label
              htmlFor="m-vehicle"
              className="block text-xs font-semibold"
            >
              Pilih Unit Kendaraan
            </label>
            <select
              id="m-vehicle"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              required
              style={{ borderRadius: "var(--radius-control)" }}
              className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} ({v.plate_number})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="m-title" className="block text-xs font-semibold">
              Judul Pekerjaan Servis
            </label>
            <input
              id="m-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Ganti Oli Berkala & Balancing Ban"
              style={{ borderRadius: "var(--radius-control)" }}
              className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="m-start" className="block text-xs font-semibold">
                Tanggal Mulai
              </label>
              <input
                id="m-start"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ borderRadius: "var(--radius-control)" }}
                className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm tabular-nums"
              />
            </div>
            <div>
              <label htmlFor="m-end" className="block text-xs font-semibold">
                Tanggal Selesai
              </label>
              <input
                id="m-end"
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ borderRadius: "var(--radius-control)" }}
                className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm tabular-nums"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="m-cost" className="block text-xs font-semibold">
                Estimasi Biaya (Rp)
              </label>
              <input
                id="m-cost"
                type="number"
                min={0}
                step={5000}
                required
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                style={{ borderRadius: "var(--radius-control)" }}
                className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm tabular-nums"
              />
            </div>
            <div>
              <label htmlFor="m-status" className="block text-xs font-semibold">
                Status Servis
              </label>
              <select
                id="m-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as MaintenanceStatus)}
                style={{ borderRadius: "var(--radius-control)" }}
                className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm"
              >
                <option value="scheduled">Terjadwal (Scheduled)</option>
                <option value="in_progress">Sedang Servis (In Progress)</option>
                <option value="done">Selesai (Done)</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="m-desc" className="block text-xs font-semibold">
              Rincian Servis / Nama Bengkel
            </label>
            <textarea
              id="m-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Bengkel resmi Auto2000 Gatot Subroto Medan..."
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
              disabled={loading}
              data-testid="submit-maintenance-button"
              style={{
                backgroundColor: "var(--primary-600)",
                color: "var(--surface-white)",
                borderRadius: "var(--radius-control)",
              }}
              className="min-h-[44px] px-4 py-2 text-xs font-semibold"
            >
              {loading ? "Menyimpan..." : "Simpan Jadwal"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
