import React from "react";
import { listCategories, listVehicles } from "@/lib/repository";
import { VehiclesManager } from "@/components/admin/vehicles-manager";

export const dynamic = "force-dynamic";

export default async function AdminVehiclesPage() {
  const [vehicles, categories] = await Promise.all([
    listVehicles(),
    listCategories(),
  ]);

  return (
    <VehiclesManager initialVehicles={vehicles} categories={categories} />
  );
}
