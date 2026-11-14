import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { AuthError, requireAdminUser } from "@/lib/rbac";
import { updateUserRoleOrStatusByAdmin } from "@/lib/repository";

const adminUserPatchSchema = z.object({
  role: z.enum(["customer", "admin"]).optional(),
  is_active: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminUser();
    const { id } = await context.params;
    const body = await request.json();
    const parsed = adminUserPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data perubahan akun tidak valid" },
        { status: 400 },
      );
    }

    const updated = await updateUserRoleOrStatusByAdmin({
      targetUserId: id,
      role: parsed.data.role,
      is_active: parsed.data.is_active,
    });
    return NextResponse.json({ data: updated, user: updated });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memperbarui pelanggan" },
      { status: 400 },
    );
  }
}
