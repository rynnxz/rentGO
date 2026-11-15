"use client";

import React, { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Plus, Search, Trash2 } from "lucide-react";
import type { VehicleCategoryRecord } from "@/lib/types";

export function CategoriesManager({
  initialCategories,
}: {
  initialCategories: VehicleCategoryRecord[];
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<VehicleCategoryRecord | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q),
    );
  }, [categories, search]);

  function openAddDialog() {
    setEditing(null);
    setName("");
    setSlug("");
    setDescription("");
    setErrorMsg(null);
    dialogRef.current?.showModal();
  }

  function openEditDialog(cat: VehicleCategoryRecord) {
    setEditing(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description ?? "");
    setErrorMsg(null);
    dialogRef.current?.showModal();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setFeedback(null);
    try {
      const endpoint = editing
        ? `/api/categories/${editing.id}`
        : "/api/categories";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
          description: description.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal menyimpan kategori.");
      }

      if (editing) {
        setCategories((prev) =>
          prev.map((c) => (c.id === editing.id ? json.data : c)),
        );
        setFeedback(`Kategori "${json.data.name}" berhasil diperbarui.`);
      } else {
        setCategories((prev) => [...prev, json.data]);
        setFeedback(`Kategori "${json.data.name}" berhasil ditambahkan.`);
      }
      dialogRef.current?.close();
      router.refresh();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal menyimpan kategori.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(cat: VehicleCategoryRecord) {
    setLoading(true);
    setErrorMsg(null);
    setFeedback(null);
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal menghapus kategori.");
      }
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      setFeedback(`Kategori "${cat.name}" berhasil dihapus.`);
      router.refresh();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal menghapus kategori.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6" data-testid="admin-categories-view">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            style={{ color: "var(--navy-900)" }}
            className="text-2xl font-bold sm:text-3xl"
          >
            Kategori Armada Kendaraan
          </h1>
          <p style={{ color: "var(--slate-600)" }} className="mt-1 text-sm">
            Klasifikasi unit kendaraan (Mobil City, MPV / Minibus, SUV, Van / Hiace, dan Motor).
          </p>
        </div>
        <button
          type="button"
          onClick={openAddDialog}
          data-testid="add-category-button"
          style={{
            backgroundColor: "var(--primary-600)",
            color: "var(--on-dark-fg)",
            borderRadius: "var(--radius-control)",
          }}
          className="inline-flex min-h-[44px] items-center gap-2 px-4 py-2 text-sm font-semibold"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Tambah Kategori</span>
        </button>
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

      {/* Search Bar */}
      <div
        style={{
          backgroundColor: "var(--surface-white)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-card)",
        }}
        className="border p-4"
      >
        <div className="relative max-w-md">
          <label htmlFor="category-search" className="sr-only">
            Cari kategori
          </label>
          <Search
            style={{ color: "var(--slate-400)" }}
            className="pointer-events-none absolute left-3 top-3.5 h-4 w-4"
            aria-hidden="true"
          />
          <input
            id="category-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau slug kategori..."
            style={{ borderRadius: "var(--radius-control)" }}
            className="min-h-[44px] w-full border pl-9 pr-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: "var(--surface-white)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-card)",
        }}
        className="overflow-hidden border"
      >
        <div className="overflow-x-auto" role="region" aria-label="Tabel Kategori Kendaraan" tabIndex={0}>
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
                  Nama Kategori
                </th>
                <th className="px-4 py-3 font-semibold">Slug</th>
                <th className="px-4 py-3 font-semibold">Deskripsi</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{ color: "var(--slate-600)" }}
                    className="px-4 py-8 text-center text-sm"
                  >
                    Tidak ada kategori yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((cat) => (
                  <tr key={cat.id}>
                    <th
                      scope="row"
                      style={{
                        backgroundColor: "var(--surface-white)",
                        color: "var(--navy-900)",
                      }}
                      className="sticky left-0 z-10 whitespace-nowrap px-4 py-3 font-semibold"
                    >
                      {cat.name}
                    </th>
                    <td className="px-4 py-3 font-mono text-xs">{cat.slug}</td>
                    <td
                      style={{ color: "var(--slate-600)" }}
                      className="max-w-md px-4 py-3 text-xs"
                    >
                      {cat.description || "-"}
                    </td>
                    <td className="min-w-[180px] px-4 py-3 text-right">
                      <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditDialog(cat)}
                          style={{
                            backgroundColor: "var(--accent-50)",
                            color: "var(--warning-text)",
                            borderColor: "var(--accent-500)",
                            borderRadius: "var(--radius-control)",
                          }}
                          className="inline-flex min-h-[38px] items-center gap-1.5 border px-3 py-1.5 text-xs font-bold whitespace-nowrap shadow-2xs transition-opacity hover:opacity-90"
                        >
                          <Edit2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat)}
                          disabled={loading}
                          style={{
                            backgroundColor: "var(--danger-bg)",
                            color: "var(--danger-text)",
                            borderColor: "var(--danger)",
                            borderRadius: "var(--radius-control)",
                          }}
                          className="inline-flex min-h-[38px] items-center gap-1.5 border px-3 py-1.5 text-xs font-bold whitespace-nowrap shadow-2xs transition-opacity hover:opacity-90"
                        >
                          <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
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

      {/* Native <dialog> for Create/Edit Category */}
      <dialog
        ref={dialogRef}
        aria-labelledby="category-dialog-title"
        style={{
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-elevated)",
        }}
        className="m-auto w-full max-w-md overflow-hidden border p-0 text-left"
      >
        <form onSubmit={handleSave}>
          <div
            style={{
              backgroundColor: "var(--brand-navy-deep)",
              color: "var(--on-dark-fg)",
            }}
            className="flex items-center justify-between gap-3 border-b px-6 py-4"
          >
            <div>
              <span
                style={{
                  backgroundColor: "var(--accent-500)",
                  color: "var(--on-amber-fg)",
                  borderRadius: "var(--radius-badge)",
                }}
                className="inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase"
              >
                Master Kategori Armada
              </span>
              <h2
                id="category-dialog-title"
                className="mt-1 text-lg font-extrabold"
              >
                {editing ? "Edit Kategori Kendaraan" : "Tambah Kategori Baru"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              style={{
                backgroundColor: "rgb(255 255 255 / 0.14)",
                color: "var(--on-dark-fg)",
                borderRadius: "var(--radius-control)",
              }}
              className="px-3 py-1.5 text-xs font-bold hover:bg-white/20"
            >
              Tutup
            </button>
          </div>
          <div className="space-y-4 p-6">

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
              htmlFor="cat-name-input"
              className="block text-xs font-semibold"
            >
              Nama Kategori
            </label>
            <input
              id="cat-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!editing) {
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, ""),
                  );
                }
              }}
              placeholder="Contoh: SUV Premium"
              style={{ borderRadius: "var(--radius-control)" }}
              className="mt-1 min-h-[44px] w-full border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="cat-slug-input"
              className="block text-xs font-semibold"
            >
              Slug URL
            </label>
            <input
              id="cat-slug-input"
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="suv-premium"
              style={{ borderRadius: "var(--radius-control)" }}
              className="mt-1 min-h-[44px] w-full border px-3 py-2 font-mono text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="cat-desc-input"
              className="block text-xs font-semibold"
            >
              Deskripsi
            </label>
            <textarea
              id="cat-desc-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat kategori armada..."
              style={{ borderRadius: "var(--radius-control)" }}
              className="mt-1 w-full border px-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t pt-4">
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
              style={{
                backgroundColor: "var(--primary-600)",
                color: "var(--on-dark-fg)",
                borderRadius: "var(--radius-control)",
              }}
              className="min-h-[44px] px-4 py-2 text-xs font-semibold"
            >
              {loading ? "Menyimpan..." : "Simpan Kategori"}
            </button>
          </div>
          </div>
        </form>
      </dialog>
    </div>
  );
}
