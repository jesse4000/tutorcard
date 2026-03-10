import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function sanitizeSlug(slug: string) {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "slug parameter required" }, { status: 400 });
  }

  const cleanSlug = sanitizeSlug(slug);
  if (!cleanSlug) {
    return NextResponse.json({ available: false });
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("tutors")
    .select("id")
    .eq("slug", cleanSlug)
    .single();

  return NextResponse.json({ available: !existing });
}
