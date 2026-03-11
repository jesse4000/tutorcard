import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tutorId, reviewerName, reviewerRole, exam, scoreBefore, scoreAfter, months, rating, quote, reviewerEmail, recommends } = body;

    if (!tutorId || !reviewerName || !rating || !quote) {
      return NextResponse.json(
        { error: "tutorId, reviewerName, rating, and quote are required" },
        { status: 400 }
      );
    }

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const trimmedQuote = quote.trim().slice(0, 2000);
    if (!trimmedQuote) {
      return NextResponse.json(
        { error: "quote cannot be empty" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: tutor } = await supabase
      .from("tutors")
      .select("id")
      .eq("id", tutorId)
      .single();

    if (!tutor) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    }

    const row: Record<string, unknown> = {
      tutor_id: tutorId,
      reviewer_name: reviewerName.trim(),
      reviewer_role: reviewerRole || null,
      exam: exam || null,
      score_before: scoreBefore || null,
      score_after: scoreAfter || null,
      months: months || null,
      rating,
      quote: trimmedQuote,
    };

    // Optional columns (added via migration — may not exist on older schemas)
    if (reviewerEmail) row.reviewer_email = reviewerEmail.trim();
    if (typeof recommends === "boolean") row.recommends = recommends;

    let { error } = await supabase.from("reviews").insert(row);

    // Retry without optional columns if they don't exist yet
    if (error && error.message?.includes("column")) {
      delete row.reviewer_email;
      delete row.recommends;
      ({ error } = await supabase.from("reviews").insert(row));
    }

    if (error) {
      console.error("Review insert error:", error.message, error.code, error.details);
      return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
