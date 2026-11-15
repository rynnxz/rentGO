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

  // 2. Skip rewrite for API routes, static image assets (.jfif, .jpg, .png, .svg, etc.), SEO files
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/uploads/") ||
    /\.(svg|png|jpg|jpeg|jfif|webp|avif|gif|ico)$/i.test(pathname) ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  // 3. Primary Single-Domain Path Architecture:
  //    - /admin and /admin/* -> /site/admin/*
  //    - /book  and /book/*  -> /site/book/*
  //    This guarantees a single shared origin (1x login across Landing, Booking, and Admin).
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const subPath = pathname.slice("/admin".length);
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/site/admin${subPath}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  if (pathname === "/book" || pathname.startsWith("/book/")) {
    const subPath = pathname.slice("/book".length);
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/site/book${subPath}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  // 4. Legacy / Fallback surface resolution (?site=book|admin or subdomain host)
  const host = request.headers.get("host");
  const siteQuery = request.nextUrl.searchParams.get("site");
  const siteCookie =
    pathname === "/" && !siteQuery
      ? null
      : (request.cookies.get("__site")?.value ?? null);

  const { surface } = resolveSurfaceFromRequest({
    host,
    pathname,
    siteQuery,
    siteCookie,
    nodeEnv: process.env.NODE_ENV,
    rootDomain: process.env.ROOT_DOMAIN ?? "rentgo.my.id",
  });

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = `/site/${surface}${pathname === "/" ? "" : pathname}`;

  const response = NextResponse.rewrite(rewriteUrl);

  // Persist preview surface override cookie in non-production environments when ?site= is used
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
  } else if (pathname === "/" && !siteQuery) {
    response.cookies.delete("__site");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
