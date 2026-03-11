"use client";

import { useState } from "react";
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

interface ReviewFlowProps {
  tutor: TutorData;
  reviewCount: number;
  averageRating: number | null;
  prefill: { exam?: string; before?: string; after?: string; timeframe?: string };
}

type Screen = "form" | "confirmation";

function Header() {
  return (
    <header style={{
      background: "white", borderBottom: "1px solid #f3f4f6",
      padding: "0 24px", height: 56, display: "flex", alignItems: "center",
      justifyContent: "center", flexShrink: 0,
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
        <div style={{ width: 24, height: 24, borderRadius: 6, background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "white" }}>tc</span>
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>tutorcard</span>
      </Link>
    </header>
  );
}

function Footer() {
  return (
    <footer style={{ padding: "20px 24px", textAlign: "center" }}>
      <p style={{ fontSize: 12, color: "#d1d5db", margin: 0 }}>
        &copy; 2026 TutorCard &middot; A <span style={{ fontWeight: 600, color: "#9ca3af" }}>StudySpaces</span> product
      </p>
    </footer>
  );
}

function TutorPreview({ tutor, accent }: { tutor: TutorData; accent: string }) {
  const t = textOnAccent(accent);
  const initials = `${tutor.firstName[0] || ""}${tutor.lastName[0] || ""}`.toUpperCase();
  const location = tutor.locations?.[0] || "";

  return (
    <div style={{
      background: "white", borderRadius: 16, border: "1px solid #f0f0f0",
      padding: "20px", display: "flex", alignItems: "center", gap: 14,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: "50%", background: accent,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        overflow: "hidden",
      }}>
        {tutor.profileImageUrl ? (
          <img src={tutor.profileImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: 18, color: t, fontWeight: 600 }}>{initials}</span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111", margin: "0 0 2px", letterSpacing: "-0.01em" }}>
          {tutor.firstName} {tutor.lastName}
        </h3>
        {tutor.title && (
          <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 6px" }}>{tutor.title}</p>
        )}
        {location && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#9ca3af" }}>
            <span>{location}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          style={{
            background: "none", border: "none", cursor: "pointer", padding: 2,
            color: i <= (hover || value) ? "#f59e0b" : "#e5e7eb",
            transition: "color 0.1s",
          }}
        >
          <Icon name="star" size={28} />
        </button>
      ))}
    </div>
  );
}

// ─── SCREEN 1: REVIEW FORM ─────────────────────────────
function ReviewForm({
  tutor, accent, reviewCount, averageRating, prefill, onSubmit,
}: {
  tutor: TutorData; accent: string; reviewCount: number;
  averageRating: number | null; prefill: ReviewFlowProps["prefill"];
  onSubmit: (data: SubmittedReview) => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("Parent");
  const [rating, setRating] = useState(0);
  const [quote, setQuote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Prefilled values from tutor (read-only for the reviewer)
  const exam = prefill.exam || "";
  const scoreBefore = prefill.before || "";
  const scoreAfter = prefill.after || "";
  const timeframe = prefill.timeframe || "";

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", borderRadius: 10,
    border: "1.5px solid #e5e7eb", fontSize: 14, color: "#111",
    outline: "none", boxSizing: "border-box", background: "white",
    fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.15s",
  };

  function parseMonths(tf: string): number | null {
    const match = tf.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (rating === 0) { setError("Please select a rating."); return; }
    if (!quote.trim()) { setError("Please write a review."); return; }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutorId: tutor.id,
          reviewerName: name.trim(),
          reviewerRole: role,
          exam: exam || null,
          scoreBefore: scoreBefore || null,
          scoreAfter: scoreAfter || null,
          months: timeframe ? parseMonths(timeframe) : null,
          rating,
          quote: quote.trim(),
        }),
      });

      if (res.ok) {
        onSubmit({ reviewerName: name.trim(), rating, quote: quote.trim() });
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  const roles = ["Parent", "Student", "Other"];

  return (
    <div style={{ width: "100%", maxWidth: 440 }}>
      <div style={{
        background: "white", borderRadius: 20,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)",
        padding: "36px 32px",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: "#f3f4f6", display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 16px",
          }}>
            <Icon name="star" size={24} style={{ color: "#f59e0b" }} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111", letterSpacing: "-0.02em", margin: "0 0 6px" }}>
            Review {tutor.firstName}
          </h1>
          <p style={{ fontSize: 14, color: "#9ca3af", margin: 0, lineHeight: 1.5 }}>
            Share your experience working with {tutor.firstName} {tutor.lastName}. Your review helps other parents find great tutors.
          </p>
        </div>

        {/* Tutor preview */}
        <TutorPreview tutor={tutor} accent={accent} />

        {/* Stats */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: 20, border: "1px solid #e5e7eb", fontSize: 12.5 }}>
            <Icon name="star" size={11} style={{ color: "#f59e0b" }} />
            <span style={{ fontWeight: 600, color: "#111" }}>{reviewCount}</span>
            <span style={{ color: "#9ca3af" }}>{reviewCount === 1 ? "review" : "reviews"}</span>
          </div>
          {averageRating !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: 20, border: "1px solid #e5e7eb", fontSize: 12.5 }}>
              <span style={{ fontWeight: 600, color: "#111" }}>{averageRating.toFixed(1)}</span>
              <span style={{ color: "#9ca3af" }}>avg</span>
            </div>
          )}
        </div>

        {error && (
          <div style={{
            background: "#fef2f2", color: "#dc2626", fontSize: 13,
            padding: "10px 14px", borderRadius: 10, marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              Your name <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Sarah Johnson" style={inputStyle}
              onFocus={e => e.target.style.borderColor = "#111"}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"}
            />
          </div>

          {/* Role */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              I am a
            </label>
            <div style={{ display: "flex", gap: 6 }}>
              {roles.map(r => (
                <button key={r} type="button" onClick={() => setRole(r)} style={{
                  padding: "6px 14px", borderRadius: 8, cursor: "pointer",
                  border: role === r ? "1.5px solid #111" : "1.5px solid #e5e7eb",
                  background: role === r ? "#111" : "white",
                  color: role === r ? "white" : "#374151",
                  fontSize: 12.5, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.15s",
                }}>{r}</button>
              ))}
            </div>
          </div>

          {/* Exam / subject (read-only, only shown if tutor prefilled) */}
          {exam && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                Exam or subject
              </label>
              <span style={{
                display: "inline-block", padding: "6px 14px", borderRadius: 8,
                border: "1.5px solid #e5e7eb", background: "#f9fafb",
                color: "#374151", fontSize: 12.5, fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif",
              }}>{exam}</span>
            </div>
          )}

          {/* Score improvement (read-only, only shown if tutor prefilled) */}
          {(scoreBefore || scoreAfter) && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                Score improvement
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {scoreBefore && (
                  <div style={{
                    ...inputStyle, flex: 1, textAlign: "center", background: "#f9fafb",
                    color: "#374151", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{scoreBefore}</div>
                )}
                {scoreBefore && scoreAfter && (
                  <span style={{ fontSize: 14, color: "#d1d5db", flexShrink: 0 }}>→</span>
                )}
                {scoreAfter && (
                  <div style={{
                    ...inputStyle, flex: 1, textAlign: "center", background: "#f9fafb",
                    color: "#374151", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{scoreAfter}</div>
                )}
              </div>
            </div>
          )}

          {/* Timeframe (read-only, only shown if tutor prefilled) */}
          {timeframe && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                Timeframe
              </label>
              <div style={{
                ...inputStyle, background: "#f9fafb", color: "#374151",
              }}>{timeframe}</div>
            </div>
          )}

          {/* Rating */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              Rating <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          {/* Review text */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              Your review <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <textarea
              value={quote} onChange={e => setQuote(e.target.value)}
              placeholder={`What was your experience working with ${tutor.firstName}?`}
              rows={4}
              maxLength={2000}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
              onFocus={e => e.target.style.borderColor = "#111"}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"}
            />
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "14px", borderRadius: 14, border: "none",
            background: "#111", color: "white", fontSize: 15, fontWeight: 600,
            cursor: loading ? "default" : "pointer", fontFamily: "'DM Sans', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "opacity 0.15s",
            opacity: loading ? 0.7 : 1,
          }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = "0.88"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = loading ? "0.7" : "1"; }}
          >
            <Icon name="star" size={16} />
            {loading ? "Submitting..." : "Submit review"}
          </button>
        </form>

        {/* View card link */}
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <Link href={`/${tutor.slug}`} style={{
            background: "none", border: "none", color: "#9ca3af",
            fontSize: 13, fontWeight: 500, textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 4,
          }}>
            View full card <Icon name="ext" size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}

interface SubmittedReview {
  reviewerName: string;
  rating: number;
  quote: string;
}

// ─── SCREEN 2: CONFIRMATION ─────────────────────────────
function ReviewConfirmation({ tutor, review }: {
  tutor: TutorData; review: SubmittedReview;
}) {
  return (
    <div style={{ width: "100%", maxWidth: 440 }}>
      <div style={{
        background: "white", borderRadius: 20,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)",
        padding: "40px 32px", textAlign: "center",
      }}>
        {/* Success icon */}
        <div style={{
          width: 64, height: 64, borderRadius: "50%", background: "#ecfdf5",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <Icon name="check" size={32} style={{ color: "#059669" }} />
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#111", letterSpacing: "-0.02em", margin: "0 0 8px" }}>
          Thank you for your review!
        </h2>
        <p style={{ fontSize: 14, color: "#9ca3af", margin: "0 0 24px", lineHeight: 1.5 }}>
          Your review of {tutor.firstName} has been submitted and will appear on their card.
        </p>

        {/* Review preview */}
        <div style={{
          background: "#fafafa", borderRadius: 14, padding: "16px",
          border: "1px solid #f0f0f0", marginBottom: 24, textAlign: "left",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 8 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <Icon key={i} name="star" size={14} style={{ color: i <= review.rating ? "#f59e0b" : "#e5e7eb" }} />
            ))}
          </div>
          <p style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.55, margin: "0 0 8px", fontStyle: "italic" }}>
            &ldquo;{review.quote.length > 150 ? review.quote.slice(0, 150) + "..." : review.quote}&rdquo;
          </p>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: 0, fontWeight: 500 }}>
            — {review.reviewerName}
          </p>
        </div>

        <Link href={`/${tutor.slug}`} style={{ textDecoration: "none" }}>
          <button style={{
            width: "100%", padding: "14px", borderRadius: 14, border: "none",
            background: "#111", color: "white", fontSize: 15, fontWeight: 600,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "opacity 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            View {tutor.firstName}&apos;s card
            <Icon name="arrowRight" size={16} />
          </button>
        </Link>
      </div>
    </div>
  );
}

// ─── MAIN FLOW ──────────────────────────────────────────
export default function ReviewFlowClient({
  tutor, reviewCount, averageRating, prefill,
}: ReviewFlowProps) {
  const [screen, setScreen] = useState<Screen>("form");
  const [submittedReview, setSubmittedReview] = useState<SubmittedReview | null>(null);

  function handleSubmit(review: SubmittedReview) {
    setSubmittedReview(review);
    setScreen("confirmation");
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
      `}</style>

      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        fontFamily: "'DM Sans', sans-serif", background: "#f5f5f4",
      }}>
        <Header />

        <main style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          padding: "40px 20px",
        }}>
          {screen === "form" && (
            <ReviewForm
              tutor={tutor}
              accent={tutor.avatarColor}
              reviewCount={reviewCount}
              averageRating={averageRating}
              prefill={prefill}
              onSubmit={handleSubmit}
            />
          )}
          {screen === "confirmation" && submittedReview && (
            <ReviewConfirmation
              tutor={tutor}
              review={submittedReview}
            />
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
