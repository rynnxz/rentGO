import { NextResponse, type NextRequest } from "next/server";
import { AuthError, requireAdminUser } from "@/lib/rbac";
import {
  getVehicleBlockedRanges,
  getVehicleById,
  softDeleteVehicle,
  updateVehicle,
} from "@/lib/repository";
import { vehicleSchema } from "@/lib/validators";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const vehicle = await getVehicleById(id);
  if (!vehicle) {
    return NextResponse.json(
      { error: "Kendaraan tidak ditemukan" },
      { status: 404 },
    );
  }
  const blockedRanges = await getVehicleBlockedRanges(id);
  return NextResponse.json({ vehicle, blockedRanges });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminUser();
    const { id } = await context.params;
    const body = await request.json();
    const parsed = vehicleSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 },
      );
    }
    const vehicle = await updateVehicle(id, parsed.data);
    return NextResponse.json({ data: vehicle, vehicle });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memperbarui kendaraan" },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminUser();
    const { id } = await context.params;
    await softDeleteVehicle(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal menghapus kendaraan" },
      { status: 400 },
    );
  }
}
