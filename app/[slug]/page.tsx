import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { autoRevokeExpiredReports } from "@/lib/auto-revoke";
import ProfileClient from "./ProfileClient";
import type { ReviewData, VoucherData, BadgeData } from "./types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getTutor(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tutors")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data;
}


export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tutor = await getTutor(slug);
  if (!tutor) return { title: "Card not found" };

  const name = `${tutor.first_name} ${tutor.last_name}`;
  const title = tutor.title || "Tutor";
  const exams = tutor.exams || [];
  const locations = tutor.locations || [];
  const description = `${name} — ${title}.${exams.length ? ` ${exams.join(", ")} tutor` : ""}${locations.length ? ` in ${locations[0]}` : ""}. View verified reviews, peer vouches, and credentials on TutorCard.`;

  return {
    title: name,
    description,
    alternates: {
      canonical: `/${slug}`,
    },
    openGraph: {
      title: `${name} — ${title}`,
      description,
      type: "profile",
      url: `/${slug}`,
      images: tutor.profile_image_url
        ? [{ url: tutor.profile_image_url, width: 400, height: 400, alt: name }]
        : undefined,
    },
    twitter: {
      card: tutor.profile_image_url ? "summary" : "summary_large_image",
      title: `${name} — ${title}`,
      description,
      images: tutor.profile_image_url ? [tutor.profile_image_url] : undefined,
    },
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const tutor = await getTutor(slug);
  if (!tutor) notFound();

  const supabase = await createClient();

  // Check if current visitor is the card owner → redirect to dashboard
  const { data: { user } } = await supabase.auth.getUser();
  if (user && user.id === tutor.user_id) {
    redirect("/dashboard");
  }

  // Auto-revoke any expired pending reports (replaces cron job)
  await autoRevokeExpiredReports(createAdminClient());

  // Parallel data fetching
  const [
    { count: vouchCount },
    { data: reviewsRaw, error: reviewsError },
    { data: badgesRaw },
    { data: vouchesRaw },
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
  ]);

  // Check if current visitor has vouched
  let currentTutorId: string | null = null;
  let hasVouched = false;
  if (user) {
    const { data: currentTutor } = await supabase
      .from("tutors")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (currentTutor) {
      currentTutorId = currentTutor.id;
      const { data: vouch } = await supabase
        .from("vouches")
        .select("id")
        .eq("voucher_tutor_id", currentTutor.id)
        .eq("vouched_tutor_id", tutor.id)
        .maybeSingle();
      hasVouched = !!vouch;
    }
  }

  if (reviewsError) {
    console.error("Failed to fetch reviews:", reviewsError.message);
  }

  // Map reviews (filter out revoked reviews defensively in JS)
  const reviews: ReviewData[] = (reviewsRaw || [])
    .filter((r: Record<string, unknown>) => !r.is_revoked)
    .map((r: Record<string, unknown>) => ({
    id: r.id as string,
    reviewerName: r.reviewer_name as string,
    reviewerRole: (r.reviewer_role as string) || undefined,
    exam: (r.exam as string) || undefined,
    scoreBefore: (r.score_before as string) || undefined,
    scoreAfter: (r.score_after as string) || undefined,
    months: (r.months as number) || undefined,
    rating: r.rating as number,
    quote: r.quote as string,
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

  // Compute average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null;

  const tutorData = {
    id: tutor.id,
    firstName: tutor.first_name,
    lastName: tutor.last_name,
    title: tutor.title || "",
    slug: tutor.slug,
    avatarColor: tutor.avatar_color || "#0f172a",
    exams: tutor.exams || [],
    subjects: tutor.subjects || [],
    locations: tutor.locations || [],
    links: tutor.links || [],
    businessName: tutor.business_name || "",
    profileImageUrl: tutor.profile_image_url || "",
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tutorcard.co";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: `${tutor.first_name} ${tutor.last_name}`,
    url: `${siteUrl}/${tutor.slug}`,
    jobTitle: tutor.title || "Tutor",
    ...(tutor.profile_image_url && { image: tutor.profile_image_url }),
    ...(tutor.locations?.length && {
      address: {
        "@type": "PostalAddress",
        addressLocality: tutor.locations[0],
      },
    }),
    ...(tutor.business_name && {
      worksFor: {
        "@type": "Organization",
        name: tutor.business_name,
      },
    }),
    knowsAbout: [...(tutor.subjects || []), ...(tutor.exams || [])],
    ...(averageRating && reviews.length > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: averageRating.toFixed(1),
        reviewCount: reviews.length,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProfileClient
        tutor={tutorData}
        vouchCount={vouchCount ?? 0}
        hasVouched={hasVouched}
        currentTutorId={currentTutorId}
        viewedTutorId={tutor.id}
        isLoggedIn={!!user}
        averageRating={averageRating}
        reviewCount={reviews.length}
        reviews={reviews}
        vouchers={vouchers}
        badges={badges}
      />
    </>
  );
}
