"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  function handleToggle() {
    setTheme(isDark ? "light" : "dark");
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      data-testid="theme-toggle-button"
      aria-label={
        mounted
          ? isDark
            ? "Beralih ke tema terang"
            : "Beralih ke tema gelap"
          : "Ubah tema tampilan"
      }
      aria-pressed={isDark}
      title={
        mounted
          ? isDark
            ? "Tema Gelap aktif (Klik untuk Terang)"
            : "Tema Terang aktif (Klik untuk Gelap)"
          : "Ubah tema tampilan"
      }
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--fg)] shadow-[var(--shadow-xs)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary-subtle)] hover:text-[var(--primary)]",
        className
      )}
    >
      {mounted && isDark ? (
        <Sun className="h-4 w-4 text-[var(--accent-500)]" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4 text-[var(--fg-secondary)]" aria-hidden="true" />
      )}
    </button>
  );
}
