"use client";

import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  type Auth,
} from "firebase/auth";

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let emulatorConnected = false;

export function hasFirebaseClientConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  );
}

export function getFirebaseClientAuth(): Auth | null {
  if (!hasFirebaseClientConfig()) {
    return null;
  }
  if (!firebaseApp) {
    const existing = getApps();
    firebaseApp =
      existing[0] ??
      initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      });
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

export async function signInWithGooglePopupClient(): Promise<string> {
  const auth = getFirebaseClientAuth();
  if (!auth) {
    throw new Error(
      "Konfigurasi Firebase Client belum diisi. Gunakan Emulator/Local Google Sign-In pada mode pengembangan.",
    );
  }
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const credential = await signInWithPopup(auth, provider);
  return credential.user.getIdToken();
}
