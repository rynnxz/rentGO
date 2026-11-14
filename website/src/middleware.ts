import { NextResponse, type NextRequest } from "next/server";
import { resolveSurfaceFromRequest } from "./lib/utils";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Block direct browser requests to internal /site/* routes (must return 404)
  if (pathname === "/site" || pathname.startsWith("/site/")) {
    return new NextResponse("Halaman tidak ditemukan (404).", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  // 2. Skip rewrite for API routes, static image assets, SEO files
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/uploads/") ||
    /\.(svg|png|jpg|jpeg|webp|ico)$/i.test(pathname) ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  const host = request.headers.get("host");
  const siteQuery = request.nextUrl.searchParams.get("site");
  const siteCookie = request.cookies.get("__site")?.value ?? null;

  const { surface } = resolveSurfaceFromRequest({
    host,
    siteQuery,
    siteCookie,
    nodeEnv: process.env.NODE_ENV,
    rootDomain: process.env.ROOT_DOMAIN ?? "rentgo.my.id",
  });

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = `/site/${surface}${pathname === "/" ? "" : pathname}`;

  const response = NextResponse.rewrite(rewriteUrl);

  // Persist preview surface override cookie in non-production environments
  if (
    process.env.NODE_ENV !== "production" &&
    (siteQuery === "landing" || siteQuery === "book" || siteQuery === "admin")
  ) {
    response.cookies.set("__site", siteQuery, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
