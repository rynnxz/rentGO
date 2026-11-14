import { NextResponse, type NextRequest } from "next/server";
import { getEnv } from "@/lib/env";
import { runHousekeepingTasks } from "@/lib/repository";

export async function GET(request: NextRequest) {
  const env = getEnv();
  const authHeader = request.headers.get("authorization");
  const secretQuery = request.nextUrl.searchParams.get("secret");

  const isAuthorized =
    authHeader === `Bearer ${env.CRON_SECRET}` ||
    secretQuery === env.CRON_SECRET;

  if (!isAuthorized) {
    return NextResponse.json(
      { error: "Unauthorized cron invocation." },
      { status: 401 },
    );
  }

  const summary = await runHousekeepingTasks(new Date());
  return NextResponse.json({
    ok: true,
    executedAt: new Date().toISOString(),
    ...summary,
  });
}
