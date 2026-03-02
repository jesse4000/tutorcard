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

async function getReferrals(tutorId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("referrals")
    .select("id, subject, location, grade_level, notes, created_at, referral_applications(id)")
    .eq("tutor_id", tutorId)
    .eq("status", "active")
    .order("created_at", { ascending: false });
  return data || [];
}

async function getCurrentTutorId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: tutor } = await supabase
    .from("tutors")
    .select("id")
    .eq("user_id", user.id)
    .single();
  return tutor?.id || null;
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
    openToReferrals: tutor.open_to_referrals || false,
  };

  const referrals = await getReferrals(tutor.id);
  const currentTutorId = await getCurrentTutorId();

  return (
    <ProfileClient
      tutor={tutorData}
      referrals={referrals}
      currentTutorId={currentTutorId}
      profileTutorId={tutor.id}
    />
  );
}
