"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { RentGoLogo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export interface MobileDrawerProps {
  id?: string;
  open: boolean;
  onClose: () => void;
  titleLabel: string;
  surfaceLabel: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function MobileDrawer({
  id,
  open,
  onClose,
  titleLabel,
  surfaceLabel,
  children,
  footer,
}: MobileDrawerProps) {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const prevPathnameRef = useRef(pathname);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Auto-close on route change
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      if (open) {
        onCloseRef.current();
      }
    }
  }, [pathname, open]);

  // Top-layer modal dialog lifecycle, Escape handling, scroll lock, and desktop resize auto-close
  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    if (mediaQuery.matches) {
      onCloseRef.current();
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    if (!dialog.open) {
      dialog.showModal();
    }

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 10);

    function handleMediaChange(e: MediaQueryListEvent) {
      if (e.matches) {
        onCloseRef.current();
      }
    }

    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      window.clearTimeout(focusTimer);
      mediaQuery.removeEventListener("change", handleMediaChange);
      if (dialog.open) {
        dialog.close();
      }
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      id={id}
      aria-label={titleLabel}
      data-testid="mobile-nav-drawer"
      onCancel={(e) => {
        e.preventDefault();
        onCloseRef.current();
      }}
      onClick={(e) => {
        if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
          onCloseRef.current();
        }
      }}
      style={{
        inset: 0,
        width: "100%",
        height: "100%",
        maxWidth: "none",
        maxHeight: "none",
        margin: 0,
        padding: 0,
        background: "transparent",
        border: 0,
        overflow: "hidden",
      }}
      className="mobile-drawer-dialog fixed inset-0 z-50 lg:hidden"
    >
      {/* Backdrop */}
      <div
        data-testid="mobile-drawer-backdrop"
        onClick={() => onCloseRef.current()}
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
        className="fixed inset-y-0 right-0 z-10 flex h-dvh w-[min(88vw,340px)] flex-col justify-between overflow-y-auto overscroll-contain border-l p-5"
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-2 border-b pb-4">
            <RentGoLogo surfaceLabel={surfaceLabel} variant="light" />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                ref={closeButtonRef}
                type="button"
                autoFocus
                onClick={() => onCloseRef.current()}
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
    </dialog>,
    document.body
  );
}
