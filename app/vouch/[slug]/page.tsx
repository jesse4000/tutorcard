import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import VouchFlowClient from "./VouchFlowClient";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ action?: string }>;
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
  return {
    title: `Vouch for ${name} — TutorCard`,
    description: `Vouch for ${name} on TutorCard — a one-click endorsement that shows parents you trust their work.`,
    openGraph: {
      title: `Vouch for ${name} — TutorCard`,
      description: `Vouch for ${name} on TutorCard`,
      type: "profile",
    },
  };
}

export default async function VouchPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { action } = await searchParams;
  const tutor = await getTutor(slug);
  if (!tutor) notFound();

  const supabase = await createClient();

  // Parallel data fetching
  const [
    { count: vouchCount },
    { data: reviewsRaw },
  ] = await Promise.all([
    supabase
      .from("vouches")
      .select("id", { count: "exact", head: true })
      .eq("vouched_tutor_id", tutor.id),
    supabase
      .from("reviews")
      .select("id, rating")
      .eq("tutor_id", tutor.id),
  ]);

  // Compute average rating
  const reviews = reviewsRaw || [];
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.rating as number), 0) / reviews.length
    : null;

  // Check auth state
  const { data: { user } } = await supabase.auth.getUser();
  let isAuthenticated = false;
  let hasTutorCard = false;
  let hasAlreadyVouched = false;

  if (user) {
    isAuthenticated = true;
    const { data: currentTutor } = await supabase
      .from("tutors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (currentTutor) {
      hasTutorCard = true;
      const { data: vouch } = await supabase
        .from("vouches")
        .select("id")
        .eq("voucher_tutor_id", currentTutor.id)
        .eq("vouched_tutor_id", tutor.id)
        .maybeSingle();
      hasAlreadyVouched = !!vouch;
    }
  }

  const tutorData = {
    id: tutor.id,
    firstName: tutor.first_name,
    lastName: tutor.last_name,
    title: tutor.title || "",
    slug: tutor.slug,
    avatarColor: tutor.avatar_color || "#0f172a",
    exams: tutor.exams || [],
    locations: tutor.locations || [],
    profileImageUrl: tutor.profile_image_url || "",
  };

  return (
    <VouchFlowClient
      tutor={tutorData}
      vouchCount={vouchCount ?? 0}
      averageRating={averageRating}
      reviewCount={reviews.length}
      isAuthenticated={isAuthenticated}
      hasTutorCard={hasTutorCard}
      hasAlreadyVouched={hasAlreadyVouched}
      autoComplete={action === "complete"}
    />
  );
}
