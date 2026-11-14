"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, CarFront, ShieldCheck, User } from "lucide-react";
import { RentGoLogo } from "@/components/shared/logo";
import { AuthControls } from "@/components/shared/auth-controls";
import type { UserRecord } from "@/lib/types";

export function BookNavbar({
  user,
  landingUrl,
  adminUrl,
}: {
  user: UserRecord | null;
  landingUrl: string;
  adminUrl: string;
}) {
  const pathname = usePathname() || "/";

  const navItems = [
    { href: "/", label: "Katalog Armada", icon: CarFront, testId: "nav-book-catalog" },
    { href: "/bookings", label: "Pesanan Saya", icon: CalendarCheck, testId: "nav-book-bookings" },
    { href: "/profile", label: "Profil & SIM", icon: User, testId: "nav-book-profile" },
  ];

  return (
    <header
      style={{ backgroundColor: "var(--surface-white)" }}
      className="sticky top-0 z-30 border-b"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="inline-flex items-center">
            <RentGoLogo surfaceLabel="Booking App" variant="light" />
          </Link>

          <nav
            aria-label="Navigasi Aplikasi Penyewaan"
            className="hidden items-center gap-1 md:flex"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/" || pathname === "/site/book"
                  : pathname.startsWith(item.href) ||
                    pathname.startsWith(`/site/book${item.href}`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-testid={item.testId}
                  style={{
                    backgroundColor: isActive
                      ? "var(--primary-50)"
                      : "transparent",
                    color: isActive
                      ? "var(--primary-700)"
                      : "var(--slate-900)",
                    borderRadius: "var(--radius-control)",
                  }}
                  className="inline-flex min-h-[44px] items-center gap-2 px-3.5 py-2 text-sm font-semibold transition-colors hover:opacity-90"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={landingUrl}
            style={{ color: "var(--slate-600)" }}
            className="hidden min-h-[44px] items-center px-2.5 text-xs font-semibold hover:underline sm:inline-flex"
          >
            Beranda Utama
          </a>
          {user?.role === "admin" ? (
            <a
              href={adminUrl}
              data-testid="goto-admin-panel-link"
              style={{
                backgroundColor: "var(--navy-900)",
                color: "var(--surface-white)",
                borderRadius: "var(--radius-control)",
              }}
              className="inline-flex min-h-[44px] items-center gap-1.5 px-3 py-2 text-xs font-semibold"
            >
              <ShieldCheck
                className="h-4 w-4"
                style={{ color: "var(--accent-500)" }}
                aria-hidden="true"
              />
              <span>Panel Admin</span>
            </a>
          ) : null}
          <AuthControls user={user} variant="light" />
        </div>
      </div>

      {/* Mobile Bottom / Sub Bar */}
      <nav
        aria-label="Navigasi Seluler"
        className="flex items-center justify-around border-t px-2 py-1.5 md:hidden"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/" || pathname === "/site/book"
              : pathname.startsWith(item.href) ||
                pathname.startsWith(`/site/book${item.href}`);

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                color: isActive ? "var(--primary-600)" : "var(--slate-600)",
                borderRadius: "var(--radius-control)",
              }}
              className="flex min-h-[44px] items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
