import React from "react";
import { listUsers } from "@/lib/repository";
import { CustomersManager } from "@/components/admin/customers-manager";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const users = await listUsers();
  return <CustomersManager initialUsers={users} />;
}
