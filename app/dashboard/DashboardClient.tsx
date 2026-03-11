"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from "@/lib/supabase/client";
import type { TutorLink } from "@/components/TutorCard";
import { LINK_TYPE_ICONS } from "../[slug]/Icon";
import type { ReviewData, VoucherData, BadgeData } from "../[slug]/types";

// ─── TYPES ──────────────────────────────────────────────
interface TutorRow {
  id: string;
  first_name: string;
  last_name: string;
  title: string | null;
  slug: string;
  avatar_color: string;
  exams: string[];
  subjects: string[];
  locations: string[];
  links: TutorLink[];
  email: string;
  business_name: string | null;
  years_experience: number | null;
  profile_image_url: string | null;
}

interface DashboardClientProps {
  tutor: TutorRow | null;
  userEmail: string;
  vouchCount: number;
  reviewCount: number;
  averageRating: number | null;
  reviews: ReviewData[];
  vouchers: VoucherData[];
  badges: BadgeData[];
  inquiryCount: number;
  inviteCodes: InviteCode[];
}

// ─── INVITE CODES ───────────────────────────────────────
interface InviteCode {
  id: string;
  code: string;
  claimed: boolean;
  name: string | null;
  slug: string | null;
}

// ─── UTILITIES ──────────────────────────────────────────
function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}
const toac = (hex: string) => (isLight(hex) ? "#111" : "white");

// ─── ICON ───────────────────────────────────────────────
const iconPaths: Record<string, React.ReactNode> = {
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
  zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
  globe: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
  phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>,
  star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>,
  arrowUp: <><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></>,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
  users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  chevron: <polyline points="9 18 15 12 9 6"/>,
  x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  wifi: <><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></>,
  check: <polyline points="20 6 9 17 4 12"/>,
  award: <><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></>,
  edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  share: <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>,
  copy: <><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
  logOut: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  send: <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
  mail: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
  plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  trendUp: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
  qr: <><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="4" height="4" rx="0.5"/><line x1="22" y1="14" x2="22" y2="14.01"/><line x1="22" y1="18" x2="22" y2="22"/><line x1="18" y1="22" x2="18" y2="22.01"/></>,
  link2: <><path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3"/><line x1="8" y1="12" x2="16" y2="12"/></>,
  clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  clipboard: <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></>,
  instagram: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></>,
  linkedin: <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></>,
  facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>,
  whatsapp: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>,
  link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
  arrowRight: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
  arrowLeft: <><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>,
  gift: <><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></>,
  ext: <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></>,
};

function Icon({ name, size = 16, ...props }: { name: string; size?: number } & React.SVGProps<SVGSVGElement>) {
  const fill = name === "star" ? "currentColor" : "none";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={fill === "none" ? "currentColor" : "none"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {iconPaths[name]}
    </svg>
  );
}

// ─── MODAL SHELL ────────────────────────────────────────
function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, animation: "fadeIn 0.15s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 480, padding: "28px", animation: "scaleIn 0.2s ease", maxHeight: "90vh", overflow: "auto" }}>
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: 0 }}>{title}</h3>
      <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6b7280" }}><Icon name="x" size={15} /></button>
    </div>
  );
}

// ─── COPY LINK ROW ──────────────────────────────────────
function CopyLinkRow({ url, copied, onCopy }: { url: string; copied: boolean; onCopy: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ flex: 1, padding: "11px 14px", fontSize: 14, color: "#111", fontFamily: "'DM Sans', sans-serif", background: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{url}</div>
      <button onClick={onCopy} style={{
        padding: "11px 16px", border: "none", borderLeft: "1.5px solid #e5e7eb",
        background: copied ? "#ecfdf5" : "#f9fafb", color: copied ? "#059669" : "#374151",
        fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", transition: "all 0.2s",
      }}><Icon name={copied ? "check" : "copy"} size={14} />{copied ? "Copied!" : "Copy link"}</button>
    </div>
  );
}

// ─── SHARE POPUP ────────────────────────────────────────
function SharePopup({ onClose, slug }: { onClose: () => void; slug: string }) {
  const [copied, setCopied] = useState(false);
  const cardUrl = typeof window !== "undefined" ? `${window.location.origin}/${slug}` : `/${slug}`;
  const displayUrl = `tutorcard.co/${slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(cardUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Share your card" onClose={onClose} />
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <div style={{ width: 160, height: 160, borderRadius: 16, background: "#fafafa", border: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <QRCodeSVG value={cardUrl} size={128} level="M" />
        </div>
      </div>
      <CopyLinkRow url={displayUrl} copied={copied} onCopy={handleCopy} />
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        {[{ label: "Email", icon: "mail" }, { label: "Text", icon: "send" }, { label: "LinkedIn", icon: "globe" }].map(s => (
          <button key={s.label} className="action-btn" style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid #e5e7eb", background: "white", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "#374151", transition: "background 0.15s" }}>
            <Icon name={s.icon} size={14} style={{ color: "#6b7280" }} />{s.label}
          </button>
        ))}
      </div>
    </Modal>
  );
}

// ─── INVITE CODE ROW ────────────────────────────────────
function CodeRow({ code, claimed, name, slug }: { code: string; claimed: boolean; name: string | null; slug: string | null }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (claimed) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 14px", borderRadius: 12,
        background: "#fafafa", border: "1px solid #f0f0f0",
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%", background: "#ecfdf5",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Icon name="check" size={15} style={{ color: "#059669" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 600, color: "#d1d5db", letterSpacing: "0.03em" }}>{code}</span>
        </div>
        <a href={slug ? `/${slug}` : "#"} target={slug ? "_blank" : undefined} rel={slug ? "noopener noreferrer" : undefined} onClick={(e) => { if (!slug) e.preventDefault(); }} style={{
          fontSize: 13, fontWeight: 600, color: "#111",
          textDecoration: "none", display: "flex", alignItems: "center", gap: 4,
          transition: "color 0.15s",
        }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#4f46e5"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#111"; }}
        >
          {name}
          <Icon name="ext" size={11} />
        </a>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 14px", borderRadius: 12,
      background: "white", border: "1.5px dashed #e5e7eb",
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: "50%", background: "#f3f4f6",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon name="gift" size={14} style={{ color: "#d1d5db" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "#111", letterSpacing: "0.03em" }}>{code}</span>
      </div>
      <button onClick={handleCopy} className="action-btn" style={{
        padding: "5px 12px", borderRadius: 8, border: "none",
        background: copied ? "#ecfdf5" : "#f3f4f6",
        color: copied ? "#059669" : "#374151",
        fontSize: 12, fontWeight: 600, cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        display: "flex", alignItems: "center", gap: 4,
        transition: "all 0.15s",
      }}>
        <Icon name={copied ? "check" : "copy"} size={12} />
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

// ─── INVITE POPUP ───────────────────────────────────────
function InvitePopup({ onClose, codes }: { onClose: () => void; codes: InviteCode[] }) {
  const claimed = codes.filter((c) => c.claimed).length;
  const remaining = codes.length - claimed;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, animation: "fadeIn 0.15s ease" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 440, padding: "32px", animation: "scaleIn 0.2s ease", maxHeight: "90vh", overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="gift" size={20} style={{ color: "white" }} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: 0 }}>Your invites</h3>
              <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
                <span style={{ fontWeight: 600, color: remaining > 0 ? "#111" : "#9ca3af" }}>{remaining}</span> of {codes.length} left
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6b7280" }}>
            <Icon name="x" size={15} />
          </button>
        </div>

        <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 20px", lineHeight: 1.5 }}>
          Each code gives a fellow tutor a free year of TutorCard. Share them with people whose work you trust.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {codes.map((c) => (
            <CodeRow key={c.id} code={c.code} claimed={c.claimed} name={c.name} slug={c.slug} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── REVIEW PREVIEW (inline in popup) ───────────────────
function DashboardReviewPreview({ exam, beforeScore, afterScore, timeframe, accent }: {
  exam: string; beforeScore: string; afterScore: string; timeframe: string; accent: string;
}) {
  const t = toac(accent);
  const imp = beforeScore && afterScore ? Number(afterScore) - Number(beforeScore) : null;
  const hasLeft = exam || beforeScore || afterScore || timeframe;

  const rightContent = (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <p style={{ fontSize: 13, color: "#d1d5db", lineHeight: 1.55, margin: "0 0 6px", fontStyle: "italic" }}>
        {"\u201CReview will appear here...\u201D"}
      </p>
      <p style={{ fontSize: 11.5, color: "#d1d5db", margin: 0, fontWeight: 500 }}>
        {"- Parent name"}
      </p>
    </div>
  );

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
                background: "#059669", color: "white", padding: "2px 8px", borderRadius: 20,
                fontSize: 10.5, fontWeight: 700, marginLeft: "auto", flexShrink: 0,
              }}>
                <Icon name="arrowUp" size={9} />+{imp}
              </span>
            )}
          </div>
          {timeframe && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>{timeframe}</span>
            </div>
          )}
          <div style={{ height: 1, background: "#ebebeb", marginBottom: 12 }} />
        </>
      )}
      {rightContent}
    </div>
  );
}

// ─── REVIEW REQUEST POPUP ───────────────────────────────
function ReviewRequestPopup({ onClose, slug, tutor }: { onClose: () => void; slug: string; tutor: TutorRow }) {
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [exam, setExam] = useState("");
  const [scoreBefore, setScoreBefore] = useState("");
  const [scoreAfter, setScoreAfter] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const accent = tutor.avatar_color || "#4f46e5";
  const tutorName = `${tutor.first_name} ${tutor.last_name}`;

  const specialties = [...new Set([...(tutor.exams || []), ...(tutor.subjects || [])])];

  const buildReviewUrl = () => {
    const params = new URLSearchParams();
    if (exam) params.set("exam", exam);
    if (scoreBefore) params.set("before", scoreBefore);
    if (scoreAfter) params.set("after", scoreAfter);
    if (timeframe) params.set("timeframe", timeframe);
    const qs = params.toString();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/${slug}/review${qs ? `?${qs}` : ""}`;
  };
  const reviewUrl = buildReviewUrl();
  const displayUrl = `tutorcard.co/${slug}/review`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reviewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleSend = async () => {
    if (!email.trim()) return;
    setSent(true);
    try {
      await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email.trim(),
          subject: `${tutorName} is requesting a review on TutorCard`,
          html: `<p>Hi,</p><p>${tutorName} would like you to leave a review on their TutorCard profile.</p><p><a href="${reviewUrl}">Leave a review</a></p><p>Thank you!</p>`,
        }),
      });
    } catch {
      // Silently handle — the UI already shows "Sent!"
    }
    setTimeout(() => { setSent(false); setEmail(""); }, 2000);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: 10,
    border: "1.5px solid #e5e7eb", fontSize: 14, color: "#111",
    outline: "none", boxSizing: "border-box", background: "white",
    fontFamily: "'DM Sans', sans-serif",
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Request a review" onClose={onClose} />
      <p style={{ fontSize: 13.5, color: "#6b7280", margin: "0 0 20px", lineHeight: 1.5 }}>
        Fill in what you know. The parent fills the rest.
      </p>

      {/* Exam / subject selector */}
      {specialties.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
            Exam or subject <span style={{ fontWeight: 400, color: "#9ca3af" }}>(optional)</span>
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {specialties.map(s => (
              <button key={s} onClick={() => setExam(exam === s ? "" : s)} style={{
                padding: "6px 14px", borderRadius: 8, cursor: "pointer",
                border: exam === s ? "1.5px solid #111" : "1.5px solid #e5e7eb",
                background: exam === s ? "#111" : "white",
                color: exam === s ? "white" : "#374151",
                fontSize: 12.5, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.15s",
              }}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {/* Score improvement */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
          Score / grade improvement <span style={{ fontWeight: 400, color: "#9ca3af" }}>(optional)</span>
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input type="number" value={scoreBefore} onChange={e => setScoreBefore(e.target.value)}
            placeholder="Before" style={{ ...inputStyle, flex: 1, textAlign: "center" }}
            onFocus={e => e.target.style.borderColor = "#111"}
            onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
          <span style={{ fontSize: 14, color: "#d1d5db", flexShrink: 0 }}>{"\u2192"}</span>
          <input type="number" value={scoreAfter} onChange={e => setScoreAfter(e.target.value)}
            placeholder="After" style={{ ...inputStyle, flex: 1, textAlign: "center" }}
            onFocus={e => e.target.style.borderColor = "#111"}
            onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
        </div>
      </div>

      {/* Timeframe */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
          Timeframe <span style={{ fontWeight: 400, color: "#9ca3af" }}>(optional)</span>
        </label>
        <input value={timeframe} onChange={e => setTimeframe(e.target.value)}
          placeholder="e.g. 4 months" style={inputStyle}
          onFocus={e => e.target.style.borderColor = "#111"}
          onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
      </div>

      <p style={{ fontSize: 12, color: "#d1d5db", margin: "0 0 16px" }}>
        All fields are optional. The parent will fill in scores, review, and rating.
      </p>

      {/* Live preview */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#9ca3af", margin: "0 0 10px" }}>Preview</p>
        <DashboardReviewPreview
          exam={exam}
          beforeScore={scoreBefore}
          afterScore={scoreAfter}
          timeframe={timeframe}
          accent={accent}
        />
        <p style={{ fontSize: 11, color: "#d1d5db", textAlign: "center", marginTop: 8 }}>Updates as the parent fills in their review</p>
      </div>

      <a href={reviewUrl} target="_blank" rel="noopener noreferrer" style={{
        width: "100%", padding: "12px", borderRadius: 12,
        border: "1px solid #e5e7eb", background: "white", color: "#374151",
        fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        textDecoration: "none", marginBottom: 20, boxSizing: "border-box",
      }}>
        Preview what the parent sees
        <Icon name="arrowRight" size={14} />
      </a>

      {/* Divider */}
      <div style={{ height: 1, background: "#f3f4f6", margin: "0 0 20px" }} />

      {/* Send via email */}
      <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", margin: "0 0 6px" }}>Send via email</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="parent@email.com"
          style={{ ...inputStyle, flex: 1 }}
          onFocus={e => e.target.style.borderColor = "#111"}
          onBlur={e => e.target.style.borderColor = "#e5e7eb"}
        />
        <button onClick={handleSend} style={{
          padding: "11px 18px", borderRadius: 10, border: "none",
          background: sent ? "#ecfdf5" : "#111", color: sent ? "#059669" : "white",
          fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", transition: "all 0.2s",
        }}>
          <Icon name={sent ? "check" : "send"} size={14} />
          {sent ? "Sent!" : "Send"}
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "4px 0 16px" }}>
        <div style={{ flex: 1, height: 1, background: "#f3f4f6" }} />
        <span style={{ fontSize: 12, color: "#d1d5db", fontWeight: 500 }}>or</span>
        <div style={{ flex: 1, height: 1, background: "#f3f4f6" }} />
      </div>

      <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", margin: "0 0 6px" }}>Copy review link</p>
      <CopyLinkRow url={displayUrl} copied={copied} onCopy={handleCopy} />
    </Modal>
  );
}

// ─── VOUCH REQUEST POPUP ────────────────────────────────
function VouchRequestPopup({ onClose, slug }: { onClose: () => void; slug: string }) {
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const vouchUrl = typeof window !== "undefined" ? `${window.location.origin}/vouch/${slug}` : `/vouch/${slug}`;
  const displayUrl = `tutorcard.co/vouch/${slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(vouchUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleSend = () => {
    if (email.trim()) {
      setSent(true);
      setTimeout(() => { setSent(false); setEmail(""); }, 2000);
    }
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Request a vouch" onClose={onClose} />
      <p style={{ fontSize: 13.5, color: "#6b7280", margin: "0 0 20px", lineHeight: 1.5 }}>
        Send this to a fellow tutor you work with. Vouching takes one click and adds their name to your card as a peer endorsement.
      </p>

      <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", margin: "0 0 6px" }}>Send via email</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="tutor@email.com"
          style={{ flex: 1, padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, color: "#111", outline: "none", fontFamily: "'DM Sans', sans-serif", background: "white" }}
          onFocus={e => e.target.style.borderColor = "#111"}
          onBlur={e => e.target.style.borderColor = "#e5e7eb"}
        />
        <button onClick={handleSend} style={{
          padding: "11px 18px", borderRadius: 10, border: "none",
          background: sent ? "#ecfdf5" : "#111", color: sent ? "#059669" : "white",
          fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", transition: "all 0.2s",
        }}>
          <Icon name={sent ? "check" : "send"} size={14} />
          {sent ? "Sent!" : "Send"}
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0 16px" }}>
        <div style={{ flex: 1, height: 1, background: "#f3f4f6" }} />
        <span style={{ fontSize: 12, color: "#d1d5db", fontWeight: 500 }}>or</span>
        <div style={{ flex: 1, height: 1, background: "#f3f4f6" }} />
      </div>

      <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", margin: "0 0 6px" }}>Copy vouch link</p>
      <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ flex: 1, padding: "11px 14px", fontSize: 13, color: "#6b7280", background: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {displayUrl}
        </div>
        <button onClick={handleCopy} style={{
          padding: "11px 16px", border: "none", borderLeft: "1.5px solid #e5e7eb",
          background: copied ? "#ecfdf5" : "#f9fafb", color: copied ? "#059669" : "#374151",
          fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", transition: "all 0.2s",
        }}><Icon name={copied ? "check" : "copy"} size={14} />{copied ? "Copied!" : "Copy"}</button>
      </div>
      <p style={{ fontSize: 12, color: "#9ca3af", margin: "10px 0 0", lineHeight: 1.45 }}>
        Share this link via text, LinkedIn DM, or in a tutoring group. They&apos;ll be guided through creating a card if they don&apos;t have one yet.
      </p>
    </Modal>
  );
}

// ─── EMPTY STATE ────────────────────────────────────────
function EmptyState({ icon, title, desc, actionLabel, actionIcon, onAction }: {
  icon: string; title: string; desc: string; actionLabel: string; actionIcon: string; onAction: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px", textAlign: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <Icon name={icon} size={24} style={{ color: "#d1d5db" }} />
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111", margin: "0 0 6px" }}>{title}</h3>
      <p style={{ fontSize: 13.5, color: "#9ca3af", margin: "0 0 20px", maxWidth: 300, lineHeight: 1.5 }}>{desc}</p>
      <button onClick={onAction} style={{
        padding: "9px 18px", borderRadius: 10, border: "none",
        background: "#111", color: "white", fontSize: 13, fontWeight: 600,
        cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        display: "flex", alignItems: "center", gap: 6, transition: "opacity 0.15s",
      }}
        onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
      ><Icon name={actionIcon} size={14} />{actionLabel}</button>
    </div>
  );
}

// ─── OWNER CARD ─────────────────────────────────────────
function OwnerCard({ tutor, accent, vouchCount, averageRating, reviewCount, inquiryCount, onShare }: {
  tutor: TutorRow; accent: string; vouchCount: number; averageRating: number | null; reviewCount: number; inquiryCount: number; onShare: () => void;
}) {
  const t = toac(accent);
  const fullName = [tutor.first_name, tutor.last_name].filter(Boolean).join(" ");
  const initials = [tutor.first_name?.[0], tutor.last_name?.[0]].filter(Boolean).join("");
  const isRemote = tutor.locations.some((l: string) => /remote|online/i.test(l));
  const physicalLocations = tutor.locations.filter((l: string) => !/remote|online/i.test(l));
  const location = physicalLocations[0] || "";

  return (
    <div style={{ background: "white", borderRadius: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)", overflow: "hidden" }}>
      <div style={{ padding: "28px 24px 18px", textAlign: "center" }}>
        <div style={{ width: 68, height: 68, borderRadius: "50%", background: tutor.profile_image_url ? "transparent" : accent, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", overflow: "hidden" }}>
          {tutor.profile_image_url ? (
            <img src={tutor.profile_image_url} alt={fullName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: 22, color: t, fontWeight: 600 }}>{initials}</span>
          )}
        </div>
        <h1 style={{ fontSize: 21, fontWeight: 700, color: "#111", margin: "0 0 1px", letterSpacing: "-0.02em" }}>{fullName}</h1>
        <p style={{ fontSize: 13.5, color: "#6b7280", margin: "0 0 8px" }}>{tutor.title || "Tutor"}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 12.5, color: "#9ca3af" }}>
          {location && <span>{location}</span>}
          {location && isRemote && <span style={{ color: "#d1d5db" }}>&middot;</span>}
          {isRemote && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#0284c7", fontWeight: 500 }}><Icon name="wifi" size={12} style={{ color: "#0284c7" }} />Remote</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: 20, border: "1px solid #e5e7eb", fontSize: 12.5 }}>
            <Icon name="users" size={12} style={{ color: "#6b7280" }} /><span style={{ fontWeight: 600, color: "#111" }}>{vouchCount}</span><span style={{ color: "#9ca3af" }}>vouches</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: 20, border: "1px solid #e5e7eb", fontSize: 12.5 }}>
            <Icon name="star" size={11} style={{ color: "#f59e0b" }} /><span style={{ fontWeight: 600, color: "#111" }}>{averageRating != null ? averageRating.toFixed(1) : "-"}</span><span style={{ color: "#9ca3af" }}>({reviewCount})</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: 20, border: "1px solid #e5e7eb", fontSize: 12.5 }}>
            <Icon name="mail" size={12} style={{ color: "#6b7280" }} /><span style={{ fontWeight: 600, color: "#111" }}>{inquiryCount}</span><span style={{ color: "#9ca3af" }}>{inquiryCount === 1 ? "inquiry" : "inquiries"}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 5, marginTop: 12 }}>
          {(tutor.exams || []).map((s: string) => <span key={s} style={{ padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 500, color: "#374151", background: "#f3f4f6" }}>{s}</span>)}
        </div>
      </div>
      <div style={{ height: 1, background: "#f3f4f6", margin: "0 20px" }} />
      <div style={{ padding: "8px 12px" }}>
        {(tutor.links || []).map((link: TutorLink, i: number) => {
          const iconName = LINK_TYPE_ICONS[link.type] || "link";
          const label = link.label || link.url || link.type.replace(/^\S+\s/, "");
          return (
            <div key={i} className="tc-link" style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 12, cursor: "pointer", transition: "background 0.15s" }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name={iconName} size={15} style={{ color: "#374151" }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#111", flex: 1 }}>{label}</span>
              <Icon name="chevron" size={13} style={{ color: "#d1d5db" }} />
            </div>
          );
        })}
      </div>
      <div style={{ padding: "4px 20px 12px", display: "flex", gap: 8 }}>
        <button onClick={onShare} style={{
          flex: 1, padding: "12px", borderRadius: 14, border: "none",
          background: "#111", color: "white", fontSize: 14, fontWeight: 600,
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          transition: "opacity 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        ><Icon name="share" size={15} />Share card</button>
        <Link href="/dashboard/edit" style={{
          padding: "12px 16px", borderRadius: 14, border: "1px solid #e5e7eb",
          background: "white", color: "#374151", fontSize: 14, fontWeight: 600,
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          transition: "background 0.15s", textDecoration: "none",
        }}><Icon name="edit" size={15} /></Link>
      </div>
      <div style={{ textAlign: "center", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, color: "#d1d5db", margin: 0 }}>
          <span style={{ fontWeight: 600 }}>tutorcard</span>.co/{tutor.slug}
        </p>
      </div>
    </div>
  );
}

// ─── TAB BAR ────────────────────────────────────────────
function TabBar({ tab, setTab }: { tab: string; setTab: (t: string) => void }) {
  const tabs = [
    { key: "reviews", label: "Reviews", icon: "star" },
    { key: "vouches", label: "Vouches", icon: "users" },
    { key: "badges", label: "Badges", icon: "shield" },
  ];
  return (
    <div style={{ display: "flex", gap: 2, borderBottom: "1px solid #f3f4f6", marginBottom: 20 }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => setTab(t.key)} style={{
          padding: "10px 16px", border: "none", background: "none",
          borderBottom: tab === t.key ? `2px solid #111` : "2px solid transparent",
          color: tab === t.key ? "#111" : "#9ca3af",
          fontSize: 13, fontWeight: 600, cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
          display: "flex", alignItems: "center", gap: 5,
          transition: "all 0.15s", marginBottom: -1,
        }}>
          <Icon name={t.icon} size={13} />{t.label}
        </button>
      ))}
    </div>
  );
}

// ─── TAB CONTENT ────────────────────────────────────────
function TabContent({ tab, wide, reviews, vouchers, badges, onReviewRequest, onVouchRequest }: {
  tab: string; wide: boolean;
  reviews: ReviewData[]; vouchers: VoucherData[]; badges: BadgeData[];
  onReviewRequest: () => void; onVouchRequest: () => void;
}) {
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#9ca3af", margin: 0 };

  const ActionBtn = ({ children, icon, onClick }: { children: React.ReactNode; icon: string; onClick: () => void }) => (
    <button onClick={onClick} style={{
      padding: "4px 12px", borderRadius: 20, border: "none",
      background: "#111", color: "white",
      fontSize: 11.5, fontWeight: 600, cursor: "pointer",
      fontFamily: "'DM Sans', sans-serif",
      display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
      transition: "opacity 0.15s",
    }}
      onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
    ><Icon name={icon} size={11} />{children}</button>
  );

  return (
    <div>
      {tab === "reviews" && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <p style={labelStyle}>Reviews ({reviews.length})</p>
            <ActionBtn icon="send" onClick={onReviewRequest}>Request a Review</ActionBtn>
          </div>
          {reviews.length === 0 ? (
            <>
              <EmptyState
                icon="trendUp" title="No reviews yet"
                desc="Send a review request to a parent or student. Each review captures the exam, score journey, and their experience working with you."
                actionLabel="Send review request" actionIcon="send" onAction={onReviewRequest}
              />
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {reviews.map(r => (
                <ReviewRow key={r.id} review={r} wide={wide} />
              ))}
            </div>
          )}
        </>
      )}
      {tab === "vouches" && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <p style={labelStyle}>Vouches ({vouchers.length})</p>
            <ActionBtn icon="send" onClick={onVouchRequest}>Request a Vouch</ActionBtn>
          </div>
          {vouchers.length === 0 ? (
            <>
              <EmptyState
                icon="users" title="No vouches yet"
                desc="Ask a fellow tutor to vouch for you. A vouch is a one-click endorsement that shows parents your peers trust your work."
                actionLabel="Send vouch request" actionIcon="send" onAction={onVouchRequest}
              />
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: wide ? 10 : 8 }}>
              {vouchers.map(v => (
                <VouchRow key={v.id} vouch={v} wide={wide} />
              ))}
            </div>
          )}
        </>
      )}
      {tab === "badges" && (
        <>
          <div style={{ marginBottom: 14 }}>
            <p style={labelStyle}>Badges ({badges.length})</p>
          </div>
          {badges.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 24px", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Icon name="clock" size={24} style={{ color: "#d1d5db" }} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111", margin: "0 0 6px" }}>Coming soon</h3>
              <p style={{ fontSize: 13.5, color: "#9ca3af", margin: "0 0 24px", maxWidth: 320, lineHeight: 1.5 }}>
                We are working with tutoring associations and certification boards to bring verified badges to TutorCard. Once live, you will be able to display your memberships and certifications directly on your card.
              </p>
              <div style={{ background: "#fafafa", borderRadius: 12, padding: "14px 16px", border: "1px solid #f0f0f0", textAlign: "left", maxWidth: 340, width: "100%" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", margin: "0 0 8px" }}>What to expect</p>
                {[
                  "Search from a list of partnered associations",
                  "Request badge verification with one click",
                  "Display memberships and certifications on your card",
                  "Badges are verified through the organization itself",
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: i < 3 ? 6 : 0 }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <Icon name="check" size={9} style={{ color: "#059669" }} />
                    </div>
                    <span style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.4 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {badges.map(b => (
                <BadgeRow key={b.id} badge={b} wide={wide} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── REVIEW ROW ─────────────────────────────────────────
function ReviewRow({ review, wide }: { review: ReviewData; wide: boolean }) {
  const hasScores = review.scoreBefore && review.scoreAfter;
  const imp = hasScores ? Number(review.scoreAfter) - Number(review.scoreBefore) : null;

  return (
    <div style={{ background: "#fafafa", borderRadius: 14, padding: wide ? "18px 22px" : "14px 16px", border: "1px solid #f0f0f0" }}>
      {wide ? (
        <div style={{ display: "flex", gap: 20 }}>
          <div style={{ flex: "0 0 auto", minWidth: 160, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {review.exam && (
              <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#6b7280", background: "#e5e7eb", padding: "2px 7px", borderRadius: 4, alignSelf: "flex-start", marginBottom: 8 }}>{review.exam}</span>
            )}
            {hasScores && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: "#b0b0b0" }}>{review.scoreBefore}</span>
                <span style={{ fontSize: 13, color: "#d1d5db" }}>&rarr;</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: "#111" }}>{review.scoreAfter}</span>
                {imp != null && imp > 0 && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 2, background: "#111", color: "white", padding: "2px 7px", borderRadius: 20, fontSize: 10.5, fontWeight: 700, marginLeft: "auto" }}>
                    <Icon name="arrowUp" size={9} />+{imp}
                  </span>
                )}
              </div>
            )}
            <div style={{ display: "flex", gap: 1, marginTop: 8 }}>
              {Array.from({ length: review.rating }).map((_, i) => (
                <Icon key={i} name="star" size={10} style={{ color: "#f59e0b" }} />
              ))}
            </div>
          </div>
          <div style={{ flex: 1, borderLeft: "1px solid #ebebeb", paddingLeft: 20, display: "flex", flexDirection: "column", justifyContent: "center", gap: 4 }}>
            <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, margin: 0, fontStyle: "italic" }}>&ldquo;{review.quote}&rdquo;</p>
            <p style={{ fontSize: 11.5, color: "#9ca3af", margin: 0, fontWeight: 500 }}>— {review.reviewerName}{review.reviewerRole ? `, ${review.reviewerRole}` : ""}</p>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            {review.exam && (
              <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#6b7280", background: "#e5e7eb", padding: "2px 7px", borderRadius: 4 }}>{review.exam}</span>
            )}
            {hasScores && (
              <>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#b0b0b0" }}>{review.scoreBefore}</span>
                <span style={{ color: "#d1d5db" }}>&rarr;</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>{review.scoreAfter}</span>
              </>
            )}
          </div>
          <div style={{ display: "flex", gap: 1, marginBottom: 8 }}>
            {Array.from({ length: review.rating }).map((_, i) => (
              <Icon key={i} name="star" size={10} style={{ color: "#f59e0b" }} />
            ))}
          </div>
          <div style={{ borderTop: "1px solid #ebebeb", paddingTop: 10 }}>
            <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, margin: "0 0 4px", fontStyle: "italic" }}>&ldquo;{review.quote}&rdquo;</p>
            <p style={{ fontSize: 11.5, color: "#9ca3af", margin: 0, fontWeight: 500 }}>— {review.reviewerName}{review.reviewerRole ? `, ${review.reviewerRole}` : ""}</p>
          </div>
        </>
      )}
    </div>
  );
}

// ─── VOUCH ROW ──────────────────────────────────────────
function VouchRow({ vouch, wide }: { vouch: VoucherData; wide: boolean }) {
  const fullName = [vouch.firstName, vouch.lastName].filter(Boolean).join(" ");
  const initials = [vouch.firstName?.[0], vouch.lastName?.[0]].filter(Boolean).join("");
  const vouchColor = vouch.avatarColor || "#0f172a";
  const t = toac(vouchColor);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: wide ? 14 : 12, padding: wide ? "14px 22px" : "10px 12px", background: "#fafafa", borderRadius: wide ? 14 : 12, border: "1px solid #f0f0f0" }}>
      <div style={{ width: wide ? 42 : 36, height: wide ? 42 : 36, borderRadius: "50%", background: vouch.profileImageUrl ? "transparent" : vouchColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
        {vouch.profileImageUrl ? (
          <img src={vouch.profileImageUrl} alt={fullName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: wide ? 14 : 12, fontWeight: 600, color: t }}>{initials}</span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#111", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fullName}</p>
        {vouch.title && <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{vouch.title}</p>}
      </div>
    </div>
  );
}

// ─── BADGE ROW ──────────────────────────────────────────
function BadgeRow({ badge, wide }: { badge: BadgeData; wide: boolean }) {
  return (
    <div style={{ display: "flex", gap: wide ? 16 : 12, alignItems: "center", padding: wide ? "18px 22px" : "12px 14px", background: "#fafafa", borderRadius: 14, border: "1px solid #f0f0f0" }}>
      <div style={{ width: wide ? 48 : 36, height: wide ? 48 : 36, borderRadius: 12, background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name="shield" size={wide ? 22 : 16} style={{ color: "#059669" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#111", margin: 0 }}>{badge.name}</p>
        {badge.organization && <p style={{ fontSize: 12, color: "#6b7280", margin: "2px 0 0" }}>{badge.organization}</p>}
        {badge.description && <p style={{ fontSize: 12, color: "#9ca3af", margin: "4px 0 0", lineHeight: 1.4 }}>{badge.description}</p>}
      </div>
    </div>
  );
}

// ─── MAIN ───────────────────────────────────────────────
export default function DashboardClient({
  tutor,
  userEmail,
  vouchCount,
  reviewCount,
  averageRating,
  reviews,
  vouchers,
  badges,
  inquiryCount,
  inviteCodes,
}: DashboardClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState("reviews");
  const [popup, setPopup] = useState<null | "share" | "review" | "vouch" | "invite">(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 800);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const close = () => setPopup(null);

  // No tutor — empty state
  if (!tutor) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
          * { box-sizing: border-box; }
        `}</style>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif", background: "#f5f5f4" }}>
          <header style={{ background: "white", borderBottom: "1px solid #f3f4f6", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "white" }}>tc</span>
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>tutorcard</span>
            </Link>
            <button onClick={handleSignOut} style={{ padding: "7px 14px", borderRadius: 10, border: "none", background: "transparent", color: "#9ca3af", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
              <Icon name="logOut" size={14} />Sign out
            </button>
          </header>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <Icon name="plus" size={28} style={{ color: "#d1d5db" }} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111", margin: "0 0 8px" }}>Create your first card</h1>
            <p style={{ fontSize: 14, color: "#9ca3af", margin: "0 0 24px", maxWidth: 360, lineHeight: 1.5 }}>
              You don&apos;t have a tutor card yet. Create one to start sharing your profile with parents and students.
            </p>
            <Link href="/create" style={{
              padding: "12px 24px", borderRadius: 12, border: "none",
              background: "#111", color: "white", fontSize: 14, fontWeight: 600,
              textDecoration: "none", fontFamily: "'DM Sans', sans-serif",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}>
              <Icon name="plus" size={15} />Create my card
            </Link>
          </div>
        </div>
      </>
    );
  }

  const accent = tutor.avatar_color || "#4f46e5";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.95) } to { opacity:1; transform:scale(1) } }
        .tc-link:hover { background: #fafafa !important; }
        .action-btn:hover { background: #f9fafb !important; }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif", background: "#f5f5f4" }}>
        <header style={{
          background: "white", borderBottom: "1px solid #f3f4f6",
          padding: "0 24px", height: 56, display: "flex", alignItems: "center",
          justifyContent: "space-between", flexShrink: 0, position: "sticky", top: 0, zIndex: 100,
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "white" }}>tc</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>tutorcard</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setPopup("invite")} className="action-btn" style={{
              padding: "7px 14px", borderRadius: 10, border: "1px solid #e5e7eb",
              background: "white", color: "#374151", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              display: "flex", alignItems: "center", gap: 6, transition: "background 0.15s",
            }}>
              <Icon name="gift" size={14} />
              Invites
              {inviteCodes.filter(c => !c.claimed).length > 0 && (
                <span style={{
                  background: "#111", color: "white", fontSize: 10, fontWeight: 700,
                  width: 18, height: 18, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginLeft: -2,
                }}>{inviteCodes.filter(c => !c.claimed).length}</span>
              )}
            </button>
            <button onClick={handleSignOut} style={{
              padding: "7px 14px", borderRadius: 10, border: "none",
              background: "transparent", color: "#9ca3af", fontSize: 13, fontWeight: 500,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              display: "flex", alignItems: "center", gap: 5, transition: "color 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.color = "#374151"}
              onMouseLeave={e => e.currentTarget.style.color = "#9ca3af"}
            ><Icon name="logOut" size={14} />Sign out</button>
          </div>
        </header>

        <main style={{ flex: 1 }}>
          {isMobile ? (
            <div style={{ maxWidth: 440, margin: "0 auto", padding: "20px 16px 40px" }}>
              <OwnerCard tutor={tutor} accent={accent} vouchCount={vouchCount} averageRating={averageRating} reviewCount={reviewCount} inquiryCount={inquiryCount} onShare={() => setPopup("share")} />
              <div style={{ marginTop: 20, background: "white", borderRadius: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)", padding: "18px 20px" }}>
                <TabBar tab={tab} setTab={setTab} />
                <TabContent tab={tab} wide={false} reviews={reviews} vouchers={vouchers} badges={badges}
                  onReviewRequest={() => setPopup("review")}
                  onVouchRequest={() => setPopup("vouch")}
                />
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 32px 60px", display: "flex", gap: 28, alignItems: "flex-start" }}>
              <div style={{ flex: "0 0 360px", position: "sticky", top: 88 }}>
                <OwnerCard tutor={tutor} accent={accent} vouchCount={vouchCount} averageRating={averageRating} reviewCount={reviewCount} inquiryCount={inquiryCount} onShare={() => setPopup("share")} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ background: "white", borderRadius: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)", padding: "24px 28px" }}>
                  <TabBar tab={tab} setTab={setTab} />
                  <TabContent tab={tab} wide={true} reviews={reviews} vouchers={vouchers} badges={badges}
                    onReviewRequest={() => setPopup("review")}
                    onVouchRequest={() => setPopup("vouch")}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
        <footer style={{ padding: "20px 24px", display: "flex", justifyContent: "center", width: "100%" }}>
          <p style={{ fontSize: 12, color: "#d1d5db", margin: 0, textAlign: "center" }}>
            &copy; 2026 TutorCard &middot; A <span style={{ fontWeight: 600, color: "#9ca3af" }}>StudySpaces</span> product
          </p>
        </footer>
      </div>

      {popup === "share" && <SharePopup onClose={close} slug={tutor.slug} />}
      {popup === "review" && <ReviewRequestPopup onClose={close} slug={tutor.slug} tutor={tutor} />}
      {popup === "vouch" && <VouchRequestPopup onClose={close} slug={tutor.slug} />}
      {popup === "invite" && <InvitePopup onClose={close} codes={inviteCodes} />}
    </>
  );
}
