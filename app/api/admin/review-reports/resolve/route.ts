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

    const allowedEmails = (process.env.SUPERADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (!user.email || !allowedEmails.includes(user.email.toLowerCase())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { reportId, action } = body;

    if (!reportId || !action || !["revoke", "deny"].includes(action)) {
      return NextResponse.json(
        { error: "reportId and action ('revoke' or 'deny') are required" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Fetch the report
    const { data: report } = await admin
      .from("review_reports")
      .select("id, review_id, status")
      .eq("id", reportId)
      .single();

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (report.status === "revoked" || report.status === "denied") {
      return NextResponse.json(
        { error: "This report has already been resolved" },
        { status: 409 }
      );
    }

    const newStatus = action === "revoke" ? "revoked" : "denied";

    // Update the report
    const { error: updateError } = await admin
      .from("review_reports")
      .update({
        status: newStatus,
        resolved_at: new Date().toISOString(),
        resolved_by: user.email,
      })
      .eq("id", report.id);

    if (updateError) {
      console.error("Review report resolve error:", updateError);
      return NextResponse.json(
        { error: "Failed to resolve report" },
        { status: 500 }
      );
    }

    // If revoking, set is_revoked on the review
    if (action === "revoke") {
      const { error: revokeError } = await admin
        .from("reviews")
        .update({ is_revoked: true })
        .eq("id", report.review_id);

      if (revokeError) {
        console.error("Review revoke error:", revokeError);
        return NextResponse.json(
          { error: "Report resolved but failed to revoke review" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
