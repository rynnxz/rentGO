import React from "react";
import { headers } from "next/headers";
import { getCurrentSessionUser } from "@/lib/session";
import { buildSurfaceUrl } from "@/lib/utils";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminSurfaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentSessionUser();
  const h = await headers();
  const hostHeader = h.get("host");
  const bookSurfaceUrl = buildSurfaceUrl("book", "/", hostHeader);
  const landingSurfaceUrl = buildSurfaceUrl("landing", "/", hostHeader);

  return (
    <AdminShell
      user={user}
      bookSurfaceUrl={bookSurfaceUrl}
      landingSurfaceUrl={landingSurfaceUrl}
    >
      {children}
    </AdminShell>
  );
}
