import { parseUtcDateMs } from "./pricing";
import type {
  BookingRecord,
  MaintenanceLogRecord,
  VehicleRecord,
} from "./types";

const ACTIVE_BOOKING_STATUSES = new Set(["pending", "confirmed", "ongoing"]);
const BLOCKING_MAINTENANCE_STATUSES = new Set(["scheduled", "in_progress"]);

/**
 * Checks if two inclusive date ranges [startA, endA] and [startB, endB] overlap.
 * Mirrors PostgreSQL `daterange(startA, endA, '[]') && daterange(startB, endB, '[]')`.
 */
export function isDateRangeOverlapping(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  const sA = parseUtcDateMs(startA);
  const eA = parseUtcDateMs(endA);
  const sB = parseUtcDateMs(startB);
  const eB = parseUtcDateMs(endB);
  if (eA < sA || eB < sB) {
    throw new Error("Rentang tanggal tidak valid: end_date lebih kecil dari start_date.");
  }
  return sA <= eB && sB <= eA;
}

export function isVehicleAvailableForRange<T extends VehicleRecord>(params: {
  vehicle: T;
  bookings: Pick<BookingRecord, "vehicle_id" | "start_date" | "end_date" | "status">[];
  maintenanceLogs: Pick<
    MaintenanceLogRecord,
    "vehicle_id" | "start_date" | "end_date" | "status"
  >[];
  startDate: string;
  endDate: string;
}): { available: boolean; reason?: string } {
  const { vehicle, bookings, maintenanceLogs, startDate, endDate } = params;

  if (vehicle.deleted_at !== null) {
    return { available: false, reason: "Kendaraan telah dihapus." };
  }

  if (vehicle.status !== "active") {
    return {
      available: false,
      reason: "Kendaraan sedang tidak aktif atau dalam perawatan.",
    };
  }

  const hasOverlappingMaintenance = maintenanceLogs.some(
    (log) =>
      log.vehicle_id === vehicle.id &&
      BLOCKING_MAINTENANCE_STATUSES.has(log.status) &&
      isDateRangeOverlapping(log.start_date, log.end_date, startDate, endDate),
  );

  if (hasOverlappingMaintenance) {
    return {
      available: false,
      reason: "Kendaraan terjadwal perawatan pada rentang tanggal tersebut.",
    };
  }

  const hasOverlappingBooking = bookings.some(
    (b) =>
      b.vehicle_id === vehicle.id &&
      ACTIVE_BOOKING_STATUSES.has(b.status) &&
      isDateRangeOverlapping(b.start_date, b.end_date, startDate, endDate),
  );

  if (hasOverlappingBooking) {
    return {
      available: false,
      reason: "Kendaraan sudah dipesan pada tanggal tersebut",
    };
  }

  return { available: true };
}

export function filterAvailableVehicles<T extends VehicleRecord>(params: {
  vehicles: T[];
  bookings: Pick<BookingRecord, "vehicle_id" | "start_date" | "end_date" | "status">[];
  maintenanceLogs: Pick<
    MaintenanceLogRecord,
    "vehicle_id" | "start_date" | "end_date" | "status"
  >[];
  startDate: string;
  endDate: string;
}): T[] {
  return params.vehicles.filter(
    (vehicle) =>
      isVehicleAvailableForRange({
        vehicle,
        bookings: params.bookings,
        maintenanceLogs: params.maintenanceLogs,
        startDate: params.startDate,
        endDate: params.endDate,
      }).available,
  );
}
