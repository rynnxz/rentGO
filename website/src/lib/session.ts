import "server-only";
import { cookies } from "next/headers";
import { getEnv } from "./env";
import { verifySessionCookieServer } from "./firebase-admin";
import { getUserByFirebaseUid, upsertUserFromAuth } from "./repository";
import type { UserRecord } from "./types";

export const SESSION_COOKIE_NAME = "__session";
export const FIVE_DAYS_SECONDS = 5 * 24 * 60 * 60;

export function buildSessionCookieOptions(hostHeader?: string | null): {
  name: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
  domain?: string;
} {
  const env = getEnv();
  const isProd = env.NODE_ENV === "production";
  const cleanHost = (hostHeader ?? "").toLowerCase().split(":")[0];
  const rootDomain = env.ROOT_DOMAIN.toLowerCase().split(":")[0];

  const shouldSetCrossSubdomain =
    isProd &&
    rootDomain !== "localhost" &&
    !cleanHost.endsWith(".vercel.app") &&
    (cleanHost === rootDomain || cleanHost.endsWith(`.${rootDomain}`));

  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: FIVE_DAYS_SECONDS,
    ...(shouldSetCrossSubdomain ? { domain: `.${rootDomain}` } : {}),
  };
}

export async function getCurrentSessionUser(): Promise<UserRecord | null> {
  const cookieStore = await cookies();
  const rawCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!rawCookie) return null;

  const identity = await verifySessionCookieServer(rawCookie);
  if (!identity) return null;

  let user = await getUserByFirebaseUid(identity.firebase_uid);
  if (!user) {
    user = await upsertUserFromAuth(identity);
  }
  if (!user.is_active) {
    return null;
  }
  return user;
}
