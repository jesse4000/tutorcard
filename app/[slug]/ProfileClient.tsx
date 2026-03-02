"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import TutorCard from "@/components/TutorCard";
import type { TutorData } from "@/components/TutorCard";
import LogoSvg from "@/components/LogoSvg";

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

export default function ProfileClient({ tutor }: { tutor: TutorData }) {
  return (
    <>
      <Navbar mode="profile" />
      <div className="profile-page">
        <div className="profile-card-wrap">
          <TutorCard data={tutor} variant="full" />
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
