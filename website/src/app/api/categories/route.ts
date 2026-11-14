import { NextResponse, type NextRequest } from "next/server";
import { AuthError, requireAdminUser } from "@/lib/rbac";
import { createCategory, listCategories } from "@/lib/repository";
import { vehicleCategorySchema } from "@/lib/validators";

export async function GET() {
  const categories = await listCategories();
  return NextResponse.json({ data: categories, categories });
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminUser();
    const body = await request.json();
    const parsed = vehicleCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data kategori tidak valid" },
        { status: 400 },
      );
    }
    const category = await createCategory(parsed.data);
    return NextResponse.json({ data: category, category }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal membuat kategori" },
      { status: 400 },
    );
  }
}
