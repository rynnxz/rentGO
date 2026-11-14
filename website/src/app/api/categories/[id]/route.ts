import { NextResponse, type NextRequest } from "next/server";
import { AuthError, requireAdminUser } from "@/lib/rbac";
import { deleteCategory, updateCategory } from "@/lib/repository";
import { vehicleCategorySchema } from "@/lib/validators";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminUser();
    const { id } = await context.params;
    const body = await request.json();
    const parsed = vehicleCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data kategori tidak valid" },
        { status: 400 },
      );
    }
    const category = await updateCategory(id, parsed.data);
    return NextResponse.json({ data: category, category });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal mengubah kategori" },
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
    await deleteCategory(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal menghapus kategori" },
      { status: 400 },
    );
  }
}
