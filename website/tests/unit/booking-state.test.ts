import { describe, expect, it } from "vitest";
import {
  assertValidBookingTransition,
  canTransitionBookingStatus,
  getAllowedNextStatuses,
  getDisplayStatus,
  shouldExpireBooking,
} from "@/lib/booking-state";

describe("Booking Status State Machine (Section 8.2)", () => {
  it("allows all valid transitions by authorized actors", () => {
    // pending -> confirmed (admin)
    expect(canTransitionBookingStatus("pending", "confirmed", "admin")).toBe(true);
    // pending -> cancelled (customer & admin)
    expect(canTransitionBookingStatus("pending", "cancelled", "customer")).toBe(true);
    expect(canTransitionBookingStatus("pending", "cancelled", "admin")).toBe(true);
    // pending -> rejected (admin)
    expect(canTransitionBookingStatus("pending", "rejected", "admin")).toBe(true);
    // pending -> expired (system)
    expect(canTransitionBookingStatus("pending", "expired", "system")).toBe(true);
    // confirmed -> ongoing (admin)
    expect(canTransitionBookingStatus("confirmed", "ongoing", "admin")).toBe(true);
    // confirmed -> cancelled (admin)
    expect(canTransitionBookingStatus("confirmed", "cancelled", "admin")).toBe(true);
    // ongoing -> completed (admin)
    expect(canTransitionBookingStatus("ongoing", "completed", "admin")).toBe(true);
  });

  it("blocks unauthorized actor transitions (e.g. customer confirming or cancelling confirmed booking)", () => {
    expect(canTransitionBookingStatus("pending", "confirmed", "customer")).toBe(false);
    expect(canTransitionBookingStatus("confirmed", "cancelled", "customer")).toBe(false);
    expect(canTransitionBookingStatus("confirmed", "ongoing", "customer")).toBe(false);
    expect(() =>
      assertValidBookingTransition("confirmed", "cancelled", "customer"),
    ).toThrow(/tidak memiliki izin/);
  });

  it("blocks illegal state transitions (e.g. completed -> ongoing, cancelled -> confirmed)", () => {
    expect(canTransitionBookingStatus("completed", "ongoing", "admin")).toBe(false);
    expect(canTransitionBookingStatus("cancelled", "confirmed", "admin")).toBe(false);
    expect(canTransitionBookingStatus("pending", "completed", "admin")).toBe(false);
    expect(() =>
      assertValidBookingTransition("completed", "ongoing", "admin"),
    ).toThrow(/tidak diizinkan oleh sistem/);
  });

  it("returns allowed next actions for admin vs customer", () => {
    const customerPendingActions = getAllowedNextStatuses("pending", "customer");
    expect(customerPendingActions.map((a) => a.status)).toEqual(["cancelled"]);

    const adminConfirmedActions = getAllowedNextStatuses("confirmed", "admin");
    expect(adminConfirmedActions.map((a) => a.status)).toEqual([
      "ongoing",
      "cancelled",
    ]);
  });
});

describe("getDisplayStatus(bookingStatus, paymentStatus) Pure Helper", () => {
  it("maps pending + unpaid to 'Menunggu Pembayaran' (amber)", () => {
    const res = getDisplayStatus("pending", "unpaid");
    expect(res.key).toBe("pending_unpaid");
    expect(res.label).toBe("Menunggu Pembayaran");
    expect(res.variant).toBe("amber");

    const fallbackNull = getDisplayStatus("pending", null);
    expect(fallbackNull.label).toBe("Menunggu Pembayaran");
    expect(fallbackNull.variant).toBe("amber");
  });

  it("maps pending + paid to 'Menunggu Konfirmasi Admin' (blue)", () => {
    const res = getDisplayStatus("pending", "paid");
    expect(res.key).toBe("pending_paid");
    expect(res.label).toBe("Menunggu Konfirmasi Admin");
    expect(res.variant).toBe("blue");
  });

  it("maps confirmed + paid to 'Siap Diambil' / 'Menunggu Unit' (teal)", () => {
    const res = getDisplayStatus("confirmed", "paid");
    expect(res.key).toBe("confirmed_paid");
    expect(res.label).toBe("Siap Diambil");
    expect(res.secondaryLabel).toBe("Menunggu Unit");
    expect(res.variant).toBe("teal");
  });

  it("maps confirmed + unpaid to 'Menunggu Pembayaran' (amber)", () => {
    const res = getDisplayStatus("confirmed", "unpaid");
    expect(res.key).toBe("confirmed_unpaid");
    expect(res.label).toBe("Menunggu Pembayaran");
    expect(res.variant).toBe("amber");
  });

  it("maps ongoing to 'Sedang Disewa' (teal)", () => {
    expect(getDisplayStatus("ongoing", "paid")).toMatchObject({
      key: "ongoing",
      label: "Sedang Disewa",
      variant: "teal",
    });
    expect(getDisplayStatus("ongoing", "unpaid").label).toBe("Sedang Disewa");
  });

  it("maps completed to 'Selesai' (emerald)", () => {
    expect(getDisplayStatus("completed", "paid")).toMatchObject({
      key: "completed",
      label: "Selesai",
      variant: "emerald",
    });
  });

  it("maps cancelled, rejected, and expired to their respective labels and variants", () => {
    expect(getDisplayStatus("cancelled", "unpaid")).toMatchObject({
      key: "cancelled",
      label: "Dibatalkan",
      variant: "slate",
    });
    expect(getDisplayStatus("cancelled", "refunded").label).toBe("Dibatalkan");

    expect(getDisplayStatus("rejected", "unpaid")).toMatchObject({
      key: "rejected",
      label: "Ditolak Admin",
      variant: "red",
    });

    expect(getDisplayStatus("expired", "unpaid")).toMatchObject({
      key: "expired",
      label: "Kedaluwarsa",
      variant: "slate",
    });
  });
});

describe("shouldExpireBooking 24-Hour Cron Rule", () => {
  const now = new Date("2026-11-17T02:00:00.000Z");
  const pastExpiry = "2026-11-16T01:00:00.000Z";
  const futureExpiry = "2026-11-18T01:00:00.000Z";

  it("expires only pending + unpaid bookings past expires_at", () => {
    expect(
      shouldExpireBooking({
        bookingStatus: "pending",
        paymentStatus: "unpaid",
        expiresAt: pastExpiry,
        now,
      }),
    ).toBe(true);
  });

  it("never expires pending bookings that are already paid or refunded", () => {
    expect(
      shouldExpireBooking({
        bookingStatus: "pending",
        paymentStatus: "paid",
        expiresAt: pastExpiry,
        now,
      }),
    ).toBe(false);

    expect(
      shouldExpireBooking({
        bookingStatus: "pending",
        paymentStatus: "refunded",
        expiresAt: pastExpiry,
        now,
      }),
    ).toBe(false);
  });

  it("does not expire bookings before expires_at or non-pending bookings", () => {
    expect(
      shouldExpireBooking({
        bookingStatus: "pending",
        paymentStatus: "unpaid",
        expiresAt: futureExpiry,
        now,
      }),
    ).toBe(false);

    expect(
      shouldExpireBooking({
        bookingStatus: "confirmed",
        paymentStatus: "unpaid",
        expiresAt: pastExpiry,
        now,
      }),
    ).toBe(false);
  });
});
