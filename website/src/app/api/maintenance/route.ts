import { NextResponse, type NextRequest } from "next/server";
import { AuthError, requireAdminUser } from "@/lib/rbac";
import { createMaintenanceLog, listMaintenanceLogs } from "@/lib/repository";
import { maintenanceLogSchema } from "@/lib/validators";

export async function GET() {
  try {
    await requireAdminUser();
    const logs = await listMaintenanceLogs();
    return NextResponse.json({ logs });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: "Gagal memuat jadwal perawatan" },
      { status: 400 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminUser();
    const body = await request.json();
    const parsed = maintenanceLogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data perawatan tidak valid" },
        { status: 400 },
      );
    }
    const log = await createMaintenanceLog(parsed.data);
    return NextResponse.json({ data: log, log }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal menambah jadwal perawatan" },
      { status: 400 },
    );
  }
}
