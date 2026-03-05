import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: list communities (public or user's)
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

    const { data: tutor } = await supabase
      .from("tutors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter"); // "mine" or "public"

    if (filter === "mine" && tutor) {
      const { data: memberships } = await supabase
        .from("community_members")
        .select("community_id, role, communities(id, name, description, avatar_color, created_by)")
        .eq("tutor_id", tutor.id);

      return NextResponse.json({ communities: memberships || [] });
    }

    // Default: public communities
    const { data: communities } = await supabase
      .from("communities")
      .select("id, name, description, avatar_color, created_by, created_at")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(50);

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
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// POST: create a new community
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Auth required" }, { status: 401 });
    }

    const { data: tutor } = await supabase
      .from("tutors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!tutor) {
      return NextResponse.json({ error: "No tutor card" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, avatarColor } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    const { data: community, error } = await supabase
      .from("communities")
      .insert({
        name: name.trim(),
        description: description?.trim() || "",
        avatar_color: avatarColor || "#0f172a",
        created_by: tutor.id,
        is_public: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Community create error:", error);
      return NextResponse.json(
        { error: "Failed to create community. The communities table may not exist yet." },
        { status: 500 }
      );
    }

    // Auto-join as owner
    await supabase.from("community_members").insert({
      community_id: community.id,
      tutor_id: tutor.id,
      role: "owner",
    });

    return NextResponse.json({ success: true, community });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
