import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ReferralViewClient from "./ReferralViewClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: referral } = await supabase
    .from("referrals")
    .select("subject, location")
    .eq("id", id)
    .single();

  if (!referral) return { title: "Referral not found" };
  return {
    title: `${referral.subject} referral — TutorCard`,
    description: `Tutoring referral for ${referral.subject} in ${referral.location}`,
  };
}

export default async function ReferralPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: referral } = await supabase
    .from("referrals")
    .select(
      `id, subject, location, grade_level, notes, status, created_at,
       tutor:tutors!referrals_tutor_id_fkey(id, first_name, last_name, avatar_color, slug)`
    )
    .eq("id", id)
    .single();

  if (!referral) notFound();

  let currentTutorId: string | null = null;
  let hasApplied = false;
  let applicationStatus: string | null = null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: currentTutor } = await supabase
      .from("tutors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (currentTutor) {
      currentTutorId = currentTutor.id;
      const { data: app } = await supabase
        .from("referral_applications")
        .select("id, status")
        .eq("referral_id", id)
        .eq("applicant_tutor_id", currentTutor.id)
        .maybeSingle();

      if (app) {
        hasApplied = true;
        applicationStatus = app.status;
      }
    }
  }

  const tutor = referral.tutor as unknown as {
    id: string;
    first_name: string;
    last_name: string;
    avatar_color: string;
    slug: string;
  } | null;

  return (
    <ReferralViewClient
      referral={{
        id: referral.id,
        subject: referral.subject,
        location: referral.location,
        grade_level: referral.grade_level,
        notes: referral.notes,
        status: referral.status,
        created_at: referral.created_at,
      }}
      poster={
        tutor
          ? {
              id: tutor.id,
              firstName: tutor.first_name,
              lastName: tutor.last_name,
              avatarColor: tutor.avatar_color,
              slug: tutor.slug,
            }
          : null
      }
      currentTutorId={currentTutorId}
      isOwnReferral={currentTutorId === tutor?.id}
      hasApplied={hasApplied}
      applicationStatus={applicationStatus}
    />
  );
}
