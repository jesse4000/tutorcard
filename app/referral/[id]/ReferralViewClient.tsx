"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import LogoSvg from "@/components/LogoSvg";

interface ReferralViewProps {
  referral: {
    id: string;
    subject: string;
    location: string;
    grade_level: string;
    notes: string;
    status: string;
    created_at: string;
  };
  poster: {
    id: string;
    firstName: string;
    lastName: string;
    avatarColor: string;
    slug: string;
  } | null;
  currentTutorId: string | null;
  isOwnReferral: boolean;
  hasApplied: boolean;
  applicationStatus: string | null;
}

export default function ReferralViewClient({
  referral,
  poster,
  currentTutorId,
  isOwnReferral,
  hasApplied: initialHasApplied,
  applicationStatus: initialStatus,
}: ReferralViewProps) {
  const router = useRouter();
  const [hasApplied, setHasApplied] = useState(initialHasApplied);
  const [applicationStatus, setApplicationStatus] = useState(initialStatus);
  const [applying, setApplying] = useState(false);

  const isClosed = referral.status !== "active";
  const initials = poster
    ? [poster.firstName?.[0], poster.lastName?.[0]].filter(Boolean).join("")
    : "?";

  async function handleApply() {
    if (!currentTutorId) {
      router.push(`/login?redirect=/referral/${referral.id}`);
      return;
    }
    if (applying || hasApplied) return;

    setApplying(true);
    try {
      const res = await fetch("/api/referrals/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralId: referral.id }),
      });
      if (res.ok) {
        setHasApplied(true);
        setApplicationStatus("pending");
      }
    } catch {
      alert("Failed to apply");
    }
    setApplying(false);
  }

  const postedDate = new Date(referral.created_at).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" }
  );

  return (
    <>
      <Navbar mode="profile" />
      <div className="referral-view-page">
        <div className="referral-view-card">
          <div className="referral-view-subject">{referral.subject}</div>
          <div className="referral-view-meta">
            {[referral.location, referral.grade_level]
              .filter(Boolean)
              .join(" · ")}
          </div>

          {referral.notes && (
            <div className="referral-view-notes">
              &quot;{referral.notes}&quot;
            </div>
          )}

          <div className="referral-view-date">Posted {postedDate}</div>

          {poster && (
            <div className="referral-view-poster">
              <div
                className="referral-view-avatar"
                style={{ background: poster.avatarColor || "#0f172a" }}
              >
                {initials}
              </div>
              <div>
                <div className="referral-view-poster-name">
                  Listed by{" "}
                  <a href={`/${poster.slug}`} className="referral-view-link">
                    {poster.firstName} {poster.lastName}
                  </a>
                </div>
              </div>
            </div>
          )}

          {isClosed && (
            <div className="referral-view-closed">
              This referral is no longer active.
            </div>
          )}

          {!isClosed && !isOwnReferral && !hasApplied && (
            <button
              className="btn-next referral-view-apply"
              onClick={handleApply}
              disabled={applying}
            >
              {applying
                ? "Applying..."
                : currentTutorId
                  ? "Apply to this referral"
                  : "Sign in to apply"}
            </button>
          )}

          {!isClosed && hasApplied && (
            <div className={`referral-view-status ${applicationStatus}`}>
              {applicationStatus === "pending" && "Application submitted — waiting for response"}
              {applicationStatus === "accepted" && "You've been accepted for this referral!"}
              {applicationStatus === "declined" && "Your application was declined"}
            </div>
          )}

          {isOwnReferral && (
            <div className="referral-view-own">
              This is your referral.{" "}
              <Link href="/dashboard" className="referral-view-link">
                Manage it on your dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
      <footer>
        <Link href="/" className="logo">
          <div className="logo-mark">
            <LogoSvg />
          </div>
          <span className="logo-name">TutorCard</span>
          <span className="logo-sub">&nbsp;by StudySpaces</span>
        </Link>
        <span className="footer-r">
          © 2025 StudySpaces · Free for every tutor
        </span>
      </footer>
    </>
  );
}
