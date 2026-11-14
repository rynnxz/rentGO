import { NextResponse, type NextRequest } from "next/server";
import { generateVehicleRecommendations } from "@/lib/ai";
import { AuthError } from "@/lib/rbac";
import { getCurrentSessionUser } from "@/lib/session";
import {
  countUserAiRequestsToday,
  listVehicles,
  recordAiRecommendationLog,
} from "@/lib/repository";
import { getTodayWib } from "@/lib/utils";
import { aiRecommendInputSchema } from "@/lib/validators";

const MAX_DAILY_AI_REQUESTS = 10;

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentSessionUser();
    const todayWib = getTodayWib();

    let usedToday = 0;
    if (user) {
      usedToday = await countUserAiRequestsToday(user.id, todayWib);
      if (usedToday >= MAX_DAILY_AI_REQUESTS) {
        return NextResponse.json(
          {
            error: `Batas penggunaan rekomendasi AI harian (${MAX_DAILY_AI_REQUESTS}x/hari) telah tercapai. Silakan gunakan filter katalog atau coba lagi besok.`,
          },
          { status: 429 },
        );
      }
    }

    const rawBody = await request.json();
    const normalizedBody = {
      ...rawBody,
      query_text: rawBody.query_text ?? rawBody.query ?? "",
    };
    const parsed = aiRecommendInputSchema.safeParse(normalizedBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Input pencarian AI tidak valid" },
        { status: 400 },
      );
    }

    const startDate = parsed.data.start_date || todayWib;
    const endDate = parsed.data.end_date || startDate;

    const startedAt = Date.now();
    const availableCandidates = await listVehicles({
      onlyAvailable: true,
      startDate,
      endDate,
    });

    const result = await generateVehicleRecommendations({
      candidates: availableCandidates.slice(0, 30),
      passengers: parsed.data.passengers,
      maxDailyBudget: parsed.data.max_daily_budget ?? null,
      queryText: parsed.data.query_text,
      startDate,
      endDate,
    });

    const latencyMs = Date.now() - startedAt;

    await recordAiRecommendationLog({
      user_id: user?.id ?? null,
      query_text: parsed.data.query_text,
      params: {
        start_date: startDate,
        end_date: endDate,
        passengers: parsed.data.passengers,
        max_daily_budget: parsed.data.max_daily_budget ?? null,
      },
      recommended_vehicle_ids: result.recommendations.map((r) => r.vehicle_id),
      model: result.model,
      used_fallback: result.used_fallback,
      latency_ms: latencyMs,
    });

    return NextResponse.json({
      data: result,
      ...result,
      remaining_quota_today: Math.max(0, MAX_DAILY_AI_REQUESTS - (usedToday + 1)),
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memproses rekomendasi AI" },
      { status: 400 },
    );
  }
}
