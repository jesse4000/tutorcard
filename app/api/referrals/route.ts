import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/referrals?tutor_id=xxx — get referrals for a tutor (public, active only)
// GET /api/referrals?mine=true — get all referrals for the logged-in tutor (including closed)
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const tutorId = searchParams.get("tutor_id");
    const mine = searchParams.get("mine");
    const referralId = searchParams.get("id");

    // Public single-referral fetch (for /referral/[id] page)
    if (referralId && mine !== "true") {
      const { data: referral, error } = await supabase
        .from("referrals")
        .select(
          `id, subject, location, grade_level, notes, status, created_at,
           tutor:tutors!referrals_tutor_id_fkey(id, first_name, last_name, avatar_color, slug)`
        )
        .eq("id", referralId)
        .single();

      if (error || !referral) {
        return NextResponse.json(
          { error: "Referral not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ referral });
    }

    if (mine === "true") {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      const { data: tutor } = await supabase
        .from("tutors")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!tutor) {
        return NextResponse.json({ referrals: [] });
      }

      const { data: referrals, error } = await supabase
        .from("referrals")
        .select(
          `*, referral_applications(id, status, bought_coffee, created_at, applicant_tutor_id, applicant:tutors!referral_applications_applicant_tutor_id_fkey(id, first_name, last_name, slug, title, avatar_color, exams, subjects, locations))`
        )
        .eq("tutor_id", tutor.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch referrals error:", error);
        return NextResponse.json(
          { error: "Failed to fetch referrals" },
          { status: 500 }
        );
      }

      return NextResponse.json({ referrals: referrals || [] });
    }

    // Public: get active referrals for a specific tutor
    if (!tutorId) {
      return NextResponse.json(
        { error: "tutor_id is required" },
        { status: 400 }
      );
    }

    const { data: referrals, error } = await supabase
      .from("referrals")
      .select(
        `*, referral_applications(id)`
      )
      .eq("tutor_id", tutorId)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch referrals error:", error);
      return NextResponse.json(
        { error: "Failed to fetch referrals" },
        { status: 500 }
      );
    }

    return NextResponse.json({ referrals: referrals || [] });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

// POST /api/referrals — create a new referral
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { data: tutor } = await supabase
      .from("tutors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!tutor) {
      return NextResponse.json(
        { error: "You need a TutorCard first" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { subject, location, gradeLevel, notes, message, communityIds } = body;

    if (!subject) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("referrals")
      .insert({
        tutor_id: tutor.id,
        subject: subject.trim(),
        location: (location || "Online").trim(),
        grade_level: (gradeLevel || "").trim(),
        notes: (notes || "").trim(),
        message: (message || "").trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("Create referral error:", error);
      return NextResponse.json(
        { error: `Failed to create referral: ${error.message}` },
        { status: 500 }
      );
    }

    // Insert community shares if any communities selected
    if (Array.isArray(communityIds) && communityIds.length > 0 && data) {
      const shares = communityIds.map((cid: string) => ({
        referral_id: data.id,
        community_id: cid,
      }));
      const { error: shareError } = await supabase
        .from("referral_community_shares")
        .insert(shares);
      if (shareError) {
        console.error("Insert community shares error:", shareError);
      }
    }

    return NextResponse.json({ success: true, referral: data });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

// PUT /api/referrals — update a referral (close it, edit, etc.)
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Referral ID is required" },
        { status: 400 }
      );
    }

    const { data: tutor } = await supabase
      .from("tutors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!tutor) {
      return NextResponse.json(
        { error: "You need a TutorCard first" },
        { status: 403 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (fields.subject !== undefined) updateData.subject = fields.subject.trim();
    if (fields.location !== undefined) updateData.location = fields.location.trim();
    if (fields.gradeLevel !== undefined) updateData.grade_level = fields.gradeLevel.trim();
    if (fields.notes !== undefined) updateData.notes = fields.notes.trim();
    if (fields.message !== undefined) updateData.message = fields.message.trim();
    if (fields.status !== undefined) updateData.status = fields.status;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("referrals")
      .update(updateData)
      .eq("id", id)
      .eq("tutor_id", tutor.id)
      .select()
      .single();

    if (error) {
      console.error("Update referral error:", error);
      return NextResponse.json(
        { error: "Failed to update referral" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, referral: data });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

// DELETE /api/referrals — delete a referral
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Referral ID is required" },
        { status: 400 }
      );
    }

    const { data: tutor } = await supabase
      .from("tutors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!tutor) {
      return NextResponse.json(
        { error: "You need a TutorCard first" },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from("referrals")
      .delete()
      .eq("id", id)
      .eq("tutor_id", tutor.id);

    if (error) {
      console.error("Delete referral error:", error);
      return NextResponse.json(
        { error: "Failed to delete referral" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
