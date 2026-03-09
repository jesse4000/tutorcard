"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { TutorData } from "@/components/TutorCard";
import type { ReviewData, VoucherData, BadgeData } from "./types";
import Icon, { textOnAccent } from "./Icon";
import ProfileCard from "./ProfileCard";
import ReviewCardComponent from "./ReviewCard";
import VouchCard from "./VouchCard";
import BadgeCardComponent from "./BadgeCard";
import TabBar from "./TabBar";
import InquirySheet from "./InquirySheet";

interface ProfileClientProps {
  tutor: TutorData & { id: string };
  vouchCount: number;
  hasVouched: boolean;
  currentTutorId: string | null;
  viewedTutorId: string;
  averageRating: number | null;
  reviewCount: number;
  reviews: ReviewData[];
  vouchers: VoucherData[];
  badges: BadgeData[];
}

export default function ProfileClient({
  tutor,
  vouchCount,
  hasVouched,
  currentTutorId,
  viewedTutorId,
  averageRating,
  reviewCount,
  reviews,
  vouchers,
  badges,
}: ProfileClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState("reviews");
  const [showInquiry, setShowInquiry] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [localVouched, setLocalVouched] = useState(hasVouched);
  const [localVouchCount, setLocalVouchCount] = useState(vouchCount);
  const [isVouching, setIsVouching] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 800);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const accent = tutor.avatarColor || "#4f46e5";
  const accentText = textOnAccent(accent);
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

  // Compute tab stats
  const reviewsWithScores = reviews.filter((r) => r.scoreBefore && r.scoreAfter);
  const avgImp =
    reviewsWithScores.length > 0
      ? Math.round(
          reviewsWithScores.reduce((s, r) => s + (Number(r.scoreAfter) - Number(r.scoreBefore)), 0) /
            reviewsWithScores.length
        )
      : 0;
  const avgRat = averageRating != null ? averageRating.toFixed(1) : null;
  const wide = !isMobile;

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#9ca3af",
    margin: 0,
  };

  function renderTabContent() {
    if (tab === "reviews") {
      return (
        <>
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: wide ? 0 : 8 }}>
              <p style={labelStyle}>Reviews ({reviews.length})</p>
              {wide && reviews.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {avgImp > 0 && (
                    <>
                      <span style={{ fontSize: 12, color: "#9ca3af" }}>Avg improvement</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: accent }}>+{avgImp} pts</span>
                      <span style={{ color: "#e5e7eb" }}>·</span>
                    </>
                  )}
                  {avgRat && (
                    <>
                      <span style={{ fontSize: 12, color: "#9ca3af" }}>Avg rating</span>
                      <Icon name="star" size={10} style={{ color: "#f59e0b" }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#111" }}>{avgRat}</span>
                    </>
                  )}
                </div>
              )}
            </div>
            {!wide && reviews.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {avgImp > 0 && (
                  <>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>Avg improvement</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: accent }}>+{avgImp} pts</span>
                    <span style={{ color: "#e5e7eb" }}>·</span>
                  </>
                )}
                {avgRat && (
                  <>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>Avg rating</span>
                    <Icon name="star" size={10} style={{ color: "#f59e0b" }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#111" }}>{avgRat}</span>
                  </>
                )}
              </div>
            )}
          </div>
          {reviews.length === 0 ? (
            <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "20px 0" }}>No reviews yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {reviews.map((r) => (
                <ReviewCardComponent key={r.id} review={r} accent={accent} accentText={accentText} wide={wide} />
              ))}
            </div>
          )}
        </>
      );
    }

    if (tab === "vouches") {
      return (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <p style={labelStyle}>Vouches ({localVouchCount})</p>
            {!isOwnCard && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {wide && <span style={{ fontSize: 12, color: "#9ca3af" }}>Know this tutor?</span>}
                <button
                  onClick={handleVouch}
                  disabled={isVouching}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 20,
                    border: "none",
                    background: localVouched ? "#e5e7eb" : accent,
                    color: localVouched ? "#6b7280" : accentText,
                    fontSize: 11.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    transition: "opacity 0.15s",
                    flexShrink: 0,
                  }}
                >
                  <Icon name="check" size={11} />
                  {localVouched ? "Vouched" : `Vouch for ${tutor.firstName}`}
                </button>
              </div>
            )}
          </div>
          {vouchers.length === 0 ? (
            <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "20px 0" }}>No vouches yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: wide ? 10 : 8 }}>
              {vouchers.map((v) => (
                <VouchCard key={v.id} vouch={v} accent={accent} wide={wide} />
              ))}
            </div>
          )}
        </>
      );
    }

    if (tab === "badges") {
      return (
        <>
          <div style={{ marginBottom: 14 }}>
            <p style={labelStyle}>Badges ({badges.length})</p>
          </div>
          {badges.length === 0 ? (
            <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "20px 0" }}>No badges yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {badges.map((b) => (
                <BadgeCardComponent key={b.id} badge={b} accent={accent} wide={wide} />
              ))}
            </div>
          )}
        </>
      );
    }

    return null;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        @keyframes pfFadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes pfSlideUp { from { transform:translateY(100%) } to { transform:translateY(0) } }
        .pf-link:hover { background: #fafafa !important; }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif", background: "#f5f5f4" }}>
        {/* Header */}
        <header style={{ background: "white", borderBottom: "1px solid #f3f4f6", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, position: "sticky", top: 0, zIndex: 100 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "white" }}>tc</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#111", letterSpacing: "-0.01em" }}>tutorcard</span>
          </Link>
          <Link
            href="/create"
            style={{
              padding: "7px 16px",
              borderRadius: 10,
              border: "none",
              background: "#111",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              display: "flex",
              alignItems: "center",
              gap: 5,
              textDecoration: "none",
              transition: "opacity 0.15s",
            }}
          >
            <Icon name="plus" size={14} />Create your card
          </Link>
        </header>

        {/* Content */}
        <main style={{ flex: 1 }}>
          {isMobile ? (
            <div style={{ maxWidth: 440, margin: "0 auto", padding: "20px 16px 40px" }}>
              <ProfileCard
                tutor={tutor}
                accent={accent}
                vouchCount={localVouchCount}
                averageRating={averageRating}
                reviewCount={reviewCount}
                featuredReview={reviews[0] || null}
                firstBadge={badges[0] || null}
                onMessage={() => setShowInquiry(true)}
              />
              <div style={{ marginTop: 20, background: "white", borderRadius: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)", padding: "18px 20px" }}>
                <TabBar tab={tab} setTab={setTab} accent={accent} reviewCount={reviews.length} vouchCount={localVouchCount} badgeCount={badges.length} />
                {renderTabContent()}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 32px 60px", display: "flex", gap: 28, alignItems: "flex-start" }}>
              <div style={{ flex: "0 0 360px", position: "sticky", top: 88 }}>
                <ProfileCard
                  tutor={tutor}
                  accent={accent}
                  vouchCount={localVouchCount}
                  averageRating={averageRating}
                  reviewCount={reviewCount}
                  featuredReview={reviews[0] || null}
                  firstBadge={badges[0] || null}
                  onMessage={() => setShowInquiry(true)}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ background: "white", borderRadius: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)", padding: "24px 28px" }}>
                  <TabBar tab={tab} setTab={setTab} accent={accent} reviewCount={reviews.length} vouchCount={localVouchCount} badgeCount={badges.length} />
                  {renderTabContent()}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer style={{ background: "white", borderTop: "1px solid #f3f4f6", padding: isMobile ? "32px 20px" : "40px 32px" }}>
          <div style={{ maxWidth: 1120, margin: "0 auto" }}>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "center" : "flex-start", justifyContent: "space-between", gap: isMobile ? 24 : 0, textAlign: isMobile ? "center" : "left" }}>
              <div>
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: isMobile ? "center" : "flex-start", marginBottom: 6, textDecoration: "none" }}>
                  <div style={{ width: 20, height: 20, borderRadius: 5, background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: "white" }}>tc</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>tutorcard</span>
                </Link>
                <p style={{ fontSize: 12.5, color: "#9ca3af", margin: 0, maxWidth: 280, lineHeight: 1.5 }}>The professional identity platform for tutors. Free to create, easy to share.</p>
              </div>
              <div style={{ display: "flex", gap: isMobile ? 32 : 48 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "#9ca3af", margin: "0 0 10px" }}>Platform</p>
                  {["Create a card", "Find a tutor", "For associations"].map((l) => (
                    <p key={l} style={{ fontSize: 13, color: "#6b7280", margin: "0 0 6px", cursor: "pointer" }}>{l}</p>
                  ))}
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "#9ca3af", margin: "0 0 10px" }}>Company</p>
                  {["About", "Blog", "Privacy", "Terms"].map((l) => (
                    <p key={l} style={{ fontSize: 13, color: "#6b7280", margin: "0 0 6px", cursor: "pointer" }}>{l}</p>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 8 : 0 }}>
              <p style={{ fontSize: 12, color: "#d1d5db", margin: 0 }}>© 2026 TutorCard · A StudySpaces product</p>
              <p style={{ fontSize: 12, color: "#d1d5db", margin: 0 }}>Powered by <span style={{ fontWeight: 600, color: "#9ca3af" }}>StudySpaces</span></p>
            </div>
          </div>
        </footer>
      </div>

      {showInquiry && (
        <InquirySheet
          onClose={() => setShowInquiry(false)}
          accent={accent}
          tutorId={viewedTutorId}
          tutorExams={tutor.exams}
        />
      )}
    </>
  );
}
