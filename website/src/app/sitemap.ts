import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const landingUrl =
    process.env.NEXT_PUBLIC_LANDING_URL || "https://rentgo.my.id";
  const bookUrl =
    process.env.NEXT_PUBLIC_BOOK_URL || "https://book.rentgo.my.id";
  const now = new Date();

  return [
    {
      url: landingUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: bookUrl,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
  ];
}
