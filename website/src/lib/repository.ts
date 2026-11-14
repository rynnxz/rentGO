import "server-only";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { getAdminEmails } from "./env";
import { calculateBookingPrice, generateBookingCode } from "./pricing";
import {
  filterAvailableVehicles,
  isDateRangeOverlapping,
  isVehicleAvailableForRange,
} from "./availability";
import { assertValidBookingTransition, type TransitionActor } from "./booking-state";
import { getTodayWib } from "./utils";
import type {
  AiRecommendationLogRecord,
  BookingDetailView,
  BookingRecord,
  BookingStatus,
  MaintenanceLogRecord,
  MaintenanceStatus,
  MaintenanceWithVehicle,
  PaymentMethod,
  PaymentRecord,
  PaymentStatus,
  UserRecord,
  UserRole,
  VehicleCategoryRecord,
  VehicleRecord,
  VehicleWithCategory,
} from "./types";

export interface LocalDatabaseState {
  users: UserRecord[];
  vehicle_categories: VehicleCategoryRecord[];
  vehicles: VehicleRecord[];
  bookings: BookingRecord[];
  payments: PaymentRecord[];
  maintenance_logs: MaintenanceLogRecord[];
  ai_recommendation_logs: AiRecommendationLogRecord[];
}

export function createInitialSeedState(): LocalDatabaseState {
  const now = "2026-11-15T01:00:00.000Z";
  return {
    vehicle_categories: [
      {
        id: "11111111-1111-4111-8111-111111111101",
        name: "Mobil City",
        slug: "mobil-city",
        description:
          "Mobil kompak hemat bahan bakar untuk mobilitas dalam Kota Medan.",
        created_at: now,
        updated_at: now,
      },
      {
        id: "11111111-1111-4111-8111-111111111102",
        name: "MPV / Minibus",
        slug: "mpv-minibus",
        description:
          "Kendaraan keluarga 7 penumpang untuk perjalanan grup dan antar-jemput Bandara Kualanamu.",
        created_at: now,
        updated_at: now,
      },
      {
        id: "11111111-1111-4111-8111-111111111103",
        name: "SUV",
        slug: "suv",
        description:
          "Ground clearance tinggi dan mesin bertenaga untuk rute tanjakan Berastagi dan Danau Toba.",
        created_at: now,
        updated_at: now,
      },
      {
        id: "11111111-1111-4111-8111-111111111104",
        name: "Van / Hiace",
        slug: "van-hiace",
        description:
          "Kapasitas besar 12-15 kursi untuk rombongan wisata dan kunjungan kerja.",
        created_at: now,
        updated_at: now,
      },
      {
        id: "11111111-1111-4111-8111-111111111105",
        name: "Motor",
        slug: "motor",
        description:
          "Sepeda motor matik praktis untuk komuter harian di pusat Kota Medan.",
        created_at: now,
        updated_at: now,
      },
    ],
    users: [
      {
        id: "22222222-2222-4222-8222-222222222201",
        firebase_uid: "firebase-admin-akbar",
        email: "akbarriansyah339@gmail.com",
        full_name: "Akbar Riansyah",
        avatar_url: null,
        phone: "081260009988",
        driver_license_no: "1271091511040001",
        role: "admin",
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: "22222222-2222-4222-8222-222222222202",
        firebase_uid: "firebase-cust-nadia",
        email: "nadia.siregar@gmail.com",
        full_name: "Nadia Siregar",
        avatar_url: null,
        phone: "081370112233",
        driver_license_no: "1271082405990002",
        role: "customer",
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: "22222222-2222-4222-8222-222222222203",
        firebase_uid: "firebase-cust-rizky",
        email: "rizky.nasution@gmail.com",
        full_name: "Rizky Nasution",
        avatar_url: null,
        phone: "082165448899",
        driver_license_no: "1271031102970003",
        role: "customer",
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ],
    vehicles: [
      {
        id: "33333333-3333-4333-8333-333333333301",
        category_id: "11111111-1111-4111-8111-111111111101",
        plate_number: "BK 1124 AAB",
        brand: "Honda",
        model: "Brio Satya RS",
        year: 2024,
        color: "Putih Mutiara",
        transmission: "automatic",
        fuel: "bensin",
        seats: 5,
        daily_price: 320000,
        status: "active",
        description:
          "City car lincah dengan transmisi CVT halus, sensor parkir, dan head unit layar sentuh untuk jalanan pusat Kota Medan.",
        image_url: "/vehicles/city-car.svg",
        deleted_at: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: "33333333-3333-4333-8333-333333333302",
        category_id: "11111111-1111-4111-8111-111111111101",
        plate_number: "BK 1482 AAC",
        brand: "Toyota",
        model: "Agya GR Sport",
        year: 2024,
        color: "Kuning",
        transmission: "automatic",
        fuel: "bensin",
        seats: 5,
        daily_price: 300000,
        status: "active",
        description:
          "Hatchback irit BBM dengan kabin ergonomis, cocok untuk mobilitas harian maupun perjalanan singkat dari Stasiun Medan.",
        image_url: "/vehicles/city-car.svg",
        deleted_at: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: "33333333-3333-4333-8333-333333333303",
        category_id: "11111111-1111-4111-8111-111111111102",
        plate_number: "BK 1750 AAD",
        brand: "Toyota",
        model: "Avanza 1.5 G CVT",
        year: 2024,
        color: "Hitam Metalik",
        transmission: "automatic",
        fuel: "bensin",
        seats: 7,
        daily_price: 420000,
        status: "active",
        description:
          "MPV 7 kursi dengan AC double blower dingin, ruang bagasi lega untuk koper Bandara Kualanamu, dan konsumsi BBM efisien.",
        image_url: "/vehicles/mpv.svg",
        deleted_at: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: "33333333-3333-4333-8333-333333333304",
        category_id: "11111111-1111-4111-8111-111111111102",
        plate_number: "BK 1890 AAE",
        brand: "Mitsubishi",
        model: "Xpander Ultimate",
        year: 2024,
        color: "Abu-abu Metalik",
        transmission: "automatic",
        fuel: "bensin",
        seats: 7,
        daily_price: 480000,
        status: "active",
        description:
          "Suspensi nyaman khas Xpander dengan cruise control dan kabin senyap untuk perjalanan keluarga Medan - Parapat.",
        image_url: "/vehicles/mpv.svg",
        deleted_at: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: "33333333-3333-4333-8333-333333333305",
        category_id: "11111111-1111-4111-8111-111111111102",
        plate_number: "BK 1921 AAF",
        brand: "Toyota",
        model: "Kijang Innova Zenix Hybrid",
        year: 2025,
        color: "Hitam",
        transmission: "automatic",
        fuel: "hybrid",
        seats: 7,
        daily_price: 750000,
        status: "active",
        description:
          "MPV premium bermesin hybrid hemat bahan bakar dengan captain seat baris kedua untuk tamu bisnis dan keluarga.",
        image_url: "/vehicles/mpv.svg",
        deleted_at: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: "33333333-3333-4333-8333-333333333306",
        category_id: "11111111-1111-4111-8111-111111111102",
        plate_number: "BK 1310 AAG",
        brand: "Daihatsu",
        model: "Xenia 1.3 R MT",
        year: 2023,
        color: "Silver",
        transmission: "manual",
        fuel: "bensin",
        seats: 7,
        daily_price: 360000,
        status: "active",
        description:
          "Pilihan MPV manual ekonomis dengan daya angkut 7 penumpang dan biaya sewa harian paling terjangkau.",
        image_url: "/vehicles/mpv.svg",
        deleted_at: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: "33333333-3333-4333-8333-333333333307",
        category_id: "11111111-1111-4111-8111-111111111103",
        plate_number: "BK 1555 AAH",
        brand: "Toyota",
        model: "Rush GR Sport",
        year: 2024,
        color: "Putih",
        transmission: "automatic",
        fuel: "bensin",
        seats: 7,
        daily_price: 500000,
        status: "active",
        description:
          "SUV 7 penumpang berpenggerak roda belakang yang tangguh melewati jalur menanjak menuju Berastagi dan Tongging.",
        image_url: "/vehicles/suv.svg",
        deleted_at: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: "33333333-3333-4333-8333-333333333308",
        category_id: "11111111-1111-4111-8111-111111111103",
        plate_number: "BK 1008 AAJ",
        brand: "Mitsubishi",
        model: "Pajero Sport Dakar 4x2",
        year: 2024,
        color: "Hitam",
        transmission: "automatic",
        fuel: "diesel",
        seats: 7,
        daily_price: 1150000,
        status: "active",
        description:
          "SUV diesel turbo bertenaga besar dengan fitur keselamatan lengkap untuk perjalanan lintas Sumatera Utara.",
        image_url: "/vehicles/suv.svg",
        deleted_at: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: "33333333-3333-4333-8333-333333333309",
        category_id: "11111111-1111-4111-8111-111111111104",
        plate_number: "BK 7012 AAK",
        brand: "Toyota",
        model: "Hiace Commuter",
        year: 2023,
        color: "Putih",
        transmission: "manual",
        fuel: "diesel",
        seats: 15,
        daily_price: 1250000,
        status: "active",
        description:
          "Minibus 15 kursi berkapasitas besar untuk rombongan wisata keluarga besar atau instansi di Medan.",
        image_url: "/vehicles/van.svg",
        deleted_at: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: "33333333-3333-4333-8333-333333333310",
        category_id: "11111111-1111-4111-8111-111111111104",
        plate_number: "BK 7099 AAL",
        brand: "Toyota",
        model: "Hiace Premio",
        year: 2024,
        color: "Silver Metalik",
        transmission: "manual",
        fuel: "diesel",
        seats: 12,
        daily_price: 1450000,
        status: "maintenance",
        description:
          "Kabin ekstra lega dengan kursi reclining individual untuk perjalanan grup eksekutif.",
        image_url: "/vehicles/van.svg",
        deleted_at: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: "33333333-3333-4333-8333-333333333311",
        category_id: "11111111-1111-4111-8111-111111111105",
        plate_number: "BK 4112 AAM",
        brand: "Yamaha",
        model: "NMAX 155 Connected",
        year: 2024,
        color: "Biru Navy",
        transmission: "automatic",
        fuel: "bensin",
        seats: 2,
        daily_price: 140000,
        status: "active",
        description:
          "Skutik 155cc posisi duduk rileks, bagasi muat helm, lengkap dengan 2 helm SNI dan jas hujan.",
        image_url: "/vehicles/scooter.svg",
        deleted_at: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: "33333333-3333-4333-8333-333333333312",
        category_id: "11111111-1111-4111-8111-111111111105",
        plate_number: "BK 4288 AAN",
        brand: "Honda",
        model: "Vario 160 ABS",
        year: 2024,
        color: "Hitam Doff",
        transmission: "automatic",
        fuel: "bensin",
        seats: 2,
        daily_price: 120000,
        status: "active",
        description:
          "Motor matik responsif dengan rem ABS dan soket pengisi daya USB untuk keliling kuliner Kota Medan.",
        image_url: "/vehicles/scooter.svg",
        deleted_at: null,
        created_at: now,
        updated_at: now,
      },
    ],
    bookings: [
      {
        id: "44444444-4444-4444-8444-444444444401",
        booking_code: "RG-261010-A101",
        user_id: "22222222-2222-4222-8222-222222222202",
        vehicle_id: "33333333-3333-4333-8333-333333333303",
        start_date: "2026-10-10",
        end_date: "2026-10-12",
        total_days: 3,
        pickup_location: "Bandara Kualanamu",
        return_location: "Bandara Kualanamu",
        daily_price_snapshot: 420000,
        total_price: 1260000,
        status: "completed",
        notes: "Jemput di pintu kedatangan domestik pukul 09.00 WIB.",
        admin_notes: "Unit dikembalikan tepat waktu dan kondisi bersih.",
        expires_at: null,
        created_at: "2026-10-09T07:00:00.000Z",
        updated_at: "2026-10-12T11:00:00.000Z",
      },
      {
        id: "44444444-4444-4444-8444-444444444402",
        booking_code: "RG-261102-B202",
        user_id: "22222222-2222-4222-8222-222222222203",
        vehicle_id: "33333333-3333-4333-8333-333333333305",
        start_date: "2026-11-02",
        end_date: "2026-11-04",
        total_days: 3,
        pickup_location: "Stasiun Medan",
        return_location: "Kantor RentGo Medan",
        daily_price_snapshot: 750000,
        total_price: 2250000,
        status: "completed",
        notes: "Perjalanan dinas tiga hari di Medan.",
        admin_notes: "Pembayaran transfer Mandiri sudah lunas.",
        expires_at: null,
        created_at: "2026-11-01T03:00:00.000Z",
        updated_at: "2026-11-04T12:00:00.000Z",
      },
      {
        id: "44444444-4444-4444-8444-444444444403",
        booking_code: "RG-261114-C303",
        user_id: "22222222-2222-4222-8222-222222222202",
        vehicle_id: "33333333-3333-4333-8333-333333333308",
        start_date: "2026-11-14",
        end_date: "2026-11-16",
        total_days: 3,
        pickup_location: "Kantor RentGo Medan",
        return_location: "Kantor RentGo Medan",
        daily_price_snapshot: 1150000,
        total_price: 3450000,
        status: "ongoing",
        notes: "Kunjungan keluarga ke Danau Toba.",
        admin_notes: "Serah terima unit dilakukan pukul 08.00 WIB.",
        expires_at: null,
        created_at: "2026-11-13T08:00:00.000Z",
        updated_at: "2026-11-14T01:00:00.000Z",
      },
      {
        id: "44444444-4444-4444-8444-444444444404",
        booking_code: "RG-261115-D404",
        user_id: "22222222-2222-4222-8222-222222222203",
        vehicle_id: "33333333-3333-4333-8333-333333333301",
        start_date: "2026-11-22",
        end_date: "2026-11-24",
        total_days: 3,
        pickup_location: "Bandara Kualanamu",
        return_location: "Stasiun Medan",
        daily_price_snapshot: 320000,
        total_price: 960000,
        status: "pending",
        notes: "Mohon unit siap pagi hari.",
        admin_notes: null,
        expires_at: "2026-11-16T01:00:00.000Z",
        created_at: "2026-11-15T01:00:00.000Z",
        updated_at: "2026-11-15T01:00:00.000Z",
      },
    ],
    payments: [
      {
        id: "55555555-5555-4555-8555-555555555501",
        booking_id: "44444444-4444-4444-8444-444444444401",
        amount: 1260000,
        method: "transfer",
        status: "paid",
        proof_url: "/vehicles/receipt-placeholder.svg",
        paid_at: "2026-10-09T07:30:00.000Z",
        verified_by: "22222222-2222-4222-8222-222222222201",
        note: "Transfer Bank Mandiri terverifikasi.",
        created_at: "2026-10-09T07:00:00.000Z",
        updated_at: "2026-10-09T07:30:00.000Z",
      },
      {
        id: "55555555-5555-4555-8555-555555555502",
        booking_id: "44444444-4444-4444-8444-444444444402",
        amount: 2250000,
        method: "qris",
        status: "paid",
        proof_url: "/vehicles/receipt-placeholder.svg",
        paid_at: "2026-11-01T03:15:00.000Z",
        verified_by: "22222222-2222-4222-8222-222222222201",
        note: "Lunas via QRIS.",
        created_at: "2026-11-01T03:00:00.000Z",
        updated_at: "2026-11-01T03:15:00.000Z",
      },
      {
        id: "55555555-5555-4555-8555-555555555503",
        booking_id: "44444444-4444-4444-8444-444444444403",
        amount: 3450000,
        method: "transfer",
        status: "paid",
        proof_url: "/vehicles/receipt-placeholder.svg",
        paid_at: "2026-11-13T09:00:00.000Z",
        verified_by: "22222222-2222-4222-8222-222222222201",
        note: "Lunas sebelum serah terima.",
        created_at: "2026-11-13T08:00:00.000Z",
        updated_at: "2026-11-13T09:00:00.000Z",
      },
      {
        id: "55555555-5555-4555-8555-555555555504",
        booking_id: "44444444-4444-4444-8444-444444444404",
        amount: 960000,
        method: "transfer",
        status: "unpaid",
        proof_url: null,
        paid_at: null,
        verified_by: null,
        note: "Menunggu unggahan bukti pembayaran pelanggan.",
        created_at: "2026-11-15T01:00:00.000Z",
        updated_at: "2026-11-15T01:00:00.000Z",
      },
    ],
    maintenance_logs: [
      {
        id: "66666666-6666-4666-8666-666666666601",
        vehicle_id: "33333333-3333-4333-8333-333333333310",
        title: "Servis Berkala 40.000 KM & Ganti Kampas Rem",
        description:
          "Pengecekan sistem pengereman, ganti oli mesin diesel, dan spooring di bengkel resmi Medan.",
        start_date: "2026-11-14",
        end_date: "2026-11-18",
        cost: 1850000,
        status: "in_progress",
        created_at: now,
        updated_at: now,
      },
    ],
    ai_recommendation_logs: [],
  };
}

let customDataFilePath: string | null = null;

export function setLocalStoreFilePathForTests(filePath: string | null): void {
  customDataFilePath = filePath;
}

function getStoreFilePath(): string {
  if (customDataFilePath) return customDataFilePath;
  return path.join(process.cwd(), ".data", "rentgo-local.json");
}

// In-process async mutex to serialize transactional operations (prevents race conditions in concurrency tests)
let transactionLock: Promise<void> = Promise.resolve();

async function withStoreTransaction<T>(
  fn: (state: LocalDatabaseState) => Promise<T> | T,
): Promise<T> {
  const prevLock = transactionLock;
  let releaseLock!: () => void;
  transactionLock = new Promise<void>((resolve) => {
    releaseLock = resolve;
  });

  await prevLock;
  try {
    const filePath = getStoreFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    let state: LocalDatabaseState;
    if (!fs.existsSync(filePath)) {
      state = createInitialSeedState();
      fs.writeFileSync(filePath, JSON.stringify(state, null, 2), "utf8");
    } else {
      const raw = fs.readFileSync(filePath, "utf8");
      state = JSON.parse(raw) as LocalDatabaseState;
    }

    const result = await fn(state);
    fs.writeFileSync(filePath, JSON.stringify(state, null, 2), "utf8");
    return result;
  } finally {
    releaseLock();
  }
}

function readStoreSnapshot(): LocalDatabaseState {
  const filePath = getStoreFilePath();
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    const seed = createInitialSeedState();
    fs.writeFileSync(filePath, JSON.stringify(seed, null, 2), "utf8");
    return seed;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as LocalDatabaseState;
}

export async function resetDatabaseToSeed(): Promise<void> {
  await withStoreTransaction((state) => {
    const fresh = createInitialSeedState();
    state.users = fresh.users;
    state.vehicle_categories = fresh.vehicle_categories;
    state.vehicles = fresh.vehicles;
    state.bookings = fresh.bookings;
    state.payments = fresh.payments;
    state.maintenance_logs = fresh.maintenance_logs;
    state.ai_recommendation_logs = fresh.ai_recommendation_logs;
  });
}

// ============================================================================
// 1. Users & RBAC Repository
// ============================================================================

export async function upsertUserFromAuth(params: {
  firebase_uid: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
}): Promise<UserRecord> {
  return withStoreTransaction((state) => {
    const normalizedEmail = params.email.trim().toLowerCase();
    const adminAllowlist = getAdminEmails();
    const shouldBeAdmin = adminAllowlist.includes(normalizedEmail);
    const now = new Date().toISOString();

    let existing = state.users.find(
      (u) =>
        u.firebase_uid === params.firebase_uid ||
        u.email.toLowerCase() === normalizedEmail,
    );

    if (existing) {
      existing.firebase_uid = params.firebase_uid;
      existing.email = normalizedEmail;
      if (params.full_name) {
        existing.full_name = params.full_name;
      }
      if (params.avatar_url !== undefined) {
        existing.avatar_url = params.avatar_url;
      }
      if (shouldBeAdmin && existing.role !== "admin") {
        existing.role = "admin";
      }
      existing.updated_at = now;
      return { ...existing };
    }

    const newUser: UserRecord = {
      id: crypto.randomUUID(),
      firebase_uid: params.firebase_uid,
      email: normalizedEmail,
      full_name: params.full_name || normalizedEmail.split("@")[0] || "Pengguna RentGo",
      avatar_url: params.avatar_url ?? null,
      phone: null,
      driver_license_no: null,
      role: shouldBeAdmin ? "admin" : "customer",
      is_active: true,
      created_at: now,
      updated_at: now,
    };

    state.users.push(newUser);
    return { ...newUser };
  });
}

export async function getUserById(userId: string): Promise<UserRecord | null> {
  const state = readStoreSnapshot();
  return state.users.find((u) => u.id === userId) ?? null;
}

export async function getUserByFirebaseUid(
  firebaseUid: string,
): Promise<UserRecord | null> {
  const state = readStoreSnapshot();
  return state.users.find((u) => u.firebase_uid === firebaseUid) ?? null;
}

export async function listUsers(): Promise<
  Array<UserRecord & { total_bookings: number }>
> {
  const state = readStoreSnapshot();
  return state.users
    .map((u) => ({
      ...u,
      total_bookings: state.bookings.filter((b) => b.user_id === u.id).length,
    }))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function updateUserProfile(
  userId: string,
  patch: {
    full_name?: string;
    phone: string;
    driver_license_no: string;
  },
): Promise<UserRecord> {
  return withStoreTransaction((state) => {
    const user = state.users.find((u) => u.id === userId);
    if (!user) {
      throw new Error("Pengguna tidak ditemukan.");
    }
    if (patch.full_name) {
      user.full_name = patch.full_name.trim();
    }
    user.phone = patch.phone.trim();
    user.driver_license_no = patch.driver_license_no.trim();
    user.updated_at = new Date().toISOString();
    return { ...user };
  });
}

export async function updateUserRoleOrStatusByAdmin(params: {
  targetUserId: string;
  role?: UserRole;
  is_active?: boolean;
}): Promise<UserRecord> {
  return withStoreTransaction((state) => {
    const user = state.users.find((u) => u.id === params.targetUserId);
    if (!user) {
      throw new Error("Pelanggan tidak ditemukan.");
    }
    if (params.role) {
      user.role = params.role;
    }
    if (typeof params.is_active === "boolean") {
      user.is_active = params.is_active;
    }
    user.updated_at = new Date().toISOString();
    return { ...user };
  });
}

// ============================================================================
// 2. Vehicle Categories Repository (CRUD)
// ============================================================================

export async function listCategories(): Promise<VehicleCategoryRecord[]> {
  const state = readStoreSnapshot();
  return [...state.vehicle_categories].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export async function createCategory(input: {
  name: string;
  slug: string;
  description?: string | null;
}): Promise<VehicleCategoryRecord> {
  return withStoreTransaction((state) => {
    const exists = state.vehicle_categories.some(
      (c) =>
        c.name.toLowerCase() === input.name.trim().toLowerCase() ||
        c.slug.toLowerCase() === input.slug.trim().toLowerCase(),
    );
    if (exists) {
      throw new Error("Nama atau slug kategori sudah digunakan.");
    }
    const now = new Date().toISOString();
    const record: VehicleCategoryRecord = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      slug: input.slug.trim().toLowerCase(),
      description: input.description?.trim() || null,
      created_at: now,
      updated_at: now,
    };
    state.vehicle_categories.push(record);
    return record;
  });
}

export async function updateCategory(
  id: string,
  input: { name: string; slug: string; description?: string | null },
): Promise<VehicleCategoryRecord> {
  return withStoreTransaction((state) => {
    const cat = state.vehicle_categories.find((c) => c.id === id);
    if (!cat) {
      throw new Error("Kategori tidak ditemukan.");
    }
    const duplicate = state.vehicle_categories.some(
      (c) =>
        c.id !== id &&
        (c.name.toLowerCase() === input.name.trim().toLowerCase() ||
          c.slug.toLowerCase() === input.slug.trim().toLowerCase()),
    );
    if (duplicate) {
      throw new Error("Nama atau slug kategori sudah dipakai kategori lain.");
    }
    cat.name = input.name.trim();
    cat.slug = input.slug.trim().toLowerCase();
    cat.description = input.description?.trim() || null;
    cat.updated_at = new Date().toISOString();
    return { ...cat };
  });
}

export async function deleteCategory(id: string): Promise<void> {
  return withStoreTransaction((state) => {
    const hasVehicles = state.vehicles.some(
      (v) => v.category_id === id && v.deleted_at === null,
    );
    if (hasVehicles) {
      throw new Error(
        "Kategori tidak dapat dihapus karena masih memiliki kendaraan aktif.",
      );
    }
    const idx = state.vehicle_categories.findIndex((c) => c.id === id);
    if (idx === -1) {
      throw new Error("Kategori tidak ditemukan.");
    }
    state.vehicle_categories.splice(idx, 1);
  });
}

// ============================================================================
// 3. Vehicles & Availability Repository (CRUD + Soft Delete + Filter)
// ============================================================================

function enrichVehicle(
  v: VehicleRecord,
  categories: VehicleCategoryRecord[],
): VehicleWithCategory {
  const cat = categories.find((c) => c.id === v.category_id);
  return {
    ...v,
    category_name: cat?.name ?? "Umum",
    category_slug: cat?.slug ?? "umum",
  };
}

export async function listVehicles(params?: {
  search?: string;
  categorySlug?: string;
  categoryId?: string;
  status?: string;
  transmission?: string;
  minSeats?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
  onlyAvailable?: boolean;
  sort?: "price_asc" | "price_desc" | "newest";
}): Promise<VehicleWithCategory[]> {
  const state = readStoreSnapshot();
  let items = state.vehicles
    .filter((v) => v.deleted_at === null)
    .map((v) => enrichVehicle(v, state.vehicle_categories));

  if (params?.onlyAvailable) {
    const start = params.startDate || getTodayWib();
    const end = params.endDate || start;
    items = filterAvailableVehicles({
      vehicles: items,
      bookings: state.bookings,
      maintenanceLogs: state.maintenance_logs,
      startDate: start,
      endDate: end,
    });
  }

  if (params?.search) {
    const q = params.search.trim().toLowerCase();
    items = items.filter(
      (v) =>
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.plate_number.toLowerCase().includes(q) ||
        v.category_name.toLowerCase().includes(q),
    );
  }

  if (params?.categorySlug && params.categorySlug !== "all") {
    items = items.filter((v) => v.category_slug === params.categorySlug);
  }

  if (params?.categoryId && params.categoryId !== "all") {
    items = items.filter((v) => v.category_id === params.categoryId);
  }

  if (params?.status && params.status !== "all") {
    items = items.filter((v) => v.status === params.status);
  }

  if (params?.transmission && params.transmission !== "all") {
    items = items.filter((v) => v.transmission === params.transmission);
  }

  if (params?.minSeats && params.minSeats > 0) {
    items = items.filter((v) => v.seats >= params.minSeats!);
  }

  if (params?.maxPrice && params.maxPrice > 0) {
    items = items.filter((v) => v.daily_price <= params.maxPrice!);
  }

  const sortMode = params?.sort ?? "price_asc";
  if (sortMode === "price_asc") {
    items.sort((a, b) => a.daily_price - b.daily_price);
  } else if (sortMode === "price_desc") {
    items.sort((a, b) => b.daily_price - a.daily_price);
  } else {
    items.sort((a, b) => b.year - a.year || b.created_at.localeCompare(a.created_at));
  }

  return items;
}

export async function getVehicleById(
  id: string,
): Promise<VehicleWithCategory | null> {
  const state = readStoreSnapshot();
  const vehicle = state.vehicles.find((v) => v.id === id && v.deleted_at === null);
  if (!vehicle) return null;
  return enrichVehicle(vehicle, state.vehicle_categories);
}

export async function getVehicleBlockedRanges(vehicleId: string): Promise<
  Array<{
    start_date: string;
    end_date: string;
    type: "booking" | "maintenance";
    label: string;
  }>
> {
  const state = readStoreSnapshot();
  const blocked: Array<{
    start_date: string;
    end_date: string;
    type: "booking" | "maintenance";
    label: string;
  }> = [];

  for (const b of state.bookings) {
    if (
      b.vehicle_id === vehicleId &&
      (b.status === "pending" || b.status === "confirmed" || b.status === "ongoing")
    ) {
      blocked.push({
        start_date: b.start_date,
        end_date: b.end_date,
        type: "booking",
        label: "Terpesan",
      });
    }
  }

  for (const m of state.maintenance_logs) {
    if (
      m.vehicle_id === vehicleId &&
      (m.status === "scheduled" || m.status === "in_progress")
    ) {
      blocked.push({
        start_date: m.start_date,
        end_date: m.end_date,
        type: "maintenance",
        label: `Perawatan: ${m.title}`,
      });
    }
  }

  return blocked.sort((a, b) => a.start_date.localeCompare(b.start_date));
}

export async function createVehicle(
  input: Omit<VehicleRecord, "id" | "deleted_at" | "created_at" | "updated_at">,
): Promise<VehicleWithCategory> {
  return withStoreTransaction((state) => {
    const cleanPlate = input.plate_number.trim().toUpperCase();
    const dup = state.vehicles.some(
      (v) => v.plate_number.toUpperCase() === cleanPlate && v.deleted_at === null,
    );
    if (dup) {
      throw new Error(`Nomor plat '${cleanPlate}' sudah terdaftar pada armada aktif.`);
    }
    const category = state.vehicle_categories.find(
      (c) => c.id === input.category_id,
    );
    if (!category) {
      throw new Error("Kategori kendaraan tidak ditemukan.");
    }
    const now = new Date().toISOString();
    const record: VehicleRecord = {
      id: crypto.randomUUID(),
      category_id: input.category_id,
      plate_number: cleanPlate,
      brand: input.brand.trim(),
      model: input.model.trim(),
      year: Number(input.year),
      color: input.color?.trim() || null,
      transmission: input.transmission,
      fuel: input.fuel,
      seats: Number(input.seats),
      daily_price: Math.round(Number(input.daily_price)),
      status: input.status,
      description: input.description?.trim() || null,
      image_url: input.image_url?.trim() || "/vehicles/mpv.svg",
      deleted_at: null,
      created_at: now,
      updated_at: now,
    };
    state.vehicles.push(record);
    return enrichVehicle(record, state.vehicle_categories);
  });
}

export async function updateVehicle(
  id: string,
  input: Partial<Omit<VehicleRecord, "id" | "deleted_at" | "created_at" | "updated_at">>,
): Promise<VehicleWithCategory> {
  return withStoreTransaction((state) => {
    const vehicle = state.vehicles.find((v) => v.id === id && v.deleted_at === null);
    if (!vehicle) {
      throw new Error("Kendaraan tidak ditemukan.");
    }
    if (input.plate_number) {
      const cleanPlate = input.plate_number.trim().toUpperCase();
      const dup = state.vehicles.some(
        (v) =>
          v.id !== id &&
          v.deleted_at === null &&
          v.plate_number.toUpperCase() === cleanPlate,
      );
      if (dup) {
        throw new Error(`Nomor plat '${cleanPlate}' sudah digunakan kendaraan lain.`);
      }
      vehicle.plate_number = cleanPlate;
    }
    if (input.category_id !== undefined) vehicle.category_id = input.category_id;
    if (input.brand !== undefined) vehicle.brand = input.brand.trim();
    if (input.model !== undefined) vehicle.model = input.model.trim();
    if (input.year !== undefined) vehicle.year = Number(input.year);
    if (input.color !== undefined) vehicle.color = input.color?.trim() || null;
    if (input.transmission !== undefined) vehicle.transmission = input.transmission;
    if (input.fuel !== undefined) vehicle.fuel = input.fuel;
    if (input.seats !== undefined) vehicle.seats = Number(input.seats);
    if (input.daily_price !== undefined) {
      vehicle.daily_price = Math.round(Number(input.daily_price));
    }
    if (input.status !== undefined) vehicle.status = input.status;
    if (input.description !== undefined) {
      vehicle.description = input.description?.trim() || null;
    }
    if (input.image_url !== undefined) {
      vehicle.image_url = input.image_url?.trim() || "/vehicles/mpv.svg";
    }
    vehicle.updated_at = new Date().toISOString();
    return enrichVehicle(vehicle, state.vehicle_categories);
  });
}

export async function softDeleteVehicle(id: string): Promise<void> {
  return withStoreTransaction((state) => {
    const vehicle = state.vehicles.find((v) => v.id === id && v.deleted_at === null);
    if (!vehicle) {
      throw new Error("Kendaraan tidak ditemukan.");
    }
    const hasActiveBooking = state.bookings.some(
      (b) =>
        b.vehicle_id === id &&
        (b.status === "pending" || b.status === "confirmed" || b.status === "ongoing"),
    );
    if (hasActiveBooking) {
      throw new Error(
        "Kendaraan tidak dapat dihapus karena masih memiliki booking aktif (pending/confirmed/ongoing).",
      );
    }
    const now = new Date().toISOString();
    vehicle.deleted_at = now;
    vehicle.status = "inactive";
    vehicle.updated_at = now;
  });
}

// ============================================================================
// 4. Bookings & Payments Repository (Anti Double-Booking + State Machine)
// ============================================================================

function enrichBooking(
  b: BookingRecord,
  state: LocalDatabaseState,
): BookingDetailView {
  const user = state.users.find((u) => u.id === b.user_id);
  const vehicle = state.vehicles.find((v) => v.id === b.vehicle_id);
  const payment = state.payments.find((p) => p.booking_id === b.id) ?? null;
  return {
    ...b,
    user_name: user?.full_name ?? "Pelanggan",
    user_email: user?.email ?? "-",
    user_phone: user?.phone ?? null,
    user_license_no: user?.driver_license_no ?? null,
    vehicle_brand: vehicle?.brand ?? "Kendaraan",
    vehicle_model: vehicle?.model ?? "",
    vehicle_plate: vehicle?.plate_number ?? "-",
    vehicle_image: vehicle?.image_url ?? "/vehicles/mpv.svg",
    vehicle_transmission: vehicle?.transmission ?? "automatic",
    vehicle_seats: vehicle?.seats ?? 5,
    payment,
  };
}

export async function createBooking(params: {
  user_id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  pickup_location: string;
  return_location: string;
  payment_method?: PaymentMethod;
  phone?: string;
  driver_license_no?: string;
  notes?: string | null;
}): Promise<BookingDetailView> {
  return withStoreTransaction((state) => {
    const user = state.users.find((u) => u.id === params.user_id);
    if (!user) {
      throw new Error("Akun pengguna tidak ditemukan.");
    }
    if (!user.is_active) {
      throw new Error("Akun pengguna sedang dinonaktifkan.");
    }

    if (params.phone) {
      user.phone = params.phone.trim();
    }
    if (params.driver_license_no) {
      user.driver_license_no = params.driver_license_no.trim();
    }
    if (!user.phone || !user.driver_license_no) {
      throw new Error(
        "Nomor HP dan Nomor SIM wajib dilengkapi sebelum melakukan booking.",
      );
    }

    const vehicle = state.vehicles.find(
      (v) => v.id === params.vehicle_id && v.deleted_at === null,
    );
    if (!vehicle) {
      throw new Error("Kendaraan tidak ditemukan.");
    }

    const availability = isVehicleAvailableForRange({
      vehicle,
      bookings: state.bookings,
      maintenanceLogs: state.maintenance_logs,
      startDate: params.start_date,
      endDate: params.end_date,
    });

    if (!availability.available) {
      throw new Error(
        availability.reason ?? "Kendaraan sudah dipesan pada tanggal tersebut",
      );
    }

    // Server-side price calculation (client price is never trusted)
    const pricing = calculateBookingPrice({
      dailyPrice: vehicle.daily_price,
      startDate: params.start_date,
      endDate: params.end_date,
    });

    let bookingCode = generateBookingCode(getTodayWib());
    while (state.bookings.some((b) => b.booking_code === bookingCode)) {
      bookingCode = generateBookingCode(getTodayWib());
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    const nowIso = now.toISOString();

    const booking: BookingRecord = {
      id: crypto.randomUUID(),
      booking_code: bookingCode,
      user_id: user.id,
      vehicle_id: vehicle.id,
      start_date: params.start_date,
      end_date: params.end_date,
      total_days: pricing.totalDays,
      pickup_location: params.pickup_location,
      return_location: params.return_location,
      daily_price_snapshot: pricing.dailyPriceSnapshot,
      total_price: pricing.totalPrice,
      status: "pending",
      notes: params.notes?.trim() || null,
      admin_notes: null,
      expires_at: expiresAt,
      created_at: nowIso,
      updated_at: nowIso,
    };

    const payment: PaymentRecord = {
      id: crypto.randomUUID(),
      booking_id: booking.id,
      amount: pricing.totalPrice,
      method: params.payment_method ?? "transfer",
      status: "unpaid",
      proof_url: null,
      paid_at: null,
      verified_by: null,
      note: null,
      created_at: nowIso,
      updated_at: nowIso,
    };

    state.bookings.push(booking);
    state.payments.push(payment);

    return enrichBooking(booking, state);
  });
}

export async function listBookings(params?: {
  userId?: string;
  status?: string;
  vehicleId?: string;
  search?: string;
}): Promise<BookingDetailView[]> {
  const state = readStoreSnapshot();
  let items = state.bookings.map((b) => enrichBooking(b, state));

  if (params?.userId) {
    items = items.filter((b) => b.user_id === params.userId);
  }
  if (params?.status && params.status !== "all") {
    items = items.filter((b) => b.status === params.status);
  }
  if (params?.vehicleId && params.vehicleId !== "all") {
    items = items.filter((b) => b.vehicle_id === params.vehicleId);
  }
  if (params?.search) {
    const q = params.search.trim().toLowerCase();
    items = items.filter(
      (b) =>
        b.booking_code.toLowerCase().includes(q) ||
        b.user_name.toLowerCase().includes(q) ||
        b.vehicle_brand.toLowerCase().includes(q) ||
        b.vehicle_model.toLowerCase().includes(q) ||
        b.vehicle_plate.toLowerCase().includes(q),
    );
  }

  return items.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getBookingById(
  bookingId: string,
): Promise<BookingDetailView | null> {
  const state = readStoreSnapshot();
  const booking = state.bookings.find((b) => b.id === bookingId);
  if (!booking) return null;
  return enrichBooking(booking, state);
}

export async function transitionBookingStatus(params: {
  bookingId: string;
  nextStatus: BookingStatus;
  actorRole: TransitionActor;
  actorUserId?: string;
  adminNotes?: string | null;
}): Promise<BookingDetailView> {
  return withStoreTransaction((state) => {
    const booking = state.bookings.find((b) => b.id === params.bookingId);
    if (!booking) {
      throw new Error("Data booking tidak ditemukan.");
    }

    if (
      params.actorRole === "customer" &&
      params.actorUserId &&
      booking.user_id !== params.actorUserId
    ) {
      throw new Error("Anda tidak memiliki akses ke pesanan milik pelanggan lain.");
    }

    assertValidBookingTransition(
      booking.status,
      params.nextStatus,
      params.actorRole,
    );

    const now = new Date().toISOString();
    booking.status = params.nextStatus;
    if (params.adminNotes !== undefined && params.adminNotes !== null) {
      booking.admin_notes = params.adminNotes.trim() || booking.admin_notes;
    }
    booking.updated_at = now;

    return enrichBooking(booking, state);
  });
}

export async function updateBookingPayment(params: {
  bookingId: string;
  actorUserId: string;
  actorRole: UserRole;
  status?: PaymentStatus;
  method?: PaymentMethod;
  proofUrl?: string | null;
  note?: string | null;
}): Promise<BookingDetailView> {
  return withStoreTransaction((state) => {
    const booking = state.bookings.find((b) => b.id === params.bookingId);
    if (!booking) {
      throw new Error("Booking tidak ditemukan.");
    }

    if (params.actorRole === "customer" && booking.user_id !== params.actorUserId) {
      throw new Error("Akses ditolak: bukan pemilik pesanan.");
    }

    const payment = state.payments.find((p) => p.booking_id === booking.id);
    if (!payment) {
      throw new Error("Data pembayaran tidak ditemukan.");
    }

    const now = new Date().toISOString();

    if (params.proofUrl !== undefined) {
      payment.proof_url = params.proofUrl;
    }
    if (params.method !== undefined) {
      payment.method = params.method;
    }
    if (params.note !== undefined) {
      payment.note = params.note;
    }

    if (params.status !== undefined) {
      if (params.actorRole !== "admin") {
        throw new Error("Hanya admin yang dapat mengubah status verifikasi pembayaran.");
      }
      payment.status = params.status;
      if (params.status === "paid") {
        payment.paid_at = now;
        payment.verified_by = params.actorUserId;
      } else if (params.status === "unpaid") {
        payment.paid_at = null;
        payment.verified_by = null;
      }
    }

    payment.updated_at = now;
    booking.updated_at = now;

    return enrichBooking(booking, state);
  });
}

// ============================================================================
// 5. Maintenance Logs Repository (CRUD + Vehicle Availability Sync)
// ============================================================================

export async function listMaintenanceLogs(): Promise<MaintenanceWithVehicle[]> {
  const state = readStoreSnapshot();
  return state.maintenance_logs
    .map((m) => {
      const v = state.vehicles.find((veh) => veh.id === m.vehicle_id);
      return {
        ...m,
        vehicle_brand: v?.brand ?? "Kendaraan",
        vehicle_model: v?.model ?? "",
        vehicle_plate: v?.plate_number ?? "-",
      };
    })
    .sort((a, b) => b.start_date.localeCompare(a.start_date));
}

export async function createMaintenanceLog(input: {
  vehicle_id: string;
  title: string;
  description?: string | null;
  start_date: string;
  end_date: string;
  cost: number;
  status: MaintenanceStatus;
}): Promise<MaintenanceWithVehicle> {
  return withStoreTransaction((state) => {
    const vehicle = state.vehicles.find(
      (v) => v.id === input.vehicle_id && v.deleted_at === null,
    );
    if (!vehicle) {
      throw new Error("Kendaraan tidak ditemukan.");
    }

    const overlappingActiveBooking = state.bookings.find(
      (b) =>
        b.vehicle_id === input.vehicle_id &&
        (b.status === "pending" ||
          b.status === "confirmed" ||
          b.status === "ongoing") &&
        isDateRangeOverlapping(
          b.start_date,
          b.end_date,
          input.start_date,
          input.end_date,
        ),
    );

    if (overlappingActiveBooking && input.status !== "done") {
      throw new Error(
        `Kendaraan memiliki booking aktif (${overlappingActiveBooking.booking_code}) pada tanggal perawatan tersebut.`,
      );
    }

    const now = new Date().toISOString();
    const record: MaintenanceLogRecord = {
      id: crypto.randomUUID(),
      vehicle_id: input.vehicle_id,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      start_date: input.start_date,
      end_date: input.end_date,
      cost: Math.round(Number(input.cost) || 0),
      status: input.status,
      created_at: now,
      updated_at: now,
    };

    if (input.status === "in_progress") {
      vehicle.status = "maintenance";
      vehicle.updated_at = now;
    }

    state.maintenance_logs.push(record);

    return {
      ...record,
      vehicle_brand: vehicle.brand,
      vehicle_model: vehicle.model,
      vehicle_plate: vehicle.plate_number,
    };
  });
}

export async function updateMaintenanceLogStatus(params: {
  id: string;
  status: MaintenanceStatus;
}): Promise<MaintenanceWithVehicle> {
  return withStoreTransaction((state) => {
    const log = state.maintenance_logs.find((m) => m.id === params.id);
    if (!log) {
      throw new Error("Jadwal perawatan tidak ditemukan.");
    }
    const now = new Date().toISOString();
    log.status = params.status;
    log.updated_at = now;

    const vehicle = state.vehicles.find((v) => v.id === log.vehicle_id);
    if (vehicle) {
      const stillInMaintenance = state.maintenance_logs.some(
        (m) => m.vehicle_id === vehicle.id && m.status === "in_progress",
      );
      if (params.status === "in_progress") {
        vehicle.status = "maintenance";
      } else if (!stillInMaintenance && vehicle.status === "maintenance") {
        vehicle.status = "active";
      }
      vehicle.updated_at = now;
    }

    return {
      ...log,
      vehicle_brand: vehicle?.brand ?? "Kendaraan",
      vehicle_model: vehicle?.model ?? "",
      vehicle_plate: vehicle?.plate_number ?? "-",
    };
  });
}

export async function deleteMaintenanceLog(id: string): Promise<void> {
  return withStoreTransaction((state) => {
    const idx = state.maintenance_logs.findIndex((m) => m.id === id);
    if (idx === -1) {
      throw new Error("Jadwal perawatan tidak ditemukan.");
    }
    state.maintenance_logs.splice(idx, 1);
  });
}

// ============================================================================
// 6. Housekeeping Cron & Dashboard Statistics
// ============================================================================

export async function runHousekeepingTasks(now: Date = new Date()): Promise<{
  expiredCount: number;
  expiredBookingCodes: string[];
  activeVehiclesCount: number;
}> {
  return withStoreTransaction((state) => {
    const nowMs = now.getTime();
    const expiredBookingCodes: string[] = [];

    for (const booking of state.bookings) {
      if (booking.status === "pending" && booking.expires_at) {
        const expMs = Date.parse(booking.expires_at);
        if (!Number.isNaN(expMs) && expMs <= nowMs) {
          booking.status = "expired";
          booking.updated_at = now.toISOString();
          expiredBookingCodes.push(booking.booking_code);
        }
      }
    }

    const activeVehiclesCount = state.vehicles.filter(
      (v) => v.deleted_at === null && v.status === "active",
    ).length;

    return {
      expiredCount: expiredBookingCodes.length,
      expiredBookingCodes,
      activeVehiclesCount,
    };
  });
}

export async function getAdminDashboardStats(todayWib: string = getTodayWib()) {
  const state = readStoreSnapshot();
  const activeFleet = state.vehicles.filter((v) => v.deleted_at === null);
  const availableToday = filterAvailableVehicles({
    vehicles: activeFleet,
    bookings: state.bookings,
    maintenanceLogs: state.maintenance_logs,
    startDate: todayWib,
    endDate: todayWib,
  });

  const inMaintenanceCount = activeFleet.filter(
    (v) =>
      v.status === "maintenance" ||
      state.maintenance_logs.some(
        (m) =>
          m.vehicle_id === v.id &&
          (m.status === "scheduled" || m.status === "in_progress") &&
          isDateRangeOverlapping(m.start_date, m.end_date, todayWib, todayWib),
      ),
  ).length;

  const activeBookingsCount = state.bookings.filter(
    (b) => b.status === "confirmed" || b.status === "ongoing",
  ).length;

  const pendingBookingsCount = state.bookings.filter(
    (b) => b.status === "pending",
  ).length;

  const currentYearMonth = todayWib.slice(0, 7); // YYYY-MM
  const monthlyRevenue = state.payments
    .filter(
      (p) =>
        p.status === "paid" &&
        (p.paid_at ?? p.created_at).slice(0, 7) === currentYearMonth,
    )
    .reduce((sum, p) => sum + p.amount, 0);

  // 6 months revenue chart
  const monthLabels = [
    { ym: "2026-06", label: "Jun 2026" },
    { ym: "2026-07", label: "Jul 2026" },
    { ym: "2026-08", label: "Agu 2026" },
    { ym: "2026-09", label: "Sep 2026" },
    { ym: "2026-10", label: "Okt 2026" },
    { ym: "2026-11", label: "Nov 2026" },
  ];

  const revenueByMonth = monthLabels.map((m) => {
    const total = state.payments
      .filter(
        (p) =>
          p.status === "paid" && (p.paid_at ?? p.created_at).slice(0, 7) === m.ym,
      )
      .reduce((sum, p) => sum + p.amount, 0);
    return {
      month: m.label,
      revenue: total,
    };
  });

  // Top vehicles by booking count
  const topVehicles = activeFleet
    .map((v) => {
      const bookingsForVehicle = state.bookings.filter(
        (b) =>
          b.vehicle_id === v.id &&
          (b.status === "completed" ||
            b.status === "ongoing" ||
            b.status === "confirmed"),
      );
      const revenue = bookingsForVehicle.reduce((s, b) => s + b.total_price, 0);
      return {
        id: v.id,
        name: `${v.brand} ${v.model}`,
        plate_number: v.plate_number,
        bookings_count: bookingsForVehicle.length,
        total_revenue: revenue,
      };
    })
    .sort(
      (a, b) =>
        b.bookings_count - a.bookings_count || b.total_revenue - a.total_revenue,
    )
    .slice(0, 5);

  const recentBookings = state.bookings
    .map((b) => enrichBooking(b, state))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 6);

  return {
    totalFleet: activeFleet.length,
    availableToday: availableToday.length,
    inMaintenanceCount,
    activeBookingsCount,
    pendingBookingsCount,
    monthlyRevenue,
    revenueByMonth,
    topVehicles,
    recentBookings,
  };
}

// ============================================================================
// 7. AI Recommendation Rate-Limit & Audit Log Repository
// ============================================================================

export async function countUserAiRequestsToday(
  userId: string,
  todayWib: string = getTodayWib(),
): Promise<number> {
  const state = readStoreSnapshot();
  return state.ai_recommendation_logs.filter(
    (log) => log.user_id === userId && log.created_at.slice(0, 10) === todayWib,
  ).length;
}

export async function recordAiRecommendationLog(
  entry: Omit<AiRecommendationLogRecord, "id" | "created_at">,
): Promise<AiRecommendationLogRecord> {
  return withStoreTransaction((state) => {
    const record: AiRecommendationLogRecord = {
      id: crypto.randomUUID(),
      ...entry,
      created_at: new Date().toISOString(),
    };
    state.ai_recommendation_logs.push(record);
    return record;
  });
}
