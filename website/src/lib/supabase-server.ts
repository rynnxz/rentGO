import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getEnv, hasSupabaseServiceCredentials } from "./env";
import type {
  AiRecommendationLogRecord,
  BookingRecord,
  MaintenanceLogRecord,
  PaymentRecord,
  UserRecord,
  VehicleCategoryRecord,
  VehicleRecord,
} from "./types";

let cachedClient: SupabaseClient | null = null;

export function getSupabaseServiceClient(): SupabaseClient | null {
  if (!hasSupabaseServiceCredentials()) {
    return null;
  }
  if (!cachedClient) {
    const env = getEnv();
    const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
    cachedClient = createClient(url, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return cachedClient;
}

export interface CloudDatabaseSnapshot {
  users: UserRecord[];
  vehicle_categories: VehicleCategoryRecord[];
  vehicles: VehicleRecord[];
  bookings: BookingRecord[];
  payments: PaymentRecord[];
  maintenance_logs: MaintenanceLogRecord[];
  ai_recommendation_logs: AiRecommendationLogRecord[];
}

export async function fetchCloudDatabaseSnapshot(): Promise<CloudDatabaseSnapshot | null> {
  const sb = getSupabaseServiceClient();
  if (!sb) return null;

  try {
    const [cats, users, vehicles, bookings, payments, maint, aiLogs] =
      await Promise.all([
        sb.from("vehicle_categories").select("*"),
        sb.from("users").select("*"),
        sb.from("vehicles").select("*"),
        sb.from("bookings").select("*"),
        sb.from("payments").select("*"),
        sb.from("maintenance_logs").select("*"),
        sb
          .from("ai_recommendation_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100),
      ]);

    if (cats.error || vehicles.error) {
      return null;
    }

    return {
      vehicle_categories: (cats.data ?? []) as VehicleCategoryRecord[],
      users: (users.data ?? []) as UserRecord[],
      vehicles: (vehicles.data ?? []).map((v) => ({
        ...v,
        daily_price: Number(v.daily_price),
        year: Number(v.year),
        seats: Number(v.seats),
      })) as VehicleRecord[],
      bookings: (bookings.data ?? []).map((b) => ({
        ...b,
        total_days: Number(b.total_days),
        daily_price_snapshot: Number(b.daily_price_snapshot),
        total_price: Number(b.total_price),
      })) as BookingRecord[],
      payments: (payments.data ?? []).map((p) => ({
        ...p,
        amount: Number(p.amount),
      })) as PaymentRecord[],
      maintenance_logs: (maint.data ?? []).map((m) => ({
        ...m,
        cost: Number(m.cost ?? 0),
      })) as MaintenanceLogRecord[],
      ai_recommendation_logs: (aiLogs.data ?? []) as AiRecommendationLogRecord[],
    };
  } catch {
    return null;
  }
}
