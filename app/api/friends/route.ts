import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: list friends and pending requests for the current user
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

    // Get tutor id
    const { data: tutor } = await supabase
      .from("tutors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!tutor) {
      return NextResponse.json({ error: "No tutor card" }, { status: 404 });
    }

    // Outgoing requests + accepted friends
    const { data: sent } = await supabase
      .from("friends")
      .select("*, friend_tutor:tutors!friends_friend_tutor_id_fkey(id, first_name, last_name, slug, avatar_color, title)")
      .eq("tutor_id", tutor.id);

    // Incoming requests
    const { data: received } = await supabase
      .from("friends")
      .select("*, requester:tutors!friends_tutor_id_fkey(id, first_name, last_name, slug, avatar_color, title)")
      .eq("friend_tutor_id", tutor.id);

    return NextResponse.json({ sent: sent || [], received: received || [] });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// POST: send a friend request (by email or slug)
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
    const { email, slug } = body;

    if (!email && !slug) {
      return NextResponse.json(
        { error: "Email or slug required" },
        { status: 400 }
      );
    }

    // Find target tutor
    let query = supabase.from("tutors").select("id, first_name, last_name, slug, avatar_color");
    if (slug) {
      query = query.eq("slug", slug);
    } else {
      query = query.eq("email", email);
    }
    const { data: target } = await query.single();

    if (!target) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    }

    if (target.id === tutor.id) {
      return NextResponse.json(
        { error: "Cannot add yourself" },
        { status: 400 }
      );
    }

    // Check if already friends or pending
    const { data: existing } = await supabase
      .from("friends")
      .select("id, status")
      .or(
        `and(tutor_id.eq.${tutor.id},friend_tutor_id.eq.${target.id}),and(tutor_id.eq.${target.id},friend_tutor_id.eq.${tutor.id})`
      )
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          error:
            existing.status === "accepted"
              ? "Already friends"
              : "Request already sent",
        },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("friends")
      .insert({
        tutor_id: tutor.id,
        friend_tutor_id: target.id,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to send request" }, { status: 500 });
    }

    return NextResponse.json({ success: true, friend: data, target });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// DELETE: remove a friend connection
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
    const friendId = searchParams.get("id");

    if (!friendId) {
      return NextResponse.json({ error: "Friend ID required" }, { status: 400 });
    }

    await supabase.from("friends").delete().eq("id", friendId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
