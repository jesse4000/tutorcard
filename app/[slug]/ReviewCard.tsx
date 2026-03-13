"use client";

import { useState, useRef, useEffect } from "react";
import Icon from "./Icon";
import type { ReviewData } from "./types";

interface ReviewCardProps {
  review: ReviewData;
  accent: string;
  accentText: string;
  wide: boolean;
}

export default function ReviewCard({ review, wide }: ReviewCardProps) {
  const hasBefore = review.scoreBefore != null && review.scoreBefore !== "";
  const hasAfter = review.scoreAfter != null && review.scoreAfter !== "";
  const hasScores = hasBefore && hasAfter;
  const imp = hasScores ? Number(review.scoreAfter) - Number(review.scoreBefore) : null;

  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);
  const quoteRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = quoteRef.current;
    if (el) setClamped(el.scrollHeight > el.clientHeight + 1);
  }, [review.quote]);

  const clampStyle: React.CSSProperties = expanded ? {} : {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
  };

  return (
    <div style={{ background: "#fafafa", borderRadius: 14, padding: wide ? "18px 22px" : "14px 16px", border: "1px solid #f0f0f0" }}>
      {/* Top section: exam tag, scores, improvement badge */}
      {(review.exam || hasScores) && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            {review.exam && (
              <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#6b7280", background: "#e5e7eb", padding: "2px 7px", borderRadius: 4 }}>{review.exam}</span>
            )}
            {hasScores && (
              <>
                <span style={{ fontSize: wide ? 24 : 20, fontWeight: 700, color: "#b0b0b0" }}>{review.scoreBefore}</span>
                <span style={{ fontSize: wide ? 14 : 13, color: "#d1d5db" }}>→</span>
                <span style={{ fontSize: wide ? 24 : 20, fontWeight: 700, color: "#111" }}>{review.scoreAfter}</span>
              </>
            )}
            {imp != null && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 2, background: "#059669", color: "white", padding: "2px 7px", borderRadius: 20, fontSize: 10.5, fontWeight: 700, marginLeft: hasScores && !review.months ? "auto" : undefined }}>
                <Icon name="arrowUp" size={9} />+{imp}
              </span>
            )}
            {review.months && (
              <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: "auto" }}>
                {review.months} months
              </span>
            )}
          </div>
          <div style={{ height: 1, background: "#ebebeb", marginBottom: 10 }} />
        </>
      )}

      {/* Bottom section: quote + reviewer name with stars */}
      <p ref={quoteRef} style={{ fontSize: wide ? 14 : 13, color: "#374151", lineHeight: 1.55, margin: "0 0 6px", fontStyle: "italic", ...clampStyle }}>
        &ldquo;{review.quote}&rdquo;
      </p>
      {clamped && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: "none", border: "none", padding: 0, cursor: "pointer",
            fontSize: 12, fontWeight: 500, color: "#9ca3af", fontFamily: "'DM Sans', sans-serif",
            marginBottom: 4,
          }}
        >
          {expanded ? "show less" : "show more"}
        </button>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ display: "flex", gap: 1, flexShrink: 0 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Icon key={i} name="star" size={10} style={{ color: i < review.rating ? "#f59e0b" : "#e5e7eb" }} />
          ))}
        </div>
        <p style={{ fontSize: wide ? 12 : 11.5, color: "#9ca3af", margin: 0, fontWeight: 500 }}>
          — {review.reviewerName}{review.reviewerRole ? `, ${review.reviewerRole}` : ""}
        </p>
      </div>
    </div>
  );
}
