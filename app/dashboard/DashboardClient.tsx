"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
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
  email: string;
  business_name: string | null;
  years_experience: number | null;
  profile_image_url: string | null;
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
  const [linkCopied, setLinkCopied] = useState(false);
  const [vouchCount, setVouchCount] = useState(0);

  // Fetch vouch count
  useEffect(() => {
    if (!tutor) return;
    (async () => {
      try {
        const supabase = createClient();
        const { count } = await supabase
          .from("vouches")
          .select("*", { count: "exact", head: true })
          .eq("vouched_tutor_id", tutor.id);
        setVouchCount(count || 0);
      } catch {
        // silently fail
      }
    })();
  }, [tutor]);

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
            <Link
              href="/create"
              className="btn-next"
              style={{ display: "inline-flex" }}
            >
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
    businessName: tutor.business_name || "",
    profileImageUrl: tutor.profile_image_url || "",
  };

  return (
    <>
      <Navbar
        mode="dashboard"
        userEmail={userEmail}
        onSignOut={handleSignOut}
      />
      <div className="dashboard-page mobile-dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Your card</h1>
          <div className="dashboard-actions">
            <Link
              href="/dashboard/edit"
              className="dash-icon-btn"
              title="Edit card"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 3H3v10h10v-3" />
                <path d="M9 1h6v6" />
                <path d="M15 1 7 9" />
              </svg>
            </a>
          </div>
        </div>
        <div className="dashboard-card-layout">
          <div className="dashboard-card-wrap">
            <TutorCard
              data={tutorData}
              variant="full"
              vouchCount={vouchCount}
            />
          </div>
          <div className="dashboard-card-sidebar">
            {/* QR banner */}
            <div className="qr-banner" onClick={() => setShowQR(true)}>
              <div className="qr-banner-info">
                <span className="qr-banner-label">Show QR code</span>
                <span className="qr-banner-url">
                  {typeof window !== "undefined"
                    ? window.location.host
                    : ""}
                  /{tutor.slug}
                </span>
              </div>
              <QRCodeSVG
                value={
                  typeof window !== "undefined"
                    ? `${window.location.origin}/${tutor.slug}`
                    : `/${tutor.slug}`
                }
                size={56}
                level="M"
              />
            </div>
            {/* Share link banner */}
            <div
              className="qr-banner"
              onClick={() => {
                const url =
                  typeof window !== "undefined"
                    ? `${window.location.origin}/${tutor.slug}`
                    : `/${tutor.slug}`;
                navigator.clipboard.writeText(url).then(() => {
                  setLinkCopied(true);
                  setTimeout(() => setLinkCopied(false), 2000);
                });
              }}
            >
              <div className="qr-banner-info">
                <span className="qr-banner-label">
                  {linkCopied ? "Link copied!" : "Share card link"}
                </span>
                <span className="qr-banner-url" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>
                    {typeof window !== "undefined"
                      ? window.location.host
                      : ""}
                    /{tutor.slug}
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0, color: "var(--ink-2)" }}
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── DESKTOP DASHBOARD ── */}
      <div className="desktop-dashboard">
        <aside className="dd-sidebar">
          <div className="dd-profile-card">
            <div className="dd-profile-head">
              <div
                className="dd-avatar"
                style={{ background: tutor.profile_image_url ? "transparent" : (tutor.avatar_color || "#0f172a") }}
              >
                {tutor.profile_image_url ? (
                  <img
                    src={tutor.profile_image_url}
                    alt={tutorData.firstName}
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                  />
                ) : (
                  [tutor.first_name?.[0], tutor.last_name?.[0]].filter(Boolean).join("")
                )}
              </div>
              <div>
                <div className="dd-name">
                  {[tutor.first_name, tutor.last_name].filter(Boolean).join(" ")}
                </div>
                <div className="dd-title-text">{tutor.title || "Tutor"}</div>
              </div>
            </div>

            <div className="dd-tags">
              {[...tutorData.exams, ...tutorData.locations].map((tag, i) => (
                <span key={tag + i} className={`dd-tag${i === 0 ? " accent" : ""}`}>{tag}</span>
              ))}
            </div>

            <div className="dd-stats">
              <div className="dd-stat">
                <span className="dd-stat-num">{vouchCount}</span>
                <span className="dd-stat-label">VOUCHES</span>
              </div>
            </div>

            <div className="dd-actions">
              <button className="dd-action-btn" onClick={() => setShowQR(true)}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="1" width="6" height="6" rx="1" />
                  <rect x="9" y="1" width="6" height="6" rx="1" />
                  <rect x="1" y="9" width="6" height="6" rx="1" />
                  <rect x="11" y="11" width="2" height="2" />
                </svg>
                QR CODE
              </button>
              <button
                className="dd-action-btn"
                onClick={() => {
                  const url = typeof window !== "undefined"
                    ? `${window.location.origin}/${tutor.slug}`
                    : `/${tutor.slug}`;
                  navigator.clipboard.writeText(url).then(() => {
                    setLinkCopied(true);
                    setTimeout(() => setLinkCopied(false), 2000);
                  });
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 2.5l1.5-1.5a2 2 0 0 1 3 3L13 5.5M6 10l-1.5 1.5a2 2 0 0 1-3-3L3 7" />
                  <path d="M6 10l4-4" />
                </svg>
                {linkCopied ? "COPIED!" : "SHARE"}
              </button>
              <Link href="/dashboard/edit" className="dd-action-btn">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11.3 1.7a1.6 1.6 0 0 1 2.3 0l.7.7a1.6 1.6 0 0 1 0 2.3L5.7 13.3 2 14l.7-3.7z" />
                </svg>
                EDIT
              </Link>
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT — Card preview */}
        <main className="dd-main">
          <section className="dd-card-preview-section">
            <div className="dd-section-header">
              <h2 className="dd-section-title">Your card</h2>
              <a
                href={`/${tutor.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="dd-section-link"
              >
                View live card &rarr;
              </a>
            </div>
            <div style={{ maxWidth: 400 }}>
              <TutorCard
                data={tutorData}
                variant="full"
                vouchCount={vouchCount}
              />
            </div>
          </section>
        </main>
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
              {typeof window !== "undefined" ? window.location.host : ""}/
              {tutor.slug}
            </p>
            <div className="qr-code-wrap">
              <QRCodeSVG
                value={
                  typeof window !== "undefined"
                    ? `${window.location.origin}/${tutor.slug}`
                    : `/${tutor.slug}`
                }
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
