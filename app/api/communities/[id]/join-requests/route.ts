import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: list join requests for a community (owners/admins only)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Check if user is owner/admin
    const { data: membership } = await supabase
      .from("community_members")
      .select("role")
      .eq("community_id", id)
      .eq("tutor_id", tutor.id)
      .single();

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const { data: requests } = await supabase
      .from("community_join_requests")
      .select("id, tutor_id, message, status, created_at, tutors(id, first_name, last_name, avatar_color, slug)")
      .eq("community_id", id)
      .eq("status", status)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      requests: (requests || []).map((r: Record<string, unknown>) => ({
        id: r.id,
        tutorId: r.tutor_id,
        message: r.message,
        status: r.status,
        createdAt: r.created_at,
        tutor: r.tutors,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST: submit a join request
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Check not already a member
    const { data: existing } = await supabase
      .from("community_members")
      .select("id")
      .eq("community_id", id)
      .eq("tutor_id", tutor.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Already a member" }, { status: 409 });
    }

    // Check no existing pending request
    const { data: existingReq } = await supabase
      .from("community_join_requests")
      .select("id, status")
      .eq("community_id", id)
      .eq("tutor_id", tutor.id)
      .maybeSingle();

    if (existingReq?.status === "pending") {
      return NextResponse.json({ error: "Request already pending" }, { status: 409 });
    }

    const body = await request.json();
    const { message } = body;

    if (existingReq) {
      // Update existing declined request to pending
      await supabase
        .from("community_join_requests")
        .update({ status: "pending", message: message?.trim() || "", updated_at: new Date().toISOString() })
        .eq("id", existingReq.id);
    } else {
      await supabase.from("community_join_requests").insert({
        community_id: id,
        tutor_id: tutor.id,
        message: message?.trim() || "",
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH: approve or decline a join request (owners/admins only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Check if user is owner/admin
    const { data: membership } = await supabase
      .from("community_members")
      .select("role")
      .eq("community_id", id)
      .eq("tutor_id", tutor.id)
      .single();

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await request.json();
    const { requestId, action } = body;

    if (!requestId || !["approved", "declined"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Update request status
    const { data: joinReq, error: updateError } = await supabase
      .from("community_join_requests")
      .update({
        status: action,
        reviewed_by: tutor.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)
      .eq("community_id", id)
      .select("tutor_id")
      .single();

    if (updateError || !joinReq) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // If approved, add as member
    if (action === "approved") {
      await supabase.from("community_members").insert({
        community_id: id,
        tutor_id: joinReq.tutor_id,
        role: "member",
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
