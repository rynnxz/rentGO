"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck, UserCheck, UserX } from "lucide-react";
import type { UserRecord, UserRole } from "@/lib/types";

export function CustomersManager({
  initialUsers,
}: {
  initialUsers: Array<UserRecord & { total_bookings: number }>;
}) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const hay =
        `${u.full_name} ${u.email} ${u.phone ?? ""} ${u.driver_license_no ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [users, search]);

  async function handleUpdateUser(
    target: UserRecord & { total_bookings: number },
    patch: { role?: UserRole; is_active?: boolean },
  ) {
    setLoading(true);
    setErrorMsg(null);
    setFeedback(null);
    try {
      const res = await fetch(`/api/users/${target.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal memperbarui data pengguna.");
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === target.id
            ? { ...json.data, total_bookings: u.total_bookings }
            : u,
        ),
      );
      setFeedback(`Akun "${target.full_name}" berhasil diperbarui.`);
      router.refresh();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal memperbarui akun.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6" data-testid="admin-customers-view">
      <div>
        <h1
          style={{ color: "var(--navy-900)" }}
          className="text-2xl font-bold sm:text-3xl"
        >
          Data Pelanggan & Hak Akses Pengguna
        </h1>
        <p style={{ color: "var(--slate-600)" }} className="mt-1 text-sm">
          Daftar pengguna terautentikasi via Firebase Google Sign-In, histori jumlah pesanan, serta pengelolaan peran (Admin/Customer) dan status aktif akun.
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

      <div
        style={{
          backgroundColor: "var(--surface-white)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-card)",
        }}
        className="border p-4"
      >
        <div className="relative max-w-md">
          <label htmlFor="customer-search" className="sr-only">
            Cari pelanggan
          </label>
          <Search
            style={{ color: "var(--slate-400)" }}
            className="pointer-events-none absolute left-3 top-3.5 h-4 w-4"
            aria-hidden="true"
          />
          <input
            id="customer-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, email, nomor HP, atau nomor SIM..."
            style={{ borderRadius: "var(--radius-control)" }}
            className="min-h-[44px] w-full border pl-9 pr-3 py-2 text-sm"
          />
        </div>
      </div>

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
          aria-label="Tabel Pelanggan Terdaftar"
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
                  Nama & Email
                </th>
                <th className="px-4 py-3 font-semibold">Nomor HP</th>
                <th className="px-4 py-3 font-semibold">Nomor SIM A/C</th>
                <th className="px-4 py-3 text-center font-semibold">
                  Total Sewa
                </th>
                <th className="px-4 py-3 font-semibold">Peran (Role)</th>
                <th className="px-4 py-3 font-semibold">Status Akun</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{ color: "var(--slate-600)" }}
                    className="px-4 py-8 text-center text-sm"
                  >
                    Tidak ada pelanggan yang ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id}>
                    <th
                      scope="row"
                      style={{
                        backgroundColor: "var(--surface-white)",
                        color: "var(--navy-900)",
                      }}
                      className="sticky left-0 z-10 whitespace-nowrap px-4 py-3 font-semibold"
                    >
                      <p>{u.full_name}</p>
                      <p
                        style={{ color: "var(--slate-600)" }}
                        className="text-xs font-normal"
                      >
                        {u.email}
                      </p>
                    </th>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">
                      {u.phone || "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">
                      {u.driver_license_no || "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center font-bold tabular-nums">
                      {u.total_bookings}x
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        style={{
                          backgroundColor:
                            u.role === "admin"
                              ? "var(--accent-50)"
                              : "var(--primary-50)",
                          color:
                            u.role === "admin"
                              ? "var(--accent-600)"
                              : "var(--primary-700)",
                          borderRadius: "var(--radius-badge)",
                        }}
                        className="inline-block px-2.5 py-1 text-xs font-bold uppercase"
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        style={{
                          backgroundColor: u.is_active
                            ? "var(--success-bg)"
                            : "var(--danger-bg)",
                          color: u.is_active
                            ? "var(--success-text)"
                            : "var(--danger-text)",
                          borderRadius: "var(--radius-badge)",
                        }}
                        className="inline-block px-2.5 py-1 text-xs font-semibold"
                      >
                        {u.is_active ? "Aktif" : "Dibekukan"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() =>
                            handleUpdateUser(u, {
                              role: u.role === "admin" ? "customer" : "admin",
                            })
                          }
                          style={{
                            backgroundColor: "var(--slate-100)",
                            color: "var(--slate-900)",
                            borderRadius: "var(--radius-control)",
                          }}
                          className="inline-flex min-h-[44px] items-center gap-1 px-3 py-1.5 text-xs font-semibold"
                        >
                          <ShieldCheck
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                          <span>
                            {u.role === "admin"
                              ? "Set Customer"
                              : "Set Admin"}
                          </span>
                        </button>

                        <button
                          type="button"
                          disabled={loading}
                          onClick={() =>
                            handleUpdateUser(u, {
                              is_active: !u.is_active,
                            })
                          }
                          style={{
                            backgroundColor: u.is_active
                              ? "var(--danger-bg)"
                              : "var(--success-bg)",
                            color: u.is_active
                              ? "var(--danger-text)"
                              : "var(--success-text)",
                            borderRadius: "var(--radius-control)",
                          }}
                          className="inline-flex min-h-[44px] items-center gap-1 px-3 py-1.5 text-xs font-semibold"
                        >
                          {u.is_active ? (
                            <>
                              <UserX
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                              />
                              <span>Nonaktifkan</span>
                            </>
                          ) : (
                            <>
                              <UserCheck
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                              />
                              <span>Aktifkan</span>
                            </>
                          )}
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
    </div>
  );
}
