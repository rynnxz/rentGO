import { NextResponse, type NextRequest } from "next/server";
import {
  AuthError,
  requireAdminUser,
  requireAuthenticatedUser,
} from "@/lib/rbac";
import { listUsers, updateUserProfile } from "@/lib/repository";
import { profileUpdateSchema } from "@/lib/validators";

export async function GET() {
  try {
    await requireAdminUser();
    const users = await listUsers();
    return NextResponse.json({ users });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: "Gagal memuat daftar pelanggan" },
      { status: 400 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data profil tidak valid" },
        { status: 400 },
      );
    }
    const updated = await updateUserProfile(user.id, parsed.data);
    return NextResponse.json({ data: updated, user: updated });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal menyimpan profil" },
      { status: 400 },
    );
  }
}
