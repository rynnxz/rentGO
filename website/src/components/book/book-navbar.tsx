"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, CarFront, ShieldCheck, User } from "lucide-react";
import { RentGoLogo } from "@/components/shared/logo";
import { AuthControls } from "@/components/shared/auth-controls";
import { ThemeToggle } from "@/components/shared/theme-toggle";
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
    {
      href: "/book",
      label: "Katalog Armada",
      icon: CarFront,
      testId: "nav-book-catalog",
    },
    {
      href: "/book/bookings",
      label: "Pesanan Saya",
      icon: CalendarCheck,
      testId: "nav-book-bookings",
    },
    {
      href: "/book/profile",
      label: "Profil & SIM",
      icon: User,
      testId: "nav-book-profile",
    },
  ];

  return (
    <header
      style={{ backgroundColor: "var(--surface-white)" }}
      className="sticky top-0 z-40 border-b shadow-xs"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2.5 px-4 py-2.5 sm:px-6">
        <div className="flex shrink-0 items-center gap-4 lg:gap-5">
          <Link href="/book" className="inline-flex shrink-0 items-center">
            <RentGoLogo surfaceLabel="Booking App" variant="light" />
          </Link>

          <nav
            aria-label="Navigasi Aplikasi Penyewaan"
            className="hidden items-center gap-1 whitespace-nowrap md:flex"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const subRoute = item.href.slice("/book".length);
              const isActive =
                item.href === "/book"
                  ? pathname === "/" ||
                    pathname === "/book" ||
                    pathname === "/site/book"
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
                    color: isActive
                      ? "var(--primary-fg)"
                      : "var(--fg)",
                    borderRadius: "var(--radius-control)",
                  }}
                  className="inline-flex min-h-[40px] items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-colors hover:opacity-90"
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
          <a
            href={landingUrl}
            style={{ color: "var(--fg-secondary)" }}
            className="hidden min-h-[40px] items-center px-2 text-xs font-bold hover:underline lg:inline-flex"
          >
            Beranda Utama
          </a>
          <ThemeToggle />
          {user?.role === "admin" ? (
            <a
              href={adminUrl}
              data-testid="goto-admin-panel-link"
              style={{
                backgroundColor: "var(--brand-navy-deep)",
                color: "var(--on-dark-fg)",
                borderRadius: "var(--radius-control)",
              }}
              className="inline-flex min-h-[40px] items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
            >
              <ShieldCheck
                className="h-3.5 w-3.5 shrink-0"
                style={{ color: "var(--accent-500)" }}
                aria-hidden="true"
              />
              <span>Panel Admin</span>
            </a>
          ) : null}
          <AuthControls user={user} variant="light" />
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <nav
        aria-label="Navigasi Seluler"
        style={{ backgroundColor: "var(--bg)" }}
        className="flex items-center justify-around gap-1 overflow-x-auto border-t px-2 py-1.5 md:hidden"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const subRoute = item.href.slice("/book".length);
          const isActive =
            item.href === "/book"
              ? pathname === "/" ||
                pathname === "/book" ||
                pathname === "/site/book"
              : pathname.startsWith(item.href) ||
                (subRoute && pathname.startsWith(subRoute)) ||
                pathname.startsWith(`/site${item.href}`);

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                backgroundColor: isActive
                  ? "var(--primary-600)"
                  : "transparent",
                color: isActive
                  ? "var(--primary-fg)"
                  : "var(--fg-secondary)",
                borderRadius: "var(--radius-control)",
              }}
              className="flex min-h-[40px] shrink-0 items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
