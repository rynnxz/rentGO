import type { BookingStatus, PaymentStatus, UserRole } from "./types";

export type TransitionActor = UserRole | "system";

export type DisplayStatusVariant =
  | "amber"
  | "blue"
  | "teal"
  | "emerald"
  | "slate"
  | "red";

export interface DisplayStatusResult {
  key:
    | "pending_unpaid"
    | "pending_paid"
    | "confirmed_paid"
    | "confirmed_unpaid"
    | "ongoing"
    | "completed"
    | "cancelled"
    | "rejected"
    | "expired";
  label: string;
  secondaryLabel?: string;
  variant: DisplayStatusVariant;
  description: string;
}

/**
 * Pure helper mapping (bookingStatus, paymentStatus) into unified UI label & color variant
 * used across both /book and /admin surfaces.
 */
export function getDisplayStatus(
  bookingStatus: BookingStatus,
  paymentStatus?: PaymentStatus | null,
): DisplayStatusResult {
  const effectivePayment: PaymentStatus = paymentStatus ?? "unpaid";

  switch (bookingStatus) {
    case "pending": {
      if (effectivePayment === "paid") {
        return {
          key: "pending_paid",
          label: "Menunggu Konfirmasi Admin",
          variant: "blue",
          description:
            "Pembayaran telah lunas. Pesanan sedang menunggu konfirmasi jadwal dari Admin.",
        };
      }
      return {
        key: "pending_unpaid",
        label: "Menunggu Pembayaran",
        variant: "amber",
        description:
          "Silakan selesaikan pembayaran QRIS sebelum batas waktu otomatis 24 jam.",
      };
    }
    case "confirmed": {
      if (effectivePayment === "unpaid") {
        return {
          key: "confirmed_unpaid",
          label: "Menunggu Pembayaran",
          secondaryLabel: "Terkonfirmasi",
          variant: "amber",
          description:
            "Pesanan telah dikonfirmasi admin namun pembayaran masih belum lunas.",
        };
      }
      return {
        key: "confirmed_paid",
        label: "Siap Diambil",
        secondaryLabel: "Menunggu Unit",
        variant: "teal",
        description:
          "Pesanan terkonfirmasi dan lunas. Unit siap diambil sesuai jadwal pengambilan.",
      };
    }
    case "ongoing":
      return {
        key: "ongoing",
        label: "Sedang Disewa",
        variant: "teal",
        description: "Unit kendaraan sedang aktif disewa oleh pelanggan.",
      };
    case "completed":
      return {
        key: "completed",
        label: "Selesai",
        variant: "emerald",
        description: "Masa sewa telah selesai dan kendaraan telah dikembalikan.",
      };
    case "cancelled":
      return {
        key: "cancelled",
        label: "Dibatalkan",
        variant: "slate",
        description: "Pesanan telah dibatalkan.",
      };
    case "rejected":
      return {
        key: "rejected",
        label: "Ditolak Admin",
        variant: "red",
        description: "Pesanan ditolak oleh admin operasional.",
      };
    case "expired":
      return {
        key: "expired",
        label: "Kedaluwarsa",
        variant: "slate",
        description:
          "Pesanan kedaluwarsa otomatis karena melewati batas waktu pembayaran 24 jam.",
      };
  }
}

/**
 * Pure helper determining whether a booking should be auto-expired by the 24-hour cron.
 * Only pending bookings whose paymentStatus is "unpaid" may be expired.
 */
export function shouldExpireBooking(params: {
  bookingStatus: BookingStatus;
  paymentStatus?: PaymentStatus | null;
  expiresAt?: string | null;
  now?: Date;
}): boolean {
  if (params.bookingStatus !== "pending") return false;
  const effectivePayment: PaymentStatus = params.paymentStatus ?? "unpaid";
  if (effectivePayment !== "unpaid") return false;
  if (!params.expiresAt) return false;
  const expMs = Date.parse(params.expiresAt);
  if (Number.isNaN(expMs)) return false;
  const nowMs = (params.now ?? new Date()).getTime();
  return expMs <= nowMs;
}

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
