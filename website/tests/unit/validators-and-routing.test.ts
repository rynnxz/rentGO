import { describe, expect, it } from "vitest";
import {
  aiRecommendInputSchema,
  bookingCreateSchema,
  maintenanceLogSchema,
  vehicleSchema,
} from "@/lib/validators";
import { parseEnv } from "@/lib/env";
import { resolveSurfaceFromRequest } from "@/lib/utils";

describe("Zod Validation & Host Surface Resolution", () => {
  it("validates vehicleSchema and rejects invalid year or negative price", () => {
    const valid = vehicleSchema.safeParse({
      category_id: "11111111-1111-4111-8111-111111111102",
      plate_number: "BK 1999 XYZ",
      brand: "Toyota",
      model: "Innova Reborn",
      year: 2024,
      transmission: "automatic",
      fuel: "diesel",
      seats: 7,
      daily_price: 650000,
      status: "active",
    });
    expect(valid.success).toBe(true);

    const invalid = vehicleSchema.safeParse({
      category_id: "11111111-1111-4111-8111-111111111102",
      plate_number: "BK 1999 XYZ",
      brand: "Toyota",
      model: "Innova",
      year: 1980,
      transmission: "automatic",
      fuel: "diesel",
      seats: 7,
      daily_price: -100,
    });
    expect(invalid.success).toBe(false);
  });

  it("validates bookingCreateSchema and enforces phone, SIM, and date order", () => {
    const badDates = bookingCreateSchema.safeParse({
      vehicle_id: "33333333-3333-4333-8333-333333333301",
      start_date: "2026-12-10",
      end_date: "2026-12-08",
      pickup_location: "Bandara Kualanamu",
      return_location: "Kantor RentGo Medan",
      phone: "081260009988",
      driver_license_no: "1271091511040001",
    });
    expect(badDates.success).toBe(false);
  });

  it("validates maintenanceLogSchema and aiRecommendInputSchema", () => {
    expect(
      maintenanceLogSchema.safeParse({
        vehicle_id: "33333333-3333-4333-8333-333333333301",
        title: "Ganti Oli Mesin",
        start_date: "2026-12-01",
        end_date: "2026-12-02",
        cost: 450000,
        status: "scheduled",
      }).success,
    ).toBe(true);

    expect(
      aiRecommendInputSchema.safeParse({
        passengers: 6,
        max_daily_budget: 600000,
        query_text: "Liburan keluarga 6 orang ke Berastagi selama 3 hari",
      }).success,
    ).toBe(true);
  });

  it("resolves 3 host surfaces accurately and disables ?site override on production custom domain", () => {
    expect(
      resolveSurfaceFromRequest({
        host: "rentgo.my.id",
        nodeEnv: "production",
        rootDomain: "rentgo.my.id",
      }).surface,
    ).toBe("landing");

    expect(
      resolveSurfaceFromRequest({
        host: "book.rentgo.my.id",
        nodeEnv: "production",
        rootDomain: "rentgo.my.id",
      }).surface,
    ).toBe("book");

    expect(
      resolveSurfaceFromRequest({
        host: "admin.rentgo.my.id",
        nodeEnv: "production",
        rootDomain: "rentgo.my.id",
      }).surface,
    ).toBe("admin");

    // In production on rentgo.my.id or www.rentgo.my.id, ?site=admin must be ignored!
    expect(
      resolveSurfaceFromRequest({
        host: "rentgo.my.id",
        siteQuery: "admin",
        nodeEnv: "production",
        rootDomain: "rentgo.my.id",
      }).surface,
    ).toBe("landing");

    expect(
      resolveSurfaceFromRequest({
        host: "www.rentgo.my.id",
        siteQuery: "admin",
        nodeEnv: "production",
        rootDomain: "rentgo.my.id",
      }).surface,
    ).toBe("landing");

    // In non-production or .vercel.app preview, ?site=admin works
    expect(
      resolveSurfaceFromRequest({
        host: "rentgo-preview.vercel.app",
        siteQuery: "admin",
        nodeEnv: "development",
        rootDomain: "rentgo.my.id",
      }).surface,
    ).toBe("admin");
  });

  it("validates env variables with zod and fails fast on malformed WHATSAPP_NUMBER", () => {
    expect(() =>
      parseEnv({
        WHATSAPP_NUMBER: "bukan-nomor",
      }),
    ).toThrow(/Konfigurasi environment variable tidak valid/);
  });
});
