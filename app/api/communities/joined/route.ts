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
      .select("community_id, role, communities(id, name, description, avatar_color)")
      .eq("tutor_id", tutor.id);

    const communityIds = (memberships || [])
      .map((m: Record<string, unknown>) => {
        const c = m.communities as Record<string, unknown> | null;
        return c ? (c.id as string) : null;
      })
      .filter(Boolean) as string[];

    // Fetch member counts for joined communities
    let memberCounts: Record<string, number> = {};
    if (communityIds.length > 0) {
      const { data: countRows } = await supabase
        .from("community_members")
        .select("community_id")
        .in("community_id", communityIds);
      if (countRows) {
        memberCounts = countRows.reduce((acc: Record<string, number>, row: Record<string, unknown>) => {
          const cid = row.community_id as string;
          acc[cid] = (acc[cid] || 0) + 1;
          return acc;
        }, {});
      }
    }

    // Fetch new referral counts (posted in last 24h) per community
    let newReferralCounts: Record<string, number> = {};
    if (communityIds.length > 0) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: refRows } = await supabase
        .from("community_referrals")
        .select("community_id")
        .in("community_id", communityIds)
        .gte("created_at", oneDayAgo);
      if (refRows) {
        newReferralCounts = refRows.reduce((acc: Record<string, number>, row: Record<string, unknown>) => {
          const cid = row.community_id as string;
          acc[cid] = (acc[cid] || 0) + 1;
          return acc;
        }, {});
      }
    }

    const communities = (memberships || []).map((m: Record<string, unknown>) => {
      const c = m.communities as Record<string, unknown> | null;
      if (!c) return null;
      const cid = c.id as string;
      return {
        id: cid,
        name: c.name,
        description: c.description,
        avatar_color: c.avatar_color,
        role: m.role,
        memberCount: memberCounts[cid] || 0,
        newReferralCount: newReferralCounts[cid] || 0,
      };
    }).filter(Boolean);

    const ownedCommunityIds = (memberships || [])
      .filter((m: Record<string, unknown>) => m.role === "owner" || m.role === "admin")
      .map((m: Record<string, unknown>) => m.community_id as string);

    // Also fetch pending join request community IDs
    const { data: pendingReqs } = await supabase
      .from("community_join_requests")
      .select("community_id")
      .eq("tutor_id", tutor.id)
      .eq("status", "pending");

    const pendingCommunityIds = (pendingReqs || []).map(
      (r: Record<string, unknown>) => r.community_id as string
    );

    return NextResponse.json({ communities, pendingCommunityIds, ownedCommunityIds });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
