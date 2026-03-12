import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reviewId } = await request.json();
    if (!reviewId) {
      return NextResponse.json({ error: "reviewId is required" }, { status: 400 });
    }

    // Get the tutor for this user
    const { data: tutor } = await supabase
      .from("tutors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!tutor) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    }

    // Verify the review belongs to this tutor
    const admin = createAdminClient();
    const { data: review } = await admin
      .from("reviews")
      .select("id, tutor_id, is_pinned")
      .eq("id", reviewId)
      .single();

    if (!review || review.tutor_id !== tutor.id) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const shouldPin = !review.is_pinned;

    // Unpin all reviews for this tutor
    await admin
      .from("reviews")
      .update({ is_pinned: false })
      .eq("tutor_id", tutor.id);

    // Pin the target review if toggling on
    if (shouldPin) {
      await admin
        .from("reviews")
        .update({ is_pinned: true })
        .eq("id", reviewId);
    }

    return NextResponse.json({ success: true, isPinned: shouldPin });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
