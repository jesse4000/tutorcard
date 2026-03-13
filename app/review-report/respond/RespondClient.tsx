"use client";

import { useState, useEffect } from "react";
import SimpleHeader from "@/components/SimpleHeader";
import SimpleFooter from "@/components/SimpleFooter";

interface ReportContext {
  reportId: string;
  reason: string;
  deadlineAt: string;
  tutorName: string;
  review: {
    reviewerName: string;
    exam: string | null;
    quote: string;
    scoreBefore: string | null;
    scoreAfter: string | null;
    rating: number;
  } | null;
}

const Icon = ({ name, size = 16, ...props }: { name: string; size?: number } & React.SVGProps<SVGSVGElement>) => {
  const paths: Record<string, React.ReactNode> = {
    flag: <><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
    check: <polyline points="20 6 9 17 4 12" />,
    x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
    send: <><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  };
  const fill = name === "star" ? "currentColor" : "none";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={fill === "none" ? "currentColor" : "none"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {paths[name]}
    </svg>
  );
};

export default function RespondClient({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<ReportContext | null>(null);
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchContext() {
      try {
        const res = await fetch(`/api/review-reports/respond?token=${token}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "This link is no longer valid.");
          return;
        }
        setContext(data);
      } catch {
        setError("Failed to load report details. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchContext();
  }, [token]);

  const handleSubmit = async () => {
    if (response.trim().length < 20 || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/review-reports/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, response: response.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit response.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Failed to submit response. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = response.trim().length >= 20 && !submitting;

  const daysLeft = context
    ? Math.max(0, Math.ceil((new Date(context.deadlineAt).getTime() - Date.now()) / 86400000))
    : 0;

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif", background: "#f5f5f4", width: "100%" }}>
        <SimpleHeader />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 16px" }}>
          <p style={{ fontSize: 14, color: "#9ca3af" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !context) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif", background: "#f5f5f4", width: "100%" }}>
        <SimpleHeader />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 16px" }}>
          <div style={{ background: "white", borderRadius: 20, padding: "40px 32px", maxWidth: 440, width: "100%", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Icon name="x" size={28} style={{ color: "#dc2626" }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111", margin: "0 0 8px" }}>Link expired or invalid</h2>
            <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.5 }}>{error}</p>
          </div>
        </div>
        <SimpleFooter />
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif", background: "#f5f5f4", width: "100%" }}>
        <SimpleHeader />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 16px" }}>
          <div style={{ background: "white", borderRadius: 20, padding: "40px 32px", maxWidth: 440, width: "100%", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Icon name="check" size={28} style={{ color: "#059669" }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111", margin: "0 0 8px" }}>Response submitted</h2>
            <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.5, margin: "0 0 8px" }}>
              Thank you for responding. Our team will review both sides and make a fair decision.
            </p>
            <p style={{ fontSize: 13, color: "#d1d5db", lineHeight: 1.5 }}>
              You can safely close this page.
            </p>
          </div>
        </div>
        <SimpleFooter />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif", background: "#f5f5f4", width: "100%" }}>
        <SimpleHeader />

        <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 16px 60px" }}>
          <div style={{ background: "white", borderRadius: 20, padding: "32px", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="flag" size={20} style={{ color: "#d97706" }} />
              </div>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111", margin: "0 0 2px" }}>Your review has been flagged</h1>
                <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
                  Respond within <span style={{ fontWeight: 600, color: "#d97706" }}>{daysLeft} day{daysLeft !== 1 ? "s" : ""}</span> to keep your review
                </p>
              </div>
            </div>

            {/* Your original review */}
            {context?.review && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Your review for {context.tutorName}</label>
                <div style={{ background: "#fafafa", borderRadius: 12, padding: "14px 16px", border: "1px solid #f0f0f0" }}>
                  {context.review.exam && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#6b7280", background: "#e5e7eb", padding: "2px 7px", borderRadius: 4 }}>{context.review.exam}</span>
                      {context.review.scoreBefore && context.review.scoreAfter && (
                        <>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#b0b0b0" }}>{context.review.scoreBefore}</span>
                          <span style={{ fontSize: 11, color: "#d1d5db" }}>&rarr;</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{context.review.scoreAfter}</span>
                        </>
                      )}
                      <div style={{ display: "flex", gap: 1, marginLeft: "auto" }}>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Icon key={i} name="star" size={9} style={{ color: context.review!.rating >= i ? "#f59e0b" : "#d1d5db" }} />
                        ))}
                      </div>
                    </div>
                  )}
                  <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, margin: 0, fontStyle: "italic" }}>&ldquo;{context.review.quote}&rdquo;</p>
                </div>
              </div>
            )}

            {/* Tutor's reason */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Why {context?.tutorName} flagged your review</label>
              <div style={{ background: "#fef2f2", borderRadius: 12, padding: "14px 16px", border: "1px solid #fecaca" }}>
                <p style={{ fontSize: 13, color: "#991b1b", lineHeight: 1.5, margin: 0, fontStyle: "italic" }}>&ldquo;{context?.reason}&rdquo;</p>
              </div>
            </div>

            {/* Response textarea */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Your response</label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Provide additional context or evidence to support your review. For example: explain your experience, provide details about your tutoring sessions, or clarify the scores you reported..."
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 10,
                  border: "1.5px solid #e5e7eb", fontSize: 14, color: "#111",
                  outline: "none", boxSizing: "border-box", background: "white",
                  fontFamily: "'DM Sans', sans-serif", minHeight: 140, resize: "vertical",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#111"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; }}
              />
              <p style={{ fontSize: 12, color: response.trim().length >= 20 ? "#059669" : "#d1d5db", margin: "6px 0 0" }}>
                {response.trim().length < 20 ? `${20 - response.trim().length} more characters needed` : "Looks good"}
              </p>
            </div>

            {/* Info box */}
            <div style={{ background: "#fafafa", borderRadius: 12, padding: "14px 16px", border: "1px solid #f0f0f0", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Icon name="shield" size={14} style={{ color: "#6b7280" }} />
                <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", margin: 0 }}>What happens next</p>
              </div>
              <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5, margin: 0 }}>
                Our team will review your response alongside the tutor&apos;s report and make a fair decision. You do not need a TutorCard account.
              </p>
            </div>

            {error && (
              <p style={{ fontSize: 13, color: "#dc2626", marginBottom: 16 }}>{error}</p>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                width: "100%", padding: "14px", borderRadius: 14, border: "none",
                background: canSubmit ? "#111" : "#e5e7eb",
                color: canSubmit ? "white" : "#9ca3af",
                fontSize: 15, fontWeight: 600, cursor: canSubmit ? "pointer" : "default",
                fontFamily: "'DM Sans', sans-serif",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              <Icon name="send" size={15} />
              {submitting ? "Submitting..." : "Submit response"}
            </button>
          </div>
        </div>

        <SimpleFooter />
      </div>
    </>
  );
}
