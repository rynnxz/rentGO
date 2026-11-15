import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  ROOT_DOMAIN: z.string().min(1).default("localhost:3000"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default("http://localhost:3000"),
  NEXT_PUBLIC_LANDING_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_BOOK_URL: z.string().url().default("http://localhost:3000/book"),
  NEXT_PUBLIC_ADMIN_URL: z.string().url().default("http://localhost:3000/admin"),
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().optional().default(""),
  FIREBASE_API_KEY: z.string().optional().default(""),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z
    .string()
    .optional()
    .default("rentgo-medan.firebaseapp.com"),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z
    .string()
    .optional()
    .default("rentgo-medan"),
  NEXT_PUBLIC_FIREBASE_APP_ID: z
    .string()
    .optional()
    .default("1:1047637681782:web:5ed7cbbc05c3ff1ed32157"),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z
    .string()
    .optional()
    .default("rentgo-medan.firebasestorage.app"),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z
    .string()
    .optional()
    .default("1047637681782"),
  NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST: z.string().optional().default(""),
  FIREBASE_AUTH_EMULATOR_HOST: z.string().optional().default(""),
  FIREBASE_SERVICE_ACCOUNT_JSON_BASE64: z.string().optional().default(""),
  SUPABASE_PROJECT_REF: z
    .string()
    .optional()
    .default("honhszsloegvpbmczkqf"),
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .optional()
    .default("https://honhszsloegvpbmczkqf.supabase.co"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().default(""),
  SUPABASE_URL: z
    .string()
    .optional()
    .default("https://honhszsloegvpbmczkqf.supabase.co"),
  SUPABASE_STORAGE_BUCKET: z.string().optional().default("vehicles"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(""),
  GEMINI_API_KEY: z.string().optional().default(""),
  GEMINI_MODEL: z.string().min(1).default("gemini-flash-latest"),
  GEMINI_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().min(1).max(60).default(10),
  MIDTRANS_MERCHANT_ID: z.string().min(1).default("rentgo-test"),
  MIDTRANS_SERVER_KEY: z.string().optional().default(""),
  MIDTRANS_ENV: z.enum(["sandbox", "production"]).default("sandbox"),
  ADMIN_EMAILS: z
    .string()
    .default("akbarriansyah339@gmail.com,admin@rentgo.my.id"),
  CRON_SECRET: z.string().min(8).default("dev-cron-secret-rentgo-2026"),
  PAYMENT_BANK_INFO: z
    .string()
    .min(3)
    .default(
      "QRIS Midtrans Sandbox (Merchant: rentgo-test) a.n. PT RentGo Transportasi Medan",
    ),
  WHATSAPP_NUMBER: z
    .string()
    .regex(/^[0-9]{10,16}$/)
    .default("6281260009988"),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function parseEnv(raw: Record<string, string | undefined>): EnvConfig {
  const normalized: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(raw)) {
    normalized[key] =
      typeof value === "string" && value.trim() === "" ? undefined : value;
  }
  const parsed = envSchema.safeParse(normalized);
  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Konfigurasi environment variable tidak valid: ${formatted}`);
  }
  return parsed.data;
}

export function getEnv(): EnvConfig {
  return parseEnv(process.env);
}

export function getAdminEmails(rawAdminEmails?: string): string[] {
  const source = rawAdminEmails ?? getEnv().ADMIN_EMAILS;
  return source
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function hasSupabaseServiceCredentials(): boolean {
  const env = getEnv();
  return Boolean(
    env.SUPABASE_URL &&
      env.SUPABASE_URL.startsWith("http") &&
      env.SUPABASE_SERVICE_ROLE_KEY &&
      env.SUPABASE_SERVICE_ROLE_KEY.length > 20,
  );
}
