"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { TutorData } from "@/components/TutorCard";
import type { ReviewData, VoucherData, BadgeData } from "./types";
import Icon, { textOnAccent } from "./Icon";
import ProfileCard from "./ProfileCard";
import ReviewCardComponent from "./ReviewCard";
import VouchCard from "./VouchCard";
import BadgeCardComponent from "./BadgeCard";
import TabBar from "./TabBar";
import InquirySheet from "./InquirySheet";
import ReviewSheet from "./ReviewSheet";
import HomepageHeader from "@/components/HomepageHeader";
import SimpleFooter from "@/components/SimpleFooter";

interface ProfileClientProps {
  tutor: TutorData & { id: string };
  vouchCount: number;
  hasVouched: boolean;
  currentTutorId: string | null;
  viewedTutorId: string;
  isLoggedIn?: boolean;
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
  isLoggedIn,
  averageRating,
  reviewCount,
  reviews,
  vouchers,
  badges,
}: ProfileClientProps) {
  const router = useRouter();

  // Record card view (fire-and-forget)
  useEffect(() => {
    fetch("/api/card-views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tutorId: viewedTutorId }),
    }).catch(() => {});
  }, [viewedTutorId]);

  const [tab, setTab] = useState("reviews");
  const [showInquiry, setShowInquiry] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [localVouched, setLocalVouched] = useState(hasVouched);
  const [localVouchCount, setLocalVouchCount] = useState(vouchCount);
  const [isVouching, setIsVouching] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 800);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setCardHeight(entry.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const accent = tutor.avatarColor || "#4f46e5";
  const accentText = textOnAccent(accent);
  const isOwnCard = currentTutorId === viewedTutorId;

  async function handleSaveContact() {
    const fullName = [tutor.firstName, tutor.lastName].filter(Boolean).join(" ");
    const phone = tutor.links.find((l) => l.type === "Phone" || l.type === "📞 Phone");
    const email = tutor.links.find((l) => l.type === "Email" || l.type === "📧 Email");

    // Fetch profile image as base64 if available
    let photoBase64: string | null = null;
    let photoType = "JPEG";
    if (tutor.profileImageUrl) {
      try {
        const res = await fetch(tutor.profileImageUrl);
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("png")) photoType = "PNG";
        else if (contentType.includes("gif")) photoType = "GIF";
        const buf = await res.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        photoBase64 = btoa(binary);
      } catch {
        // Silently skip photo if fetch fails
      }
    }

    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${fullName}`,
      `N:${tutor.lastName || ""};${tutor.firstName || ""};;;`,
    ];
    if (tutor.title) lines.push(`TITLE:${tutor.title}`);
    if (tutor.businessName) lines.push(`ORG:${tutor.businessName}`);
    if (phone) lines.push(`TEL;TYPE=CELL:${phone.url}`);
    if (email) lines.push(`EMAIL:${email.url}`);
    if (photoBase64) lines.push(`PHOTO;ENCODING=b;TYPE=${photoType}:${photoBase64}`);
    lines.push(`URL:https://tutorcard.co/${tutor.slug}`);
    if (tutor.exams.length > 0 || tutor.subjects.length > 0) {
      const note = [...tutor.exams, ...tutor.subjects].join(", ");
      lines.push(`NOTE:${note}`);
    }
    lines.push("END:VCARD");

    const blob = new Blob([lines.join("\r\n")], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tutor.firstName}-${tutor.lastName}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleVouch() {
    if (!currentTutorId) {
      router.push(`/vouch/${tutor.slug}`);
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
              <p style={{ ...labelStyle, flex: 1 }}>Reviews ({reviews.length})</p>
              {wide && reviews.length > 0 && avgRat && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, justifyContent: "center" }}>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>Avg rating</span>
                  <Icon name="star" size={10} style={{ color: "#f59e0b" }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#111" }}>{avgRat}</span>
                </div>
              )}
              <div style={{ flex: wide ? 1 : 0, display: "flex", justifyContent: "flex-end" }}>
                {!isOwnCard && (
                  <button
                    onClick={() => setShowReview(true)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 20,
                      border: "none",
                      background: accent,
                      color: accentText,
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
                    <Icon name="star" size={11} />
                    Leave a review
                  </button>
                )}
              </div>
            </div>
            {!wide && reviews.length > 0 && avgRat && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>Avg rating</span>
                <Icon name="star" size={10} style={{ color: "#f59e0b" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#111" }}>{avgRat}</span>
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
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 24px", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Icon name="clock" size={24} style={{ color: "#d1d5db" }} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111", margin: "0 0 6px" }}>Coming soon</h3>
              <p style={{ fontSize: 13.5, color: "#9ca3af", margin: 0, maxWidth: 320, lineHeight: 1.5 }}>
                Verified badges for memberships and certifications are on the way.
              </p>
            </div>
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
        * { box-sizing: border-box; }
        @keyframes pfFadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes pfSlideUp { from { transform:translateY(100%) } to { transform:translateY(0) } }
        .pf-link:hover { background: #fafafa !important; }
        .pf-view-btn:hover { border-color: ${accent} !important; color: ${accent} !important; }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif", background: "#f5f5f4", width: "100%" }}>
        {/* Header */}
        <HomepageHeader isMobile={isMobile} isLoggedIn={isLoggedIn} />

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
                featuredReview={reviews.find(r => r.isPinned) || null}
                firstBadge={badges[0] || null}
                onMessage={() => setShowInquiry(true)}
              />
              {!isOwnCard && (
                <button
                  onClick={handleSaveContact}
                  style={{
                    width: "100%",
                    marginTop: 12,
                    padding: "13px",
                    borderRadius: 14,
                    border: "1.5px solid #e5e7eb",
                    background: "white",
                    color: "#374151",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.background = "#fafafa"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.background = "white"; }}
                >
                  <Icon name="download" size={15} />Save Contact
                </button>
              )}
              <div style={{ marginTop: 20, background: "white", borderRadius: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)", padding: "18px 20px" }}>
                <TabBar tab={tab} setTab={setTab} accent={accent} reviewCount={reviews.length} vouchCount={localVouchCount} badgeCount={badges.length} />
                {renderTabContent()}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 32px 60px", display: "flex", gap: 28, alignItems: "flex-start" }}>
              <div ref={cardRef} style={{ flex: "0 0 360px", position: "sticky", top: 88 }}>
                <ProfileCard
                  tutor={tutor}
                  accent={accent}
                  vouchCount={localVouchCount}
                  averageRating={averageRating}
                  reviewCount={reviewCount}
                  featuredReview={reviews.find(r => r.isPinned) || null}
                  firstBadge={badges[0] || null}
                  onMessage={() => setShowInquiry(true)}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0, height: cardHeight, display: "flex", flexDirection: "column" as const }}>
                <div style={{ background: "white", borderRadius: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)", padding: "24px 28px", flex: 1, display: "flex", flexDirection: "column" as const, overflow: "hidden", minHeight: 0 }}>
                  <TabBar tab={tab} setTab={setTab} accent={accent} reviewCount={reviews.length} vouchCount={localVouchCount} badgeCount={badges.length} />
                  <div style={{ flex: 1, overflowY: "auto" as const, minHeight: 0 }}>
                    {renderTabContent()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <SimpleFooter />
      </div>

      {showInquiry && (
        <InquirySheet
          onClose={() => setShowInquiry(false)}
          accent={accent}
          tutorId={viewedTutorId}
          tutorExams={tutor.exams}
        />
      )}

      {showReview && (
        <ReviewSheet
          onClose={() => setShowReview(false)}
          tutor={{
            id: viewedTutorId,
            firstName: tutor.firstName,
            lastName: tutor.lastName,
            title: tutor.title || "",
            slug: tutor.slug,
            avatarColor: tutor.avatarColor || accent,
            exams: tutor.exams,
            locations: tutor.locations || [],
            profileImageUrl: tutor.profileImageUrl || "",
          }}
          accent={accent}
        />
      )}
    </>
  );
}
