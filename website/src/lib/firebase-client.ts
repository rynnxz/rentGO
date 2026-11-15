"use client";

import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  type Auth,
} from "firebase/auth";

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
}

/**
 * Firebase Client Configuration (Strictly used for Authentication ONLY).
 * All relational database and file storage operations use Supabase.
 */
const DEFAULT_FIREBASE_CONFIG: FirebaseClientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "rentgo-medan.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "rentgo-medan",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:1047637681782:web:5ed7cbbc05c3ff1ed32157",
};

let resolvedConfig: FirebaseClientConfig | null =
  DEFAULT_FIREBASE_CONFIG.apiKey && DEFAULT_FIREBASE_CONFIG.projectId
    ? DEFAULT_FIREBASE_CONFIG
    : null;
let configFetchPromise: Promise<FirebaseClientConfig | null> | null = null;
let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let emulatorConnected = false;

function initAuthFromConfig(config: FirebaseClientConfig): Auth {
  if (!firebaseApp) {
    const existing = getApps();
    firebaseApp = existing[0] ?? initializeApp(config);
  }
  if (!firebaseAuth) {
    firebaseAuth = getAuth(firebaseApp);
    const emulatorHost = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST;
    if (emulatorHost && !emulatorConnected) {
      connectAuthEmulator(
        firebaseAuth,
        emulatorHost.startsWith("http")
          ? emulatorHost
          : `http://${emulatorHost}`,
        { disableWarnings: true },
      );
      emulatorConnected = true;
    }
  }
  return firebaseAuth;
}

export function hasFirebaseClientConfig(): boolean {
  return Boolean(resolvedConfig?.apiKey && resolvedConfig?.projectId);
}

export async function resolveFirebaseClientConfig(): Promise<FirebaseClientConfig | null> {
  if (resolvedConfig?.apiKey && resolvedConfig?.projectId) {
    return resolvedConfig;
  }

  if (!configFetchPromise) {
    configFetchPromise = (async () => {
      try {
        const res = await fetch("/api/auth/config", { cache: "no-store" });
        if (!res.ok) return null;
        const data = (await res.json()) as {
          configured?: boolean;
          config?: FirebaseClientConfig | null;
        };
        if (data.configured && data.config?.apiKey && data.config?.projectId) {
          resolvedConfig = data.config;
          return resolvedConfig;
        }
        return null;
      } catch {
        return null;
      } finally {
        configFetchPromise = null;
      }
    })();
  }

  return configFetchPromise;
}

export function getFirebaseClientApp(): FirebaseApp | null {
  if (!resolvedConfig?.apiKey || !resolvedConfig?.projectId) {
    return null;
  }
  if (!firebaseApp) {
    const existing = getApps();
    firebaseApp = existing[0] ?? initializeApp(resolvedConfig);
  }
  return firebaseApp;
}

export function getFirebaseClientAuth(): Auth | null {
  if (!resolvedConfig?.apiKey || !resolvedConfig?.projectId) {
    return null;
  }
  return initAuthFromConfig(resolvedConfig);
}

export async function getFirebaseClientAuthAsync(): Promise<Auth | null> {
  const config = await resolveFirebaseClientConfig();
  if (!config) return null;
  return initAuthFromConfig(config);
}

export function getFirebaseAuthErrorMessage(
  err: unknown,
  context: "google" | "email",
): string {
  const code =
    typeof err === "object" && err !== null && "code" in err
      ? String((err as { code?: unknown }).code ?? "")
      : "";
  const msg = err instanceof Error ? err.message : "";
  const combined = `${code} ${msg}`;

  if (
    combined.includes("auth/popup-closed-by-user") ||
    combined.includes("auth/cancelled-popup-request")
  ) {
    return "Jendela login Google ditutup sebelum memilih akun.";
  }
  if (combined.includes("auth/popup-blocked")) {
    return "Popup Google Sign-In diblokir oleh browser. Izinkan pop-up untuk situs ini lalu coba lagi.";
  }
  if (combined.includes("auth/unauthorized-domain")) {
    const host =
      typeof window !== "undefined" ? window.location.hostname : "domain ini";
    return `Domain "${host}" belum terdaftar di Firebase Authorized Domains (Authentication -> Settings -> Authorized domains).`;
  }
  if (combined.includes("auth/operation-not-allowed")) {
    return context === "google"
      ? "Provider Google Sign-In belum diaktifkan di Firebase Console."
      : "Provider Email/Password belum diaktifkan di Firebase Console.";
  }
  if (
    combined.includes("auth/invalid-credential") ||
    combined.includes("auth/wrong-password") ||
    combined.includes("auth/user-not-found")
  ) {
    return "Email atau kata sandi tidak valid.";
  }
  if (combined.includes("auth/email-already-in-use")) {
    return "Email ini sudah terdaftar. Silakan pilih 'Sudah Punya Akun?' untuk masuk.";
  }
  if (combined.includes("auth/weak-password")) {
    return "Kata sandi terlalu lemah. Gunakan minimal 6 karakter.";
  }
  if (combined.includes("auth/invalid-email")) {
    return "Format alamat email tidak valid.";
  }
  if (combined.includes("auth/too-many-requests")) {
    return "Terlalu banyak percobaan login. Silakan tunggu beberapa menit lalu coba lagi.";
  }
  if (combined.includes("auth/network-request-failed")) {
    return "Gagal terhubung ke server autentikasi Google/Firebase. Periksa koneksi internet Anda.";
  }

  if (msg) {
    return context === "google" ? `Gagal masuk via Google (${msg}).` : msg;
  }
  return context === "google"
    ? "Popup Google Sign-In dibatalkan atau gagal diproses."
    : "Gagal memproses autentikasi Email/Password.";
}

export async function signInWithGooglePopupClient(): Promise<string> {
  const auth = await getFirebaseClientAuthAsync();
  if (!auth) {
    throw new Error("Konfigurasi Firebase Auth belum tersedia.");
  }
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const credential = await signInWithPopup(auth, provider);
  return credential.user.getIdToken();
}

export async function signInWithEmailPasswordClient(
  email: string,
  password: string,
): Promise<string> {
  const auth = await getFirebaseClientAuthAsync();
  if (!auth) {
    throw new Error("Konfigurasi Firebase Auth belum tersedia.");
  }
  const credential = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  );
  return credential.user.getIdToken();
}

export async function registerWithEmailPasswordClient(
  email: string,
  password: string,
  fullName: string,
): Promise<string> {
  const auth = await getFirebaseClientAuthAsync();
  if (!auth) {
    throw new Error("Konfigurasi Firebase Auth belum tersedia.");
  }
  const credential = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  );
  if (fullName.trim()) {
    await updateProfile(credential.user, { displayName: fullName.trim() });
  }
  return credential.user.getIdToken(true);
}
