import path from "node:path";
import fs from "node:fs";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createBooking,
  createMaintenanceLog,
  getBookingById,
  listVehicles,
  resetDatabaseToSeed,
  runHousekeepingTasks,
  setLocalStoreFilePathForTests,
  softDeleteVehicle,
  updateBookingPayment,
} from "@/lib/repository";
import { isDateRangeOverlapping } from "@/lib/availability";

const TEST_DB_PATH = path.join(
  process.cwd(),
  ".data",
  "rentgo-unit-test.json",
);

describe("Availability Overlap, Maintenance Blocking, & Concurrency Anti-Double-Booking", () => {
  beforeEach(async () => {
    setLocalStoreFilePathForTests(TEST_DB_PATH);
    await resetDatabaseToSeed();
  });

  afterAll(() => {
    setLocalStoreFilePathForTests(null);
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  it("detects inclusive date overlaps across start, end, inner, and outer ranges", () => {
    // Existing booking: 2026-11-20 to 2026-11-24
    expect(
      isDateRangeOverlapping("2026-11-20", "2026-11-24", "2026-11-18", "2026-11-20"),
    ).toBe(true); // touches start boundary
    expect(
      isDateRangeOverlapping("2026-11-20", "2026-11-24", "2026-11-24", "2026-11-26"),
    ).toBe(true); // touches end boundary
    expect(
      isDateRangeOverlapping("2026-11-20", "2026-11-24", "2026-11-21", "2026-11-22"),
    ).toBe(true); // inside range
    expect(
      isDateRangeOverlapping("2026-11-20", "2026-11-24", "2026-11-19", "2026-11-25"),
    ).toBe(true); // encloses range
    expect(
      isDateRangeOverlapping("2026-11-20", "2026-11-24", "2026-11-25", "2026-11-27"),
    ).toBe(false); // strictly after
  });

  it("excludes vehicles that have overlapping active bookings or scheduled maintenance", async () => {
    // Vehicle 33333333-3333-4333-8333-333333333301 (Honda Brio) has a pending booking 2026-11-22..2026-11-24
    const availableDuringBrioBooking = await listVehicles({
      onlyAvailable: true,
      startDate: "2026-11-23",
      endDate: "2026-11-25",
    });
    expect(
      availableDuringBrioBooking.some(
        (v) => v.id === "33333333-3333-4333-8333-333333333301",
      ),
    ).toBe(false);

    // Schedule maintenance on Toyota Avanza (33333333-3333-4333-8333-333333333303) for 2026-12-01..2026-12-03
    await createMaintenanceLog({
      vehicle_id: "33333333-3333-4333-8333-333333333303",
      title: "Servis AC & Filter Udara",
      start_date: "2026-12-01",
      end_date: "2026-12-03",
      cost: 350000,
      status: "scheduled",
    });

    const availableDuringMaint = await listVehicles({
      onlyAvailable: true,
      startDate: "2026-12-02",
      endDate: "2026-12-04",
    });
    expect(
      availableDuringMaint.some(
        (v) => v.id === "33333333-3333-4333-8333-333333333303",
      ),
    ).toBe(false);
  });

  it("CONCURRENCY TEST: two simultaneous booking requests for the same vehicle & dates -> exactly one succeeds", async () => {
    const targetVehicleId = "33333333-3333-4333-8333-333333333302"; // Toyota Agya GR Sport
    const results = await Promise.allSettled([
      createBooking({
        user_id: "22222222-2222-4222-8222-222222222202",
        vehicle_id: targetVehicleId,
        start_date: "2026-12-10",
        end_date: "2026-12-12",
        pickup_location: "Bandara Kualanamu",
        return_location: "Bandara Kualanamu",
        payment_method: "transfer",
      }),
      createBooking({
        user_id: "22222222-2222-4222-8222-222222222203",
        vehicle_id: targetVehicleId,
        start_date: "2026-12-11", // overlaps!
        end_date: "2026-12-13",
        pickup_location: "Stasiun Medan",
        return_location: "Stasiun Medan",
        payment_method: "qris",
      }),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect((rejected[0] as PromiseRejectedResult).reason.message).toMatch(
      /Kendaraan sudah dipesan pada tanggal tersebut/,
    );
  });

  it("prevents soft-deleting a vehicle that has an active booking", async () => {
    await expect(
      softDeleteVehicle("33333333-3333-4333-8333-333333333301"),
    ).rejects.toThrow(/masih memiliki booking aktif/);
  });

  it("CRON HOUSEKEEPING: expires only pending + unpaid bookings past 24 hours, preserving pending + paid bookings", async () => {
    // Seed booking 44444444-4444-4444-8444-444444444404 is pending + unpaid with expires_at 2026-11-16T01:00:00.000Z
    // Create a second pending booking and mark its payment as paid
    const paidPendingBooking = await createBooking({
      user_id: "22222222-2222-4222-8222-222222222202",
      vehicle_id: "33333333-3333-4333-8333-333333333302",
      start_date: "2026-12-18",
      end_date: "2026-12-19",
      pickup_location: "Bandara Kualanamu",
      return_location: "Bandara Kualanamu",
      payment_method: "qris",
    });

    await updateBookingPayment({
      bookingId: paidPendingBooking.id,
      actorUserId: "22222222-2222-4222-8222-222222222202",
      actorRole: "customer",
      status: "paid",
      method: "qris",
    });

    // Run cron far in the future (48 hours after both bookings' expires_at)
    const futureNow = new Date(Date.now() + 72 * 60 * 60 * 1000);
    const result = await runHousekeepingTasks(futureNow);

    // Unpaid seed booking RG-261115-D404 must be expired
    expect(result.expiredBookingCodes).toContain("RG-261115-D404");
    // Paid pending booking must NOT be expired
    expect(result.expiredBookingCodes).not.toContain(
      paidPendingBooking.booking_code,
    );

    const refreshedPaidBooking = await getBookingById(paidPendingBooking.id);
    expect(refreshedPaidBooking?.status).toBe("pending");
    expect(refreshedPaidBooking?.payment?.status).toBe("paid");
  });

  it("never calls mkdir inside process.cwd() on Vercel and falls back to in-memory seed if tmpdir fails", async () => {
    const prevVercel = process.env.VERCEL;
    process.env.VERCEL = "1";
    setLocalStoreFilePathForTests(null);

    const mkdirSpy = vi.spyOn(fs, "mkdirSync").mockImplementation((target) => {
      if (String(target).startsWith(process.cwd())) {
        throw new Error(`Unexpected mkdir in cwd: ${String(target)}`);
      }
      const err = Object.assign(new Error("EROFS: read-only file system"), {
        code: "EROFS",
      });
      throw err;
    });

    try {
      const vehicles = await listVehicles({ status: "active" });
      expect(vehicles.length).toBeGreaterThan(0);
      for (const call of mkdirSpy.mock.calls) {
        expect(String(call[0]).startsWith(process.cwd())).toBe(false);
      }
    } finally {
      mkdirSpy.mockRestore();
      if (prevVercel === undefined) {
        delete process.env.VERCEL;
      } else {
        process.env.VERCEL = prevVercel;
      }
    }
  });
});
