import { NextResponse, type NextRequest } from "next/server";
import { AuthError, requireAuthenticatedUser } from "@/lib/rbac";
import { getBookingById, transitionBookingStatus } from "@/lib/repository";
import { bookingStatusUpdateSchema } from "@/lib/validators";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = await context.params;
    const booking = await getBookingById(id);
    if (!booking) {
      return NextResponse.json(
        { error: "Pesanan tidak ditemukan." },
        { status: 404 },
      );
    }
    if (user.role !== "admin" && booking.user_id !== user.id) {
      return NextResponse.json(
        { error: "Akses ditolak: Anda hanya dapat melihat pesanan milik sendiri." },
        { status: 403 },
      );
    }
    return NextResponse.json({ booking });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memuat detail pesanan" },
      { status: 400 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = await context.params;
    const body = await request.json();
    const parsed = bookingStatusUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Status tidak valid" },
        { status: 400 },
      );
    }

    const updated = await transitionBookingStatus({
      bookingId: id,
      nextStatus: parsed.data.status,
      actorRole: user.role,
      actorUserId: user.id,
      adminNotes: parsed.data.admin_notes ?? null,
    });

    return NextResponse.json({ data: updated, booking: updated });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const msg = err instanceof Error ? err.message : "Gagal mengubah status pesanan";
    const isForbidden =
      msg.includes("tidak memiliki akses") || msg.includes("tidak memiliki izin");
    return NextResponse.json(
      { error: msg },
      { status: isForbidden ? 403 : 400 },
    );
  }
}
