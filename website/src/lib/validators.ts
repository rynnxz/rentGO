import { z } from "zod";
import { PICKUP_LOCATIONS } from "./utils";

const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal wajib YYYY-MM-DD");

export const vehicleCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama kategori minimal 2 karakter")
    .max(60, "Nama kategori maksimal 60 karakter"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug minimal 2 karakter")
    .max(60, "Slug maksimal 60 karakter")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung"),
  description: z.string().trim().max(300).optional().nullable(),
});

export const vehicleSchema = z.object({
  category_id: z.string().uuid("Kategori kendaraan wajib dipilih"),
  plate_number: z
    .string()
    .trim()
    .min(4, "Nomor plat minimal 4 karakter")
    .max(20, "Nomor plat maksimal 20 karakter")
    .regex(/^[A-Z0-9 ]+$/i, "Nomor plat hanya boleh huruf, angka, dan spasi"),
  brand: z.string().trim().min(2, "Merek kendaraan wajib diisi").max(50),
  model: z.string().trim().min(2, "Model kendaraan wajib diisi").max(80),
  year: z.coerce
    .number()
    .int()
    .min(1990, "Tahun minimal 1990")
    .max(2100, "Tahun maksimal 2100"),
  color: z.string().trim().max(40).optional().nullable(),
  transmission: z.enum(["manual", "automatic"]),
  fuel: z.enum(["bensin", "diesel", "listrik", "hybrid"]),
  seats: z.coerce
    .number()
    .int()
    .min(1, "Jumlah kursi minimal 1")
    .max(60, "Jumlah kursi maksimal 60"),
  daily_price: z.coerce
    .number()
    .positive("Harga harian harus lebih dari Rp 0")
    .max(100_000_000, "Harga harian terlalu besar"),
  status: z.enum(["active", "maintenance", "inactive"]).default("active"),
  description: z.string().trim().max(600).optional().nullable(),
  image_url: z.string().trim().max(500).optional().nullable(),
});

export const profileUpdateSchema = z.object({
  full_name: z.string().trim().min(2, "Nama lengkap minimal 2 karakter").max(100).optional(),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+]{9,16}$/, "Nomor HP harus 9-16 digit angka"),
  driver_license_no: z
    .string()
    .trim()
    .min(8, "Nomor SIM minimal 8 karakter")
    .max(24, "Nomor SIM maksimal 24 karakter"),
});

export const bookingCreateSchema = z
  .object({
    vehicle_id: z.string().uuid("ID kendaraan tidak valid"),
    start_date: isoDateString,
    end_date: isoDateString,
    pickup_location: z.enum(PICKUP_LOCATIONS, {
      errorMap: () => ({ message: "Pilih lokasi jemput yang tersedia di Medan" }),
    }),
    return_location: z.enum(PICKUP_LOCATIONS, {
      errorMap: () => ({ message: "Pilih lokasi pengembalian yang tersedia di Medan" }),
    }),
    payment_method: z.enum(["cash", "transfer", "qris"]).default("transfer"),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+]{9,16}$/, "Nomor HP aktif wajib diisi (9-16 digit)"),
    driver_license_no: z
      .string()
      .trim()
      .min(8, "Nomor SIM wajib diisi (minimal 8 karakter)")
      .max(24, "Nomor SIM maksimal 24 karakter"),
    notes: z.string().trim().max(400).optional().nullable(),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: "Tanggal kembali harus sama atau setelah tanggal ambil",
    path: ["end_date"],
  });

export const bookingStatusUpdateSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "ongoing",
    "completed",
    "cancelled",
    "rejected",
    "expired",
  ]),
  admin_notes: z.string().trim().max(500).optional().nullable(),
});

export const paymentVerifySchema = z.object({
  status: z.enum(["unpaid", "paid", "refunded"]),
  method: z.enum(["cash", "transfer", "qris"]).optional(),
  note: z.string().trim().max(400).optional().nullable(),
  proof_url: z.string().trim().max(500).optional().nullable(),
});

export const maintenanceLogSchema = z
  .object({
    vehicle_id: z.string().uuid("Kendaraan wajib dipilih"),
    title: z.string().trim().min(3, "Judul perawatan minimal 3 karakter").max(120),
    description: z.string().trim().max(500).optional().nullable(),
    start_date: isoDateString,
    end_date: isoDateString,
    cost: z.coerce.number().min(0, "Biaya perawatan tidak boleh negatif").default(0),
    status: z.enum(["scheduled", "in_progress", "done"]).default("scheduled"),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: "Tanggal selesai perawatan harus sama atau setelah tanggal mulai",
    path: ["end_date"],
  });

export const aiRecommendInputSchema = z
  .object({
    start_date: isoDateString.optional(),
    end_date: isoDateString.optional(),
    passengers: z.coerce
      .number()
      .int()
      .min(1, "Jumlah penumpang minimal 1 orang")
      .max(30, "Jumlah penumpang maksimal 30 orang")
      .default(4),
    max_daily_budget: z.coerce
      .number()
      .positive("Anggaran per hari harus positif")
      .optional()
      .nullable(),
    query_text: z
      .string()
      .trim()
      .min(3, "Tuliskan kebutuhan perjalanan Anda (minimal 3 karakter)")
      .max(300, "Teks kebutuhan maksimal 300 karakter"),
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        return data.end_date >= data.start_date;
      }
      return true;
    },
    {
      message: "Tanggal kembali harus sama atau setelah tanggal ambil",
      path: ["end_date"],
    },
  );
