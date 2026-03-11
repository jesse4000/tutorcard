import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Auto-revoke reviews with expired pending reports.
 * Called on-demand (e.g. during page loads) instead of via cron.
 */
export async function autoRevokeExpiredReports(admin: SupabaseClient) {
  const { data: expired } = await admin
    .from("review_reports")
    .select("id, review_id")
    .eq("status", "pending")
    .lt("deadline_at", new Date().toISOString());

  if (!expired || expired.length === 0) return;

  const reportIds = expired.map((r) => r.id);
  const reviewIds = expired.map((r) => r.review_id);

  await admin
    .from("review_reports")
    .update({
      status: "revoked",
      resolved_at: new Date().toISOString(),
      resolved_by: "system:auto-revoke",
    })
    .in("id", reportIds);

  await admin
    .from("reviews")
    .update({ is_revoked: true })
    .in("id", reviewIds);
}
