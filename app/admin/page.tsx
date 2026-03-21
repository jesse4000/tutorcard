import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { autoRevokeExpiredReports } from "@/lib/auto-revoke";
import SuperAdminDashboard from "./SuperAdminDashboard";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

function countInRange(
  items: { created_at: string }[],
  daysAgoStart: number,
  daysAgoEnd: number
): number {
  const now = Date.now();
  const start = now - daysAgoStart * 86_400_000;
  const end = now - daysAgoEnd * 86_400_000;
  return items.filter((i) => {
    const t = new Date(i.created_at).getTime();
    return t >= start && t < end;
  }).length;
}

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  const allowedEmails = (process.env.SUPERADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!user.email || !allowedEmails.includes(user.email.toLowerCase())) {
    redirect("/dashboard");
  }

  // Use service role client to bypass RLS (needed for inquiries)
  const admin = createAdminClient();

  // Auto-revoke expired pending reports
  await autoRevokeExpiredReports(admin);

  const [
    { data: tutorsRaw },
    { data: reviewsRaw },
    { data: vouchesRaw },
    { data: badgesRaw },
    { data: inquiriesRaw },
    { data: reportsRaw },
    { data: cardViewsRaw },
  ] = await Promise.all([
    admin.from("tutors").select("*"),
    admin.from("reviews").select("id, tutor_id, reviewer_name, exam, rating, quote, created_at, is_revoked"),
    admin.from("vouches").select("id, voucher_tutor_id, vouched_tutor_id, created_at"),
    admin.from("badges").select("id, tutor_id, created_at"),
    admin.from("inquiries").select("id, tutor_id, sender_name, created_at"),
    admin.from("review_reports").select("id, review_id, tutor_id, reason, reviewer_response, status, created_at, deadline_at, responded_at, resolved_at, resolved_by").order("created_at", { ascending: false }),
    admin.from("card_views").select("tutor_id, visitor_hash, created_at"),
  ]);

  const tutors = tutorsRaw || [];
  const reviews = reviewsRaw || [];
  const vouches = vouchesRaw || [];
  const badges = badgesRaw || [];
  const inquiries = inquiriesRaw || [];
  const reports = reportsRaw || [];
  const cardViews = cardViewsRaw || [];

  // Log if review_reports query returned null (table may not exist)
  if (!reportsRaw && tutors.length > 0) {
    console.warn("Admin: review_reports query returned null — migration may not be applied");
  }

  // --- Stats ---
  const stats = {
    totalTutors: tutors.length,
    totalReviews: reviews.length,
    totalVouches: vouches.length,
    totalInquiries: inquiries.length,
    signupsThisWeek: countInRange(
      tutors.map((t) => ({ created_at: t.created_at })),
      7,
      0
    ),
    signupsLastWeek: countInRange(
      tutors.map((t) => ({ created_at: t.created_at })),
      14,
      7
    ),
    reviewsThisWeek: countInRange(reviews, 7, 0),
    reviewsLastWeek: countInRange(reviews, 14, 7),
    vouchesThisWeek: countInRange(vouches, 7, 0),
    vouchesLastWeek: countInRange(vouches, 14, 7),
    inquiriesThisWeek: countInRange(inquiries, 7, 0),
    inquiriesLastWeek: countInRange(inquiries, 14, 7),
    totalCardViews: cardViews.length,
    uniqueCardViewers: new Set(cardViews.map((v) => v.visitor_hash as string)).size,
    viewsThisWeek: countInRange(cardViews, 7, 0),
    viewsLastWeek: countInRange(cardViews, 14, 7),
  };

  // --- Funnel ---
  const isComplete = (t: Record<string, unknown>) =>
    !!t.title &&
    Array.isArray(t.exams) &&
    (t.exams as string[]).length > 0 &&
    Array.isArray(t.locations) &&
    (t.locations as string[]).length > 0;

  const tutorsWithReview = new Set(reviews.map((r) => r.tutor_id));
  const tutorsWithVouch = new Set(vouches.map((v) => v.vouched_tutor_id));
  const tutorsWithInquiry = new Set(inquiries.map((i) => i.tutor_id));

  const funnel = {
    signedUp: tutors.length,
    cardComplete: tutors.filter(isComplete).length,
    firstReviewReceived: tutorsWithReview.size,
    firstVouchReceived: tutorsWithVouch.size,
    firstInquiry: tutorsWithInquiry.size,
  };

  // --- Per-tutor counts ---
  const countByTutor = (items: { tutor_id?: string; vouched_tutor_id?: string }[], key: "tutor_id" | "vouched_tutor_id" = "tutor_id") => {
    const map = new Map<string, number>();
    for (const item of items) {
      const id = (item as Record<string, string>)[key];
      if (id) map.set(id, (map.get(id) || 0) + 1);
    }
    return map;
  };

  const reviewsByTutor = countByTutor(reviews);
  const vouchesByTutor = countByTutor(vouches, "vouched_tutor_id");
  const badgesByTutor = countByTutor(badges);
  const inquiriesByTutor = countByTutor(inquiries);
  const viewsByTutor = countByTutor(cardViews);

  // Unique visitors per tutor
  const uniqueVisitorsByTutor = new Map<string, Set<string>>();
  for (const v of cardViews) {
    const tid = v.tutor_id as string;
    if (!uniqueVisitorsByTutor.has(tid)) uniqueVisitorsByTutor.set(tid, new Set());
    uniqueVisitorsByTutor.get(tid)!.add(v.visitor_hash as string);
  }

  // --- Last activity per tutor ---
  const lastActivityMap = new Map<string, number>();
  const updateLastActivity = (id: string, dateStr: string) => {
    const t = new Date(dateStr).getTime();
    const current = lastActivityMap.get(id) || 0;
    if (t > current) lastActivityMap.set(id, t);
  };
  for (const r of reviews) updateLastActivity(r.tutor_id, r.created_at);
  for (const v of vouches) updateLastActivity(v.vouched_tutor_id, v.created_at);
  for (const b of badges) updateLastActivity(b.tutor_id, b.created_at);
  for (const i of inquiries) updateLastActivity(i.tutor_id, i.created_at);

  const thirtyDaysAgo = Date.now() - 30 * 86_400_000;

  // --- Build tutor rows ---
  const tutorRows = tutors.map((t) => {
    const complete = isComplete(t);
    const lastActivity = lastActivityMap.get(t.id) || new Date(t.created_at).getTime();
    const joinedTime = new Date(t.created_at).getTime();

    let status: "active" | "inactive" | "incomplete";
    if (!complete) {
      status = "incomplete";
    } else if (lastActivity >= thirtyDaysAgo || joinedTime >= thirtyDaysAgo) {
      status = "active";
    } else {
      status = "inactive";
    }

    const physicalLocations = (t.locations as string[] || []).filter(
      (l: string) => !/remote|online/i.test(l)
    );
    const location = physicalLocations[0] || (t.locations as string[])?.[0] || "";

    return {
      id: t.id,
      userId: t.user_id as string,
      name: [t.first_name, t.last_name].filter(Boolean).join(" "),
      headline: t.title || "",
      email: (t.email as string) || "",
      location,
      specialties: (t.exams as string[]) || [],
      reviews: reviewsByTutor.get(t.id) || 0,
      vouches: vouchesByTutor.get(t.id) || 0,
      badges: badgesByTutor.get(t.id) || 0,
      inquiries: inquiriesByTutor.get(t.id) || 0,
      views: viewsByTutor.get(t.id) || 0,
      uniqueVisitors: uniqueVisitorsByTutor.get(t.id)?.size || 0,
      status,
      joined: t.created_at,
      slug: t.slug as string,
      avatarColor: (t.avatar_color as string) || "#111",
      allLocations: (t.locations as string[]) || [],
      subjects: (t.subjects as string[]) || [],
      businessName: (t.business_name as string) || null,
      yearsExperience: (t.years_experience as number) || null,
      profileImageUrl: (t.profile_image_url as string) || null,
      links: (t.links as { label: string; url: string; icon?: string }[]) || [],
      isSuspended: false, // updated below from auth data
    };
  });

  // --- Fetch auth users to check banned status and get account emails ---
  try {
    const { data: authUsersData } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (authUsersData?.users) {
      const authUserMap = new Map(authUsersData.users.map((u) => [u.id, u]));
      for (const row of tutorRows) {
        const authUser = authUserMap.get(row.userId);
        if (authUser) {
          if (authUser.email) {
            row.email = authUser.email;
          }
          if (authUser.banned_until && new Date(authUser.banned_until).getTime() > Date.now()) {
            row.isSuspended = true;
          }
        }
      }
    }
  } catch (err) {
    console.warn("Failed to fetch auth users:", err);
  }

  // --- Build recent activity per tutor ---
  const tutorNameMapById = new Map(tutors.map((t) => [t.id, [t.first_name, t.last_name].filter(Boolean).join(" ")]));
  const recentActivity: Record<string, {
    reviews: { reviewerName: string; exam: string | null; rating: number; quote: string; date: string }[];
    vouches: { voucherName: string; date: string }[];
    inquiries: { studentName: string | null; date: string }[];
  }> = {};

  for (const t of tutors) {
    const tid = t.id as string;
    // Recent reviews (last 5)
    const tutorReviews = reviews
      .filter((r) => r.tutor_id === tid)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map((r) => ({
        reviewerName: (r.reviewer_name as string) || "Anonymous",
        exam: (r.exam as string) || null,
        rating: (r.rating as number) || 0,
        quote: (r.quote as string) || "",
        date: r.created_at,
      }));

    // Recent vouches (last 5)
    const tutorVouches = vouches
      .filter((v) => v.vouched_tutor_id === tid)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map((v) => ({
        voucherName: tutorNameMapById.get(v.voucher_tutor_id as string) || "Unknown",
        date: v.created_at,
      }));

    // Recent inquiries (last 5)
    const tutorInquiries = inquiries
      .filter((i) => i.tutor_id === tid)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map((i) => ({
        studentName: (i.sender_name as string) || null,
        date: i.created_at,
      }));

    recentActivity[tid] = { reviews: tutorReviews, vouches: tutorVouches, inquiries: tutorInquiries };
  }

  // --- Dynamic filter lists ---
  const allLocations = new Set<string>();
  const allExams = new Set<string>();
  for (const t of tutors) {
    for (const loc of (t.locations as string[]) || []) {
      if (!/remote|online/i.test(loc)) allLocations.add(loc);
    }
    for (const exam of (t.exams as string[]) || []) allExams.add(exam);
  }

  // --- Build review report rows for admin ---
  // We need to get review details for reports
  const reportReviewIds = [...new Set(reports.map((r) => r.review_id))];
  let reviewDetailsMap = new Map<string, Record<string, unknown>>();
  if (reportReviewIds.length > 0) {
    const { data: reviewDetails } = await admin
      .from("reviews")
      .select("id, reviewer_name, reviewer_email, exam, quote, rating")
      .in("id", reportReviewIds);
    if (reviewDetails) {
      reviewDetailsMap = new Map(reviewDetails.map((r) => [r.id, r]));
    }
  }

  // Build tutor name map from already-fetched tutors
  const tutorNameMap = new Map(tutors.map((t) => [t.id, { name: [t.first_name, t.last_name].filter(Boolean).join(" "), slug: t.slug as string }]));

  const reviewReports = reports.map((r) => {
    const review = reviewDetailsMap.get(r.review_id) || {};
    const tutorInfo = tutorNameMap.get(r.tutor_id) || { name: "Unknown", slug: "" };
    return {
      id: r.id as string,
      reviewId: r.review_id as string,
      tutorName: tutorInfo.name,
      tutorSlug: tutorInfo.slug,
      reviewerName: (review.reviewer_name as string) || "Unknown",
      reviewerEmail: (review.reviewer_email as string) || null,
      reviewExam: (review.exam as string) || null,
      reviewQuote: (review.quote as string) || "",
      reviewRating: (review.rating as number) || 0,
      reason: r.reason as string,
      reviewerResponse: (r.reviewer_response as string) || null,
      status: r.status as string,
      createdAt: r.created_at as string,
      deadlineAt: r.deadline_at as string,
      respondedAt: (r.responded_at as string) || null,
      resolvedAt: (r.resolved_at as string) || null,
      resolvedBy: (r.resolved_by as string) || null,
    };
  });

  return (
    <SuperAdminDashboard
      stats={stats}
      funnel={funnel}
      tutors={tutorRows}
      locations={Array.from(allLocations).sort()}
      exams={Array.from(allExams).sort()}
      reviewReports={reviewReports}
      recentActivity={recentActivity}
    />
  );
}
