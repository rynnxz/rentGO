import React from "react";
import type {
  BookingStatus,
  MaintenanceStatus,
  PaymentStatus,
  VehicleStatus,
} from "@/lib/types";
import {
  getDisplayStatus,
  type DisplayStatusVariant,
} from "@/lib/booking-state";

export function BookingStatusBadge({
  status,
  paymentStatus,
}: {
  status: BookingStatus;
  paymentStatus?: PaymentStatus | null;
}) {
  const display = getDisplayStatus(status, paymentStatus);

  const variantStyles: Record<DisplayStatusVariant, React.CSSProperties> = {
    amber: {
      backgroundColor: "var(--warning-bg)",
      color: "var(--warning-text)",
      borderColor: "var(--warning)",
    },
    blue: {
      backgroundColor: "var(--primary-100)",
      color: "var(--primary-700)",
      borderColor: "var(--primary-600)",
    },
    teal: {
      backgroundColor: "var(--info-bg)",
      color: "var(--info-text)",
      borderColor: "var(--info)",
    },
    emerald: {
      backgroundColor: "var(--success-bg)",
      color: "var(--success-text)",
      borderColor: "var(--success)",
    },
    slate: {
      backgroundColor: "var(--slate-100)",
      color: "var(--slate-600)",
      borderColor: "var(--slate-400)",
    },
    red: {
      backgroundColor: "var(--danger-bg)",
      color: "var(--danger-text)",
      borderColor: "var(--danger)",
    },
  };

  return (
    <span
      data-testid="booking-status-badge"
      data-status-key={display.key}
      data-status-variant={display.variant}
      style={{
        ...variantStyles[display.variant],
        borderRadius: "var(--radius-badge)",
      }}
      className="inline-flex items-center gap-1.5 border px-2.5 py-1 text-xs font-semibold tracking-tight"
      title={display.description}
    >
      {display.label}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const labels: Record<PaymentStatus, string> = {
    unpaid: "Belum Dibayar",
    paid: "Lunas",
    refunded: "Dikembalikan (Refund)",
  };

  const styles: Record<PaymentStatus, React.CSSProperties> = {
    unpaid: {
      backgroundColor: "var(--accent-50)",
      color: "var(--warning-text)",
      borderColor: "var(--accent-500)",
    },
    paid: {
      backgroundColor: "var(--success-bg)",
      color: "var(--success-text)",
      borderColor: "var(--success)",
    },
    refunded: {
      backgroundColor: "var(--slate-100)",
      color: "var(--slate-600)",
      borderColor: "var(--slate-200)",
    },
  };

  return (
    <span
      style={{
        ...styles[status],
        borderRadius: "var(--radius-badge)",
      }}
      className="inline-flex items-center border px-2.5 py-1 text-xs font-semibold"
    >
      {labels[status]}
    </span>
  );
}

export function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
  const labels: Record<VehicleStatus, string> = {
    active: "Tersedia / Aktif",
    maintenance: "Dalam Perawatan",
    inactive: "Nonaktif",
  };

  const styles: Record<VehicleStatus, React.CSSProperties> = {
    active: {
      backgroundColor: "var(--success-bg)",
      color: "var(--success-text)",
      borderColor: "var(--success)",
    },
    maintenance: {
      backgroundColor: "var(--accent-50)",
      color: "var(--warning-text)",
      borderColor: "var(--accent-500)",
    },
    inactive: {
      backgroundColor: "var(--slate-100)",
      color: "var(--slate-600)",
      borderColor: "var(--slate-200)",
    },
  };

  return (
    <span
      style={{
        ...styles[status],
        borderRadius: "var(--radius-badge)",
      }}
      className="inline-flex items-center border px-2.5 py-1 text-xs font-semibold"
    >
      {labels[status]}
    </span>
  );
}

export function MaintenanceStatusBadge({
  status,
}: {
  status: MaintenanceStatus;
}) {
  const labels: Record<MaintenanceStatus, string> = {
    scheduled: "Terjadwal",
    in_progress: "Sedang Dikerjakan",
    done: "Selesai",
  };

  const styles: Record<MaintenanceStatus, React.CSSProperties> = {
    scheduled: {
      backgroundColor: "var(--primary-100)",
      color: "var(--primary-700)",
      borderColor: "var(--primary-600)",
    },
    in_progress: {
      backgroundColor: "var(--accent-50)",
      color: "var(--warning-text)",
      borderColor: "var(--accent-500)",
    },
    done: {
      backgroundColor: "var(--success-bg)",
      color: "var(--success-text)",
      borderColor: "var(--success)",
    },
  };

  return (
    <span
      style={{
        ...styles[status],
        borderRadius: "var(--radius-badge)",
      }}
      className="inline-flex items-center border px-2.5 py-1 text-xs font-semibold"
    >
      {labels[status]}
    </span>
  );
}
