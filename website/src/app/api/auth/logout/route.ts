import { NextResponse, type NextRequest } from "next/server";
import { buildSessionCookieOptions, SESSION_COOKIE_NAME } from "@/lib/session";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  const cookieOpts = buildSessionCookieOptions(request.headers.get("host"));
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...cookieOpts,
    maxAge: 0,
  });
  return response;
}
