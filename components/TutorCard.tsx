"use client";

import { useState } from "react";

export interface TutorLink {
  type: string;
  url: string;
  label: string;
}

export interface TutorData {
  firstName: string;
  lastName: string;
  title: string;
  slug: string;
  avatarColor: string;
  exams: string[];
  subjects: string[];
  locations: string[];
  links: TutorLink[];
  businessName?: string;
  profileImageUrl?: string;
}

const LINK_ICONS: Record<string, string> = {
  "🌐 Website": "🌐",
  "📅 Booking": "📅",
  "📋 Resource": "📋",
  "📧 Email": "📧",
  "📞 Phone": "📞",
  "💬 WhatsApp": "💬",
  "📘 Facebook": "📘",
  "📸 Instagram": "📸",
  "💼 LinkedIn": "💼",
};

interface TutorCardProps {
  data: TutorData;
  variant?: "preview" | "full";
  vouchCount?: number;
}

export default function TutorCard({ data, variant = "preview", vouchCount }: TutorCardProps) {
  const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ");
  const initials =
    [data.firstName?.[0], data.lastName?.[0]].filter(Boolean).join("") || "?";
  const allTags = [
    ...data.exams,
    ...data.subjects,
    ...data.locations,
  ];
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const visibleTags = tagsExpanded ? allTags : allTags.slice(0, 3);
  const overflowCount = allTags.length - 3;
  const isPreview = variant === "preview";

  return (
    <div className={isPreview ? "live-card" : "mock-card"}>
      {/* Head */}
      <div className={isPreview ? "lc-head" : "mc-head"}>
        <div
          className={isPreview ? "lc-av" : "mc-av"}
          style={{ background: data.profileImageUrl ? "transparent" : data.avatarColor }}
        >
          {data.profileImageUrl ? (
            <img
              src={data.profileImageUrl}
              alt={fullName}
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
            />
          ) : (
            initials
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className={isPreview ? "lc-name" : "mc-name"}>
            {fullName || "Your Name"}
          </div>
          {data.businessName && (
            <div className={isPreview ? "lc-business" : "mc-business"}>
              {data.businessName}
            </div>
          )}
        </div>
      </div>
      <div className={isPreview ? "lc-title-text" : "mc-title"}>
        {data.title || "Your title will appear here"}
      </div>

      {/* Tags */}
      <div className={isPreview ? "lc-tags" : "mc-tags"}>
        {allTags.length === 0 ? (
          <span className="empty-placeholder">
            Subjects &amp; exams will appear here
          </span>
        ) : (
          <>
            {visibleTags.map((t, i) => (
              <span
                key={t + i}
                className={
                  isPreview
                    ? `lc-tag${i === 0 ? " accent" : ""}`
                    : `tag${i === 0 ? " accent" : ""}`
                }
              >
                {t}
              </span>
            ))}
            {overflowCount > 0 && (
              <span
                className={`${isPreview ? "lc-tag" : "tag"} tag-toggle`}
                onClick={() => setTagsExpanded(!tagsExpanded)}
              >
                {tagsExpanded ? "Show less" : `+${overflowCount}`}
              </span>
            )}
          </>
        )}
      </div>

      {/* Rule */}
      <div className={isPreview ? "lc-rule" : "mc-rule"} />

      {/* Action buttons */}
      <div className={isPreview ? "lc-actions" : "mc-actions"}>
        {data.links.length === 0 ? (
          <div className="empty-placeholder">
            Your action buttons will appear here
          </div>
        ) : (
          data.links.map((link, i) => {
            const icon = LINK_ICONS[link.type] || "🔗";
            const label =
              link.label || link.url || link.type.replace(/^\S+\s/, "");
            const href =
              link.type === "📞 Phone"
                ? `tel:${link.url.replace(/[^+\d]/g, "")}`
                : link.url.startsWith("http")
                  ? link.url
                  : link.url.includes("@")
                    ? `mailto:${link.url}`
                    : `https://${link.url}`;

            if (isPreview) {
              const cls =
                i === 0
                  ? "lc-btn primary"
                  : i === 2
                    ? "lc-btn amber-btn"
                    : "lc-btn";
              return (
                <div key={i} className={cls}>
                  <span className="lc-btn-icon">{icon}</span>
                  {label}
                  <span className="lc-btn-arr">↗</span>
                </div>
              );
            }

            const cls =
              i === 0
                ? "mc-action-btn primary"
                : i === 2
                  ? "mc-action-btn amber"
                  : "mc-action-btn";
            return (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={cls}
              >
                <span className="btn-icon">{icon}</span>
                {label}
                <span className="btn-arrow">↗</span>
              </a>
            );
          })
        )}
      </div>

      {/* Vouch count badge */}
      {!isPreview && vouchCount !== undefined && vouchCount > 0 && (
        <div className="vouch-badge">
          <span className="vouch-badge-icon">🤝</span>
          Vouched by {vouchCount} {vouchCount === 1 ? "tutor" : "tutors"}
        </div>
      )}

    </div>
  );
}
