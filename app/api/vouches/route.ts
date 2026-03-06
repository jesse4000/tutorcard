import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST: toggle vouch for a tutor
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
    const { tutorId } = body;

    if (!tutorId) {
      return NextResponse.json({ error: "tutorId required" }, { status: 400 });
    }

    if (tutorId === tutor.id) {
      return NextResponse.json({ error: "Cannot vouch for yourself" }, { status: 400 });
    }

    // Check if already vouched
    const { data: existing } = await supabase
      .from("vouches")
      .select("id")
      .eq("voucher_tutor_id", tutor.id)
      .eq("vouched_tutor_id", tutorId)
      .maybeSingle();

    if (existing) {
      // Remove vouch
      await supabase.from("vouches").delete().eq("id", existing.id);
    } else {
      // Add vouch
      const { error } = await supabase.from("vouches").insert({
        voucher_tutor_id: tutor.id,
        vouched_tutor_id: tutorId,
      });
      if (error) {
        return NextResponse.json({ error: "Failed to vouch" }, { status: 500 });
      }
    }

    // Get fresh count
    const { count } = await supabase
      .from("vouches")
      .select("id", { count: "exact", head: true })
      .eq("vouched_tutor_id", tutorId);

    return NextResponse.json({
      vouched: !existing,
      vouchCount: count ?? 0,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
