import { NextResponse, type NextRequest } from "next/server";
import { AuthError, requireAuthenticatedUser } from "@/lib/rbac";
import { createBooking, listBookings } from "@/lib/repository";
import { bookingCreateSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const sp = request.nextUrl.searchParams;
    const isExportCsv = sp.get("format") === "csv";

    const bookings = await listBookings({
      userId: user.role === "admin" ? undefined : user.id,
      status: sp.get("status") ?? undefined,
      vehicleId: sp.get("vehicleId") ?? undefined,
      search: sp.get("search") ?? undefined,
    });

    if (isExportCsv && user.role === "admin") {
      const header = [
        "Booking Code",
        "Customer Name",
        "Customer Email",
        "Phone",
        "Vehicle",
        "Plate Number",
        "Start Date",
        "End Date",
        "Total Days",
        "Total Price (IDR)",
        "Booking Status",
        "Payment Status",
      ].join(",");

      const rows = bookings.map((b) =>
        [
          b.booking_code,
          `"${b.user_name.replace(/"/g, '""')}"`,
          b.user_email,
          b.user_phone ?? "-",
          `"${b.vehicle_brand} ${b.vehicle_model}"`,
          b.vehicle_plate,
          b.start_date,
          b.end_date,
          b.total_days,
          b.total_price,
          b.status,
          b.payment?.status ?? "unpaid",
        ].join(","),
      );

      const csv = [header, ...rows].join("\n");
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "content-type": "text/csv; charset=utf-8",
          "content-disposition": `attachment; filename="rentgo-bookings.csv"`,
        },
      });
    }

    return NextResponse.json({ bookings });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memuat pesanan" },
      { status: 400 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();
    const parsed = bookingCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data booking tidak valid" },
        { status: 400 },
      );
    }

    const booking = await createBooking({
      user_id: user.id,
      vehicle_id: parsed.data.vehicle_id,
      start_date: parsed.data.start_date,
      end_date: parsed.data.end_date,
      pickup_location: parsed.data.pickup_location,
      return_location: parsed.data.return_location,
      payment_method: parsed.data.payment_method,
      phone: parsed.data.phone,
      driver_license_no: parsed.data.driver_license_no,
      notes: parsed.data.notes ?? null,
    });

    return NextResponse.json({ data: booking, booking }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const msg = err instanceof Error ? err.message : "Gagal membuat booking";
    const isConflict =
      msg.includes("sudah dipesan") || msg.includes("perawatan");
    return NextResponse.json(
      { error: msg },
      { status: isConflict ? 409 : 400 },
    );
  }
}
