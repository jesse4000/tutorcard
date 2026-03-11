"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Icon, { textOnAccent } from "@/app/[slug]/Icon";

interface TutorData {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  slug: string;
  avatarColor: string;
  exams: string[];
  locations: string[];
  profileImageUrl: string;
}

interface ReviewSheetProps {
  onClose: () => void;
  tutor: TutorData;
  accent: string;
}

interface SubmittedReview {
  reviewerName: string;
  rating: number;
  quote: string;
  recommends?: boolean;
}

type Screen = "form" | "confirmation";

// ─── STAR RATING ────────────────────────────────────────
function StarRating({ value, onChange, size = 28 }: { value: number; onChange: (v: number) => void; size?: number }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          style={{
            background: "none", border: "none", cursor: "pointer", padding: 1,
            transition: "transform 0.1s",
            transform: hover >= i || value >= i ? "scale(1.1)" : "scale(1)",
          }}
        >
          <Icon name="star" size={size}
            style={{ color: value >= i || hover >= i ? "#f59e0b" : "#d1d5db", transition: "color 0.15s" }} />
        </button>
      ))}
    </div>
  );
}

// ─── REVIEW PREVIEW CARD ────────────────────────────────
function ReviewPreview({
  reviewText, stars, sigName, accent, wide,
}: {
  reviewText: string; stars: number; sigName: string; accent: string; wide: boolean;
}) {
  const rightContent = (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <p style={{ fontSize: wide ? 14 : 13, color: reviewText ? "#374151" : "#d1d5db", lineHeight: 1.55, margin: "0 0 6px", fontStyle: "italic" }}>
        {reviewText ? `\u201C${reviewText}\u201D` : '\u201CReview will appear here...\u201D'}
      </p>
      <p style={{ fontSize: wide ? 12 : 11.5, color: sigName ? "#9ca3af" : "#d1d5db", margin: 0, fontWeight: 500 }}>
        {"- "}{sigName || "Parent name"}
      </p>
      {stars > 0 && (
        <div style={{ display: "flex", gap: 1, marginTop: 6 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <Icon key={i} name="star" size={12} style={{ color: stars >= i ? "#f59e0b" : "#d1d5db" }} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ background: "#fafafa", borderRadius: 14, padding: "16px 18px", border: "1px solid #f0f0f0" }}>
      {rightContent}
    </div>
  );
}

// ─── SHARED INPUT STYLE ─────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: 10,
  border: "1.5px solid #e5e7eb", fontSize: 14, color: "#111",
  outline: "none", boxSizing: "border-box", background: "white",
  fontFamily: "'DM Sans', sans-serif",
};

// ─── REVIEW FORM ────────────────────────────────────────
function ReviewForm({
  tutor, accent, onSubmit, isMobile,
}: {
  tutor: TutorData; accent: string;
  onSubmit: (data: SubmittedReview) => void;
  isMobile: boolean;
}) {
  const t = textOnAccent(accent);
  const initials = `${tutor.firstName[0] || ""}${tutor.lastName[0] || ""}`.toUpperCase();
  const [reviewText, setReviewText] = useState("");
  const [stars, setStars] = useState(0);
  const [recommend, setRecommend] = useState(false);
  const [sigName, setSigName] = useState("");
  const [sigEmail, setSigEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = stars > 0 && sigName.trim() && sigEmail.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sigName.trim()) { setError("Please enter your name."); return; }
    if (stars === 0) { setError("Please select a rating."); return; }
    if (!sigEmail.trim()) { setError("Please enter your email."); return; }
    if (!reviewText.trim()) { setError("Please write a review."); return; }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutorId: tutor.id,
          reviewerName: sigName.trim(),
          reviewerRole: null,
          reviewerEmail: sigEmail.trim(),
          recommends: recommend,
          exam: null,
          scoreBefore: null,
          scoreAfter: null,
          months: null,
          rating: stars,
          quote: reviewText.trim(),
        }),
      });

      if (res.ok) {
        onSubmit({ reviewerName: sigName.trim(), rating: stars, quote: reviewText.trim(), recommends: recommend });
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <>
      <h2 style={{ fontSize: isMobile ? 18 : 20, fontWeight: 800, color: "#111", letterSpacing: "-0.02em", margin: "0 0 4px" }}>
        Leave a review for {tutor.firstName}
      </h2>
      <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 16px" }}>
        Your review helps other families find great tutors.
      </p>

      {/* Tutor context */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#fafafa", borderRadius: 12, border: "1px solid #f0f0f0", marginBottom: 16 }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%", background: accent,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          overflow: "hidden",
        }}>
          {tutor.profileImageUrl ? (
            <img src={tutor.profileImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: 11, color: t, fontWeight: 600 }}>{initials}</span>
          )}
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#111", margin: 0 }}>{tutor.firstName} {tutor.lastName}</p>
          {tutor.title && <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{tutor.title}</p>}
        </div>
      </div>

      {error && (
        <div style={{
          background: "#fef2f2", color: "#dc2626", fontSize: 13,
          padding: "10px 14px", borderRadius: 10, marginBottom: 14,
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Review text */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Your experience</label>
          <textarea value={reviewText} onChange={e => setReviewText(e.target.value)}
            placeholder={`Tell other families about your experience working with ${tutor.firstName}...`}
            maxLength={2000}
            style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
            onFocus={e => { e.target.style.borderColor = "#111"; }}
            onBlur={e => { e.target.style.borderColor = "#e5e7eb"; }} />
        </div>

        {/* Stars */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Rating</label>
          <StarRating value={stars} onChange={setStars} />
        </div>

        {/* Recommend */}
        <button type="button" onClick={() => setRecommend(!recommend)} style={{
          display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
          borderRadius: 12, border: recommend ? "1.5px solid #111" : "1.5px solid #e5e7eb",
          background: recommend ? "#fafafa" : "white", cursor: "pointer",
          width: "100%", fontFamily: "'DM Sans', sans-serif", marginBottom: 14,
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: 6,
            background: recommend ? "#111" : "white",
            border: recommend ? "none" : "1.5px solid #d1d5db",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            {recommend && <Icon name="check" size={12} style={{ color: "white" }} />}
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#111" }}>I recommend this tutor</span>
        </button>

        <div style={{ height: 1, background: "#f3f4f6", margin: "0 0 14px" }} />

        {/* Signature - Name */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
            {"Your name "}
            <span style={{ fontWeight: 400, color: "#9ca3af" }}>(displayed with your review)</span>
          </label>
          <input value={sigName} onChange={e => setSigName(e.target.value)}
            placeholder="e.g. Rebecca R., Parent" style={inputStyle}
            onFocus={e => { e.target.style.borderColor = "#111"; }}
            onBlur={e => { e.target.style.borderColor = "#e5e7eb"; }} />
        </div>

        {/* Email */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>
            Your email
          </label>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 6px" }}>Used to verify your review. Never displayed publicly.</p>
          <input type="email" value={sigEmail} onChange={e => setSigEmail(e.target.value)}
            placeholder="your@email.com" style={inputStyle}
            onFocus={e => { e.target.style.borderColor = "#111"; }}
            onBlur={e => { e.target.style.borderColor = "#e5e7eb"; }} />
        </div>

        {/* Submit */}
        <button type="submit" disabled={!canSubmit || loading} style={{
          width: "100%", padding: "13px", borderRadius: 14, border: "none",
          background: canSubmit ? "#111" : "#e5e7eb",
          color: canSubmit ? "white" : "#9ca3af",
          fontSize: 14, fontWeight: 600,
          cursor: canSubmit && !loading ? "pointer" : "default",
          fontFamily: "'DM Sans', sans-serif",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          opacity: loading ? 0.7 : 1,
        }}>
          {loading ? "Submitting..." : "Submit review"} <Icon name="arrowRight" size={15} />
        </button>
        <p style={{ fontSize: 11, color: "#d1d5db", textAlign: "center", marginTop: 8 }}>
          Your review will be visible on {tutor.firstName}&apos;s TutorCard.
        </p>
      </form>
    </>
  );
}

// ─── CONFIRMATION SCREEN ────────────────────────────────
function ReviewConfirmation({ tutor, accent, submittedReview }: {
  tutor: TutorData; accent: string; submittedReview: SubmittedReview;
}) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%", background: "#ecfdf5",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 16px",
      }}>
        <Icon name="check" size={28} style={{ color: "#059669" }} />
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111", letterSpacing: "-0.02em", margin: "0 0 6px" }}>
        Thank you!
      </h2>
      <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 20px", lineHeight: 1.5 }}>
        Your review has been submitted and will appear on {tutor.firstName}&apos;s TutorCard.
      </p>

      {/* Review preview */}
      <div style={{ marginBottom: 20 }}>
        <ReviewPreview
          reviewText={submittedReview.quote}
          stars={submittedReview.rating}
          sigName={submittedReview.reviewerName}
          accent={accent}
          wide={false}
        />
      </div>

      <div>
        <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 10 }}>Are you a tutor yourself?</p>
        <Link href="/" style={{ textDecoration: "none" }}>
          <button style={{
            padding: "11px 22px", borderRadius: 12, border: "none",
            background: "#111", color: "white", fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            Create your own TutorCard <Icon name="arrowRight" size={13} />
          </button>
        </Link>
      </div>
    </div>
  );
}

// ─── MAIN SHEET COMPONENT ───────────────────────────────
export default function ReviewSheet({ onClose, tutor, accent }: ReviewSheetProps) {
  const [screen, setScreen] = useState<Screen>("form");
  const [submittedReview, setSubmittedReview] = useState<SubmittedReview | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  function handleSubmit(review: SubmittedReview) {
    setSubmittedReview(review);
    setScreen("confirmation");
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        animation: "pfFadeIn 0.15s ease",
      }}
    >
      <style>{`
        .review-sheet-inner::-webkit-scrollbar { display: none; }
        .review-sheet-inner { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div
        className="review-sheet-inner"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: 20,
          width: "100%",
          maxWidth: 480,
          maxHeight: "90vh",
          overflow: "auto",
          padding: isMobile ? "24px 20px" : "28px 28px",
          margin: "0 16px",
          animation: "pfFadeIn 0.2s ease",
          boxShadow: "0 4px 40px rgba(0,0,0,0.15)",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "#f3f4f6",
            border: "none",
            borderRadius: "50%",
            width: 30,
            height: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#6b7280",
            zIndex: 1,
          }}
        >
          <Icon name="x" size={15} />
        </button>

        {screen === "form" && (
          <ReviewForm
            tutor={tutor}
            accent={accent}
            onSubmit={handleSubmit}
            isMobile={isMobile}
          />
        )}
        {screen === "confirmation" && submittedReview && (
          <ReviewConfirmation
            tutor={tutor}
            accent={accent}
            submittedReview={submittedReview}
          />
        )}
      </div>
    </div>
  );
}
