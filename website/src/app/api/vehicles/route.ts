import { NextResponse, type NextRequest } from "next/server";
import { AuthError, requireAdminUser } from "@/lib/rbac";
import { createVehicle, listVehicles } from "@/lib/repository";
import { vehicleSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const vehicles = await listVehicles({
    search: sp.get("search") ?? undefined,
    categorySlug: sp.get("category") ?? undefined,
    categoryId: sp.get("categoryId") ?? undefined,
    status: sp.get("status") ?? undefined,
    transmission: sp.get("transmission") ?? undefined,
    minSeats: sp.get("minSeats") ? Number(sp.get("minSeats")) : undefined,
    maxPrice: sp.get("maxPrice") ? Number(sp.get("maxPrice")) : undefined,
    startDate: sp.get("startDate") ?? undefined,
    endDate: sp.get("endDate") ?? undefined,
    onlyAvailable:
      sp.get("available") === "true" || sp.get("onlyAvailable") === "true",
    sort: (sp.get("sort") as "price_asc" | "price_desc" | "newest") || "price_asc",
  });

  return NextResponse.json({ data: vehicles, vehicles });
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminUser();
    const body = await request.json();
    const parsed = vehicleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data kendaraan tidak valid" },
        { status: 400 },
      );
    }
    const vehicle = await createVehicle({
      ...parsed.data,
      color: parsed.data.color ?? null,
      description: parsed.data.description ?? null,
      image_url: parsed.data.image_url ?? "/vehicles/mpv.svg",
    });
    return NextResponse.json({ data: vehicle, vehicle }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal menambah kendaraan" },
      { status: 400 },
    );
  }
}
