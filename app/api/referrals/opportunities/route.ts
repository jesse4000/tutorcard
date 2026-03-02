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

    // Fetch all active referrals from OTHER tutors, with poster info
    const { data: referrals, error } = await supabase
      .from("referrals")
      .select(
        `id, subject, location, grade_level, notes, created_at,
         tutor:tutors!referrals_tutor_id_fkey(id, first_name, last_name, avatar_color, slug, subjects, exams)`
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

    // Get current tutor's applications to know which they've already applied to
    const { data: myApps } = await supabase
      .from("referral_applications")
      .select("referral_id")
      .eq("applicant_tutor_id", currentTutor.id);

    const appliedSet = new Set((myApps || []).map((a) => a.referral_id));

    // Build skill match set (lowercase for comparison)
    const mySkills = [
      ...(currentTutor.subjects || []),
      ...(currentTutor.exams || []),
    ].map((s: string) => s.toLowerCase());
    const myLocations: string[] = (currentTutor.locations || []).map(
      (l: string) => l.toLowerCase()
    );

    const opportunities = (referrals || []).map((ref) => {
      const subjectLower = ref.subject.toLowerCase();
      const locationLower = ref.location.toLowerCase();
      const skillMatch =
        mySkills.some(
          (s) => subjectLower.includes(s) || s.includes(subjectLower)
        ) ||
        myLocations.some(
          (l) => locationLower.includes(l) || l.includes(locationLower)
        );

      return {
        ...ref,
        applied: appliedSet.has(ref.id),
        skillMatch,
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
