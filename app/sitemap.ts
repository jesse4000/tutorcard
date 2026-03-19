import { createAdminClient } from "@/lib/supabase/admin";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let tutorEntries: MetadataRoute.Sitemap = [];
  try {
    const supabase = createAdminClient();
    const { data: tutors } = await supabase
      .from("tutors")
      .select("slug, updated_at");

    tutorEntries = (tutors || []).map(
      (t: { slug: string; updated_at?: string }) => ({
        url: `https://tutorcard.co/${t.slug}`,
        lastModified: t.updated_at || new Date().toISOString(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })
    );
  } catch {
    tutorEntries = [];
  }

  return [
    {
      url: "https://tutorcard.co",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: "https://tutorcard.co/for-associations",
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: "https://tutorcard.co/privacy",
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: "https://tutorcard.co/terms",
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...tutorEntries,
  ];
}
