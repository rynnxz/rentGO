"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  Clock,
  Compass,
  ExternalLink,
  Loader2,
  MapPin,
  Navigation
} from "lucide-react";
import {
  buildGoogleMapsDirectionsUrl,
  formatDistanceKm,
  RENTGO_LOCATIONS,
  sortLocationsByDistance,
  type PickupLocationName
} from "@/lib/locations";
import { cn } from "@/lib/utils";

const PickupMapInner = dynamic(() => import("./pickup-map-inner"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-full min-h-[320px] w-full flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-subtle)] text-xs text-[var(--fg-muted)]"
      data-testid="pickup-map-skeleton"
    >
      <Loader2 className="h-5 w-5 animate-spin text-[var(--primary)]" aria-hidden="true" />
      <span>Memuat peta interaktif OpenStreetMap...</span>
    </div>
  )
});

export interface PickupMapProps {
  pickupLocationName?: string | null;
  returnLocationName?: string | null;
  onPickupLocationChange?: (locationName: PickupLocationName) => void;
  onReturnLocationChange?: (locationName: PickupLocationName) => void;
  compact?: boolean;
  className?: string;
}

const ACCENT_DOT_CLASS: Record<"cobalt" | "teal" | "amber", string> = {
  cobalt: "bg-[var(--primary)]",
  teal: "bg-[var(--secondary)]",
  amber: "bg-[var(--accent)]"
};

export function PickupMap({
  pickupLocationName,
  returnLocationName,
  onPickupLocationChange,
  onReturnLocationChange,
  compact = false,
  className
}: PickupMapProps) {
  const isInteractiveSelection = Boolean(
    onPickupLocationChange || onReturnLocationChange
  );

  const [selectionTarget, setSelectionTarget] = useState<"pickup" | "return">(
    "pickup"
  );
  const [focusedLocationName, setFocusedLocationName] = useState<string | null>(
    pickupLocationName ?? RENTGO_LOCATIONS[0].name
  );
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [geoState, setGeoState] = useState<
    "idle" | "locating" | "granted" | "unavailable"
  >("idle");

  // Two-way sync: when pickupLocationName changes from outside (e.g. dropdown), flyTo that pin
  useEffect(() => {
    if (pickupLocationName) {
      setFocusedLocationName(pickupLocationName);
    }
  }, [pickupLocationName]);

  // Two-way sync: when returnLocationName changes from outside, flyTo that pin
  useEffect(() => {
    if (returnLocationName) {
      setFocusedLocationName(returnLocationName);
    }
  }, [returnLocationName]);

  const sortedLocations = useMemo(
    () => sortLocationsByDistance(userCoords, RENTGO_LOCATIONS),
    [userCoords]
  );

  function handleSelectFromMapOrCard(locationName: string) {
    setFocusedLocationName(locationName);
    const typedName = locationName as PickupLocationName;

    if (selectionTarget === "pickup" && onPickupLocationChange) {
      onPickupLocationChange(typedName);
    } else if (selectionTarget === "return" && onReturnLocationChange) {
      onReturnLocationChange(typedName);
    } else if (onPickupLocationChange) {
      onPickupLocationChange(typedName);
    }
  }

  function handleRequestGeolocation() {
    if (
      typeof window === "undefined" ||
      !("geolocation" in navigator) ||
      typeof navigator.geolocation?.getCurrentPosition !== "function"
    ) {
      setGeoState("unavailable");
      return;
    }

    setGeoState("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserCoords(coords);
        setGeoState("granted");

        const ranked = sortLocationsByDistance(coords, RENTGO_LOCATIONS);
        if (ranked[0]) {
          setFocusedLocationName(ranked[0].name);
        }
      },
      () => {
        // Jika ditolak/gagal: peta tetap berfungsi normal tanpa jarak, tanpa error
        setGeoState("unavailable");
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 60000
      }
    );
  }

  return (
    <div
      className={cn("space-y-4", className)}
      data-testid="pickup-map-section"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
            <Compass className="h-3.5 w-3.5 text-[var(--primary)]" aria-hidden="true" />
            3 Titik Layanan Resmi Medan & Deli Serdang
          </span>

          {isInteractiveSelection && onPickupLocationChange && onReturnLocationChange ? (
            <div
              className="inline-flex rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-subtle)] p-0.5 text-xs"
              role="group"
              aria-label="Mode klik pin peta"
            >
              <button
                type="button"
                onClick={() => setSelectionTarget("pickup")}
                className={cn(
                  "rounded-[calc(var(--radius-md)-2px)] px-2.5 py-1 font-semibold transition-colors",
                  selectionTarget === "pickup"
                    ? "bg-[var(--primary)] text-[var(--primary-fg)]"
                    : "text-[var(--fg-secondary)] hover:text-[var(--fg)]"
                )}
              >
                Pilih Titik Ambil
              </button>
              <button
                type="button"
                onClick={() => setSelectionTarget("return")}
                className={cn(
                  "rounded-[calc(var(--radius-md)-2px)] px-2.5 py-1 font-semibold transition-colors",
                  selectionTarget === "return"
                    ? "bg-[var(--secondary)] text-white"
                    : "text-[var(--fg-secondary)] hover:text-[var(--fg)]"
                )}
              >
                Pilih Titik Kembali
              </button>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRequestGeolocation}
            disabled={geoState === "locating"}
            data-testid="use-my-location-button"
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-1.5 text-xs font-semibold text-[var(--fg)] shadow-[var(--shadow-xs)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary-subtle)] hover:text-[var(--primary)] disabled:opacity-60"
          >
            {geoState === "locating" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--primary)]" aria-hidden="true" />
            ) : (
              <Navigation className="h-3.5 w-3.5 text-[var(--primary)]" aria-hidden="true" />
            )}
            <span>
              {geoState === "granted"
                ? "Perbarui lokasi saya"
                : "Gunakan lokasi saya"}
            </span>
          </button>

          {geoState === "unavailable" ? (
            <span
              className="text-[11px] text-[var(--fg-muted)]"
              data-testid="geolocation-fallback-note"
            >
              Akses lokasi tidak aktif. Pilih titik secara manual di bawah.
            </span>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          " grid gap-4",
          compact ? "grid-cols-1" : "lg:grid-cols-12"
        )}
      >
        <div
          className={cn(
            "overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-elevated)] shadow-[var(--shadow-xs)]",
            compact
              ? "h-[280px] sm:h-[320px]"
              : "h-[340px] sm:h-[400px] lg:col-span-7 lg:h-full lg:min-h-[420px]"
          )}
        >
          <PickupMapInner
            locations={sortedLocations}
            focusedLocationName={focusedLocationName}
            pickupLocationName={pickupLocationName}
            returnLocationName={returnLocationName}
            userCoords={userCoords}
            onSelectLocation={handleSelectFromMapOrCard}
          />
        </div>

        <div
          className={cn(
            "grid gap-3",
            compact
              ? "grid-cols-1 sm:grid-cols-3"
              : "grid-cols-1 lg:col-span-5"
          )}
          data-testid="pickup-location-cards"
        >
          {sortedLocations.map((loc) => {
            const isFocused = loc.name === focusedLocationName;
            const isPickup = loc.name === pickupLocationName;
            const isReturn = loc.name === returnLocationName;
            const directionsUrl = buildGoogleMapsDirectionsUrl(loc.lat, loc.lng);

            return (
              <div
                key={loc.id}
                data-testid={`location-card-${loc.id}`}
                onClick={() => handleSelectFromMapOrCard(loc.name)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelectFromMapOrCard(loc.name);
                  }
                }}
                className={cn(
                  "group flex flex-col justify-between rounded-[var(--radius-lg)] border p-3.5 text-left transition-all cursor-pointer",
                  isFocused
                    ? "border-[var(--primary)] bg-[var(--primary-subtle)]/45 shadow-[var(--shadow-sm)]"
                    : "border-[var(--border)] bg-[var(--surface-elevated)] hover:border-[var(--border-strong)]"
                )}
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          ACCENT_DOT_CLASS[loc.accentColor]
                        )}
                        aria-hidden="true"
                      />
                      {loc.shortLabel}
                    </span>

                    <div className="flex flex-wrap items-center gap-1">
                      {loc.isNearest ? (
                        <span
                          data-testid="nearest-location-badge"
                          className="rounded-full border border-[var(--secondary)]/30 bg-[var(--secondary-subtle)] px-2 py-0.5 text-[10px] font-bold text-[var(--secondary)]"
                        >
                          Terdekat
                          {loc.distanceKm !== null
                            ? ` · ${formatDistanceKm(loc.distanceKm)}`
                            : ""}
                        </span>
                      ) : loc.distanceKm !== null ? (
                        <span className="rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[var(--fg-secondary)]">
                          {formatDistanceKm(loc.distanceKm)}
                        </span>
                      ) : null}

                      {isPickup ? (
                        <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-[10px] font-bold text-[var(--primary-fg)]">
                          Titik Ambil
                        </span>
                      ) : null}
                      {isReturn ? (
                        <span className="rounded-full bg-[var(--secondary)] px-2 py-0.5 text-[10px] font-bold text-white">
                          Titik Kembali
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[var(--fg)] group-hover:text-[var(--primary)]">
                      {loc.name}
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--fg-secondary)]">
                      {loc.address}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--fg-muted)]">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-[var(--secondary)]" aria-hidden="true" />
                    <span>{loc.operatingHours}</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] pt-2.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--primary)]">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {isInteractiveSelection ? "Klik untuk pilih & fokus" : "Fokus di peta"}
                  </span>

                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    data-testid={`open-route-${loc.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex min-h-[32px] items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[11px] font-semibold text-[var(--fg)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  >
                    <span>Buka rute</span>
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
