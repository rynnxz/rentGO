import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { verifyIncomingIdTokenAndCreateSession } from "@/lib/firebase-admin";
import { upsertUserFromAuth } from "@/lib/repository";
import {
  buildSessionCookieOptions,
  getCurrentSessionUser,
} from "@/lib/session";

const loginSchema = z.object({
  idToken: z.string().min(10, "ID token Google tidak valid"),
});

// Simple per-IP in-memory rate limit for auth endpoint
const authAttempts = new Map<string, { count: number; resetAt: number }>();

export async function GET() {
  const user = await getCurrentSessionUser();
  return NextResponse.json({ user });
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "127.0.0.1";
    const now = Date.now();
    const record = authAttempts.get(ip);
    if (record && now < record.resetAt) {
      if (record.count >= 30) {
        return NextResponse.json(
          { error: "Terlalu banyak percobaan login. Silakan tunggu 1 menit." },
          { status: 429 },
        );
      }
      record.count += 1;
    } else {
      authAttempts.set(ip, { count: 1, resetAt: now + 60_000 });
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
        { status: 400 },
      );
    }

    const { identity, sessionCookieValue } =
      await verifyIncomingIdTokenAndCreateSession(parsed.data.idToken);

    const user = await upsertUserFromAuth(identity);
    if (!user.is_active) {
      return NextResponse.json(
        { error: "Akun Anda sedang dinonaktifkan oleh Administrator." },
        { status: 403 },
      );
    }

    const response = NextResponse.json({ user });
    const cookieOpts = buildSessionCookieOptions(request.headers.get("host"));
    response.cookies.set(cookieOpts.name, sessionCookieValue, cookieOpts);
    return response;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal memverifikasi sesi login.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
