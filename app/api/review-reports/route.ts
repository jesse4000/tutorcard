import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

      const html = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
          <div style="padding: 32px 24px;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 28px;">
              <div style="width: 24px; height: 24px; border-radius: 6px; background: #111; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 11px; font-weight: 700; color: white;">tc</span>
              </div>
              <span style="font-size: 15px; font-weight: 700; color: #111;">tutorcard</span>
            </div>

            <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 12px; color: #111;">Your review has been flagged</h1>

            <p style="font-size: 15px; color: #374151; line-height: 1.6; margin: 0 0 20px;">
              Hi ${review.reviewer_name},
            </p>

            <p style="font-size: 15px; color: #374151; line-height: 1.6; margin: 0 0 20px;">
              Your review for <strong>${tutorName}</strong> on TutorCard has been flagged by the tutor for the following reason:
            </p>

            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px 18px; margin: 0 0 20px;">
              <p style="font-size: 14px; color: #6b7280; line-height: 1.55; margin: 0; font-style: italic;">
                "${trimmedReason}"
              </p>
            </div>

            <p style="font-size: 15px; color: #374151; line-height: 1.6; margin: 0 0 24px;">
              You have <strong>7 days</strong> to respond with additional information to support your review. If you do not respond, your review will be automatically removed.
            </p>

            <a href="${respondUrl}" style="display: inline-block; padding: 14px 28px; background: #111; color: white; text-decoration: none; border-radius: 12px; font-size: 15px; font-weight: 600;">
              Respond to this report
            </a>

            <p style="font-size: 13px; color: #9ca3af; line-height: 1.5; margin: 24px 0 0;">
              If you did not leave this review, you can safely ignore this email and the review will be removed automatically.
            </p>
          </div>
        </div>
      `;

      try {
        const emailUrl = `${request.url.split("/api/")[0]}/api/email`;
        await fetch(emailUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: review.reviewer_email,
            subject: "Your review on TutorCard has been flagged",
            html,
          }),
        });
      } catch (emailError) {
        // Log but don't fail the report submission
        console.error("Failed to send reviewer notification email:", emailError);
      }
    }

    return NextResponse.json({ success: true, reportId: report.id });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
