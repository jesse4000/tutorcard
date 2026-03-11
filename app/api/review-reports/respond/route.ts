import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET — fetch report context for reviewer (token-gated, public)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: report } = await admin
      .from("review_reports")
      .select("id, reason, status, deadline_at, review_id")
      .eq("response_token", token)
      .single();

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (report.status !== "pending") {
      return NextResponse.json(
        { error: "This report has already been resolved or responded to", status: report.status },
        { status: 410 }
      );
    }

    if (new Date(report.deadline_at) < new Date()) {
      return NextResponse.json(
        { error: "The response deadline has passed" },
        { status: 410 }
      );
    }

    // Fetch the review details
    const { data: review } = await admin
      .from("reviews")
      .select("id, reviewer_name, exam, quote, score_before, score_after, rating")
      .eq("id", report.review_id)
      .single();

    // Fetch tutor name
    const { data: reportWithTutor } = await admin
      .from("review_reports")
      .select("tutor_id")
      .eq("id", report.id)
      .single();

    let tutorName = "the tutor";
    if (reportWithTutor) {
      const { data: tutor } = await admin
        .from("tutors")
        .select("first_name, last_name")
        .eq("id", reportWithTutor.tutor_id)
        .single();
      if (tutor) {
        tutorName = `${tutor.first_name} ${tutor.last_name}`;
      }
    }

    return NextResponse.json({
      reportId: report.id,
      reason: report.reason,
      deadlineAt: report.deadline_at,
      tutorName,
      review: review
        ? {
            reviewerName: review.reviewer_name,
            exam: review.exam,
            quote: review.quote,
            scoreBefore: review.score_before,
            scoreAfter: review.score_after,
            rating: review.rating,
          }
        : null,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// POST — reviewer submits response (token-gated, public)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, response } = body;

    if (!token || !response) {
      return NextResponse.json(
        { error: "token and response are required" },
        { status: 400 }
      );
    }

    const trimmedResponse = response.trim().slice(0, 2000);
    if (trimmedResponse.length < 20) {
      return NextResponse.json(
        { error: "Response must be at least 20 characters" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: report } = await admin
      .from("review_reports")
      .select("id, status, deadline_at")
      .eq("response_token", token)
      .single();

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (report.status !== "pending") {
      return NextResponse.json(
        { error: "This report has already been resolved or responded to" },
        { status: 410 }
      );
    }

    if (new Date(report.deadline_at) < new Date()) {
      return NextResponse.json(
        { error: "The response deadline has passed" },
        { status: 410 }
      );
    }

    const { error: updateError } = await admin
      .from("review_reports")
      .update({
        reviewer_response: trimmedResponse,
        responded_at: new Date().toISOString(),
        status: "responded",
      })
      .eq("id", report.id);

    if (updateError) {
      console.error("Review report response update error:", updateError);
      return NextResponse.json(
        { error: "Failed to submit response" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
