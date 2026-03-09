"use client";

import Icon from "./Icon";
import type { ReviewData } from "./types";

interface ReviewCardProps {
  review: ReviewData;
  accent: string;
  accentText: string;
  wide: boolean;
}

export default function ReviewCard({ review, accent, accentText, wide }: ReviewCardProps) {
  const hasBefore = review.scoreBefore != null && review.scoreBefore !== "";
  const hasAfter = review.scoreAfter != null && review.scoreAfter !== "";
  const hasScores = hasBefore && hasAfter;
  const imp = hasScores ? Number(review.scoreAfter) - Number(review.scoreBefore) : null;

  if (wide) {
    return (
      <div style={{ background: "#fafafa", borderRadius: 14, padding: "18px 22px", border: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex", gap: 20 }}>
          <div style={{ flex: "0 0 auto", minWidth: 160, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {review.exam && (
              <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#6b7280", background: "#e5e7eb", padding: "2px 7px", borderRadius: 4, alignSelf: "flex-start", marginBottom: 8 }}>{review.exam}</span>
            )}
            {hasScores && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: "#b0b0b0" }}>{review.scoreBefore}</span>
                <span style={{ fontSize: 14, color: "#d1d5db" }}>→</span>
                <span style={{ fontSize: 24, fontWeight: 700, color: "#111" }}>{review.scoreAfter}</span>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
              {imp != null && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 2, background: accent, color: accentText, padding: "2px 7px", borderRadius: 20, fontSize: 10.5, fontWeight: 700 }}>
                  <Icon name="arrowUp" size={9} />+{imp}
                </span>
              )}
              {review.months && <span style={{ fontSize: 12, color: "#9ca3af" }}>{review.months} mo</span>}
              <div style={{ display: "flex", gap: 1 }}>
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Icon key={i} name="star" size={10} style={{ color: "#f59e0b" }} />
                ))}
              </div>
            </div>
          </div>
          <div style={{ flex: 1, borderLeft: "1px solid #ebebeb", paddingLeft: 20, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.55, margin: "0 0 6px", fontStyle: "italic" }}>&ldquo;{review.quote}&rdquo;</p>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: 0, fontWeight: 500 }}>
              — {review.reviewerName}{review.reviewerRole ? `, ${review.reviewerRole}` : ""}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#fafafa", borderRadius: 14, padding: "14px 16px", border: "1px solid #f0f0f0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        {review.exam && (
          <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#6b7280", background: "#e5e7eb", padding: "2px 7px", borderRadius: 4 }}>{review.exam}</span>
        )}
        {hasScores && (
          <>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#b0b0b0" }}>{review.scoreBefore}</span>
            <span style={{ fontSize: 13, color: "#d1d5db" }}>→</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#111" }}>{review.scoreAfter}</span>
          </>
        )}
        {imp != null && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 2, background: accent, color: accentText, padding: "2px 7px", borderRadius: 20, fontSize: 10.5, fontWeight: 700, marginLeft: "auto" }}>
            <Icon name="arrowUp" size={9} />+{imp}
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#9ca3af", marginBottom: 12 }}>
        {review.months && <span>{review.months} months</span>}
        {review.months && <span style={{ color: "#e5e7eb" }}>·</span>}
        <div style={{ display: "flex", gap: 1 }}>
          {Array.from({ length: review.rating }).map((_, i) => (
            <Icon key={i} name="star" size={10} style={{ color: "#f59e0b" }} />
          ))}
        </div>
      </div>
      <div style={{ borderTop: "1px solid #ebebeb", paddingTop: 10 }}>
        <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, margin: "0 0 4px", fontStyle: "italic" }}>&ldquo;{review.quote}&rdquo;</p>
        <p style={{ fontSize: 11.5, color: "#9ca3af", margin: 0, fontWeight: 500 }}>
          — {review.reviewerName}{review.reviewerRole ? `, ${review.reviewerRole}` : ""}
        </p>
      </div>
    </div>
  );
}
