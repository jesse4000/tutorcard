import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ReviewFlowClient from "./ReviewFlowClient";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ exam?: string; before?: string; after?: string; timeframe?: string }>;
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
  const description = `Leave a review for ${name} on TutorCard — share your experience and help other parents find great tutors.`;
  return {
    title: `Review ${name}`,
    description,
    alternates: {
      canonical: `/${slug}/review`,
    },
    openGraph: {
      title: `Review ${name} | TutorCard`,
      description,
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: `Review ${name} | TutorCard`,
      description,
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function ReviewPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const tutor = await getTutor(slug);
  if (!tutor) notFound();

  const supabase = await createClient();

  const { data: reviewsRaw } = await supabase
    .from("reviews")
    .select("id, rating")
    .eq("tutor_id", tutor.id);

  const reviews = reviewsRaw || [];
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.rating as number), 0) / reviews.length
    : null;

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
    <ReviewFlowClient
      tutor={tutorData}
      reviewCount={reviews.length}
      averageRating={averageRating}
      prefill={{
        exam: sp.exam || "",
        before: sp.before || "",
        after: sp.after || "",
        timeframe: sp.timeframe || "",
      }}
    />
  );
}
