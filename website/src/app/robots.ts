import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_LANDING_URL || "https://rentgo.my.id";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/site/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
