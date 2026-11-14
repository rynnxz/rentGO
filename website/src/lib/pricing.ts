import { getTodayWib } from "./utils";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function parseUtcDateMs(dateStr: string): number {
  if (!ISO_DATE_RE.test(dateStr)) {
    throw new Error(`Format tanggal tidak valid: ${dateStr} (gunakan YYYY-MM-DD)`);
  }
  const ms = Date.parse(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(ms)) {
    throw new Error(`Tanggal tidak valid: ${dateStr}`);
  }
  return ms;
}

export function calculateInclusiveDays(startDate: string, endDate: string): number {
  const startMs = parseUtcDateMs(startDate);
  const endMs = parseUtcDateMs(endDate);
  if (endMs < startMs) {
    throw new Error("Tanggal kembali harus sama atau setelah tanggal ambil.");
  }
  const diffDays = Math.round((endMs - startMs) / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

export const calculateRentalDays = calculateInclusiveDays;

export function calculateBookingPrice(params: {
  dailyPrice: number;
  startDate: string;
  endDate: string;
}): {
  totalDays: number;
  dailyPriceSnapshot: number;
  totalPrice: number;
} {
  const dailyPriceSnapshot = Math.round(Number(params.dailyPrice));
  if (!Number.isFinite(dailyPriceSnapshot) || dailyPriceSnapshot <= 0) {
    throw new Error("Harga sewa harian harus lebih besar dari Rp 0.");
  }
  const totalDays = calculateInclusiveDays(params.startDate, params.endDate);
  const totalPrice = totalDays * dailyPriceSnapshot;
  return {
    totalDays,
    dailyPriceSnapshot,
    totalPrice,
  };
}

export function generateBookingCode(
  wibDateStr: string = getTodayWib(),
  randomSuffix?: string,
): string {
  const cleanDate = wibDateStr.replace(/-/g, "");
  const yymmdd = cleanDate.length >= 8 ? cleanDate.slice(2, 8) : "261115";
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = randomSuffix ?? "";
  if (!suffix) {
    for (let i = 0; i < 4; i++) {
      suffix += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return `RG-${yymmdd}-${suffix.toUpperCase().slice(0, 4)}`;
}
