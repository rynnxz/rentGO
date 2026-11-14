import { TZDate } from "@date-fns/tz";
import { addDays, format, parseISO } from "date-fns";
import type { SurfaceName } from "./types";

export const WIB_TIMEZONE = "Asia/Jakarta";

export const PICKUP_LOCATIONS = [
  "Bandara Kualanamu",
  "Stasiun Medan",
  "Kantor RentGo Medan",
] as const;

export function formatRupiah(amount: number): string {
  const rounded = Math.round(Number(amount) || 0);
  const formatted = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(rounded);
  return `Rp ${formatted}`;
}

export function getTodayWib(now: Date = new Date()): string {
  const wibDate = new TZDate(now.getTime(), WIB_TIMEZONE);
  return format(wibDate, "yyyy-MM-dd");
}

export function addDaysIso(dateStr: string, days: number): string {
  const parsed = parseISO(`${dateStr}T00:00:00Z`);
  const next = addDays(parsed, days);
  return next.toISOString().slice(0, 10);
}

export function formatDateId(dateStr: string): string {
  if (!dateStr) return "-";
  const [y, m, d] = dateStr.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return dateStr;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  return `${d} ${months[m - 1] ?? ""} ${y}`;
}

export function resolveSurfaceFromRequest(params: {
  host: string | null;
  siteQuery?: string | null;
  siteCookie?: string | null;
  nodeEnv?: string;
  rootDomain?: string;
}): {
  surface: SurfaceName;
  usedOverride: boolean;
} {
  const cleanHost = (params.host ?? "localhost:3000")
    .toLowerCase()
    .split(":")[0]
    .trim();
  const rootBase = (params.rootDomain ?? "rentgo.my.id")
    .toLowerCase()
    .split(":")[0]
    .trim();

  // 1. Subdomain matching on production domain or *.localhost
  if (
    cleanHost === `admin.${rootBase}` ||
    cleanHost === "admin.localhost" ||
    cleanHost.startsWith("admin.")
  ) {
    return { surface: "admin", usedOverride: false };
  }

  if (
    cleanHost === `book.${rootBase}` ||
    cleanHost === "book.localhost" ||
    cleanHost.startsWith("book.")
  ) {
    return { surface: "book", usedOverride: false };
  }

  // 2. Preview / non-production override (?site=landing|book|admin or cookie __site)
  // Strictly disabled on production root domain
  const isProductionCustomDomain =
    params.nodeEnv === "production" &&
    cleanHost === rootBase &&
    !cleanHost.endsWith(".vercel.app") &&
    cleanHost !== "localhost";

  if (!isProductionCustomDomain) {
    const candidate = params.siteQuery ?? params.siteCookie;
    if (
      candidate === "landing" ||
      candidate === "book" ||
      candidate === "admin"
    ) {
      return { surface: candidate, usedOverride: true };
    }
  }

  return { surface: "landing", usedOverride: false };
}

export function buildSurfaceUrl(
  surface: SurfaceName,
  pathname: string = "/",
  hostHeader?: string | null,
): string {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const cleanHost = (hostHeader ?? "localhost:3000").toLowerCase();

  if (cleanHost.includes("localhost") || cleanHost.startsWith("127.0.0.1")) {
    const portPart = cleanHost.includes(":")
      ? `:${cleanHost.split(":")[1]}`
      : ":3000";
    if (surface === "landing") {
      return `http://localhost${portPart}${normalizedPath}`;
    }
    return `http://${surface}.localhost${portPart}${normalizedPath}`;
  }

  if (cleanHost.endsWith(".vercel.app")) {
    const sep = normalizedPath.includes("?") ? "&" : "?";
    return `https://${cleanHost}${normalizedPath}${sep}site=${surface}`;
  }

  const root = (process.env.ROOT_DOMAIN ?? "rentgo.my.id")
    .replace(/^https?:\/\//, "")
    .split("/")[0];
  if (surface === "landing") {
    return `https://${root}${normalizedPath}`;
  }
  return `https://${surface}.${root}${normalizedPath}`;
}

export function buildWhatsAppBookingUrl(params: {
  whatsappNumber: string;
  bookingCode: string;
  vehicleName: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  customerName: string;
}): string {
  const cleanPhone = params.whatsappNumber.replace(/[^0-9]/g, "");
  const message = [
    `Halo Admin RentGo Medan, saya ingin mengonfirmasi pesanan sewa kendaraan:`,
    `- Kode Booking: ${params.bookingCode}`,
    `- Nama Pemesan: ${params.customerName}`,
    `- Unit Kendaraan: ${params.vehicleName}`,
    `- Tanggal Sewa: ${params.startDate} s/d ${params.endDate}`,
    `- Total Tagihan: ${formatRupiah(params.totalPrice)}`,
    `Terima kasih.`,
  ].join("\n");

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
