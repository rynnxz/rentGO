import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getEnv, hasSupabaseServiceCredentials } from "./env";

let cachedClient: SupabaseClient | null = null;

export function getSupabaseServiceClient(): SupabaseClient | null {
  if (!hasSupabaseServiceCredentials()) {
    return null;
  }
  if (!cachedClient) {
    const env = getEnv();
    cachedClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return cachedClient;
}
