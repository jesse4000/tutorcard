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

// ─── LIVE PREVIEW CARD ──────────────────────────────────
function ReviewPreview({
  exam, beforeScore, afterScore, timeframe, reviewText, stars, sigName, accent, wide,
}: {
  exam: string; beforeScore: string; afterScore: string; timeframe: string;
  reviewText: string; stars: number; sigName: string; accent: string; wide: boolean;
}) {
  const t = textOnAccent(accent);
  const imp = beforeScore && afterScore ? Number(afterScore) - Number(beforeScore) : null;
  const hasLeft = exam || beforeScore || afterScore || timeframe;

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

  const leftContent = hasLeft ? (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
      {exam && (
        <span style={{
          fontSize: 10.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase",
          color: "#6b7280", background: "#e5e7eb",
          padding: "2px 7px", borderRadius: 4, alignSelf: "flex-start",
          marginBottom: (beforeScore || afterScore) ? 8 : 0,
        }}>{exam}</span>
      )}
      {(beforeScore || afterScore) && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: beforeScore ? "#b0b0b0" : "#e5e7eb" }}>{beforeScore || "---"}</span>
          <span style={{ fontSize: 14, color: "#d1d5db" }}>{"\u2192"}</span>
          <span style={{ fontSize: 24, fontWeight: 700, color: afterScore ? "#111" : "#e5e7eb" }}>{afterScore || "---"}</span>
        </div>
      )}
      {(imp !== null && imp > 0 || timeframe) && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
          {imp !== null && imp > 0 && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 2, background: accent, color: t, padding: "2px 7px", borderRadius: 20, fontSize: 10.5, fontWeight: 700 }}>
              <Icon name="arrowUp" size={9} />+{imp}
            </span>
          )}
          {timeframe && <span style={{ fontSize: 12, color: "#9ca3af" }}>{timeframe}</span>}
        </div>
      )}
    </div>
  ) : null;

  if (wide) {
    return (
      <div style={{ background: "#fafafa", borderRadius: 14, padding: "18px 22px", border: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex", gap: 20 }}>
          {leftContent && (
            <>
              <div style={{ flex: "0 0 auto", minWidth: 160 }}>{leftContent}</div>
              <div style={{ width: 1, background: "#ebebeb", alignSelf: "stretch" }} />
            </>
          )}
          <div style={{ flex: 1 }}>{rightContent}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#fafafa", borderRadius: 14, padding: "16px 18px", border: "1px solid #f0f0f0" }}>
      {hasLeft && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            {exam && (
              <span style={{
                fontSize: 10.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase",
                color: "#6b7280", background: "#e5e7eb", padding: "3px 8px", borderRadius: 5, flexShrink: 0,
              }}>{exam}</span>
            )}
            {(beforeScore || afterScore) && (
              <>
                <span style={{ fontSize: 22, fontWeight: 700, color: beforeScore ? "#b0b0b0" : "#e5e7eb" }}>{beforeScore || "---"}</span>
                <span style={{ fontSize: 13, color: "#d1d5db" }}>{"\u2192"}</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: afterScore ? "#111" : "#e5e7eb" }}>{afterScore || "---"}</span>
              </>
            )}
            {imp !== null && imp > 0 && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 2,
                background: accent, color: t, padding: "2px 8px", borderRadius: 20,
                fontSize: 10.5, fontWeight: 700, marginLeft: "auto", flexShrink: 0,
              }}>
                <Icon name="arrowUp" size={9} />+{imp}
              </span>
            )}
          </div>
          {(timeframe || stars > 0) && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              {timeframe && <span style={{ fontSize: 12, color: "#9ca3af" }}>{timeframe}</span>}
              {stars > 0 && (
                <div style={{ display: "flex", gap: 1 }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <Icon key={i} name="star" size={11} style={{ color: stars >= i ? "#f59e0b" : "#d1d5db" }} />
                  ))}
                </div>
              )}
            </div>
          )}
          <div style={{ height: 1, background: "#ebebeb", marginBottom: 12 }} />
        </>
      )}
      <p style={{ fontSize: 13.5, color: reviewText ? "#374151" : "#d1d5db", lineHeight: 1.55, margin: "0 0 6px", fontStyle: "italic" }}>
        {reviewText ? `\u201C${reviewText}\u201D` : '\u201CReview will appear here...\u201D'}
      </p>
      <p style={{ fontSize: 12, color: sigName ? "#9ca3af" : "#d1d5db", margin: 0, fontWeight: 500 }}>
        {"- "}{sigName || "Parent name"}
      </p>
      {!hasLeft && stars > 0 && (
        <div style={{ display: "flex", gap: 1, marginTop: 6 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <Icon key={i} name="star" size={11} style={{ color: stars >= i ? "#f59e0b" : "#d1d5db" }} />
          ))}
        </div>
      )}
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

// ─── SCREEN 1: PARENT REVIEW ────────────────────────────
function ParentReview({
  tutor, accent, prefill, onSubmit, isMobile,
}: {
  tutor: TutorData; accent: string;
  prefill: ReviewFlowProps["prefill"];
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

  const tutorExam = prefill.exam || "";
  const tutorBefore = prefill.before || "";
  const tutorAfter = prefill.after || "";
  const tutorTimeframe = prefill.timeframe || "";

  const canSubmit = stars > 0 && sigName.trim() && sigEmail.trim();

  function parseMonths(tf: string): number | null {
    const match = tf.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

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
          exam: tutorExam || null,
          scoreBefore: tutorBefore || null,
          scoreAfter: tutorAfter || null,
          months: tutorTimeframe ? parseMonths(tutorTimeframe) : null,
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
    <div style={{
      background: "white", borderRadius: 20,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)",
      padding: isMobile ? "28px 20px" : "36px 32px",
      width: "100%", maxWidth: 520,
    }}>
      <button onClick={() => window.history.back()} style={{
        display: "flex", alignItems: "center", gap: 4, background: "none",
        border: "none", color: "#9ca3af", fontSize: 13, fontWeight: 500,
        cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginBottom: 16,
      }}>
        <Icon name="arrowLeft" size={14} />Back
      </button>

      <h2 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 800, color: "#111", letterSpacing: "-0.02em", margin: "0 0 4px" }}>
        Leave a review for {tutor.firstName}
      </h2>
      <p style={{ fontSize: 14, color: "#9ca3af", margin: "0 0 20px" }}>
        Your review helps other families find great tutors.
      </p>

      {/* Tutor context */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "#fafafa", borderRadius: 12, border: "1px solid #f0f0f0", marginBottom: 20 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%", background: accent,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          overflow: "hidden",
        }}>
          {tutor.profileImageUrl ? (
            <img src={tutor.profileImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: 13, color: t, fontWeight: 600 }}>{initials}</span>
          )}
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#111", margin: 0 }}>{tutor.firstName} {tutor.lastName}</p>
          {tutor.title && <p style={{ fontSize: 11.5, color: "#9ca3af", margin: 0 }}>{tutor.title}</p>}
        </div>
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
        {/* Review text */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Your experience</label>
          <textarea value={reviewText} onChange={e => setReviewText(e.target.value)}
            placeholder={`Tell other families about your experience working with ${tutor.firstName}...`}
            maxLength={2000}
            style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
            onFocus={e => { e.target.style.borderColor = "#111"; }}
            onBlur={e => { e.target.style.borderColor = "#e5e7eb"; }} />
        </div>

        {/* Stars */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Rating</label>
          <StarRating value={stars} onChange={setStars} />
        </div>

        {/* Recommend */}
        <button type="button" onClick={() => setRecommend(!recommend)} style={{
          display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
          borderRadius: 12, border: recommend ? "1.5px solid #111" : "1.5px solid #e5e7eb",
          background: recommend ? "#fafafa" : "white", cursor: "pointer",
          width: "100%", fontFamily: "'DM Sans', sans-serif", marginBottom: 16,
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            background: recommend ? "#111" : "white",
            border: recommend ? "none" : "1.5px solid #d1d5db",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            {recommend && <Icon name="check" size={13} style={{ color: "white" }} />}
          </div>
          <span style={{ fontSize: 14, fontWeight: 500, color: "#111" }}>I recommend this tutor</span>
        </button>

        <div style={{ height: 1, background: "#f3f4f6", margin: "0 0 16px" }} />

        {/* Signature - Name */}
        <div style={{ marginBottom: 16 }}>
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
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>
            Your email
          </label>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 6px" }}>Used to verify your review. Never displayed publicly.</p>
          <input type="email" value={sigEmail} onChange={e => setSigEmail(e.target.value)}
            placeholder="your@email.com" style={inputStyle}
            onFocus={e => { e.target.style.borderColor = "#111"; }}
            onBlur={e => { e.target.style.borderColor = "#e5e7eb"; }} />
        </div>

        {/* Live preview */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#9ca3af", margin: "0 0 10px" }}>Preview</p>
          <ReviewPreview
            exam={tutorExam}
            beforeScore={tutorBefore}
            afterScore={tutorAfter}
            timeframe={tutorTimeframe}
            reviewText={reviewText}
            stars={stars}
            sigName={sigName}
            accent={accent}
            wide={!isMobile}
          />
        </div>

        {/* Submit */}
        <button type="submit" disabled={!canSubmit || loading} style={{
          width: "100%", padding: "14px", borderRadius: 14, border: "none",
          background: canSubmit ? "#111" : "#e5e7eb",
          color: canSubmit ? "white" : "#9ca3af",
          fontSize: 15, fontWeight: 600,
          cursor: canSubmit && !loading ? "pointer" : "default",
          fontFamily: "'DM Sans', sans-serif",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          opacity: loading ? 0.7 : 1,
        }}>
          {loading ? "Submitting..." : "Submit review"} <Icon name="arrowRight" size={16} />
        </button>
        <p style={{ fontSize: 12, color: "#d1d5db", textAlign: "center", marginTop: 10 }}>
          Your review will be visible on {tutor.firstName}&apos;s TutorCard.
        </p>
      </form>
    </div>
  );
}

interface SubmittedReview {
  reviewerName: string;
  rating: number;
  quote: string;
  recommends?: boolean;
}

// ─── SCREEN 2: CONFIRMATION ─────────────────────────────
function ReviewConfirmation({ tutor, accent }: {
  tutor: TutorData; accent: string;
}) {
  const t = textOnAccent(accent);
  const initials = `${tutor.firstName[0] || ""}${tutor.lastName[0] || ""}`.toUpperCase();

  return (
    <div style={{ width: "100%", maxWidth: 440 }}>
      <div style={{
        background: "white", borderRadius: 20,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)",
        padding: "40px 32px", textAlign: "center",
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%", background: "#ecfdf5",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <Icon name="check" size={32} style={{ color: "#059669" }} />
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#111", letterSpacing: "-0.02em", margin: "0 0 8px" }}>
          Thank you!
        </h2>
        <p style={{ fontSize: 14, color: "#9ca3af", margin: "0 0 24px", lineHeight: 1.5 }}>
          Your review has been submitted and will appear on {tutor.firstName}&apos;s TutorCard.
        </p>

        <div style={{
          display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
          background: "#fafafa", borderRadius: 12, border: "1px solid #f0f0f0", justifyContent: "center",
          marginBottom: 24,
        }}>
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
          <p style={{ fontSize: 13, fontWeight: 600, color: "#111", margin: 0 }}>{tutor.firstName} {tutor.lastName}</p>
        </div>

        <div>
          <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 12 }}>Are you a tutor yourself?</p>
          <Link href="/" style={{ textDecoration: "none" }}>
            <button style={{
              padding: "12px 24px", borderRadius: 12, border: "none",
              background: "#111", color: "white", fontSize: 14, fontWeight: 600,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}>
              Create your own TutorCard <Icon name="arrowRight" size={14} />
            </button>
          </Link>
        </div>
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
  const [isMobile, setIsMobile] = useState(false);
  const accent = tutor.avatarColor;

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
          padding: "32px 20px",
        }}>
          {screen === "form" && (
            <ParentReview
              tutor={tutor}
              accent={accent}
              prefill={prefill}
              onSubmit={handleSubmit}
              isMobile={isMobile}
            />
          )}
          {screen === "confirmation" && (
            <ReviewConfirmation
              tutor={tutor}
              accent={accent}
            />
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
