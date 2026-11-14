import React from "react";
import { listMaintenanceLogs, listVehicles } from "@/lib/repository";
import { MaintenanceManager } from "@/components/admin/maintenance-manager";

export const dynamic = "force-dynamic";

export default async function AdminMaintenancePage() {
  const [logs, vehicles] = await Promise.all([
    listMaintenanceLogs(),
    listVehicles(),
  ]);

  return <MaintenanceManager initialLogs={logs} vehicles={vehicles} />;
}
