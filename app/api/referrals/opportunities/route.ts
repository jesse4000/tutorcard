import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/referrals/opportunities — get active referrals from other tutors
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { data: currentTutor } = await supabase
      .from("tutors")
      .select("id, subjects, exams, locations")
      .eq("user_id", user.id)
      .single();

    if (!currentTutor) {
      return NextResponse.json({ opportunities: [] });
    }

    // Fetch all active referrals from OTHER tutors, with poster info and community shares
    const { data: referrals, error } = await supabase
      .from("referrals")
      .select(
        `id, subject, location, grade_level, notes, message, created_at,
         tutor:tutors!referrals_tutor_id_fkey(id, first_name, last_name, avatar_color, slug, subjects, exams),
         referral_community_shares(community_id)`
      )
      .eq("status", "active")
      .neq("tutor_id", currentTutor.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch opportunities error:", error);
      return NextResponse.json(
        { error: "Failed to fetch opportunities" },
        { status: 500 }
      );
    }

    // Get current tutor's applications to know which they've already applied to and their status
    const { data: myApps } = await supabase
      .from("referral_applications")
      .select("referral_id, status")
      .eq("applicant_tutor_id", currentTutor.id);

    const appMap = new Map(
      (myApps || []).map((a) => [a.referral_id, a.status])
    );

    // Get communities the current user is a member of
    const { data: myMemberships } = await supabase
      .from("community_members")
      .select("community_id")
      .eq("tutor_id", currentTutor.id);

    const myCommunityIds = new Set(
      (myMemberships || []).map((m: { community_id: string }) => m.community_id)
    );

    // Build skill match set (lowercase for comparison)
    const mySkills = [
      ...(currentTutor.subjects || []),
      ...(currentTutor.exams || []),
    ].map((s: string) => s.toLowerCase());
    const myLocations: string[] = (currentTutor.locations || []).map(
      (l: string) => l.toLowerCase()
    );

    const opportunities = (referrals || [])
      .filter((ref) => {
        const communityShares = (ref.referral_community_shares || []) as { community_id: string }[];
        if (communityShares.length === 0) return false;

        return communityShares.some(
          (s) => myCommunityIds.has(s.community_id)
        );
      })
      .map((ref) => {
        const subjectLower = ref.subject.toLowerCase();
        const locationLower = ref.location.toLowerCase();
        const skillMatch =
          mySkills.some(
            (s) => subjectLower.includes(s) || s.includes(subjectLower)
          ) ||
          myLocations.some(
            (l) => locationLower.includes(l) || l.includes(locationLower)
          );

        const appStatus = appMap.get(ref.id) || null;
        const isAccepted = appStatus === "accepted";

        // Build sharing info for display
        const communityShares = (ref.referral_community_shares || []) as { community_id: string }[];
        const sharedCommunityIds = communityShares.map((s) => s.community_id);

        return {
          id: ref.id,
          subject: ref.subject,
          location: ref.location,
          grade_level: ref.grade_level,
          notes: ref.notes,
          created_at: ref.created_at,
          tutor: ref.tutor,
          // Only reveal the private message to accepted applicants
          message: isAccepted ? ((ref as Record<string, unknown>).message || "") : undefined,
          applied: !!appStatus,
          applicationStatus: appStatus,
          skillMatch,
          sharedCommunityIds,
        };
      });

    // Sort: skill matches first, then by date
    opportunities.sort((a, b) => {
      if (a.skillMatch && !b.skillMatch) return -1;
      if (!a.skillMatch && b.skillMatch) return 1;
      return 0;
    });

    return NextResponse.json({ opportunities });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
