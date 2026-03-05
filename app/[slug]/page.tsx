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

  return (
    <ProfileClient
      tutor={tutorData}
    />
  );
}
