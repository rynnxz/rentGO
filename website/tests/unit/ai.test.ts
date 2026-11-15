import { describe, expect, it } from "vitest";
import {
  buildHeuristicRecommendations,
  sanitizeAiRecommendations,
} from "@/lib/ai";
import type { VehicleWithCategory } from "@/lib/types";

const mockCandidates: VehicleWithCategory[] = [
  {
    id: "33333333-3333-4333-8333-333333333301",
    category_id: "11111111-1111-4111-8111-111111111101",
    category_name: "Mobil City",
    category_slug: "mobil-city",
    plate_number: "BK 1124 AAB",
    brand: "Honda",
    model: "Brio Satya RS",
    year: 2024,
    color: "Putih",
    transmission: "automatic",
    fuel: "bensin",
    seats: 5,
    daily_price: 320000,
    status: "active",
    description: "City car lincah",
    image_url: "/vehicles/city-car.svg",
    deleted_at: null,
    created_at: "2026-11-15T00:00:00Z",
    updated_at: "2026-11-15T00:00:00Z",
  },
  {
    id: "33333333-3333-4333-8333-333333333307",
    category_id: "11111111-1111-4111-8111-111111111103",
    category_name: "SUV",
    category_slug: "suv",
    plate_number: "BK 1555 AAH",
    brand: "Toyota",
    model: "Rush GR Sport",
    year: 2024,
    color: "Putih",
    transmission: "automatic",
    fuel: "bensin",
    seats: 7,
    daily_price: 500000,
    status: "active",
    description: "SUV 7 kursi tangguh untuk Berastagi",
    image_url: "/vehicles/suv.svg",
    deleted_at: null,
    created_at: "2026-11-15T00:00:00Z",
    updated_at: "2026-11-15T00:00:00Z",
  },
  {
    id: "33333333-3333-4333-8333-333333333311",
    category_id: "11111111-1111-4111-8111-111111111105",
    category_name: "Motor",
    category_slug: "motor",
    plate_number: "BK 4112 AAM",
    brand: "Yamaha",
    model: "NMAX 155 Connected",
    year: 2024,
    color: "Biru Navy",
    transmission: "automatic",
    fuel: "bensin",
    seats: 2,
    daily_price: 140000,
    status: "active",
    description: "Skutik 155cc posisi duduk rileks",
    image_url: "/vehicles/yamaha-nmax-155-connected.png",
    deleted_at: null,
    created_at: "2026-11-15T00:00:00Z",
    updated_at: "2026-11-15T00:00:00Z",
  },
];

describe("AI Recommendation Validation & Heuristic Fallback", () => {
  it("strips hallucinated/foreign vehicle_ids that are not in available candidates", () => {
    const cleaned = sanitizeAiRecommendations({
      rawItems: [
        {
          vehicle_id: "99999999-9999-4999-8999-999999999999", // hallucinated ID
          rank: 1,
          reason: "Unit tidak ada di stok",
          fit_score: 99,
        },
        {
          vehicle_id: "33333333-3333-4333-8333-333333333307", // valid candidate
          rank: 2,
          reason: "Cocok untuk 6 penumpang ke Berastagi.",
          fit_score: 95,
        },
      ],
      candidates: mockCandidates,
    });

    expect(cleaned).toHaveLength(1);
    expect(cleaned[0]?.vehicle_id).toBe("33333333-3333-4333-8333-333333333307");
    expect(cleaned[0]?.rank).toBe(1);
  });

  it("produces deterministic heuristic fallback matching passenger count, vehicle type, and budget", () => {
    const fallback = buildHeuristicRecommendations({
      candidates: mockCandidates,
      passengers: 6,
      maxDailyBudget: 550000,
      queryText: "Liburan keluarga 6 orang ke Berastagi 3 hari",
      startDate: "2026-11-20",
      endDate: "2026-11-22",
    });

    expect(fallback.used_fallback).toBe(true);
    expect(fallback.recommendations.length).toBeGreaterThan(0);
    // 6 passengers requires the 7-seat Rush SUV, not the 5-seat Brio
    expect(fallback.recommendations[0]?.vehicle_id).toBe(
      "33333333-3333-4333-8333-333333333307",
    );

    // Motorcycle natural language query with default 4 passengers must extract motor + 200rb budget
    const motorRec = buildHeuristicRecommendations({
      candidates: mockCandidates,
      passengers: 4,
      maxDailyBudget: null,
      queryText: "motor yang cocok untuk touring bareng pacar, budget 200rb maksimal",
      startDate: "2026-11-20",
      endDate: "2026-11-21",
    });
    expect(motorRec.recommendations).toHaveLength(1);
    expect(motorRec.recommendations[0]?.vehicle_id).toBe(
      "33333333-3333-4333-8333-333333333311",
    );
  });
});
