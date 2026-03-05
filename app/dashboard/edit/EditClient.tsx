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
  profile_image: string | null;
  business_name: string | null;
  years_in_business: number | null;
  phone: string | null;
  facebook: string | null;
  linkedin: string | null;
  instagram: string | null;
  exams: string[];
  subjects: string[];
  locations: string[];
  links: TutorLink[];
  open_to_referrals: boolean;
  notify_on_match: boolean;
  email: string;
}

export default function EditClient({ tutor }: { tutor: TutorRow }) {
  const initialData: TutorFormData = {
    id: tutor.id,
    firstName: tutor.first_name,
    lastName: tutor.last_name,
    title: tutor.title || "",
    slug: tutor.slug,
    avatarColor: tutor.avatar_color || "#0f172a",
    profileImage: tutor.profile_image || "",
    businessName: tutor.business_name || "",
    yearsInBusiness: tutor.years_in_business || undefined,
    phone: tutor.phone || "",
    facebook: tutor.facebook || "",
    linkedin: tutor.linkedin || "",
    instagram: tutor.instagram || "",
    exams: tutor.exams || [],
    subjects: tutor.subjects || [],
    locations: tutor.locations || [],
    links:
      tutor.links?.length > 0
        ? tutor.links
        : [{ type: "🌐 Website", url: "", label: "" }],
    openToReferrals: tutor.open_to_referrals || false,
    notifyOnMatch: tutor.notify_on_match || false,
    email: tutor.email || "",
  };

  return <TutorForm mode="edit" initialData={initialData} />;
}
