import React from "react";
import { notFound } from "next/navigation";
import { getEnv } from "@/lib/env";
import {
  getVehicleBlockedRanges,
  getVehicleById,
} from "@/lib/repository";
import { getCurrentSessionUser } from "@/lib/session";
import { addDaysIso, getTodayWib } from "@/lib/utils";
import { VehicleCheckoutView } from "@/components/book/vehicle-checkout-view";

export const dynamic = "force-dynamic";

export default async function BookVehicleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const vehicle = await getVehicleById(id);
  if (!vehicle) {
    notFound();
  }

  const [blockedRanges, user] = await Promise.all([
    getVehicleBlockedRanges(id),
    getCurrentSessionUser(),
  ]);

  const today = getTodayWib();
  const tomorrow = addDaysIso(today, 1);
  const initialStartDate =
    typeof sp.start === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.start)
      ? sp.start
      : today;
  const initialEndDate =
    typeof sp.end === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(sp.end) &&
    sp.end >= initialStartDate
      ? sp.end
      : initialStartDate > tomorrow
        ? initialStartDate
        : tomorrow;

  const env = getEnv();

  return (
    <VehicleCheckoutView
      vehicle={vehicle}
      blockedRanges={blockedRanges}
      user={user}
      initialStartDate={initialStartDate}
      initialEndDate={initialEndDate}
      bankInfo={env.PAYMENT_BANK_INFO}
    />
  );
}
