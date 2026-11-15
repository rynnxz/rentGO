import type { PICKUP_LOCATIONS } from "./utils";

export type PickupLocationName = (typeof PICKUP_LOCATIONS)[number];

export interface RentGoLocation {
  id: string;
  name: PickupLocationName;
  shortLabel: string;
  lat: number;
  lng: number;
  address: string;
  operatingHours: string;
  notes: string;
  accentColor: "cobalt" | "teal" | "amber";
  isPlaceholder?: boolean;
}

export interface RentGoLocationWithDistance extends RentGoLocation {
  distanceKm: number | null;
  isNearest: boolean;
}

/**
 * Single source of truth untuk seluruh titik pengambilan & pengembalian armada RentGo Medan.
 */
export const RENTGO_LOCATIONS: readonly RentGoLocation[] = [
  {
    id: "kualanamu-airport",
    name: "Bandara Kualanamu",
    shortLabel: "KNO Airport",
    lat: 3.6422,
    lng: 98.8853,
    address:
      "Area Pick-Up Kedatangan Domestik & Internasional, Bandara Internasional Kualanamu, Kab. Deli Serdang, Sumatera Utara 20553",
    operatingHours: "05.00 - 24.00 WIB (Setiap Hari)",
    notes: "Tim serah-terima menunggu di lobi kedatangan sesuai nomor penerbangan Anda.",
    accentColor: "cobalt"
  },
  {
    id: "stasiun-medan",
    name: "Stasiun Medan",
    shortLabel: "City Railway Hub",
    lat: 3.5917,
    lng: 98.6783,
    address:
      "Pintu Timur Stasiun Kereta Api Medan (Railink City Check-In / Lapangan Merdeka), Kesawan, Kec. Medan Barat, Kota Medan 20111",
    operatingHours: "06.00 - 22.00 WIB (Setiap Hari)",
    notes: "Titik temu tepat di depan pintu keluar Kereta Bandara Railink & jalur kereta antarkota.",
    accentColor: "teal"
  },
  {
    id: "kantor-rentgo-medan",
    name: "Kantor RentGo Medan",
    shortLabel: "Garasi Utama",
    // TODO: Ganti koordinat placeholder Kantor RentGo Medan (sekitar Jl. Gatot Subroto / Medan Baru)
    // dengan titik koordinat garasi/kantor operasional aktual saat lokasi fisik final ditetapkan.
    lat: 3.5902,
    lng: 98.6598,
    address:
      "Jl. Gatot Subroto No. 88 (Simpang Iskandar Muda), Babura, Kec. Medan Baru, Kota Medan, Sumatera Utara 20154",
    operatingHours: "07.00 - 22.00 WIB (Setiap Hari)",
    notes: "Garasi pusat inspeksi unit, layanan cuci, dan administrasi pelanggan langsung.",
    accentColor: "amber",
    isPlaceholder: true
  }
] as const;

export const MEDAN_DEFAULT_CENTER: [number, number] = [3.608, 98.741];
export const MEDAN_DEFAULT_ZOOM = 11;

export function getLocationByName(name: string | null | undefined): RentGoLocation | undefined {
  if (!name) return undefined;
  return RENTGO_LOCATIONS.find(
    (loc) => loc.name.toLowerCase() === name.trim().toLowerCase()
  );
}

export function buildGoogleMapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Menghitung jarak garis lurus (Haversine) antara dua koordinat bumi dalam kilometer.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const EARTH_RADIUS_KM = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
  const rawKm = EARTH_RADIUS_KM * c;
  return Math.round(rawKm * 10) / 10;
}

export function formatDistanceKm(distanceKm: number | null | undefined): string {
  if (distanceKm === null || distanceKm === undefined || !Number.isFinite(distanceKm)) {
    return "";
  }
  if (distanceKm < 1) {
    return `${Math.max(100, Math.round(distanceKm * 1000))} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Mengembalikan daftar lokasi lengkap dengan jarak lurus dari koordinat pengguna.
 * Jika koordinat pengguna tersedia, lokasi diurutkan dari yang terdekat dan lokasi terdekat diberi flag `isNearest: true`.
 * Jika koordinat pengguna tidak tersedia (null), urutan asli dipertahankan tanpa error.
 */
export function sortLocationsByDistance(
  userCoords: { lat: number; lng: number } | null | undefined,
  locations: readonly RentGoLocation[] = RENTGO_LOCATIONS
): RentGoLocationWithDistance[] {
  if (
    !userCoords ||
    !Number.isFinite(userCoords.lat) ||
    !Number.isFinite(userCoords.lng)
  ) {
    return locations.map((loc) => ({
      ...loc,
      distanceKm: null,
      isNearest: false
    }));
  }

  const withDistances = locations.map((loc) => ({
    ...loc,
    distanceKm: calculateHaversineDistanceKm(
      userCoords.lat,
      userCoords.lng,
      loc.lat,
      loc.lng
    ),
    isNearest: false
  }));

  withDistances.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));

  if (withDistances.length > 0) {
    withDistances[0] = {
      ...withDistances[0],
      isNearest: true
    };
  }

  return withDistances;
}
