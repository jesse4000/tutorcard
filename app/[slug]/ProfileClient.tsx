"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import TutorCard from "@/components/TutorCard";
import type { TutorData } from "@/components/TutorCard";
import LogoSvg from "@/components/LogoSvg";

interface ProfileClientProps {
  tutor: TutorData;
  vouchCount: number;
  hasVouched: boolean;
  currentTutorId: string | null;
  viewedTutorId: string;
}

function buildVCard(tutor: TutorData): string {
  const fullName = [tutor.firstName, tutor.lastName].filter(Boolean).join(" ");
  const emailLink = tutor.links.find((l) => l.type === "📧 Email");
  const websiteLink = tutor.links.find((l) => l.type === "🌐 Website");
  const phoneLink = tutor.links.find((l) => l.type === "📞 Phone");
  const escape = (s: string) => s.replace(/[;,\\]/g, (c) => "\\" + c);

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escape(fullName)}`,
    `N:${escape(tutor.lastName || "")};${escape(tutor.firstName || "")};;;`,
  ];
  if (tutor.businessName) lines.push(`ORG:${escape(tutor.businessName)}`);
  if (tutor.title) lines.push(`TITLE:${escape(tutor.title)}`);
  if (phoneLink?.url) lines.push(`TEL:${phoneLink.url.replace(/[^+\d]/g, "")}`);
  if (emailLink?.url) lines.push(`EMAIL:${emailLink.url}`);
  if (websiteLink?.url) {
    const url = websiteLink.url.startsWith("http")
      ? websiteLink.url
      : `https://${websiteLink.url}`;
    lines.push(`URL:${url}`);
  }
  if (tutor.profileImageUrl) lines.push(`PHOTO;VALUE=URI:${tutor.profileImageUrl}`);
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
  vouchCount,
  hasVouched,
  currentTutorId,
  viewedTutorId,
}: ProfileClientProps) {
  const router = useRouter();
  const [localVouched, setLocalVouched] = useState(hasVouched);
  const [localVouchCount, setLocalVouchCount] = useState(vouchCount);
  const [isVouching, setIsVouching] = useState(false);

  const isOwnCard = currentTutorId === viewedTutorId;

  async function handleVouch() {
    if (!currentTutorId) {
      router.push(`/login?redirect=/${tutor.slug}`);
      return;
    }
    if (isVouching) return;

    setIsVouching(true);
    const prevVouched = localVouched;
    const prevCount = localVouchCount;

    // Optimistic update
    setLocalVouched(!localVouched);
    setLocalVouchCount(localVouched ? localVouchCount - 1 : localVouchCount + 1);

    try {
      const res = await fetch("/api/vouches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutorId: viewedTutorId }),
      });
      if (res.ok) {
        const data = await res.json();
        setLocalVouched(data.vouched);
        setLocalVouchCount(data.vouchCount);
      } else {
        // Rollback
        setLocalVouched(prevVouched);
        setLocalVouchCount(prevCount);
      }
    } catch {
      setLocalVouched(prevVouched);
      setLocalVouchCount(prevCount);
    } finally {
      setIsVouching(false);
    }
  }

  return (
    <>
      <Navbar mode="profile" />
      <div className="profile-page">
        <div className="profile-card-wrap">
          <TutorCard
            data={tutor}
            variant="full"
            vouchCount={localVouchCount}
          />

          {!isOwnCard && (
            <button
              className={`vouch-btn${localVouched ? " vouched" : ""}`}
              onClick={handleVouch}
              disabled={isVouching}
            >
              {localVouched ? (
                <><span className="vouch-icon">✓</span> Vouched</>
              ) : (
                <><span className="vouch-icon">🤝</span> Vouch for {tutor.firstName}</>
              )}
            </button>
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
