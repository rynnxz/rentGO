"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck2,
  CarFront,
  FolderKanban,
  LayoutDashboard,
  Palette,
  ShieldAlert,
  Users,
  Wrench,
  ExternalLink,
} from "lucide-react";
import { RentGoLogo } from "@/components/shared/logo";
import { AuthControls } from "@/components/shared/auth-controls";
import type { UserRecord } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/", label: "Dasbor Utama", icon: LayoutDashboard, testId: "nav-admin-dashboard" },
  { href: "/categories", label: "Kategori Armada", icon: FolderKanban, testId: "nav-admin-categories" },
  { href: "/vehicles", label: "Data Kendaraan", icon: CarFront, testId: "nav-admin-vehicles" },
  { href: "/bookings", label: "Pesanan & Pembayaran", icon: CalendarCheck2, testId: "nav-admin-bookings" },
  { href: "/maintenance", label: "Jadwal Perawatan", icon: Wrench, testId: "nav-admin-maintenance" },
  { href: "/customers", label: "Data Pelanggan", icon: Users, testId: "nav-admin-customers" },
  { href: "/_styleguide", label: "Panduan Desain", icon: Palette, testId: "nav-admin-styleguide" },
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
  const isStyleguide = pathname.includes("_styleguide");

  // RBAC Guard for Admin Surface
  if (!isStyleguide && !user) {
    return (
      <div
        style={{ backgroundColor: "var(--slate-50)" }}
        className="flex min-h-screen flex-col justify-between"
      >
        <header
          style={{ backgroundColor: "var(--navy-900)" }}
          className="border-b px-6 py-4"
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
                Panel operasional <code>admin.rentgo.my.id</code> hanya dapat diakses oleh petugas resmi RentGo Medan yang terdaftar di <code>ADMIN_EMAILS</code>.
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

  if (!isStyleguide && user && user.role !== "admin") {
    return (
      <div
        style={{ backgroundColor: "var(--slate-50)" }}
        className="flex min-h-screen flex-col justify-between"
      >
        <header
          style={{ backgroundColor: "var(--navy-900)" }}
          className="border-b px-6 py-4"
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
      {/* Navy Sidebar */}
      <aside
        style={{ backgroundColor: "var(--navy-900)", color: "var(--surface-white)" }}
        className="w-full shrink-0 lg:w-64 lg:min-h-screen"
      >
        <div className="flex h-full flex-col justify-between p-4 lg:p-5">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="inline-flex items-center">
                <RentGoLogo surfaceLabel="Admin Panel" variant="dark" />
              </Link>
            </div>

            <nav aria-label="Navigasi Administrator" className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-1">
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
                    data-testid={item.testId}
                    style={{
                      backgroundColor: isActive
                        ? "var(--primary-600)"
                        : "transparent",
                      color: "var(--surface-white)",
                      borderRadius: "var(--radius-control)",
                    }}
                    className="flex min-h-[44px] items-center gap-2.5 px-3 py-2 text-xs font-semibold transition-colors hover:opacity-95 lg:text-sm"
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
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
            className="mt-6 hidden border-t pt-4 lg:block"
          >
            <p className="text-xs font-semibold opacity-80">Pintasan Subdomain</p>
            <div className="mt-2 flex flex-col gap-1.5 text-xs">
              <a
                href={bookSurfaceUrl}
                className="inline-flex min-h-[36px] items-center justify-between opacity-90 hover:underline"
              >
                <span>book.rentgo.my.id</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
              <a
                href={landingSurfaceUrl}
                className="inline-flex min-h-[36px] items-center justify-between opacity-90 hover:underline"
              >
                <span>rentgo.my.id</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header
          style={{ backgroundColor: "var(--surface-white)" }}
          className="border-b px-4 py-3 sm:px-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p
                style={{ color: "var(--slate-600)" }}
                className="text-xs font-semibold uppercase tracking-wider"
              >
                Pusat Kendali Operasional Armada Medan
              </p>
            </div>
            <AuthControls user={user} variant="light" />
          </div>
        </header>

        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
