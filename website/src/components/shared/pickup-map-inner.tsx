"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import {
  buildGoogleMapsDirectionsUrl,
  formatDistanceKm,
  MEDAN_DEFAULT_CENTER,
  MEDAN_DEFAULT_ZOOM,
  type RentGoLocationWithDistance
} from "@/lib/locations";

export interface PickupMapInnerProps {
  locations: RentGoLocationWithDistance[];
  focusedLocationName: string | null;
  pickupLocationName?: string | null;
  returnLocationName?: string | null;
  userCoords: { lat: number; lng: number } | null;
  onSelectLocation?: (locationName: string) => void;
}

const ACCENT_HEX: Record<
  RentGoLocationWithDistance["accentColor"],
  { bg: string; ring: string }
> = {
  cobalt: { bg: "#1D4ED8", ring: "rgba(29, 78, 216, 0.28)" },
  teal: { bg: "#0D9488", ring: "rgba(13, 148, 136, 0.28)" },
  amber: { bg: "#D97706", ring: "rgba(217, 119, 6, 0.28)" }
};

function createLocationDivIcon(
  location: RentGoLocationWithDistance,
  isFocused: boolean,
  isPickup: boolean,
  isReturn: boolean
): L.DivIcon {
  const palette = ACCENT_HEX[location.accentColor];
  const scale = isFocused ? 1.14 : 1;
  const badgeText =
    isPickup && isReturn
      ? "AMBIL & KEMBALI"
      : isPickup
        ? "AMBIL"
        : isReturn
          ? "KEMBALI"
          : "";

  const badgeHtml = badgeText
    ? `<span style="position:absolute;top:-22px;left:50%;transform:translateX(-50%);white-space:nowrap;background:#0F172A;color:#F8FAFC;font-size:9px;font-weight:700;letter-spacing:0.06em;padding:2px 6px;border-radius:999px;box-shadow:0 2px 6px rgba(15,23,42,0.3);">${badgeText}</span>`
    : "";

  return L.divIcon({
    className: "rentgo-leaflet-pin-wrapper",
    iconSize: [40, 48],
    iconAnchor: [20, 44],
    popupAnchor: [0, -40],
    html: `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;transform:scale(${scale});transition:transform 180ms ease;">
        ${badgeHtml}
        <div style="width:36px;height:36px;border-radius:999px;background:${palette.bg};border:3px solid #FFFFFF;box-shadow:0 0 0 6px ${palette.ring}, 0 6px 14px rgba(15,23,42,0.28);display:flex;align-items:center;justify-content:center;color:#FFFFFF;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${palette.bg};margin-top:-2px;"></div>
      </div>
    `
  });
}

function createUserLocationDivIcon(): L.DivIcon {
  return L.divIcon({
    className: "rentgo-leaflet-user-pin",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
    html: `
      <div style="width:20px;height:20px;border-radius:999px;background:#2563EB;border:3px solid #FFFFFF;box-shadow:0 0 0 6px rgba(37,99,235,0.25), 0 3px 8px rgba(15,23,42,0.3);" title="Lokasi Anda"></div>
    `
  });
}

function MapFlyToController({
  targetCoords
}: {
  targetCoords: [number, number] | null;
}) {
  const map = useMap();
  const prevTargetRef = useRef<string | null>(null);

  useEffect(() => {
    if (!targetCoords) return;
    const key = `${targetCoords[0].toFixed(4)},${targetCoords[1].toFixed(4)}`;
    if (prevTargetRef.current === key) return;
    prevTargetRef.current = key;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      map.setView(targetCoords, 14, { animate: false });
    } else {
      map.flyTo(targetCoords, 14, {
        duration: 0.85
      });
    }
  }, [map, targetCoords]);

  return null;
}

export default function PickupMapInner({
  locations,
  focusedLocationName,
  pickupLocationName,
  returnLocationName,
  userCoords,
  onSelectLocation
}: PickupMapInnerProps) {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const resolveTheme = () => {
      const attr = document.documentElement.getAttribute("data-theme");
      if (attr === "dark") {
        setIsDarkTheme(true);
      } else if (attr === "light") {
        setIsDarkTheme(false);
      } else {
        setIsDarkTheme(
          window.matchMedia("(prefers-color-scheme: dark)").matches
        );
      }
    };

    resolveTheme();

    const observer = new MutationObserver(resolveTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"]
    });

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    mql.addEventListener("change", resolveTheme);

    return () => {
      observer.disconnect();
      mql.removeEventListener("change", resolveTheme);
    };
  }, []);

  const focusedLocation = useMemo(
    () =>
      locations.find((loc) => loc.name === focusedLocationName) ?? null,
    [locations, focusedLocationName]
  );

  const targetCoords = useMemo<[number, number] | null>(() => {
    if (!focusedLocation) return null;
    return [focusedLocation.lat, focusedLocation.lng];
  }, [focusedLocation]);

  const userIcon = useMemo(() => createUserLocationDivIcon(), []);

  const tileUrl = isDarkTheme
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const tileAttribution = isDarkTheme
    ? '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';

  return (
    <div
      className="relative isolate h-full w-full overflow-hidden rounded-[var(--radius-lg)]"
      data-testid="leaflet-map-canvas"
      data-map-theme={isDarkTheme ? "dark" : "light"}
    >
      <MapContainer
        center={MEDAN_DEFAULT_CENTER}
        zoom={MEDAN_DEFAULT_ZOOM}
        scrollWheelZoom={false}
        className="h-full w-full z-0"
        style={{ height: "100%", width: "100%", minHeight: "320px" }}
      >
        <TileLayer
          key={isDarkTheme ? "carto-dark" : "osm-light"}
          attribution={tileAttribution}
          url={tileUrl}
        />

        <MapFlyToController targetCoords={targetCoords} />

        {userCoords ? (
          <Marker
            position={[userCoords.lat, userCoords.lng]}
            icon={userIcon}
          >
            <Popup>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-[var(--fg)]">Lokasi Anda Saat Ini</p>
                <p className="font-mono text-[11px] text-[var(--fg-muted)]">
                  {userCoords.lat.toFixed(4)}, {userCoords.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        ) : null}

        {locations.map((loc) => {
          const isFocused = loc.name === focusedLocationName;
          const isPickup = loc.name === pickupLocationName;
          const isReturn = loc.name === returnLocationName;
          const icon = createLocationDivIcon(loc, isFocused, isPickup, isReturn);
          const directionsUrl = buildGoogleMapsDirectionsUrl(loc.lat, loc.lng);

          return (
            <Marker
              key={loc.id}
              position={[loc.lat, loc.lng]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  onSelectLocation?.(loc.name);
                }
              }}
            >
              <Popup>
                <div className="min-w-[210px] max-w-[250px] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold uppercase tracking-wider text-[10px] text-[var(--primary)]">
                      {loc.shortLabel}
                    </span>
                    {loc.isNearest ? (
                      <span className="rounded-full bg-[var(--secondary-subtle)] px-2 py-0.5 text-[10px] font-semibold text-[var(--secondary)]">
                        Terdekat
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm font-bold text-slate-900">{loc.name}</p>
                  <p className="leading-relaxed text-slate-600">{loc.address}</p>
                  <p className="font-medium text-slate-700">
                    Jam operasional: {loc.operatingHours}
                  </p>
                  {loc.distanceKm !== null ? (
                    <p className="font-mono text-[11px] font-semibold text-teal-700">
                      Jarak lurus: ~{formatDistanceKm(loc.distanceKm)}
                    </p>
                  ) : null}
                  <div className="pt-1">
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-md bg-blue-700 px-2.5 py-1.5 text-[11px] font-semibold !text-white hover:bg-blue-800"
                    >
                      Buka rute di Google Maps
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
