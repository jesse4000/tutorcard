"use client";

import TutorForm from "@/components/TutorForm";
import type { TutorFormData } from "@/components/TutorForm";
import type { TutorLink } from "@/components/TutorCard";

interface TutorRow {
  id: string;
  first_name: string;
  last_name: string;
  title: string | null;
  slug: string;
  avatar_color: string;
  exams: string[];
  subjects: string[];
  locations: string[];
  links: TutorLink[];
  notify_on_match: boolean;
  email: string;
  business_name: string | null;
  years_experience: number | null;
  profile_image_url: string | null;
}

export default function EditClient({ tutor }: { tutor: TutorRow }) {
  const initialData: TutorFormData = {
    id: tutor.id,
    firstName: tutor.first_name,
    lastName: tutor.last_name,
    title: tutor.title || "",
    slug: tutor.slug,
    avatarColor: tutor.avatar_color || "#0f172a",
    exams: tutor.exams || [],
    subjects: tutor.subjects || [],
    locations: tutor.locations || [],
    links:
      tutor.links?.length > 0
        ? tutor.links
        : [{ type: "🌐 Website", url: "", label: "" }],
    notifyOnMatch: tutor.notify_on_match || false,
    email: tutor.email || "",
    businessName: tutor.business_name || "",
    profileImageUrl: tutor.profile_image_url || "",
  };

  return <TutorForm mode="edit" initialData={initialData} />;
}
