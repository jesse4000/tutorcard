import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    // Verify cron secret (Vercel sends this automatically for cron jobs)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();

    // Find expired pending reports
    const { data: expired, error: fetchError } = await admin
      .from("review_reports")
      .select("id, review_id")
      .eq("status", "pending")
      .lt("deadline_at", new Date().toISOString());

    if (fetchError) {
      console.error("Auto-revoke fetch error:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch expired reports" },
        { status: 500 }
      );
    }

    if (!expired || expired.length === 0) {
      return NextResponse.json({ success: true, revokedCount: 0 });
    }

    const reportIds = expired.map((r) => r.id);
    const reviewIds = expired.map((r) => r.review_id);

    // Update reports to revoked
    const { error: updateError } = await admin
      .from("review_reports")
      .update({
        status: "revoked",
        resolved_at: new Date().toISOString(),
        resolved_by: "system:auto-revoke",
      })
      .in("id", reportIds);

    if (updateError) {
      console.error("Auto-revoke update error:", updateError);
      return NextResponse.json(
        { error: "Failed to auto-revoke reports" },
        { status: 500 }
      );
    }

    // Set is_revoked on the reviews
    const { error: revokeError } = await admin
      .from("reviews")
      .update({ is_revoked: true })
      .in("id", reviewIds);

    if (revokeError) {
      console.error("Auto-revoke review update error:", revokeError);
    }

    console.log(`Auto-revoked ${expired.length} review(s)`);
    return NextResponse.json({ success: true, revokedCount: expired.length });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
