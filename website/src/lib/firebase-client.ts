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

/**
 * Firebase Client Configuration (Strictly used for Authentication ONLY).
 * All relational database and file storage operations use Supabase.
 */
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "rentgo-medan.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "rentgo-medan",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:1047637681782:web:5ed7cbbc05c3ff1ed32157",
};

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let emulatorConnected = false;

export function hasFirebaseClientConfig(): boolean {
  return Boolean(
    DEFAULT_FIREBASE_CONFIG.apiKey && DEFAULT_FIREBASE_CONFIG.projectId,
  );
}

export function getFirebaseClientApp(): FirebaseApp | null {
  if (!hasFirebaseClientConfig()) {
    return null;
  }
  if (!firebaseApp) {
    const existing = getApps();
    firebaseApp = existing[0] ?? initializeApp(DEFAULT_FIREBASE_CONFIG);
  }
  return firebaseApp;
}

export function getFirebaseClientAuth(): Auth | null {
  const app = getFirebaseClientApp();
  if (!app) return null;
  if (!firebaseAuth) {
    firebaseAuth = getAuth(app);
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

export async function signInWithGooglePopupClient(): Promise<string> {
  const auth = getFirebaseClientAuth();
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
  const auth = getFirebaseClientAuth();
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
  const auth = getFirebaseClientAuth();
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
