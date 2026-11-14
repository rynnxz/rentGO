import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  ROOT_DOMAIN: z.string().min(1).default("localhost:3000"),
  NEXT_PUBLIC_LANDING_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_BOOK_URL: z.string().url().default("http://book.localhost:3000"),
  NEXT_PUBLIC_ADMIN_URL: z.string().url().default("http://admin.localhost:3000"),
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().optional().default(""),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().optional().default(""),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional().default(""),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional().default(""),
  NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST: z.string().optional().default(""),
  FIREBASE_AUTH_EMULATOR_HOST: z.string().optional().default(""),
  FIREBASE_SERVICE_ACCOUNT_JSON_BASE64: z.string().optional().default(""),
  SUPABASE_URL: z.string().optional().default(""),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(""),
  GEMINI_API_KEY: z.string().optional().default(""),
  GEMINI_MODEL: z.string().min(1).default("gemini-3.5-flash-lite"),
  ADMIN_EMAILS: z
    .string()
    .default("akbarriansyah339@gmail.com,admin@rentgo.my.id"),
  CRON_SECRET: z.string().min(8).default("dev-cron-secret-rentgo-2026"),
  PAYMENT_BANK_INFO: z
    .string()
    .min(3)
    .default("Bank Mandiri 105-00-8899776-5 a.n. PT RentGo Transportasi Medan"),
  WHATSAPP_NUMBER: z
    .string()
    .regex(/^[0-9]{10,16}$/)
    .default("6281260009988"),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function parseEnv(raw: Record<string, string | undefined>): EnvConfig {
  const normalized: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(raw)) {
    normalized[key] = typeof value === "string" && value.trim() === "" ? undefined : value;
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
