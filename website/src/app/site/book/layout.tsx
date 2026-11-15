import React from "react";
import { headers } from "next/headers";
import { getCurrentSessionUser } from "@/lib/session";
import { buildSurfaceUrl } from "@/lib/utils";
import { BookNavbar } from "@/components/book/book-navbar";

export const dynamic = "force-dynamic";

export default async function BookSurfaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentSessionUser();
  const h = await headers();
  const hostHeader = h.get("host");
  const landingUrl = buildSurfaceUrl("landing", "/", hostHeader);
  const adminUrl = buildSurfaceUrl("admin", "/", hostHeader);

  return (
    <div
      style={{ backgroundColor: "var(--slate-50)" }}
      className="flex min-h-screen flex-col"
    >
      <BookNavbar user={user} landingUrl={landingUrl} adminUrl={adminUrl} />
      <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 lg:py-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
      <footer
        style={{
          backgroundColor: "var(--surface-white)",
          color: "var(--slate-600)",
        }}
        className="border-t px-4 py-5 text-center text-xs"
      >
        <p>
          RentGo Medan (<code>rentgo.my.id/book</code>) - Sistem Penyewaan Kendaraan Real-Time Berbasis SDLC Incremental.
        </p>
      </footer>
    </div>
  );
}
