"use client";

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
        <>
          <div style={{ padding: "16px 20px" }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#9ca3af", margin: "0 0 10px" }}>Verified Result</p>
            <div style={{ background: "#fafafa", borderRadius: 14, padding: "14px 16px", border: "1px solid #f0f0f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                {a.exam && (
                  <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#6b7280", background: "#e5e7eb", padding: "2px 7px", borderRadius: 4 }}>{a.exam}</span>
                )}
                {hasScores && (
                  <>
                    <span style={{ fontSize: 20, fontWeight: 700, color: "#b0b0b0" }}>{a.scoreBefore}</span>
                    <span style={{ fontSize: 13, color: "#d1d5db" }}>→</span>
                    <span style={{ fontSize: 20, fontWeight: 700, color: "#111" }}>{a.scoreAfter}</span>
                  </>
                )}
                {imp != null && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 2, background: "#059669", color: "white", padding: "2px 7px", borderRadius: 20, fontSize: 10.5, fontWeight: 700, marginLeft: "auto" }}>
                    <Icon name="arrowUp" size={9} />+{imp}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#9ca3af", marginBottom: 12 }}>
                {a.months && <span>{a.months} months</span>}
                {a.months && <span style={{ color: "#e5e7eb" }}>·</span>}
                <div style={{ display: "flex", gap: 1 }}>
                  {Array.from({ length: a.rating }).map((_, i) => (
                    <Icon key={i} name="star" size={10} style={{ color: "#f59e0b" }} />
                  ))}
                </div>
              </div>
              <div style={{ borderTop: "1px solid #ebebeb", paddingTop: 10 }}>
                <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, margin: "0 0 4px", fontStyle: "italic" }}>&ldquo;{a.quote}&rdquo;</p>
                <p style={{ fontSize: 11.5, color: "#9ca3af", margin: 0, fontWeight: 500 }}>— {a.reviewerName}{a.reviewerRole ? `, ${a.reviewerRole}` : ""}</p>
              </div>
            </div>
          </div>
          <div style={{ height: 1, background: "#f3f4f6", margin: "0 20px" }} />
        </>
      )}

      {/* Links */}
      <div style={{ padding: "8px 12px" }}>
        {tutor.links.map((link, i) => {
          const iconName = LINK_TYPE_ICONS[link.type] || "link";
          const label = link.label || link.url || link.type.replace(/^\S+\s/, "");
          const href =
            link.type === "📞 Phone"
              ? `tel:${link.url.replace(/[^+\d]/g, "")}`
              : link.url.startsWith("http")
                ? link.url
                : link.url.includes("@")
                  ? `mailto:${link.url}`
                  : `https://${link.url}`;

          return (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
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
