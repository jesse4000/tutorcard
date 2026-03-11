import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import SuperAdminDashboard from "./SuperAdminDashboard";

export const metadata: Metadata = {
  title: "Admin — TutorCard",
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

  const [
    { data: tutorsRaw },
    { data: reviewsRaw },
    { data: vouchesRaw },
    { data: badgesRaw },
    { data: inquiriesRaw },
  ] = await Promise.all([
    admin.from("tutors").select("*"),
    admin.from("reviews").select("id, tutor_id, created_at"),
    admin.from("vouches").select("id, vouched_tutor_id, created_at"),
    admin.from("badges").select("id, tutor_id, created_at"),
    admin.from("inquiries").select("id, tutor_id, created_at"),
  ]);

  const tutors = tutorsRaw || [];
  const reviews = reviewsRaw || [];
  const vouches = vouchesRaw || [];
  const badges = badgesRaw || [];
  const inquiries = inquiriesRaw || [];

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
      name: [t.first_name, t.last_name].filter(Boolean).join(" "),
      headline: t.title || "",
      location,
      specialties: (t.exams as string[]) || [],
      reviews: reviewsByTutor.get(t.id) || 0,
      vouches: vouchesByTutor.get(t.id) || 0,
      badges: badgesByTutor.get(t.id) || 0,
      inquiries: inquiriesByTutor.get(t.id) || 0,
      status,
      joined: t.created_at,
      slug: t.slug as string,
    };
  });

  // --- Dynamic filter lists ---
  const allLocations = new Set<string>();
  const allExams = new Set<string>();
  for (const t of tutors) {
    for (const loc of (t.locations as string[]) || []) {
      if (!/remote|online/i.test(loc)) allLocations.add(loc);
    }
    for (const exam of (t.exams as string[]) || []) allExams.add(exam);
  }

  return (
    <SuperAdminDashboard
      stats={stats}
      funnel={funnel}
      tutors={tutorRows}
      locations={Array.from(allLocations).sort()}
      exams={Array.from(allExams).sort()}
    />
  );
}
