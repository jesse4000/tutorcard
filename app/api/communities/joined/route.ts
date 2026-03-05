import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
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
      return NextResponse.json({ communities: [] });
    }

    const { data: memberships } = await supabase
      .from("community_members")
      .select("community_id, communities(id, name, description, avatar_color)")
      .eq("tutor_id", tutor.id);

    const communities = (memberships || []).map((m: Record<string, unknown>) => {
      const c = m.communities as Record<string, unknown> | null;
      return c ? { id: c.id, name: c.name, description: c.description, avatar_color: c.avatar_color } : null;
    }).filter(Boolean);

    return NextResponse.json({ communities });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
