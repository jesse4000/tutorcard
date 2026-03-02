"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "@/components/Navbar";
import TutorCard from "@/components/TutorCard";
import ReferralManager from "@/components/ReferralManager";
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
  const [showQR, setShowQR] = useState(false);

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
        <div className="dashboard-card-wrap">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Your card</h1>
            <div className="dashboard-actions">
              <Link href="/dashboard/edit" className="dash-icon-btn" title="Edit card">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11.3 1.7a1.6 1.6 0 0 1 2.3 0l.7.7a1.6 1.6 0 0 1 0 2.3L5.7 13.3 2 14l.7-3.7z" />
                </svg>
              </Link>
              <a
                href={`/${tutor.slug}`}
                className="dash-icon-btn"
                target="_blank"
                rel="noopener noreferrer"
                title="View live"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3H3v10h10v-3" />
                  <path d="M9 1h6v6" />
                  <path d="M15 1 7 9" />
                </svg>
              </a>
            </div>
          </div>
          <TutorCard data={tutorData} variant="full" />

          {/* QR banner */}
          <div className="qr-banner" onClick={() => setShowQR(true)}>
            <div className="qr-banner-info">
              <span className="qr-banner-label">Show QR code</span>
              <span className="qr-banner-url">
                {typeof window !== "undefined" ? window.location.host : ""}/{tutor.slug}
              </span>
            </div>
            <QRCodeSVG
              value={typeof window !== "undefined" ? `${window.location.origin}/${tutor.slug}` : `/${tutor.slug}`}
              size={56}
              level="M"
            />
          </div>
        </div>

        {/* Referral Manager */}
        <div className="dashboard-referrals">
          <ReferralManager />
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="qr-overlay" onClick={() => setShowQR(false)}>
          <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
            <button className="qr-close" onClick={() => setShowQR(false)}>
              &times;
            </button>
            <h2 className="qr-heading">Scan to view card</h2>
            <p className="qr-sub">
              {typeof window !== "undefined" ? window.location.host : ""}/{tutor.slug}
            </p>
            <div className="qr-code-wrap">
              <QRCodeSVG
                value={typeof window !== "undefined" ? `${window.location.origin}/${tutor.slug}` : `/${tutor.slug}`}
                size={220}
                level="M"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
