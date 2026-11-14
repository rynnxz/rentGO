import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { AuthError, requireAdminUser } from "@/lib/rbac";
import {
  deleteMaintenanceLog,
  updateMaintenanceLogStatus,
} from "@/lib/repository";

const statusPatchSchema = z.object({
  status: z.enum(["scheduled", "in_progress", "done"]),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminUser();
    const { id } = await context.params;
    const body = await request.json();
    const parsed = statusPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Status perawatan tidak valid" },
        { status: 400 },
      );
    }
    const log = await updateMaintenanceLogStatus({
      id,
      status: parsed.data.status,
    });
    return NextResponse.json({ data: log, log });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memperbarui perawatan" },
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
    await deleteMaintenanceLog(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal menghapus perawatan" },
      { status: 400 },
    );
  }
}
