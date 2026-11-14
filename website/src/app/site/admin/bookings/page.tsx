import React from "react";
import { listBookings } from "@/lib/repository";
import { BookingsManager } from "@/components/admin/bookings-manager";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const bookings = await listBookings();
  return <BookingsManager initialBookings={bookings} />;
}
