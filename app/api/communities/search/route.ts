import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: search public communities by name
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Auth required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    let query = supabase
      .from("communities")
      .select("id, name, description, avatar_color, created_at")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(20);

    if (q.trim()) {
      query = query.ilike("name", `%${q.trim()}%`);
    }

    const { data: communities, error: queryError } = await query;

    if (queryError) {
      console.error("Community search error:", queryError);
      return NextResponse.json(
        { error: "Failed to search communities. The communities table may not exist yet." },
        { status: 500 }
      );
    }

    // Get member counts
    const enriched = await Promise.all(
      (communities || []).map(async (c) => {
        const { count } = await supabase
          .from("community_members")
          .select("*", { count: "exact", head: true })
          .eq("community_id", c.id);
        return { ...c, memberCount: count || 0 };
      })
    );

    return NextResponse.json({ communities: enriched });
  } catch (err) {
    console.error("Community search exception:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
