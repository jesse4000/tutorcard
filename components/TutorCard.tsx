"use client";

import QrSvg from "./QrSvg";

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
  openToReferrals: boolean;
}

const LINK_ICONS: Record<string, string> = {
  "🌐 Website": "🌐",
  "📅 Booking": "📅",
  "📋 Resource": "📋",
  "📧 Email": "📧",
  "💬 WhatsApp": "💬",
};

interface TutorCardProps {
  data: TutorData;
  variant?: "preview" | "full";
}

export default function TutorCard({ data, variant = "preview" }: TutorCardProps) {
  const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ");
  const initials =
    [data.firstName?.[0], data.lastName?.[0]].filter(Boolean).join("") || "?";
  const allTags = [
    ...data.exams.slice(0, 2),
    ...data.subjects.slice(0, 2),
    ...data.locations.slice(0, 1),
  ];
  const urlDisplay = data.slug
    ? `studyspaces.com/${data.slug}`
    : "studyspaces.com/your-card";
  const isPreview = variant === "preview";

  return (
    <div className={isPreview ? "live-card" : "mock-card"}>
      {/* Head */}
      <div className={isPreview ? "lc-head" : "mc-head"}>
        <div
          className={isPreview ? "lc-av" : "mc-av"}
          style={{ background: data.avatarColor }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className={isPreview ? "lc-name" : "mc-name"}>
            {fullName || "Your Name"}
          </div>
          <div className={isPreview ? "lc-title-text" : "mc-title"}>
            {data.title || "Your title will appear here"}
          </div>
        </div>
        {data.openToReferrals && (
          <div className={isPreview ? "lc-open" : "open-badge"}>
            Open{!isPreview && " to referrals"}
          </div>
        )}
      </div>

      {/* Tags */}
      <div className={isPreview ? "lc-tags" : "mc-tags"}>
        {allTags.length === 0 ? (
          <span className="empty-placeholder">
            Subjects &amp; exams will appear here
          </span>
        ) : (
          allTags.map((t, i) => (
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
          ))
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
          data.links.slice(0, 3).map((link, i) => {
            const icon = LINK_ICONS[link.type] || "🔗";
            const label =
              link.label || link.url || link.type.replace(/^\S+\s/, "");
            const href = link.url.startsWith("http")
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

      {/* Referral block */}
      <div className={isPreview ? "lc-ref" : "mc-ref"}>
        <div>
          <div className={isPreview ? "lc-ref-lbl" : "mc-ref-lbl"}>
            Active referral
          </div>
          <div className={isPreview ? "lc-ref-val" : "mc-ref-val"}>
            {isPreview
              ? "Add referrals after creating your card"
              : "SAT Math · New Jersey · 10th grade"}
          </div>
        </div>
        <div className={isPreview ? "lc-ref-n" : "mc-ref-n"}>
          {isPreview ? "0" : "4"}
        </div>
      </div>

      <div style={{ height: isPreview ? 8 : 10 }} />

      {/* QR row */}
      <div className={isPreview ? "lc-qr-row" : "mc-qr"}>
        <div className={isPreview ? "lc-qr-text" : undefined}>
          <div className={isPreview ? "lc-qr-label" : "mc-qr-label"}>
            Scan to view card
          </div>
          <div className={isPreview ? "lc-qr-url" : "mc-qr-sub"}>
            {urlDisplay}
          </div>
        </div>
        <div className={isPreview ? undefined : "mc-qr-svg"}>
          <QrSvg size={isPreview ? 38 : 48} />
        </div>
      </div>
    </div>
  );
}
