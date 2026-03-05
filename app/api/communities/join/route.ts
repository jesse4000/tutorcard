import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST: join a community
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
    const { communityId } = body;

    if (!communityId) {
      return NextResponse.json({ error: "Community ID required" }, { status: 400 });
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from("community_members")
      .select("id")
      .eq("community_id", communityId)
      .eq("tutor_id", tutor.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Already a member" }, { status: 409 });
    }

    const { error } = await supabase.from("community_members").insert({
      community_id: communityId,
      tutor_id: tutor.id,
      role: "member",
    });

    if (error) {
      return NextResponse.json({ error: "Failed to join" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// DELETE: leave a community
export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const communityId = searchParams.get("communityId");

    if (!communityId) {
      return NextResponse.json({ error: "Community ID required" }, { status: 400 });
    }

    await supabase
      .from("community_members")
      .delete()
      .eq("community_id", communityId)
      .eq("tutor_id", tutor.id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
