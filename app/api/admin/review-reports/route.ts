import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedEmails = (process.env.SUPERADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (!user.email || !allowedEmails.includes(user.email.toLowerCase())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const admin = createAdminClient();

    // Fetch all reports
    const { data: reports, error } = await admin
      .from("review_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin review reports fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch reports" },
        { status: 500 }
      );
    }

    if (!reports || reports.length === 0) {
      return NextResponse.json({ reports: [] });
    }

    // Get unique review IDs and tutor IDs
    const reviewIds = [...new Set(reports.map((r) => r.review_id))];
    const tutorIds = [...new Set(reports.map((r) => r.tutor_id))];

    // Fetch reviews and tutors in parallel
    const [{ data: reviews }, { data: tutors }] = await Promise.all([
      admin.from("reviews").select("id, reviewer_name, reviewer_email, exam, quote, score_before, score_after, rating").in("id", reviewIds),
      admin.from("tutors").select("id, first_name, last_name, slug").in("id", tutorIds),
    ]);

    const reviewMap = new Map((reviews || []).map((r) => [r.id, r]));
    const tutorMap = new Map((tutors || []).map((t) => [t.id, t]));

    const enriched = reports.map((report) => {
      const review = reviewMap.get(report.review_id);
      const tutor = tutorMap.get(report.tutor_id);
      return {
        id: report.id,
        reviewId: report.review_id,
        tutorName: tutor ? `${tutor.first_name} ${tutor.last_name}` : "Unknown",
        tutorSlug: tutor?.slug || "",
        reviewerName: review?.reviewer_name || "Unknown",
        reviewerEmail: review?.reviewer_email || null,
        reviewExam: review?.exam || null,
        reviewQuote: review?.quote || "",
        reviewRating: review?.rating || 0,
        reason: report.reason,
        reviewerResponse: report.reviewer_response,
        status: report.status,
        createdAt: report.created_at,
        deadlineAt: report.deadline_at,
        respondedAt: report.responded_at,
        resolvedAt: report.resolved_at,
        resolvedBy: report.resolved_by,
      };
    });

    return NextResponse.json({ reports: enriched });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
