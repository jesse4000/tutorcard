"use client";

import { useState, useRef, useEffect } from "react";
import Icon, { LINK_TYPE_ICONS, textOnAccent } from "./Icon";
import type { TutorData } from "@/components/TutorCard";
import type { ReviewData, BadgeData } from "./types";

interface ProfileCardProps {
  tutor: TutorData & { id: string };
  accent: string;
  vouchCount: number;
  averageRating: number | null;
  reviewCount: number;
  featuredReview: ReviewData | null;
  firstBadge: BadgeData | null;
  onMessage: () => void;
}

function FeaturedReview({ a, hasScores, imp }: { a: ReviewData; hasScores: boolean; imp: number | null }) {
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);
  const quoteRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = quoteRef.current;
    if (el) setClamped(el.scrollHeight > el.clientHeight + 1);
  }, [a.quote]);

  const clampStyle: React.CSSProperties = expanded ? {} : {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
  };

  return (
    <>
      <div style={{ padding: "16px 20px" }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#9ca3af", margin: "0 0 10px" }}>Verified Result</p>
        <div style={{ background: "#fafafa", borderRadius: 14, padding: "14px 14px", border: "1px solid #f0f0f0" }}>
          {/* Top: exam, scores, improvement */}
          {(a.exam || hasScores) && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 10, flexWrap: "nowrap", overflow: "hidden" }}>
                {a.exam && (
                  <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#6b7280", background: "#e5e7eb", padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flexShrink: 1, minWidth: 0 }}>{a.exam}</span>
                )}
                {hasScores && (
                  <>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "#b0b0b0", flexShrink: 0 }}>{a.scoreBefore}</span>
                    <span style={{ fontSize: 11, color: "#d1d5db", flexShrink: 0 }}>→</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "#111", flexShrink: 0 }}>{a.scoreAfter}</span>
                  </>
                )}
                {imp != null && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 2, background: "#059669", color: "white", padding: "2px 6px", borderRadius: 20, fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                    <Icon name="arrowUp" size={8} />+{imp}
                  </span>
                )}
                {a.months && (
                  <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: "auto", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {a.months} months
                  </span>
                )}
              </div>
              <div style={{ height: 1, background: "#ebebeb", marginBottom: 10 }} />
            </>
          )}
          {/* Bottom: quote + reviewer name with stars */}
          <p ref={quoteRef} style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, margin: "0 0 4px", fontStyle: "italic", ...clampStyle }}>&ldquo;{a.quote}&rdquo;</p>
          {clamped && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                background: "none", border: "none", padding: 0, cursor: "pointer",
                fontSize: 11, fontWeight: 500, color: "#9ca3af", fontFamily: "'DM Sans', sans-serif",
                marginBottom: 4,
              }}
            >
              {expanded ? "show less" : "show more"}
            </button>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", gap: 1, flexShrink: 0 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon key={i} name="star" size={10} style={{ color: i < a.rating ? "#f59e0b" : "#e5e7eb" }} />
              ))}
            </div>
            <p style={{ fontSize: 11.5, color: "#9ca3af", margin: 0, fontWeight: 500 }}>— {a.reviewerName}{a.reviewerRole ? `, ${a.reviewerRole}` : ""}</p>
          </div>
        </div>
      </div>
      <div style={{ height: 1, background: "#f3f4f6", margin: "0 20px" }} />
    </>
  );
}

export default function ProfileCard({
  tutor,
  accent,
  vouchCount,
  averageRating,
  reviewCount,
  featuredReview,
  firstBadge,
  onMessage,
}: ProfileCardProps) {
  const t = textOnAccent(accent);
  const fullName = [tutor.firstName, tutor.lastName].filter(Boolean).join(" ");
  const initials = [tutor.firstName?.[0], tutor.lastName?.[0]].filter(Boolean).join("");
  const isRemote = tutor.locations.some((l) => /remote|online/i.test(l));
  const physicalLocations = tutor.locations.filter((l) => !/remote|online/i.test(l));
  const location = physicalLocations[0] || "";

  const a = featuredReview;
  const hasScores = a && a.scoreBefore && a.scoreAfter;
  const imp = hasScores ? Number(a.scoreAfter) - Number(a.scoreBefore) : null;

  return (
    <div style={{ background: "white", borderRadius: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "28px 24px 18px", textAlign: "center" }}>
        <div style={{ width: 68, height: 68, borderRadius: "50%", background: tutor.profileImageUrl ? "transparent" : accent, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", overflow: "hidden" }}>
          {tutor.profileImageUrl ? (
            <img src={tutor.profileImageUrl} alt={fullName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: 22, color: t, fontWeight: 600 }}>{initials}</span>
          )}
        </div>
        <h1 style={{ fontSize: 21, fontWeight: 700, color: "#111", margin: "0 0 1px", letterSpacing: "-0.02em" }}>{fullName}</h1>
        <p style={{ fontSize: 13.5, color: "#6b7280", margin: "0 0 8px" }}>{tutor.title}</p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 12.5, color: "#9ca3af" }}>
          {location && <span>{location}</span>}
          {location && isRemote && <span style={{ color: "#d1d5db" }}>·</span>}
          {isRemote && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, color: accent, fontWeight: 500 }}>
              <Icon name="wifi" size={12} style={{ color: accent }} />Remote
            </span>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 12 }}>
          {vouchCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: 20, border: "1px solid #e5e7eb", fontSize: 12.5 }}>
              <Icon name="users" size={12} style={{ color: "#6b7280" }} />
              <span style={{ fontWeight: 600, color: "#111" }}>{vouchCount}</span>
              <span style={{ color: "#9ca3af" }}>vouches</span>
            </div>
          )}
          {averageRating != null && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: 20, border: "1px solid #e5e7eb", fontSize: 12.5 }}>
              <Icon name="star" size={11} style={{ color: "#f59e0b" }} />
              <span style={{ fontWeight: 600, color: "#111" }}>{averageRating.toFixed(1)}</span>
              <span style={{ color: "#9ca3af" }}>({reviewCount})</span>
            </div>
          )}
        </div>

        {/* Specialties */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 5, marginTop: 12 }}>
          {tutor.exams.map((s) => (
            <span key={s} style={{ padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 500, color: "#374151", background: "#f3f4f6" }}>{s}</span>
          ))}
          {firstBadge && (
            <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, color: "#059669", background: "#ecfdf5", display: "flex", alignItems: "center", gap: 3 }}>
              <Icon name="shield" size={10} />{firstBadge.name}
            </span>
          )}
        </div>
      </div>

      <div style={{ height: 1, background: "#f3f4f6", margin: "0 20px" }} />

      {/* Verified Result */}
      {a && (
        <FeaturedReview a={a} hasScores={!!hasScores} imp={imp} />
      )}

      {/* Links */}
      <div style={{ padding: "8px 12px" }}>
        {tutor.links.map((link, i) => {
          const iconName = LINK_TYPE_ICONS[link.type] || "link";
          const label = link.label || link.url || link.type.replace(/^\S+\s/, "");
          const isPhone = link.type === "📞 Phone" || link.type === "Phone";
          const isEmail = link.type === "📧 Email" || link.type === "Email";
          const href = isPhone
            ? `tel:${link.url.replace(/[^+\d]/g, "")}`
            : isEmail
              ? `mailto:${link.url}`
              : link.url.startsWith("http")
                ? link.url
                : link.url.includes("@")
                  ? `mailto:${link.url}`
                  : `https://${link.url}`;
          const isNativeProtocol = isPhone || isEmail || href.startsWith("mailto:");

          return (
            <a
              key={i}
              href={href}
              {...(!isNativeProtocol && { target: "_blank", rel: "noopener noreferrer" })}
              className="pf-link"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 12px",
                borderRadius: 12,
                cursor: "pointer",
                transition: "background 0.15s",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name={iconName} size={15} style={{ color: "#374151" }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#111", flex: 1 }}>{label}</span>
              <Icon name="chevron" size={13} style={{ color: "#d1d5db" }} />
            </a>
          );
        })}
      </div>

      {/* Send message button */}
      <div style={{ padding: "4px 20px 20px" }}>
        <button
          onClick={onMessage}
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: 14,
            border: "none",
            background: accent,
            color: t,
            fontSize: 14.5,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <Icon name="msg" size={15} />Send a message
        </button>
      </div>
    </div>
  );
}
