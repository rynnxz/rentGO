import type { BookingStatus, UserRole } from "./types";

export type TransitionActor = UserRole | "system";

interface TransitionRule {
  from: BookingStatus;
  to: BookingStatus;
  allowedActors: TransitionActor[];
  label: string;
}

export const BOOKING_TRANSITION_RULES: TransitionRule[] = [
  {
    from: "pending",
    to: "confirmed",
    allowedActors: ["admin"],
    label: "Konfirmasi Pesanan",
  },
  {
    from: "pending",
    to: "cancelled",
    allowedActors: ["customer", "admin"],
    label: "Batalkan Pesanan",
  },
  {
    from: "pending",
    to: "rejected",
    allowedActors: ["admin"],
    label: "Tolak Pesanan",
  },
  {
    from: "pending",
    to: "expired",
    allowedActors: ["system", "admin"],
    label: "Kedaluwarsa (Lewat 24 Jam)",
  },
  {
    from: "confirmed",
    to: "ongoing",
    allowedActors: ["admin"],
    label: "Serah Terima Kendaraan (Mulai Sewa)",
  },
  {
    from: "confirmed",
    to: "cancelled",
    allowedActors: ["admin"],
    label: "Batalkan Pesanan Terkonfirmasi",
  },
  {
    from: "ongoing",
    to: "completed",
    allowedActors: ["admin"],
    label: "Selesaikan Sewa (Kendaraan Kembali)",
  },
];

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Menunggu Pembayaran",
  confirmed: "Terkonfirmasi",
  ongoing: "Sedang Disewa",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  rejected: "Ditolak Admin",
  expired: "Kedaluwarsa",
};

export function canTransitionBookingStatus(
  from: BookingStatus,
  to: BookingStatus,
  actor: TransitionActor,
): boolean {
  return BOOKING_TRANSITION_RULES.some(
    (rule) =>
      rule.from === from &&
      rule.to === to &&
      rule.allowedActors.includes(actor),
  );
}

export function getAllowedNextStatuses(
  from: BookingStatus,
  actor: TransitionActor,
): Array<{ status: BookingStatus; label: string }> {
  return BOOKING_TRANSITION_RULES.filter(
    (rule) => rule.from === from && rule.allowedActors.includes(actor),
  ).map((rule) => ({
    status: rule.to,
    label: rule.label,
  }));
}

export function assertValidBookingTransition(
  from: BookingStatus,
  to: BookingStatus,
  actor: TransitionActor,
): void {
  if (from === to) {
    throw new Error(`Status pesanan sudah berada pada '${BOOKING_STATUS_LABELS[from]}'.`);
  }

  const ruleExistsForPair = BOOKING_TRANSITION_RULES.find(
    (rule) => rule.from === from && rule.to === to,
  );

  if (!ruleExistsForPair) {
    throw new Error(
      `Transisi status booking dari '${from}' ke '${to}' tidak diizinkan oleh sistem.`,
    );
  }

  if (!ruleExistsForPair.allowedActors.includes(actor)) {
    throw new Error(
      `Peran '${actor}' tidak memiliki izin untuk mengubah status dari '${from}' ke '${to}'.`,
    );
  }
}
