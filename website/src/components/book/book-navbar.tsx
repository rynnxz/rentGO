"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  CarFront,
  ExternalLink,
  Menu,
  ShieldCheck,
  User,
} from "lucide-react";
import { RentGoLogo } from "@/components/shared/logo";
import { AuthControls } from "@/components/shared/auth-controls";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { MobileDrawer } from "@/components/shared/mobile-drawer";
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
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  function checkIsActive(href: string) {
    const subRoute = href.slice("/book".length);
    return href === "/book"
      ? pathname === "/" || pathname === "/book" || pathname === "/site/book"
      : pathname.startsWith(href) ||
          Boolean(subRoute && pathname.startsWith(subRoute)) ||
          pathname.startsWith(`/site${href}`);
  }

  return (
    <header className="sticky-glass-header sticky top-0 z-40 shadow-[var(--shadow-xs)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex shrink-0 items-center gap-4 lg:gap-5">
          <Link href="/book" className="inline-flex shrink-0 items-center">
            <RentGoLogo surfaceLabel="Booking App" variant="light" />
          </Link>

          {/* Desktop Navigation (>= lg) */}
          <nav
            aria-label="Navigasi Aplikasi Penyewaan"
            className="hidden items-center gap-1.5 whitespace-nowrap lg:flex"
          >
            {navItems.map((item) => {
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
                    color: isActive ? "var(--primary-fg)" : "var(--fg)",
                    borderRadius: "var(--radius-control)",
                  }}
                  className="inline-flex min-h-[40px] items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-colors hover:bg-[var(--bg-subtle)]"
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Desktop Actions (>= lg) */}
        <div className="hidden shrink-0 items-center gap-2 whitespace-nowrap lg:flex">
          <a
            href={landingUrl}
            style={{ color: "var(--fg-secondary)" }}
            className="inline-flex min-h-[40px] items-center px-2 text-xs font-bold hover:text-[var(--fg)] hover:underline"
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

        {/* Mobile & Tablet Actions (< lg) */}
        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <ThemeToggle />
          <div className="hidden sm:block">
            <AuthControls user={user} variant="light" />
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            data-testid="mobile-hamburger-button"
            aria-label="Buka menu navigasi"
            aria-expanded={drawerOpen}
            style={{
              backgroundColor: "var(--surface-elevated)",
              color: "var(--fg)",
              borderColor: "var(--border)",
              borderRadius: "var(--radius-control)",
            }}
            className="inline-flex h-10 w-10 items-center justify-center border shadow-[var(--shadow-xs)]"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Slide-in Drawer (< lg) */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        titleLabel="Menu Navigasi Aplikasi Booking"
        surfaceLabel="Booking App"
        footer={
          <div className="space-y-3">
            <a
              href={landingUrl}
              onClick={() => setDrawerOpen(false)}
              style={{
                backgroundColor: "var(--bg-subtle)",
                color: "var(--fg)",
                borderRadius: "var(--radius-control)",
              }}
              className="flex min-h-[44px] w-full items-center justify-between border px-3.5 py-2.5 text-xs font-bold"
            >
              <span>Beranda Utama RentGo</span>
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>

            {user?.role === "admin" ? (
              <a
                href={adminUrl}
                onClick={() => setDrawerOpen(false)}
                style={{
                  backgroundColor: "var(--brand-navy-deep)",
                  color: "var(--on-dark-fg)",
                  borderRadius: "var(--radius-control)",
                }}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-bold"
              >
                <ShieldCheck
                  className="h-4 w-4"
                  style={{ color: "var(--accent-500)" }}
                  aria-hidden="true"
                />
                <span>Panel Admin</span>
              </a>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <AuthControls user={user} variant="light" />
            </div>
          </div>
        }
      >
        <nav aria-label="Menu Navigasi Seluler" className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = checkIsActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setDrawerOpen(false)}
                style={{
                  backgroundColor: isActive
                    ? "var(--primary-600)"
                    : "transparent",
                  color: isActive ? "var(--primary-fg)" : "var(--fg)",
                  borderRadius: "var(--radius-control)",
                }}
                className="flex min-h-[44px] items-center gap-3 px-3.5 py-2.5 text-sm font-bold transition-colors hover:bg-[var(--bg-subtle)]"
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </MobileDrawer>
    </header>
  );
}
