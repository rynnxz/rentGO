import { describe, expect, it } from "vitest";
import {
  buildGoogleMapsDirectionsUrl,
  calculateHaversineDistanceKm,
  formatDistanceKm,
  getLocationByName,
  RENTGO_LOCATIONS,
  sortLocationsByDistance
} from "@/lib/locations";
import { PICKUP_LOCATIONS } from "@/lib/utils";

describe("locations single source of truth & Haversine helpers", () => {
  it("memuat 3 titik lokasi resmi Medan yang selaras dengan PICKUP_LOCATIONS", () => {
    expect(RENTGO_LOCATIONS).toHaveLength(3);
    const names = RENTGO_LOCATIONS.map((loc) => loc.name);
    expect(names).toEqual([...PICKUP_LOCATIONS]);

    const kualanamu = getLocationByName("Bandara Kualanamu");
    expect(kualanamu).toBeDefined();
    expect(kualanamu?.lat).toBeCloseTo(3.6422, 3);
    expect(kualanamu?.lng).toBeCloseTo(98.8853, 3);

    const stasiun = getLocationByName("Stasiun Medan");
    expect(stasiun).toBeDefined();
    expect(stasiun?.lat).toBeCloseTo(3.5917, 3);
    expect(stasiun?.lng).toBeCloseTo(98.6783, 3);

    const kantor = getLocationByName("Kantor RentGo Medan");
    expect(kantor).toBeDefined();
    expect(kantor?.isPlaceholder).toBe(true);
    expect(kantor?.address.length).toBeGreaterThan(10);
    expect(kantor?.operatingHours.length).toBeGreaterThan(5);
  });

  it("menghitung jarak lurus Haversine secara akurat", () => {
    expect(calculateHaversineDistanceKm(3.5917, 98.6783, 3.5917, 98.6783)).toBe(0);

    // Jarak Stasiun Medan ke Kantor RentGo Medan (~2.1 km)
    const cityDist = calculateHaversineDistanceKm(3.5917, 98.6783, 3.5902, 98.6598);
    expect(cityDist).toBeGreaterThan(1.5);
    expect(cityDist).toBeLessThan(3.5);

    // Jarak Stasiun Medan ke Bandara Kualanamu (~23.6 km)
    const airportDist = calculateHaversineDistanceKm(3.5917, 98.6783, 3.6422, 98.8853);
    expect(airportDist).toBeGreaterThan(20);
    expect(airportDist).toBeLessThan(28);
  });

  it("mengurutkan lokasi berdasarkan jarak terdekat jika geolocation diberikan dan aman jika null", () => {
    // Jika geolocation ditolak / null -> urutan asli, distanceKm null, tanpa error
    const withoutGeo = sortLocationsByDistance(null);
    expect(withoutGeo).toHaveLength(3);
    expect(withoutGeo.every((loc) => loc.distanceKm === null && !loc.isNearest)).toBe(
      true
    );

    // Jika pengguna berada dekat Bandara Kualanamu
    const nearAirport = sortLocationsByDistance({ lat: 3.64, lng: 98.88 });
    expect(nearAirport[0].name).toBe("Bandara Kualanamu");
    expect(nearAirport[0].isNearest).toBe(true);
    expect(nearAirport[1].isNearest).toBe(false);
    expect(nearAirport[2].isNearest).toBe(false);

    // Jika pengguna berada dekat Stasiun Medan (Lapangan Merdeka)
    const nearStation = sortLocationsByDistance({ lat: 3.5915, lng: 98.678 });
    expect(nearStation[0].name).toBe("Stasiun Medan");
    expect(nearStation[0].isNearest).toBe(true);
    expect(formatDistanceKm(nearStation[0].distanceKm)).toContain("m");
  });

  it("membangun URL rute Google Maps publik tanpa API key", () => {
    const url = buildGoogleMapsDirectionsUrl(3.6422, 98.8853);
    expect(url).toBe("https://www.google.com/maps/dir/?api=1&destination=3.6422,98.8853");
  });
});
