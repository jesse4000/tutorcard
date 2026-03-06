import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProfileClient from "./ProfileClient";

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
  return {
    title: `${name} — TutorCard`,
    description: tutor.title || `${name}'s tutor card on StudySpaces`,
    openGraph: {
      title: `${name} — TutorCard`,
      description: tutor.title || `${name}'s tutor card on StudySpaces`,
      type: "profile",
    },
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const tutor = await getTutor(slug);
  if (!tutor) notFound();

  const supabase = await createClient();

  // Vouch count
  const { count: vouchCount } = await supabase
    .from("vouches")
    .select("id", { count: "exact", head: true })
    .eq("vouched_tutor_id", tutor.id);

  // Check if current visitor is logged in and has vouched
  let currentTutorId: string | null = null;
  let hasVouched = false;
  const { data: { user } } = await supabase.auth.getUser();
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

  const tutorData = {
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

  return (
    <ProfileClient
      tutor={tutorData}
      vouchCount={vouchCount ?? 0}
      hasVouched={hasVouched}
      currentTutorId={currentTutorId}
      viewedTutorId={tutor.id}
    />
  );
}
