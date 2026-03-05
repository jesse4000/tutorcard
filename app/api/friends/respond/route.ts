import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST: accept or decline a friend request
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

    const body = await request.json();
    const { friendRequestId, action } = body;

    if (!friendRequestId || !["accepted", "declined"].includes(action)) {
      return NextResponse.json({ error: "Invalid params" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("friends")
      .update({ status: action, updated_at: new Date().toISOString() })
      .eq("id", friendRequestId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to respond" }, { status: 500 });
    }

    return NextResponse.json({ success: true, friend: data });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
