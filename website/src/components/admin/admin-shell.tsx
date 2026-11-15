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
} from "lucide-react";
import { RentGoLogo } from "@/components/shared/logo";
import { AuthControls } from "@/components/shared/auth-controls";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { MobileDrawer } from "@/components/shared/mobile-drawer";
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

  function checkIsActive(href: string) {
    const subRoute = href.slice("/admin".length);
    return href === "/admin"
      ? pathname === "/" || pathname === "/admin" || pathname === "/site/admin"
      : pathname.startsWith(href) ||
          Boolean(subRoute && pathname.startsWith(subRoute)) ||
          pathname.startsWith(`/site${href}`);
  }

  // RBAC Guard for Admin Surface (Unauthenticated)
  if (!user) {
    return (
      <div
        style={{ backgroundColor: "var(--slate-50)" }}
        className="flex min-h-screen flex-col justify-between"
      >
        <header
          style={{ backgroundColor: "var(--brand-navy-deep)" }}
          className="sticky top-0 z-40 border-b px-6 py-4 shadow-xs"
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <RentGoLogo surfaceLabel="Admin Panel" variant="dark" />
            <ThemeToggle />
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
          style={{ backgroundColor: "var(--brand-navy-deep)" }}
          className="sticky top-0 z-40 border-b px-6 py-4 shadow-xs"
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <RentGoLogo surfaceLabel="Admin Panel" variant="dark" />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <AuthControls user={user} variant="dark" />
            </div>
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
                  color: "var(--on-dark-fg)",
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
      {/* Desktop Sticky Sidebar (>= lg) */}
      <aside
        style={{
          backgroundColor: "var(--brand-navy-deep)",
          color: "var(--on-dark-fg)",
        }}
        className="hidden w-72 shrink-0 flex-col justify-between border-r p-5 lg:sticky lg:top-0 lg:flex lg:h-screen lg:overflow-y-auto"
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
              const isActive = checkIsActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-testid={item.testId}
                  style={{
                    backgroundColor: isActive
                      ? "var(--primary-600)"
                      : "transparent",
                    color: "var(--on-dark-fg)",
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
                      color: isActive ? "var(--accent-500)" : "#CCFBF1",
                    }}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
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
        <header className="sticky-glass-header sticky top-0 z-40 shadow-[var(--shadow-xs)]">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              {/* Mobile Logo (< lg) */}
              <div className="flex items-center gap-2.5 lg:hidden">
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

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <div className="hidden sm:block">
                <AuthControls user={user} variant="light" />
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(true)}
                data-testid="mobile-hamburger-button"
                aria-expanded={mobileDrawerOpen}
                aria-label="Toggle Menu Navigasi Admin"
                style={{
                  backgroundColor: "var(--brand-navy-deep)",
                  color: "var(--on-dark-fg)",
                  borderRadius: "var(--radius-control)",
                }}
                className="inline-flex h-10 w-10 items-center justify-center lg:hidden"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Mobile Slide-in Sidebar Drawer (< lg) */}
          <MobileDrawer
            open={mobileDrawerOpen}
            onClose={() => setMobileDrawerOpen(false)}
            titleLabel="Menu Navigasi Administrator"
            surfaceLabel="Admin Panel"
            footer={
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <a
                    href={bookSurfaceUrl}
                    onClick={() => setMobileDrawerOpen(false)}
                    style={{
                      backgroundColor: "var(--bg-subtle)",
                      color: "var(--fg)",
                      borderRadius: "var(--radius-control)",
                    }}
                    className="inline-flex min-h-[40px] items-center justify-between border px-3 py-2 font-bold"
                  >
                    <span>Katalog Booking</span>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                  <a
                    href={landingSurfaceUrl}
                    onClick={() => setMobileDrawerOpen(false)}
                    style={{
                      backgroundColor: "var(--bg-subtle)",
                      color: "var(--fg)",
                      borderRadius: "var(--radius-control)",
                    }}
                    className="inline-flex min-h-[40px] items-center justify-between border px-3 py-2 font-bold"
                  >
                    <span>Beranda Publik</span>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <AuthControls user={user} variant="light" />
                </div>
              </div>
            }
          >
            <nav aria-label="Menu Navigasi Admin Seluler" className="space-y-1.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = checkIsActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileDrawerOpen(false)}
                    style={{
                      backgroundColor: isActive
                        ? "var(--primary-600)"
                        : "transparent",
                      color: isActive ? "var(--primary-fg)" : "var(--fg)",
                      borderRadius: "var(--radius-control)",
                    }}
                    className="flex min-h-[44px] items-center gap-3 px-3.5 py-2.5 text-sm font-bold transition-colors hover:bg-[var(--bg-subtle)]"
                  >
                    <Icon
                      className="h-4 w-4 shrink-0"
                      style={{
                        color: isActive ? "var(--accent-500)" : "var(--primary)",
                      }}
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </MobileDrawer>
        </header>

        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
