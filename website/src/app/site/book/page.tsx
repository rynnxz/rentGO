import React from "react";
import { listCategories, listVehicles } from "@/lib/repository";
import { addDaysIso, getTodayWib } from "@/lib/utils";
import { CatalogView } from "@/components/book/catalog-view";

export const dynamic = "force-dynamic";

export default async function BookCatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const today = getTodayWib();
  const tomorrow = addDaysIso(today, 1);

  const startDate =
    typeof sp.start === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.start)
      ? sp.start
      : today;
  const endDate =
    typeof sp.end === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(sp.end) &&
    sp.end >= startDate
      ? sp.end
      : startDate > tomorrow
        ? startDate
        : tomorrow;
  const categorySlug =
    typeof sp.category === "string" ? sp.category : "all";

  const [vehicles, categories] = await Promise.all([
    listVehicles({
      onlyAvailable: true,
      startDate,
      endDate,
    }),
    listCategories(),
  ]);

  return (
    <CatalogView
      initialVehicles={vehicles}
      categories={categories}
      initialStartDate={startDate}
      initialEndDate={endDate}
      initialCategorySlug={categorySlug}
    />
  );
}
