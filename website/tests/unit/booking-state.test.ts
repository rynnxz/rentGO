import { describe, expect, it } from "vitest";
import {
  assertValidBookingTransition,
  canTransitionBookingStatus,
  getAllowedNextStatuses,
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
