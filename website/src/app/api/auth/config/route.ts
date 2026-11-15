import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";

export async function GET() {
  const env = getEnv();
  const apiKey = env.NEXT_PUBLIC_FIREBASE_API_KEY || env.FIREBASE_API_KEY || "";
  const projectId = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "rentgo-medan";

  if (!apiKey || !projectId) {
    return NextResponse.json(
      { configured: false, config: null },
      { headers: { "cache-control": "no-store" } },
    );
  }

  return NextResponse.json(
    {
      configured: true,
      config: {
        apiKey,
        authDomain:
          env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
        projectId,
        appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
      },
    },
    { headers: { "cache-control": "no-store" } },
  );
}
