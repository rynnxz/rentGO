"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { RentGoLogo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  titleLabel: string;
  surfaceLabel: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function MobileDrawer({
  open,
  onClose,
  titleLabel,
  surfaceLabel,
  children,
  footer,
}: MobileDrawerProps) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const prevPathnameRef = useRef(pathname);

  // Auto-close on route change
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      if (open) {
        onClose();
      }
    }
  }, [pathname, open, onClose]);

  // Esc key + Focus Trap + Body scroll lock
  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 10);

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={titleLabel}
      data-testid="mobile-nav-drawer"
    >
      {/* Backdrop */}
      <div
        data-testid="mobile-drawer-backdrop"
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-in Sheet */}
      <div
        ref={panelRef}
        style={{
          backgroundColor: "var(--surface-elevated)",
          color: "var(--fg)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-elevated)",
        }}
        className="fixed inset-y-0 right-0 z-10 flex w-[min(88vw,340px)] flex-col justify-between border-l p-5 overflow-y-auto"
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-2 border-b pb-4">
            <RentGoLogo surfaceLabel={surfaceLabel} variant="light" />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                data-testid="mobile-drawer-close"
                aria-label="Tutup menu navigasi"
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  color: "var(--fg)",
                  borderRadius: "var(--radius-control)",
                }}
                className="inline-flex h-10 w-10 items-center justify-center border"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="space-y-2">{children}</div>
        </div>

        {footer ? (
          <div className="mt-6 border-t pt-4">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
