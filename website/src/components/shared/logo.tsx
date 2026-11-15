import React from "react";

export function RentGoLogo({
  surfaceLabel,
  subtitle,
  variant = "light",
}: {
  surfaceLabel?: string;
  subtitle?: string;
  variant?: "light" | "dark";
}) {
  const isDark = variant === "dark";
  const label = surfaceLabel ?? subtitle;

  return (
    <div
      className="inline-flex items-center gap-2.5 select-none"
      aria-label={`RentGo Medan ${label ?? ""}`.trim()}
    >
      {/* Minimalist Geometric Typography Slash Mark (Triadic Speed Bars) */}
      <span
        aria-hidden="true"
        className="inline-flex items-end gap-0.5 py-0.5"
      >
        <span
          style={{
            backgroundColor: isDark ? "var(--on-dark-fg)" : "var(--primary)",
          }}
          className="h-6 w-1.5 -skew-x-16 rounded-[2px]"
        />
        <span
          style={{ backgroundColor: "var(--secondary)" }}
          className="h-5 w-1.5 -skew-x-16 rounded-[2px]"
        />
        <span
          style={{ backgroundColor: "var(--accent-500)" }}
          className="h-3.5 w-1.5 -skew-x-16 rounded-[2px]"
        />
      </span>

      {/* Pure Editorial Typography Wordmark: RENTGO. MDN */}
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline tracking-tighter">
          <span
            style={{
              color: isDark ? "var(--on-dark-fg)" : "var(--fg)",
            }}
            className="text-xl font-black uppercase sm:text-2xl"
          >
            RENT
          </span>
          <span
            style={{
              color: isDark ? "var(--accent-500)" : "var(--primary)",
            }}
            className="text-xl font-black italic uppercase sm:text-2xl"
          >
            GO
          </span>
          <span
            style={{ color: "var(--secondary)" }}
            className="ml-0.5 text-2xl font-black leading-none"
            aria-hidden="true"
          >
            .
          </span>
          <span
            style={{
              backgroundColor: isDark
                ? "rgb(255 255 255 / 0.14)"
                : "var(--bg-subtle)",
              color: isDark ? "var(--on-dark-fg)" : "var(--fg-secondary)",
              borderColor: isDark
                ? "rgb(255 255 255 / 0.22)"
                : "var(--border)",
            }}
            className="ml-2 rounded border px-1.5 py-0.5 font-mono text-[9px] font-extrabold tracking-widest uppercase"
          >
            MDN
          </span>
        </div>

        {label ? (
          <span
            style={{
              color: isDark ? "#CCFBF1" : "var(--secondary-700)",
            }}
            className="mt-0.5 font-mono text-[9px] font-bold tracking-[0.16em] uppercase"
          >
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
