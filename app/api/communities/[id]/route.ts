import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: community detail with stats
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

    // Fetch community
    const { data: community, error } = await supabase
      .from("communities")
      .select("id, name, description, avatar_color, created_by, is_public, require_approval, application_questions, created_at")
      .eq("id", id)
      .single();

    if (error || !community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    // Member count
    const { count: memberCount } = await supabase
      .from("community_members")
      .select("*", { count: "exact", head: true })
      .eq("community_id", id);

    // Members list with tutor info
    const { data: members } = await supabase
      .from("community_members")
      .select("tutor_id, role, joined_at, tutors(id, first_name, last_name, avatar_color, slug)")
      .eq("community_id", id)
      .order("joined_at", { ascending: true });

    // Pending join requests count (for owners/admins)
    let pendingRequests = 0;
    let isOwnerOrAdmin = false;
    if (tutor) {
      const membership = (members || []).find(
        (m: Record<string, unknown>) => m.tutor_id === tutor.id
      );
      if (membership) {
        const role = membership.role as string;
        isOwnerOrAdmin = role === "owner" || role === "admin";
      }

      if (isOwnerOrAdmin) {
        const { count } = await supabase
          .from("community_join_requests")
          .select("*", { count: "exact", head: true })
          .eq("community_id", id)
          .eq("status", "pending");
        pendingRequests = count || 0;
      }
    }

    // Community referrals count
    const { count: referralCount } = await supabase
      .from("referrals")
      .select("*", { count: "exact", head: true })
      .eq("community_id", id);

    // Current user's membership
    let userRole: string | null = null;
    let hasPendingRequest = false;
    if (tutor) {
      const membership = (members || []).find(
        (m: Record<string, unknown>) => m.tutor_id === tutor.id
      );
      if (membership) {
        userRole = membership.role as string;
      }

      // Check if user has a pending join request
      if (!userRole) {
        const { data: pendingReq } = await supabase
          .from("community_join_requests")
          .select("id")
          .eq("community_id", id)
          .eq("tutor_id", tutor.id)
          .eq("status", "pending")
          .maybeSingle();
        hasPendingRequest = !!pendingReq;
      }
    }

    return NextResponse.json({
      community: {
        ...community,
        memberCount: memberCount || 0,
        referralCount: referralCount || 0,
        pendingRequests,
        userRole,
        isOwnerOrAdmin,
        hasPendingRequest,
      },
      members: (members || []).map((m: Record<string, unknown>) => ({
        tutorId: m.tutor_id,
        role: m.role,
        joinedAt: m.joined_at,
        tutor: m.tutors,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
