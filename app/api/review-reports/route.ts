import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { reviewFlaggedEmail } from "@/lib/email-templates";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reviewId, reason } = body;

    if (!reviewId || !reason) {
      return NextResponse.json(
        { error: "reviewId and reason are required" },
        { status: 400 }
      );
    }

    const trimmedReason = reason.trim().slice(0, 1000);
    if (trimmedReason.length < 20) {
      return NextResponse.json(
        { error: "Reason must be at least 20 characters" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Verify the review exists and belongs to this tutor
    const { data: review } = await admin
      .from("reviews")
      .select("id, tutor_id, reviewer_name, reviewer_email, exam, quote")
      .eq("id", reviewId)
      .single();

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Verify the tutor owns this review
    const { data: tutor } = await admin
      .from("tutors")
      .select("id, first_name, last_name, slug")
      .eq("user_id", user.id)
      .eq("id", review.tutor_id)
      .single();

    if (!tutor) {
      return NextResponse.json(
        { error: "Not authorized to report this review" },
        { status: 403 }
      );
    }

    // Check for existing active report on this review
    const { data: existing } = await admin
      .from("review_reports")
      .select("id")
      .eq("review_id", reviewId)
      .in("status", ["pending", "responded"])
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "An active report already exists for this review" },
        { status: 409 }
      );
    }

    // Insert the report
    const { data: report, error: insertError } = await admin
      .from("review_reports")
      .insert({
        review_id: reviewId,
        tutor_id: tutor.id,
        reason: trimmedReason,
      })
      .select("id, response_token")
      .single();

    if (insertError || !report) {
      console.error("Review report insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to submit report" },
        { status: 500 }
      );
    }

    // Send email to reviewer if they have an email
    if (review.reviewer_email) {
      const tutorName = `${tutor.first_name} ${tutor.last_name}`;
      const respondUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://tutorcard.co"}/review-report/respond?token=${report.response_token}`;

      try {
        const tpl = reviewFlaggedEmail(review.reviewer_name, tutorName, trimmedReason, respondUrl);
        await sendEmail({ to: review.reviewer_email, ...tpl });
      } catch (emailError) {
        // Log but don't fail the report submission
        console.error("Failed to send reviewer notification email:", emailError);
      }
    }

    return NextResponse.json({ success: true, reportId: report.id });
  } catch (err) {
    console.error("Review report submission error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
