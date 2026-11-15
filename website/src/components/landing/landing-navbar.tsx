"use client";

import React, { useState } from "react";
import {
  CalendarCheck2,
  CarFront,
  Compass,
  HelpCircle,
  Menu,
  ReceiptText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { RentGoLogo } from "@/components/shared/logo";
import { AuthControls } from "@/components/shared/auth-controls";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { MobileDrawer } from "@/components/shared/mobile-drawer";
import type { UserRecord } from "@/lib/types";

const LANDING_NAV_LINKS = [
  { href: "#keunggulan", label: "Keunggulan", icon: Sparkles },
  { href: "#armada", label: "Armada", icon: CarFront },
  { href: "#alur", label: "Cara Sewa", icon: CalendarCheck2 },
  { href: "#tarif", label: "Tarif", icon: ReceiptText },
  { href: "#lokasi", label: "Lokasi", icon: Compass },
  { href: "#faq", label: "FAQ", icon: HelpCircle },
];

export function LandingNavbar({
  user,
  bookUrl,
  adminUrl,
}: {
  user: UserRecord | null;
  bookUrl: string;
  adminUrl: string;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <header className="sticky-glass-header sticky top-0 z-40 shadow-[var(--shadow-xs)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <a href="#" className="inline-flex shrink-0 items-center">
          <RentGoLogo surfaceLabel="Medan & Kualanamu" variant="light" />
        </a>

        {/* Desktop Nav (>= lg) */}
        <nav
          aria-label="Navigasi Halaman Utama"
          className="hidden items-center gap-1 whitespace-nowrap text-xs font-semibold lg:flex xl:gap-2 xl:text-sm"
        >
          {LANDING_NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{ color: "var(--fg-secondary)" }}
              className="inline-flex min-h-[40px] items-center rounded-[var(--radius-control)] px-2.5 py-1.5 transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--fg)]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions (>= lg) */}
        <div className="hidden shrink-0 items-center gap-2 whitespace-nowrap lg:flex">
          <ThemeToggle />
          {user?.role === "admin" ? (
            <a
              href={adminUrl}
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
          <a
            href={bookUrl}
            data-testid="navbar-cta-book"
            style={{
              backgroundColor: "var(--primary-600)",
              color: "var(--primary-fg)",
              borderRadius: "var(--radius-control)",
            }}
            className="inline-flex min-h-[40px] items-center px-3.5 py-1.5 text-xs font-bold shadow-[var(--shadow-xs)] transition-all hover:opacity-95"
          >
            Buka Aplikasi Booking
          </a>
          <AuthControls user={user} variant="light" />
        </div>

        {/* Mobile & Tablet Compact Actions (< lg) */}
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
        titleLabel="Menu Navigasi Halaman Utama"
        surfaceLabel="Medan & Kualanamu"
        footer={
          <div className="space-y-3">
            <a
              href={bookUrl}
              onClick={() => setDrawerOpen(false)}
              style={{
                backgroundColor: "var(--primary-600)",
                color: "var(--primary-fg)",
                borderRadius: "var(--radius-control)",
              }}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold shadow-[var(--shadow-xs)]"
            >
              <CalendarCheck2 className="h-4 w-4" aria-hidden="true" />
              <span>Buka Aplikasi Booking</span>
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
                className="flex min-h-[44px] w-full items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold"
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
        <nav aria-label="Menu Navigasi Seluler" className="space-y-1">
          {LANDING_NAV_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setDrawerOpen(false)}
                style={{
                  color: "var(--fg)",
                  borderRadius: "var(--radius-control)",
                }}
                className="flex min-h-[44px] items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--bg-subtle)]"
              >
                <Icon
                  className="h-4 w-4 shrink-0 text-[var(--primary)]"
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </MobileDrawer>
    </header>
  );
}
