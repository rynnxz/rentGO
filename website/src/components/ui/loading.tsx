import React from "react";
import { cn } from "@/lib/utils";

export type SpinnerSize = "xs" | "sm" | "md" | "lg";
export type SpinnerTone =
  | "current"
  | "primary"
  | "secondary"
  | "accent"
  | "danger"
  | "light";

const SIZE_CONFIG: Record<SpinnerSize, { size: string; thickness: string }> = {
  xs: { size: "14px", thickness: "2px" },
  sm: { size: "16px", thickness: "2.25px" },
  md: { size: "22px", thickness: "2.75px" },
  lg: { size: "32px", thickness: "3.25px" },
};

const TONE_CONFIG: Record<SpinnerTone, { color: string; track: string }> = {
  current: {
    color: "currentColor",
    track: "rgb(148 163 184 / 0.32)",
  },
  primary: {
    color: "var(--primary-600)",
    track: "var(--primary-100)",
  },
  secondary: {
    color: "var(--secondary-600)",
    track: "var(--secondary-100)",
  },
  accent: {
    color: "var(--accent-500)",
    track: "rgb(245 158 11 / 0.25)",
  },
  danger: {
    color: "var(--danger)",
    track: "rgb(220 38 38 / 0.2)",
  },
  light: {
    color: "#FFFFFF",
    track: "rgb(255 255 255 / 0.28)",
  },
};

export interface LoadingSpinnerProps {
  size?: SpinnerSize;
  tone?: SpinnerTone;
  label?: string;
  className?: string;
  testId?: string;
}

/**
 * Semantic indeterminate loading spinner built on native `<progress>`.
 */
export function LoadingSpinner({
  size = "sm",
  tone = "current",
  label = "Memuat data",
  className,
  testId,
}: LoadingSpinnerProps) {
  const { size: sizePx, thickness } = SIZE_CONFIG[size];
  const { color, track } = TONE_CONFIG[tone];

  return (
    <progress
      aria-label={label}
      data-testid={testId}
      style={
        {
          "--size": sizePx,
          "--thickness": thickness,
          "--spinner-color": color,
          "--track-color": track,
        } as React.CSSProperties
      }
      className={cn("loading-spinner", className)}
    />
  );
}

export interface LoadingBarProps {
  label?: string;
  tone?: "primary" | "secondary" | "accent";
  height?: string;
  className?: string;
  testId?: string;
}

const BAR_TONE_CONFIG: Record<
  NonNullable<LoadingBarProps["tone"]>,
  { fill: string; track: string }
> = {
  primary: {
    fill: "var(--primary-600)",
    track: "var(--primary-100)",
  },
  secondary: {
    fill: "var(--secondary-600)",
    track: "var(--secondary-100)",
  },
  accent: {
    fill: "var(--accent-500)",
    track: "var(--accent-100)",
  },
};

/**
 * Semantic indeterminate horizontal progress bar built on native `<progress>`.
 */
export function LoadingBar({
  label = "Memproses permintaan ke server",
  tone = "primary",
  height = "4px",
  className,
  testId,
}: LoadingBarProps) {
  const { fill, track } = BAR_TONE_CONFIG[tone];

  return (
    <progress
      aria-label={label}
      data-testid={testId}
      style={
        {
          "--progress-bar-height": height,
          "--progress-bar-fill": fill,
          "--progress-bar-track": track,
        } as React.CSSProperties
      }
      className={cn("loading-bar", className)}
    />
  );
}

export interface LoadingStatusBannerProps {
  title: string;
  description?: string;
  tone?: "primary" | "secondary" | "accent";
  className?: string;
  testId?: string;
}

/**
 * Accessible status banner combining an indeterminate progress bar, spinner,
 * and specific contextual explanation of what is being fetched or updated (R-27).
 */
export function LoadingStatusBanner({
  title,
  description,
  tone = "primary",
  className,
  testId = "loading-status-banner",
}: LoadingStatusBannerProps) {
  const palette =
    tone === "secondary"
      ? {
          bg: "var(--secondary-50)",
          border: "var(--secondary-600)",
          titleColor: "var(--secondary-700)",
        }
      : tone === "accent"
        ? {
            bg: "var(--accent-50)",
            border: "var(--accent-500)",
            titleColor: "var(--warning-text)",
          }
        : {
            bg: "var(--primary-50)",
            border: "var(--primary-600)",
            titleColor: "var(--primary-700)",
          };

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid={testId}
      style={{
        backgroundColor: palette.bg,
        borderColor: palette.border,
        borderRadius: "var(--radius-control)",
      }}
      className={cn("overflow-hidden border shadow-2xs", className)}
    >
      <LoadingBar label={title} tone={tone} height="3px" />
      <div className="flex items-center gap-3 px-3.5 py-2.5">
        <LoadingSpinner size="sm" tone={tone} label={title} />
        <div className="min-w-0 flex-1">
          <p
            style={{ color: palette.titleColor }}
            className="text-xs font-extrabold leading-snug"
          >
            {title}
          </p>
          {description ? (
            <p
              style={{ color: "var(--slate-600)" }}
              className="mt-0.5 text-[11px] leading-snug"
            >
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * Vehicle catalog card skeleton used during route transitions and date availability re-fetches.
 */
export function CatalogCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      aria-hidden="true"
      data-testid="catalog-cards-skeleton"
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }, (_, idx) => (
        <div
          key={idx}
          style={{
            backgroundColor: "var(--surface-white)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-card)",
          }}
          className="flex flex-col justify-between overflow-hidden border"
        >
          <div
            style={{ backgroundColor: "var(--slate-100)" }}
            className="h-44 w-full animate-pulse border-b"
          />
          <div className="space-y-3 p-5">
            <div className="flex items-center justify-between gap-2">
              <div
                style={{ backgroundColor: "var(--slate-200)" }}
                className="h-5 w-40 animate-pulse rounded"
              />
              <div
                style={{ backgroundColor: "var(--slate-100)" }}
                className="h-4 w-20 animate-pulse rounded"
              />
            </div>
            <div
              style={{ backgroundColor: "var(--slate-100)" }}
              className="h-3.5 w-full animate-pulse rounded"
            />
            <div
              style={{ backgroundColor: "var(--slate-100)" }}
              className="h-12 w-full animate-pulse rounded-lg"
            />
          </div>
          <div className="flex items-center justify-between border-t px-5 py-4">
            <div
              style={{ backgroundColor: "var(--slate-200)" }}
              className="h-6 w-28 animate-pulse rounded"
            />
            <div
              style={{ backgroundColor: "var(--primary-100)" }}
              className="h-10 w-32 animate-pulse rounded-lg"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Data table skeleton used for Admin & Booking route loading states.
 */
export function TableRowsSkeleton({
  rows = 5,
  columns = 6,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        backgroundColor: "var(--surface-white)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card)",
      }}
      className="overflow-hidden border"
    >
      <div
        style={{ backgroundColor: "var(--slate-100)" }}
        className="grid gap-4 border-b px-4 py-3"
      >
        <div
          style={{ backgroundColor: "var(--slate-200)" }}
          className="h-4 w-48 animate-pulse rounded"
        />
      </div>
      <div className="divide-y p-4">
        {Array.from({ length: rows }, (_, rIdx) => (
          <div
            key={rIdx}
            className="grid grid-cols-2 items-center gap-4 py-3.5 sm:grid-cols-6"
          >
            {Array.from({ length: Math.min(columns, 6) }, (__, cIdx) => (
              <div
                key={cIdx}
                style={{
                  backgroundColor:
                    cIdx === 0 ? "var(--slate-200)" : "var(--slate-100)",
                }}
                className="h-4 w-full animate-pulse rounded"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
