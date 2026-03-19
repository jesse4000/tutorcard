import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/admin",
          "/create",
          "/login",
          "/signup",
          "/api/",
        ],
      },
    ],
    sitemap: "https://tutorcard.co/sitemap.xml",
  };
}
