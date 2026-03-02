"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import TutorCard from "@/components/TutorCard";
import type { TutorData } from "@/components/TutorCard";
import LogoSvg from "@/components/LogoSvg";

interface ReferralApp {
  id: string;
}

interface Referral {
  id: string;
  subject: string;
  location: string;
  grade_level: string;
  notes: string;
  created_at: string;
  referral_applications: ReferralApp[];
}

interface ProfileClientProps {
  tutor: TutorData;
  referrals: Referral[];
  currentTutorId: string | null;
  profileTutorId: string;
}

function buildVCard(tutor: TutorData): string {
  const fullName = [tutor.firstName, tutor.lastName].filter(Boolean).join(" ");
  const emailLink = tutor.links.find((l) => l.type === "📧 Email");
  const websiteLink = tutor.links.find((l) => l.type === "🌐 Website");
  const escape = (s: string) => s.replace(/[;,\\]/g, (c) => "\\" + c);

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escape(fullName)}`,
    `N:${escape(tutor.lastName || "")};${escape(tutor.firstName || "")};;;`,
  ];
  if (tutor.title) lines.push(`TITLE:${escape(tutor.title)}`);
  if (emailLink?.url) lines.push(`EMAIL:${emailLink.url}`);
  if (websiteLink?.url) {
    const url = websiteLink.url.startsWith("http")
      ? websiteLink.url
      : `https://${websiteLink.url}`;
    lines.push(`URL:${url}`);
  }
  lines.push(`NOTE:${escape([...tutor.exams, ...tutor.subjects].join(", "))}`);
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

function downloadVCard(tutor: TutorData) {
  const vcf = buildVCard(tutor);
  const blob = new Blob([vcf], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${tutor.firstName}-${tutor.lastName}.vcf`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ProfileClient({
  tutor,
  referrals,
  currentTutorId,
  profileTutorId,
}: ProfileClientProps) {
  const router = useRouter();
  const [showReferrals, setShowReferrals] = useState(false);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [appliedTo, setAppliedTo] = useState<Set<string>>(new Set());
  const [showCoffee, setShowCoffee] = useState<string | null>(null);

  const isOwnCard = currentTutorId === profileTutorId;
  const activeReferrals = referrals;

  async function handleApply(referralId: string, boughtCoffee = false) {
    // Not logged in — redirect to create a card
    if (!currentTutorId) {
      router.push(`/signup?redirect=/${tutor.slug}&apply=${referralId}`);
      return;
    }

    setApplyingTo(referralId);
    try {
      const res = await fetch("/api/referrals/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralId, boughtCoffee }),
      });

      const data = await res.json();

      if (res.ok) {
        setAppliedTo((prev) => new Set(prev).add(referralId));
        setShowCoffee(null);
      } else {
        alert(data.error || "Failed to apply");
      }
    } catch {
      alert("Network error. Please try again.");
    }
    setApplyingTo(null);
  }

  return (
    <>
      <Navbar mode="profile" />
      <div className="profile-page">
        <div className="profile-card-wrap">
          <TutorCard
            data={tutor}
            variant="full"
            referralCount={activeReferrals.length}
            onReferralClick={
              activeReferrals.length > 0
                ? () => setShowReferrals(!showReferrals)
                : undefined
            }
          />

          {/* Referrals expandable section */}
          {showReferrals && activeReferrals.length > 0 && (
            <div className="profile-referrals">
              <div className="profile-ref-header">
                <h3 className="profile-ref-title">Active Referrals</h3>
                <span className="profile-ref-count">
                  {activeReferrals.length}
                </span>
              </div>
              {activeReferrals.map((ref) => {
                const hasApplied = appliedTo.has(ref.id);
                const isApplying = applyingTo === ref.id;
                const appCount = ref.referral_applications?.length || 0;

                return (
                  <div key={ref.id} className="profile-ref-card">
                    <div className="profile-ref-info">
                      <div className="profile-ref-subject">{ref.subject}</div>
                      <div className="profile-ref-meta">
                        {[ref.location, ref.grade_level]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                      {ref.notes && (
                        <div className="profile-ref-notes">
                          &quot;{ref.notes}&quot;
                        </div>
                      )}
                      <div className="profile-ref-app-count">
                        {appCount} tutor{appCount !== 1 ? "s" : ""} applied
                      </div>
                    </div>

                    {!isOwnCard && (
                      <div className="profile-ref-actions">
                        {hasApplied ? (
                          <span className="profile-ref-applied">
                            Applied ✓
                          </span>
                        ) : showCoffee === ref.id ? (
                          <div className="profile-ref-coffee-prompt">
                            <button
                              className="profile-ref-apply-btn"
                              onClick={() => handleApply(ref.id, false)}
                              disabled={isApplying}
                            >
                              {isApplying ? "Applying..." : "Just apply"}
                            </button>
                            <button
                              className="profile-ref-coffee-btn"
                              onClick={() => handleApply(ref.id, true)}
                              disabled={isApplying}
                            >
                              ☕ Apply + buy a coffee
                            </button>
                          </div>
                        ) : (
                          <button
                            className="profile-ref-apply-btn"
                            onClick={() => {
                              if (!currentTutorId) {
                                handleApply(ref.id);
                              } else {
                                setShowCoffee(ref.id);
                              }
                            }}
                            disabled={isApplying}
                          >
                            Apply
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <button
            className="vcard-btn"
            onClick={() => downloadVCard(tutor)}
          >
            <span className="vcard-icon">👤</span> Save Contact
          </button>
          <div className="card-url" style={{ marginTop: 12 }}>
            {typeof window !== "undefined" ? window.location.host : ""}/{tutor.slug}
          </div>
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
