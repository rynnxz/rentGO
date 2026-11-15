import "server-only";
import crypto from "node:crypto";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth as getAdminAuth, type Auth } from "firebase-admin/auth";
import { getEnv } from "./env";

export interface VerifiedIdentity {
  firebase_uid: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
}

let cachedAdminApp: App | null = null;

function getFirebaseAdminAuth(): Auth | null {
  const env = getEnv();
  if (
    !env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 &&
    !env.FIREBASE_AUTH_EMULATOR_HOST
  ) {
    return null;
  }
  if (!cachedAdminApp) {
    const existing = getApps();
    if (existing.length > 0) {
      cachedAdminApp = existing[0]!;
    } else if (env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64) {
      const decodedJson = Buffer.from(
        env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64,
        "base64",
      ).toString("utf8");
      const serviceAccount = JSON.parse(decodedJson);
      cachedAdminApp = initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      cachedAdminApp = initializeApp({
        projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "rentgo-medan",
      });
    }
  }
  return getAdminAuth(cachedAdminApp);
}

function getHmacSecret(): string {
  return getEnv().CRON_SECRET || "dev-cron-secret-rentgo-2026";
}

export function createSignedDevSessionCookie(
  identity: VerifiedIdentity,
): string {
  const payload = {
    ...identity,
    exp: Date.now() + 5 * 24 * 60 * 60 * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  const sig = crypto
    .createHmac("sha256", getHmacSecret())
    .update(encoded)
    .digest("base64url");
  return `rgdev.${encoded}.${sig}`;
}

export function verifySignedDevSessionCookie(
  cookieValue: string,
): VerifiedIdentity | null {
  if (!cookieValue.startsWith("rgdev.")) return null;
  const parts = cookieValue.split(".");
  if (parts.length !== 3) return null;
  const [, encoded, sig] = parts;
  if (!encoded || !sig) return null;
  const expectedSig = crypto
    .createHmac("sha256", getHmacSecret())
    .update(encoded)
    .digest("base64url");
  if (sig !== expectedSig) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as VerifiedIdentity & { exp: number };
    if (typeof parsed.exp !== "number" || Date.now() > parsed.exp) {
      return null;
    }
    return {
      firebase_uid: parsed.firebase_uid,
      email: parsed.email,
      full_name: parsed.full_name,
      avatar_url: parsed.avatar_url ?? null,
    };
  } catch {
    return null;
  }
}

async function verifyIdTokenViaFirebaseRest(
  idToken: string,
  apiKey: string,
): Promise<VerifiedIdentity | null> {
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idToken }),
        signal: AbortSignal.timeout(3500),
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      users?: Array<{
        localId?: string;
        email?: string;
        displayName?: string;
        photoUrl?: string;
      }>;
    };
    const u = data.users?.[0];
    if (!u || !u.email || !u.localId) return null;
    const email = u.email.toLowerCase();
    return {
      firebase_uid: u.localId,
      email,
      full_name:
        u.displayName?.trim() || email.split("@")[0] || "Pengguna RentGo",
      avatar_url: u.photoUrl ?? null,
    };
  } catch {
    return null;
  }
}

export async function verifyIncomingIdTokenAndCreateSession(
  idToken: string,
): Promise<{
  identity: VerifiedIdentity;
  sessionCookieValue: string;
}> {
  const env = getEnv();

  // 1. Support local emulator / demo switcher & email/password fallback token in non-production
  if (
    env.NODE_ENV !== "production" &&
    (idToken.startsWith("emulator-google:") ||
      idToken.startsWith("firebase-email:"))
  ) {
    const prefix = idToken.startsWith("emulator-google:")
      ? "emulator-google:"
      : "firebase-email:";
    const rawJson = idToken.slice(prefix.length);
    const parsed = JSON.parse(rawJson) as {
      uid?: string;
      email: string;
      name?: string;
      picture?: string | null;
    };
    const email = parsed.email.trim().toLowerCase();
    const identity: VerifiedIdentity = {
      firebase_uid:
        parsed.uid || `fb-${email.replace(/[^a-z0-9]/g, "-")}`,
      email,
      full_name:
        parsed.name?.trim() || email.split("@")[0] || "Pengguna RentGo",
      avatar_url: parsed.picture ?? null,
    };
    return {
      identity,
      sessionCookieValue: createSignedDevSessionCookie(identity),
    };
  }

  // 2. If Firebase Admin SDK service account is configured, use full Admin SDK verification
  const adminAuth = getFirebaseAdminAuth();
  if (adminAuth) {
    const decoded = await adminAuth.verifyIdToken(idToken);
    if (!decoded.email) {
      throw new Error("Akun Firebase tidak memiliki alamat email terverifikasi.");
    }
    const identity: VerifiedIdentity = {
      firebase_uid: decoded.uid,
      email: decoded.email.toLowerCase(),
      full_name:
        decoded.name || decoded.email.split("@")[0] || "Pengguna RentGo",
      avatar_url: decoded.picture ?? null,
    };
    const expiresIn = 5 * 24 * 60 * 60 * 1000;
    const sessionCookieValue = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });
    return {
      identity,
      sessionCookieValue,
    };
  }

  // 3. Verify live Firebase ID token via Firebase Identity Toolkit REST API (project: rentgo-medan)
  if (env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    const restIdentity = await verifyIdTokenViaFirebaseRest(
      idToken,
      env.NEXT_PUBLIC_FIREBASE_API_KEY,
    );
    if (restIdentity) {
      return {
        identity: restIdentity,
        sessionCookieValue: createSignedDevSessionCookie(restIdentity),
      };
    }
  }

  throw new Error(
    "Token autentikasi Firebase tidak valid atau telah kedaluwarsa.",
  );
}

export async function verifySessionCookieServer(
  sessionCookieValue: string,
): Promise<VerifiedIdentity | null> {
  if (!sessionCookieValue) return null;

  if (sessionCookieValue.startsWith("rgdev.")) {
    return verifySignedDevSessionCookie(sessionCookieValue);
  }

  const adminAuth = getFirebaseAdminAuth();
  if (!adminAuth) {
    return null;
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(
      sessionCookieValue,
      true,
    );
    if (!decoded.email) return null;
    return {
      firebase_uid: decoded.uid,
      email: decoded.email.toLowerCase(),
      full_name:
        decoded.name || decoded.email.split("@")[0] || "Pengguna RentGo",
      avatar_url: decoded.picture ?? null,
    };
  } catch {
    return null;
  }
}
