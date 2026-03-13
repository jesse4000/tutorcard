import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { generateCodesForUser } from "@/lib/inviteCodes";
import { createAdminClient } from "@/lib/supabase/admin";
import { autoRevokeExpiredReports } from "@/lib/auto-revoke";
import DashboardClient from "./DashboardClient";
import type { ReviewData, VoucherData, BadgeData } from "../[slug]/types";

export const metadata: Metadata = {
  title: "Dashboard — TutorCard",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  const { data: tutors } = await supabase
    .from("tutors")
    .select("*")
    .eq("user_id", user.id);

  const tutor = tutors?.[0] || null;

  if (!tutor) {
    return <DashboardClient tutor={null} userEmail={user.email || ""} vouchCount={0} reviewCount={0} averageRating={null} reviews={[]} vouchers={[]} badges={[]} inquiryCount={0} inviteCodes={[]} />;
  }

  // Parallel data fetching (same pattern as [slug]/page.tsx)
  const [
    { count: vouchCount },
    { data: reviewsRaw },
    { data: badgesRaw },
    { data: vouchesRaw },
    { count: inquiryCount },
  ] = await Promise.all([
    supabase
      .from("vouches")
      .select("id", { count: "exact", head: true })
      .eq("vouched_tutor_id", tutor.id),
    supabase
      .from("reviews")
      .select("*")
      .eq("tutor_id", tutor.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("badges")
      .select("*")
      .eq("tutor_id", tutor.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("vouches")
      .select("id, voucher:tutors!voucher_tutor_id(id, first_name, last_name, slug, title, avatar_color, profile_image_url)")
      .eq("vouched_tutor_id", tutor.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("inquiries")
      .select("id", { count: "exact", head: true })
      .eq("tutor_id", tutor.id),
  ]);

  const admin = createAdminClient();

  // Auto-revoke any expired pending reports (replaces cron job)
  await autoRevokeExpiredReports(admin);

  // Fetch review report statuses
  const reviewIds = (reviewsRaw || []).map((r: Record<string, unknown>) => r.id as string);
  let reportStatusMap: Record<string, string> = {};
  if (reviewIds.length > 0) {
    const { data: reportsRaw } = await admin
      .from("review_reports")
      .select("review_id, status")
      .in("review_id", reviewIds)
      .in("status", ["pending", "responded", "revoked", "denied"]);
    if (reportsRaw) {
      for (const rp of reportsRaw) {
        // Keep the most recent/active status per review
        const existing = reportStatusMap[rp.review_id];
        if (!existing || rp.status === "pending" || rp.status === "responded") {
          reportStatusMap[rp.review_id] = rp.status;
        }
      }
    }
  }

  // Map reviews
  const reviews: ReviewData[] = (reviewsRaw || []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    reviewerName: r.reviewer_name as string,
    reviewerRole: (r.reviewer_role as string) || undefined,
    exam: (r.exam as string) || undefined,
    scoreBefore: (r.score_before as string) || undefined,
    scoreAfter: (r.score_after as string) || undefined,
    months: (r.months as number) || undefined,
    rating: r.rating as number,
    quote: r.quote as string,
    reportStatus: (reportStatusMap[r.id as string] as ReviewData["reportStatus"]) || undefined,
    isPinned: (r.is_pinned as boolean) || false,
  }));

  // Map badges
  const badges: BadgeData[] = (badgesRaw || []).map((b: Record<string, unknown>) => ({
    id: b.id as string,
    name: b.name as string,
    organization: (b.organization as string) || undefined,
    badgeType: b.badge_type as "certification" | "membership",
    sinceYear: (b.since_year as number) || undefined,
    description: (b.description as string) || undefined,
  }));

  // Map vouchers
  const vouchers: VoucherData[] = (vouchesRaw || []).map((v: Record<string, unknown>) => {
    const voucher = v.voucher as Record<string, unknown> | null;
    return {
      id: v.id as string,
      firstName: (voucher?.first_name as string) || "",
      lastName: (voucher?.last_name as string) || "",
      slug: (voucher?.slug as string) || "",
      title: (voucher?.title as string) || undefined,
      avatarColor: (voucher?.avatar_color as string) || "#0f172a",
      profileImageUrl: (voucher?.profile_image_url as string) || undefined,
    };
  });

  // Compute average rating from non-revoked reviews only
  const activeReviews = (reviewsRaw || []).filter(
    (r: Record<string, unknown>) => !r.is_revoked
  );
  const averageRating = activeReviews.length > 0
    ? activeReviews.reduce((sum, r) => sum + (r.rating as number), 0) / activeReviews.length
    : null;

  // Fetch invite codes using admin client to bypass RLS issues in server components
  let { data: inviteCodesRaw, error: inviteError } = await admin
    .from("invite_codes")
    .select("id, code, claimed, claimed_name, claimed_slug")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true });

  if (inviteError) {
    console.error("Invite codes fetch error:", inviteError.code, inviteError.message);
  }

  // Auto-generate codes for existing users who have none (skip if table-level error)
  if ((!inviteCodesRaw || inviteCodesRaw.length === 0) && !inviteError) {
    try {
      await generateCodesForUser(user.id);
      const result = await admin
        .from("invite_codes")
        .select("id, code, claimed, claimed_name, claimed_slug")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: true });
      inviteCodesRaw = result.data;
    } catch (e) {
      console.error("Failed to generate invite codes:", e);
    }
  }

  const inviteCodes = (inviteCodesRaw || []).map((c: Record<string, unknown>) => ({
    id: c.id as string,
    code: c.code as string,
    claimed: c.claimed as boolean,
    name: (c.claimed_name as string) || null,
    slug: (c.claimed_slug as string) || null,
  }));

  return (
    <DashboardClient
      tutor={tutor}
      userEmail={user.email || ""}
      vouchCount={vouchCount ?? 0}
      reviewCount={activeReviews.length}
      averageRating={averageRating}
      reviews={reviews}
      vouchers={vouchers}
      badges={badges}
      inquiryCount={inquiryCount ?? 0}
      inviteCodes={inviteCodes}
    />
  );
}
