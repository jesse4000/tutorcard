"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import TutorCard from "@/components/TutorCard";
import { createClient } from "@/lib/supabase/client";
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
  open_to_referrals: boolean;
  notify_on_match: boolean;
  email: string;
}

interface DashboardClientProps {
  tutor: TutorRow | null;
  userEmail: string;
}

export default function DashboardClient({
  tutor,
  userEmail,
}: DashboardClientProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (!tutor) {
    return (
      <>
        <Navbar
          mode="dashboard"
          userEmail={userEmail}
          onSignOut={handleSignOut}
        />
        <div className="dashboard-page">
          <div className="dashboard-empty">
            <div style={{ fontSize: 48, marginBottom: 16 }}>📇</div>
            <h1 className="dashboard-title">Create your first card</h1>
            <p className="dashboard-sub">
              You don&apos;t have a tutor card yet. Create one to start sharing
              your profile with parents and students.
            </p>
            <Link href="/create" className="btn-next" style={{ display: "inline-flex" }}>
              Create my card
            </Link>
          </div>
        </div>
      </>
    );
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
    openToReferrals: tutor.open_to_referrals || false,
  };

  return (
    <>
      <Navbar
        mode="dashboard"
        userEmail={userEmail}
        onSignOut={handleSignOut}
      />
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Your card</h1>
          <div className="dashboard-actions">
            <Link href="/dashboard/edit" className="btn-next">
              Edit card
            </Link>
            <a
              href={`/${tutor.slug}`}
              className="btn-back"
              target="_blank"
              rel="noopener noreferrer"
            >
              View live →
            </a>
          </div>
        </div>
        <div className="dashboard-card-wrap">
          <TutorCard data={tutorData} variant="full" />
        </div>
      </div>
    </>
  );
}
