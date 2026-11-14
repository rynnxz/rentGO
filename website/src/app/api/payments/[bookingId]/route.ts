import { NextResponse, type NextRequest } from "next/server";
import { AuthError, requireAuthenticatedUser } from "@/lib/rbac";
import { updateBookingPayment } from "@/lib/repository";
import { paymentVerifySchema } from "@/lib/validators";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ bookingId: string }> },
) {
  try {
    const user = await requireAuthenticatedUser();
    const { bookingId } = await context.params;
    const body = await request.json();
    const parsed = paymentVerifySchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data pembayaran tidak valid" },
        { status: 400 },
      );
    }

    const booking = await updateBookingPayment({
      bookingId,
      actorUserId: user.id,
      actorRole: user.role,
      status: parsed.data.status,
      method: parsed.data.method,
      proofUrl: parsed.data.proof_url,
      note: parsed.data.note,
    });

    return NextResponse.json({ data: booking, booking });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const msg =
      err instanceof Error ? err.message : "Gagal memperbarui pembayaran";
    return NextResponse.json(
      { error: msg },
      { status: msg.includes("Akses ditolak") || msg.includes("Hanya admin") ? 403 : 400 },
    );
  }
}
