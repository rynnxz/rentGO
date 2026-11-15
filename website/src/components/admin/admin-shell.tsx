"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck2,
  CarFront,
  ExternalLink,
  FolderKanban,
  LayoutDashboard,
  Menu,
  ShieldAlert,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { RentGoLogo } from "@/components/shared/logo";
import { AuthControls } from "@/components/shared/auth-controls";
import type { UserRecord } from "@/lib/types";

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Dasbor Utama",
    icon: LayoutDashboard,
    testId: "nav-admin-dashboard",
  },
  {
    href: "/admin/categories",
    label: "Kategori Armada",
    icon: FolderKanban,
    testId: "nav-admin-categories",
  },
  {
    href: "/admin/vehicles",
    label: "Data Kendaraan",
    icon: CarFront,
    testId: "nav-admin-vehicles",
  },
  {
    href: "/admin/bookings",
    label: "Pesanan & Pembayaran",
    icon: CalendarCheck2,
    testId: "nav-admin-bookings",
  },
  {
    href: "/admin/maintenance",
    label: "Jadwal Perawatan",
    icon: Wrench,
    testId: "nav-admin-maintenance",
  },
  {
    href: "/admin/customers",
    label: "Data Pelanggan",
    icon: Users,
    testId: "nav-admin-customers",
  },
];

export function AdminShell({
  user,
  bookSurfaceUrl,
  landingSurfaceUrl,
  children,
}: {
  user: UserRecord | null;
  bookSurfaceUrl: string;
  landingSurfaceUrl: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "/";
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // RBAC Guard for Admin Surface (Unauthenticated)
  if (!user) {
    return (
      <div
        style={{ backgroundColor: "var(--slate-50)" }}
        className="flex min-h-screen flex-col justify-between"
      >
        <header
          style={{ backgroundColor: "var(--navy-900)" }}
          className="sticky top-0 z-40 border-b px-6 py-4 shadow-xs"
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <RentGoLogo surfaceLabel="Admin Panel" variant="dark" />
          </div>
        </header>

        <main
          id="main-content"
          className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-6 py-12 text-center"
        >
          <div
            style={{
              backgroundColor: "var(--surface-white)",
              borderRadius: "var(--radius-card)",
              boxShadow: "var(--shadow-elevated)",
            }}
            className="w-full space-y-5 border p-8"
            data-testid="admin-login-gate"
          >
            <div
              style={{
                backgroundColor: "var(--primary-50)",
                color: "var(--primary-600)",
                borderRadius: "var(--radius-control)",
              }}
              className="mx-auto flex h-12 w-12 items-center justify-center"
            >
              <ShieldAlert className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h1
                style={{ color: "var(--navy-900)" }}
                className="text-2xl font-bold"
              >
                Autentikasi Administrator Diperlukan
              </h1>
              <p style={{ color: "var(--slate-600)" }} className="text-sm">
                Panel operasional <code>rentgo.my.id/admin</code> hanya dapat diakses oleh petugas resmi RentGo Medan yang terdaftar di <code>ADMIN_EMAILS</code>.
              </p>
            </div>
            <div className="flex flex-col items-center justify-center gap-3 pt-2">
              <AuthControls user={null} variant="light" />
              <a
                href={bookSurfaceUrl}
                style={{ color: "var(--primary-600)" }}
                className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold underline"
              >
                <span>Buka Katalog Penyewaan Pelanggan</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // RBAC Guard for Admin Surface (Customer 403)
  if (user.role !== "admin") {
    return (
      <div
        style={{ backgroundColor: "var(--slate-50)" }}
        className="flex min-h-screen flex-col justify-between"
      >
        <header
          style={{ backgroundColor: "var(--navy-900)" }}
          className="sticky top-0 z-40 border-b px-6 py-4 shadow-xs"
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <RentGoLogo surfaceLabel="Admin Panel" variant="dark" />
            <AuthControls user={user} variant="dark" />
          </div>
        </header>

        <main
          id="main-content"
          className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-6 py-12 text-center"
        >
          <div
            style={{
              backgroundColor: "var(--surface-white)",
              borderRadius: "var(--radius-card)",
              boxShadow: "var(--shadow-elevated)",
            }}
            className="w-full space-y-5 border p-8"
            data-testid="admin-access-denied"
          >
            <div
              style={{
                backgroundColor: "var(--danger-bg)",
                color: "var(--danger)",
                borderRadius: "var(--radius-control)",
              }}
              className="mx-auto flex h-12 w-12 items-center justify-center"
            >
              <ShieldAlert className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <span
                style={{
                  backgroundColor: "var(--danger-bg)",
                  color: "var(--danger-text)",
                  borderRadius: "var(--radius-badge)",
                }}
                className="inline-block px-2.5 py-1 text-xs font-bold uppercase"
              >
                HTTP 403 - Akses Ditolak
              </span>
              <h1
                style={{ color: "var(--navy-900)" }}
                className="text-2xl font-bold"
              >
                Akun Pelanggan Tidak Memiliki Hak Admin
              </h1>
              <p style={{ color: "var(--slate-600)" }} className="text-sm">
                Anda masuk sebagai <strong>{user.email}</strong> dengan peran{" "}
                <strong>Customer</strong>. Halaman ini dibatasi untuk Administrator RentGo.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href={bookSurfaceUrl}
                style={{
                  backgroundColor: "var(--primary-600)",
                  color: "var(--surface-white)",
                  borderRadius: "var(--radius-control)",
                }}
                className="inline-flex min-h-[44px] items-center gap-2 px-4 py-2 text-sm font-semibold"
              >
                <span>Kembali ke Aplikasi Booking</span>
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={landingSurfaceUrl}
                style={{
                  backgroundColor: "var(--slate-100)",
                  color: "var(--slate-900)",
                  borderRadius: "var(--radius-control)",
                }}
                className="inline-flex min-h-[44px] items-center px-4 py-2 text-sm font-semibold"
              >
                Ke Halaman Utama
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      style={{ backgroundColor: "var(--slate-50)" }}
      className="flex min-h-screen flex-col lg:flex-row"
    >
      {/* Desktop Sticky Sidebar (Locked to viewport height, never scrolls away) */}
      <aside
        style={{
          backgroundColor: "var(--navy-900)",
          color: "var(--surface-white)",
        }}
        className="hidden w-68 shrink-0 flex-col justify-between border-r p-5 lg:sticky lg:top-0 lg:flex lg:h-screen lg:overflow-y-auto"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2">
            <Link href="/admin" className="inline-flex items-center">
              <RentGoLogo surfaceLabel="Admin Panel" variant="dark" />
            </Link>
          </div>

          <nav aria-label="Navigasi Administrator" className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const subRoute = item.href.slice("/admin".length);
              const isActive =
                item.href === "/admin"
                  ? pathname === "/" ||
                    pathname === "/admin" ||
                    pathname === "/site/admin"
                  : pathname.startsWith(item.href) ||
                    (subRoute && pathname.startsWith(subRoute)) ||
                    pathname.startsWith(`/site${item.href}`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-testid={item.testId}
                  style={{
                    backgroundColor: isActive
                      ? "var(--primary-600)"
                      : "transparent",
                    color: "var(--surface-white)",
                    borderColor: isActive
                      ? "var(--accent-500)"
                      : "transparent",
                    borderRadius: "var(--radius-control)",
                  }}
                  className="flex min-h-[44px] items-center gap-3 border-l-4 px-3.5 py-2.5 text-sm font-semibold transition-all hover:bg-white/10"
                >
                  <Icon
                    className="h-4 w-4 shrink-0"
                    style={{
                      color: isActive
                        ? "var(--accent-500)"
                        : "var(--secondary-100)",
                    }}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div
          style={{
            borderColor: "rgb(255 255 255 / 0.14)",
          }}
          className="mt-6 border-t pt-4"
        >
          <p className="text-[11px] font-bold uppercase tracking-wider opacity-75">
            Pintasan Ekosistem
          </p>
          <div className="mt-2 flex flex-col gap-1.5 text-xs">
            <a
              href={bookSurfaceUrl}
              style={{
                backgroundColor: "rgb(255 255 255 / 0.07)",
                borderRadius: "var(--radius-control)",
              }}
              className="inline-flex min-h-[38px] items-center justify-between px-3 py-1.5 font-semibold opacity-95 hover:bg-white/15"
            >
              <span>Katalog Booking</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <a
              href={landingSurfaceUrl}
              style={{
                backgroundColor: "rgb(255 255 255 / 0.07)",
                borderRadius: "var(--radius-control)",
              }}
              className="inline-flex min-h-[38px] items-center justify-between px-3 py-1.5 font-semibold opacity-95 hover:bg-white/15"
            >
              <span>Beranda Publik</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content Area + Sticky Top Navbar */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header
          style={{ backgroundColor: "var(--surface-white)" }}
          className="sticky top-0 z-40 border-b shadow-xs"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              {/* Mobile Logo & Drawer Button */}
              <div className="flex items-center gap-2.5 lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen((prev) => !prev)}
                  aria-expanded={mobileDrawerOpen}
                  aria-label="Toggle Menu Navigasi Admin"
                  style={{
                    backgroundColor: "var(--navy-900)",
                    color: "var(--surface-white)",
                    borderRadius: "var(--radius-control)",
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center"
                >
                  {mobileDrawerOpen ? (
                    <X className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
                <Link href="/admin" className="inline-flex items-center">
                  <RentGoLogo surfaceLabel="Admin" variant="light" />
                </Link>
              </div>

              <div className="hidden lg:block">
                <p
                  style={{ color: "var(--secondary-700)" }}
                  className="text-xs font-extrabold uppercase tracking-wider"
                >
                  Pusat Kendali Operasional Armada Medan (rentgo.my.id/admin)
                </p>
              </div>
            </div>

            <AuthControls user={user} variant="light" />
          </div>

          {/* Mobile Horizontal Quick-Nav Bar (Always accessible on phones/tablets) */}
          <nav
            aria-label="Navigasi Cepat Seluler"
            style={{ backgroundColor: "var(--slate-50)" }}
            className="flex items-center gap-1.5 overflow-x-auto border-t px-4 py-2 lg:hidden"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const subRoute = item.href.slice("/admin".length);
              const isActive =
                item.href === "/admin"
                  ? pathname === "/" ||
                    pathname === "/admin" ||
                    pathname === "/site/admin"
                  : pathname.startsWith(item.href) ||
                    (subRoute && pathname.startsWith(subRoute)) ||
                    pathname.startsWith(`/site${item.href}`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileDrawerOpen(false)}
                  style={{
                    backgroundColor: isActive
                      ? "var(--primary-600)"
                      : "var(--surface-white)",
                    color: isActive
                      ? "var(--surface-white)"
                      : "var(--navy-900)",
                    borderColor: isActive
                      ? "var(--primary-600)"
                      : "var(--slate-200)",
                    borderRadius: "var(--radius-control)",
                  }}
                  className="inline-flex min-h-[38px] shrink-0 items-center gap-1.5 border px-3 py-1.5 text-xs font-bold shadow-2xs"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Collapsible Mobile Drawer Panel */}
          {mobileDrawerOpen ? (
            <div
              style={{
                backgroundColor: "var(--navy-900)",
                color: "var(--surface-white)",
              }}
              className="border-t p-4 lg:hidden"
            >
              <div className="grid gap-1.5 sm:grid-cols-2">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/"
                      ? pathname === "/" || pathname === "/site/admin"
                      : pathname.startsWith(item.href) ||
                        pathname.startsWith(`/site/admin${item.href}`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileDrawerOpen(false)}
                      style={{
                        backgroundColor: isActive
                          ? "var(--primary-600)"
                          : "rgb(255 255 255 / 0.06)",
                        borderRadius: "var(--radius-control)",
                      }}
                      className="flex min-h-[42px] items-center gap-2.5 px-3 py-2 text-xs font-bold"
                    >
                      <Icon
                        className="h-4 w-4 shrink-0"
                        style={{ color: "var(--accent-500)" }}
                        aria-hidden="true"
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 border-t border-white/15 pt-3 text-xs">
                <a
                  href={bookSurfaceUrl}
                  className="inline-flex items-center gap-1 font-semibold underline"
                >
                  <span>Buka Katalog Booking</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
                <a
                  href={landingSurfaceUrl}
                  className="inline-flex items-center gap-1 font-semibold underline"
                >
                  <span>Beranda Publik</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          ) : null}
        </header>

        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
