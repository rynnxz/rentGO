import { describe, expect, it } from "vitest";
import {
  calculateBookingPrice,
  calculateInclusiveDays,
  generateBookingCode,
} from "@/lib/pricing";
import { formatRupiah, getTodayWib } from "@/lib/utils";

describe("Pricing & WIB Date Utilities", () => {
  it("calculates inclusive days accurately (same day = 1 day, 3 days = 3)", () => {
    expect(calculateInclusiveDays("2026-11-15", "2026-11-15")).toBe(1);
    expect(calculateInclusiveDays("2026-11-15", "2026-11-17")).toBe(3);
    expect(calculateInclusiveDays("2026-11-01", "2026-11-10")).toBe(10);
  });

  it("rejects end_date earlier than start_date or malformed dates", () => {
    expect(() => calculateInclusiveDays("2026-11-18", "2026-11-15")).toThrow(
      /Tanggal kembali harus sama atau setelah tanggal ambil/,
    );
    expect(() => calculateInclusiveDays("15-11-2026", "2026-11-15")).toThrow(
      /Format tanggal tidak valid/,
    );
  });

  it("computes server-side booking total price from dailyPrice * inclusiveDays", () => {
    const res = calculateBookingPrice({
      dailyPrice: 420000,
      startDate: "2026-11-20",
      endDate: "2026-11-22",
    });
    expect(res.totalDays).toBe(3);
    expect(res.dailyPriceSnapshot).toBe(420000);
    expect(res.totalPrice).toBe(1260000);
  });

  it("formats Rupiah currency in id-ID locale with Rp prefix", () => {
    expect(formatRupiah(350000)).toBe("Rp 350.000");
    expect(formatRupiah(1260000)).toBe("Rp 1.260.000");
  });

  it("generates booking code with format RG-YYMMDD-XXXX", () => {
    const code = generateBookingCode("2026-11-15", "ab9k");
    expect(code).toBe("RG-261115-AB9K");
    const randomCode = generateBookingCode("2026-11-15");
    expect(randomCode).toMatch(/^RG-261115-[A-Z0-9]{4}$/);
  });

  it("computes WIB date correctly across UTC midnight boundary", () => {
    // 2026-11-14T20:00:00Z is 2026-11-15T03:00:00+07:00 (WIB)
    const utcEvening = new Date("2026-11-14T20:00:00.000Z");
    expect(getTodayWib(utcEvening)).toBe("2026-11-15");
  });
});
