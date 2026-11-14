export type UserRole = "customer" | "admin";
export type VehicleStatus = "active" | "maintenance" | "inactive";
export type TransmissionType = "manual" | "automatic";
export type FuelType = "bensin" | "diesel" | "listrik" | "hybrid";
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "ongoing"
  | "completed"
  | "cancelled"
  | "rejected"
  | "expired";
export type PaymentMethod = "cash" | "transfer" | "qris";
export type PaymentStatus = "unpaid" | "paid" | "refunded";
export type MaintenanceStatus = "scheduled" | "in_progress" | "done";
export type SurfaceName = "landing" | "book" | "admin";

export interface UserRecord {
  id: string;
  firebase_uid: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  driver_license_no: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VehicleCategoryRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleRecord {
  id: string;
  category_id: string;
  plate_number: string;
  brand: string;
  model: string;
  year: number;
  color: string | null;
  transmission: TransmissionType;
  fuel: FuelType;
  seats: number;
  daily_price: number;
  status: VehicleStatus;
  description: string | null;
  image_url: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleWithCategory extends VehicleRecord {
  category_name: string;
  category_slug: string;
}

export interface BookingRecord {
  id: string;
  booking_code: string;
  user_id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  pickup_location: string;
  return_location: string;
  daily_price_snapshot: number;
  total_price: number;
  status: BookingStatus;
  notes: string | null;
  admin_notes: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentRecord {
  id: string;
  booking_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  proof_url: string | null;
  paid_at: string | null;
  verified_by: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingDetailView extends BookingRecord {
  user_name: string;
  user_email: string;
  user_phone: string | null;
  user_license_no: string | null;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_plate: string;
  vehicle_image: string | null;
  vehicle_transmission: TransmissionType;
  vehicle_seats: number;
  payment: PaymentRecord | null;
}

export interface MaintenanceLogRecord {
  id: string;
  vehicle_id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  cost: number;
  status: MaintenanceStatus;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceWithVehicle extends MaintenanceLogRecord {
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_plate: string;
}

export interface AiRecommendationLogRecord {
  id: string;
  user_id: string | null;
  query_text: string;
  params: Record<string, unknown>;
  recommended_vehicle_ids: string[];
  model: string | null;
  used_fallback: boolean;
  latency_ms: number | null;
  created_at: string;
}

export interface AiRecommendationItem {
  vehicle_id: string;
  rank: number;
  reason: string;
  fit_score: number;
  vehicle?: VehicleWithCategory;
}

export interface AiRecommendationResponse {
  summary: string;
  used_fallback: boolean;
  model: string;
  recommendations: AiRecommendationItem[];
}
