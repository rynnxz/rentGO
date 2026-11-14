import React from "react";

export function RentGoLogo({
  variant = "light",
  subtitle,
  surfaceLabel,
}: {
  variant?: "dark" | "light";
  subtitle?: string;
  surfaceLabel?: string;
}) {
  const label = surfaceLabel ?? subtitle;
  const textColor =
    variant === "dark" ? "var(--surface-white)" : "var(--navy-900)";
  const subColor =
    variant === "dark" ? "var(--primary-100)" : "var(--slate-600)";

  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          x="2"
          y="2"
          width="32"
          height="32"
          rx="8"
          fill="var(--navy-900)"
          stroke="var(--accent-500)"
          strokeWidth="2"
        />
        <path
          d="M9 22L12.5 14.5C13.1 13.3 14.3 12.5 15.6 12.5H20.4C21.7 12.5 22.9 13.3 23.5 14.5L27 22"
          stroke="var(--surface-white)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="13" cy="23.5" r="2.5" fill="var(--accent-500)" />
        <circle cx="23" cy="23.5" r="2.5" fill="var(--accent-500)" />
        <path
          d="M14 17.5H22"
          stroke="var(--accent-500)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span className="flex flex-col leading-none">
        <span
          style={{ color: textColor }}
          className="text-lg font-extrabold tracking-tight"
        >
          Rent<span style={{ color: "var(--accent-500)" }}>Go</span>
        </span>
        {label ? (
          <span
            style={{ color: subColor }}
            className="text-[11px] font-semibold tracking-wide"
          >
            {label}
          </span>
        ) : null}
      </span>
    </span>
  );
}
