"use client";

import { useState, useEffect, useRef, forwardRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { toPng, toBlob } from "html-to-image";
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

interface InquiryData {
  id: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string | null;
  examsOfInterest: string[];
  message: string;
  read: boolean;
  createdAt: string;
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
  inquiries: InquiryData[];
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
function getTimeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

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
  flag: <><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></>,
  pin: <><path d="M12 17v5"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
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
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 480, padding: "28px", margin: "0 16px", animation: "scaleIn 0.2s ease", maxHeight: "90vh", overflow: "auto" }}>
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
  const qrRef = useRef<HTMLDivElement>(null);
  const cardUrl = typeof window !== "undefined" ? `${window.location.origin}/${slug}` : `/${slug}`;
  const displayUrl = `tutorcard.co/${slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(cardUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 0, 0, 512, 512);
      URL.revokeObjectURL(url);
      const a = document.createElement("a");
      a.download = `tutorcard-${slug}-qr.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = url;
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Share your card" onClose={onClose} />
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <div ref={qrRef} style={{ width: 160, height: 160, borderRadius: 16, background: "#fafafa", border: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <QRCodeSVG value={cardUrl} size={128} level="M" />
        </div>
      </div>
      <CopyLinkRow url={displayUrl} copied={copied} onCopy={handleCopy} />
      <button onClick={handleDownloadQr} className="action-btn" style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid #e5e7eb", background: "white", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "#374151", transition: "background 0.15s", marginTop: 12 }}>
        <Icon name="download" size={14} style={{ color: "#6b7280" }} />Download QR code
      </button>
    </Modal>
  );
}

// ─── SIGNATURE HTML GENERATORS ──────────────────────────
function sigMinimal(tutor: TutorRow, accent: string) {
  const fullName = [tutor.first_name, tutor.last_name].filter(Boolean).join(" ");
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111111;">
  <tr>
    <td style="padding-bottom:4px;">
      <strong style="font-size:15px;">${fullName}</strong>
    </td>
  </tr>
  <tr>
    <td style="font-size:13px;color:#6b7280;padding-bottom:10px;">
      ${tutor.title || "Tutor"}
    </td>
  </tr>
  <tr>
    <td style="padding-top:8px;border-top:1px solid #e5e7eb;">
      <a href="https://tutorcard.co/${tutor.slug}" style="color:${accent};text-decoration:none;font-size:13px;font-weight:600;">tutorcard.co/${tutor.slug}</a>
    </td>
  </tr>
</table>`;
}

function sigStandard(tutor: TutorRow, accent: string) {
  const fullName = [tutor.first_name, tutor.last_name].filter(Boolean).join(" ");
  const initials = [tutor.first_name?.[0], tutor.last_name?.[0]].filter(Boolean).join("");
  const physicalLocations = tutor.locations.filter((l: string) => !/remote|online/i.test(l));
  const location = physicalLocations[0] || "";
  const subtitle = [tutor.title || "Tutor", location].filter(Boolean).join(" \u00B7 ");
  const t = toac(accent);
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111111;">
  <tr>
    <td style="padding-right:16px;vertical-align:top;border-right:2px solid ${accent};">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="width:52px;height:52px;background:${accent};border-radius:50%;text-align:center;vertical-align:middle;color:${t};font-size:18px;font-weight:600;">${initials}</td></tr>
      </table>
    </td>
    <td style="padding-left:16px;vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:16px;font-weight:700;padding-bottom:2px;">${fullName}</td></tr>
        <tr><td style="font-size:13px;color:#6b7280;padding-bottom:6px;">${subtitle}</td></tr>
        <tr><td style="padding-bottom:2px;"><a href="https://tutorcard.co/${tutor.slug}" style="color:${accent};text-decoration:none;font-size:13px;font-weight:600;">View my TutorCard &rarr;</a></td></tr>
      </table>
    </td>
  </tr>
</table>`;
}

function sigWithStats(tutor: TutorRow, accent: string, vouchCount: number, averageRating: number | null, reviewCount: number) {
  const fullName = [tutor.first_name, tutor.last_name].filter(Boolean).join(" ");
  const initials = [tutor.first_name?.[0], tutor.last_name?.[0]].filter(Boolean).join("");
  const physicalLocations = tutor.locations.filter((l: string) => !/remote|online/i.test(l));
  const location = physicalLocations[0] || "";
  const subtitle = [tutor.title || "Tutor", location].filter(Boolean).join(" \u00B7 ");
  const t = toac(accent);
  const ratingDisplay = averageRating != null ? averageRating.toFixed(1) : "-";
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111111;">
  <tr>
    <td style="padding-right:16px;vertical-align:top;border-right:2px solid ${accent};">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="width:52px;height:52px;background:${accent};border-radius:50%;text-align:center;vertical-align:middle;color:${t};font-size:18px;font-weight:600;">${initials}</td></tr>
      </table>
    </td>
    <td style="padding-left:16px;vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:16px;font-weight:700;padding-bottom:2px;">${fullName}</td></tr>
        <tr><td style="font-size:13px;color:#6b7280;padding-bottom:8px;">${subtitle}</td></tr>
        <tr>
          <td style="padding-bottom:8px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-size:12px;color:#6b7280;padding-right:12px;">&#9733; <strong style="color:#111;">${ratingDisplay}</strong> <span style="color:#9ca3af;">(${reviewCount})</span></td>
                <td style="font-size:12px;color:#6b7280;"><strong style="color:#111;">${vouchCount}</strong> peer vouches</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr><td><a href="https://tutorcard.co/${tutor.slug}" style="color:${accent};text-decoration:none;font-size:13px;font-weight:600;">View my TutorCard &rarr;</a></td></tr>
      </table>
    </td>
  </tr>
</table>`;
}

// ─── SIGNATURE POPUP ────────────────────────────────────
function SignaturePopup({ onClose, tutor, accent, vouchCount, averageRating, reviewCount }: {
  onClose: () => void; tutor: TutorRow; accent: string; vouchCount: number; averageRating: number | null; reviewCount: number;
}) {
  const [style, setStyle] = useState("standard");
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const STYLES = [
    { key: "minimal", label: "Minimal", gen: () => sigMinimal(tutor, accent) },
    { key: "standard", label: "Standard", gen: () => sigStandard(tutor, accent) },
    { key: "stats", label: "With stats", gen: () => sigWithStats(tutor, accent, vouchCount, averageRating, reviewCount) },
  ];

  const currentSig = STYLES.find((s) => s.key === style)!;
  const html = currentSig.gen();

  const handleCopy = () => {
    const el = previewRef.current;
    if (!el) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand("copy");
    sel.removeAllRanges();
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, animation: "fadeIn 0.15s ease" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 520, padding: "32px", animation: "scaleIn 0.2s ease", maxHeight: "90vh", overflow: "auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="mail" size={18} style={{ color: "#374151" }} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: 0 }}>Email signature</h3>
              <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Copy and paste into your email settings.</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6b7280" }}>
            <Icon name="x" size={15} />
          </button>
        </div>
        {/* Style tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {STYLES.map((s) => (
            <button key={s.key} onClick={() => setStyle(s.key)} style={{
              padding: "7px 16px", borderRadius: 10, border: "none", cursor: "pointer",
              background: style === s.key ? "#111" : "#f3f4f6",
              color: style === s.key ? "white" : "#6b7280",
              fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.15s",
            }}>{s.label}</button>
          ))}
        </div>
        {/* Preview */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#9ca3af", margin: "0 0 10px" }}>Preview</p>
          <div style={{
            background: "white", borderRadius: 14, padding: "24px 20px",
            border: "1px solid #f0f0f0",
          }}>
            {/* Fake email context */}
            <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #f3f4f6" }}>
              <p style={{ fontSize: 13, color: "#d1d5db", margin: "0 0 8px" }}>...</p>
              <p style={{ fontSize: 14, color: "#6b7280", margin: 0, lineHeight: 1.5 }}>
                Looking forward to our session on Thursday. Let me know if you have any questions before then!
              </p>
            </div>
            <div ref={previewRef} dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
        {/* Copy button */}
        <button onClick={handleCopy} style={{
          width: "100%", padding: "13px", borderRadius: 14, border: "none",
          background: copied ? "#ecfdf5" : "#111",
          color: copied ? "#059669" : "white",
          fontSize: 15, fontWeight: 600, cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "all 0.2s",
        }}>
          <Icon name={copied ? "check" : "copy"} size={16} />
          {copied ? "Copied to clipboard!" : "Copy signature"}
        </button>
        {/* Instructions */}
        <div style={{ marginTop: 16, padding: "14px 16px", background: "#fafafa", borderRadius: 12, border: "1px solid #f0f0f0" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", margin: "0 0 8px" }}>How to add it</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { app: "Gmail", step: "Settings > See all settings > Signature > Paste" },
              { app: "Outlook", step: "Settings > Mail > Compose and reply > Signature > Paste" },
              { app: "Apple Mail", step: "Preferences > Signatures > Paste" },
            ].map((item) => (
              <div key={item.app} style={{ display: "flex", gap: 8, fontSize: 12.5, lineHeight: 1.4 }}>
                <span style={{ fontWeight: 600, color: "#111", flexShrink: 0, width: 72 }}>{item.app}</span>
                <span style={{ color: "#9ca3af" }}>{item.step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
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
function DashboardReviewPreview({ exam, beforeScore, afterScore, timeframe }: {
  exam: string; beforeScore: string; afterScore: string; timeframe: string; accent: string;
}) {
  const imp = beforeScore && afterScore ? Number(afterScore) - Number(beforeScore) : null;
  const hasLeft = exam || beforeScore || afterScore || timeframe;

  return (
    <div style={{ background: "#fafafa", borderRadius: 14, padding: "16px 18px", border: "1px solid #f0f0f0" }}>
      {hasLeft && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
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
                fontSize: 10.5, fontWeight: 700, flexShrink: 0,
              }}>
                <Icon name="arrowUp" size={9} />+{imp}
              </span>
            )}
            {timeframe && (
              <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: "auto" }}>
                {timeframe}
              </span>
            )}
          </div>
          <div style={{ height: 1, background: "#ebebeb", marginBottom: 12 }} />
        </>
      )}
      {/* Bottom: quote placeholder + parent name */}
      <p style={{ fontSize: 13, color: "#d1d5db", lineHeight: 1.55, margin: "0 0 6px", fontStyle: "italic" }}>
        {"\u201CReview will appear here...\u201D"}
      </p>
      <p style={{ fontSize: 11.5, color: "#d1d5db", margin: 0, fontWeight: 500 }}>
        {"– Parent name"}
      </p>
    </div>
  );
}

// ─── SCORE INPUT TYPE HELPER ────────────────────────────
type ScoreInputType = "numeric" | "ap" | "letter" | "text";
const LETTER_GRADES = ["A", "B", "C", "D", "F"];
const AP_SCORES = ["1", "2", "3", "4", "5"];
const SUBJECT_NAMES = ["algebra", "geometry", "essay writing", "spanish", "french", "english", "reading", "writing", "math", "science", "history", "biology", "chemistry", "physics", "calculus", "statistics", "economics", "psychology", "sociology", "art", "music"];
const STANDARDIZED_TESTS = ["SAT", "ACT", "GRE", "GMAT", "LSAT", "ISEE", "SSAT", "SHSAT", "HSPT", "PANCE", "MCAT", "PSAT", "TOEFL", "IELTS", "PRAXIS", "DAT", "OAT"];

function getScoreInputType(exam: string): ScoreInputType {
  if (!exam) return "text";
  if (/^AP\s/i.test(exam)) return "ap";
  if (SUBJECT_NAMES.some(s => exam.toLowerCase() === s)) return "letter";
  if (STANDARDIZED_TESTS.some(t => exam.toUpperCase().includes(t))) return "numeric";
  return "text";
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
      await fetch("/api/review-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email.trim(),
          slug,
          exam: exam || undefined,
          scoreBefore: scoreBefore || undefined,
          scoreAfter: scoreAfter || undefined,
          timeframe: timeframe || undefined,
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
              <button key={s} onClick={() => {
                const next = exam === s ? "" : s;
                if (getScoreInputType(next) !== getScoreInputType(exam)) {
                  setScoreBefore("");
                  setScoreAfter("");
                }
                setExam(next);
              }} style={{
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

      {/* Score improvement - only shown when an exam is selected */}
      {exam && (() => {
        const scoreType = getScoreInputType(exam);
        const selectStyle: React.CSSProperties = { ...inputStyle, flex: 1, textAlign: "center" as const, appearance: "none" as const, WebkitAppearance: "none" as const, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" };
        const options = scoreType === "ap" ? AP_SCORES : scoreType === "letter" ? LETTER_GRADES : [];
        return (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              Score / grade improvement <span style={{ fontWeight: 400, color: "#9ca3af" }}>(optional)</span>
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {(scoreType === "ap" || scoreType === "letter") ? (
                <>
                  <select value={scoreBefore} onChange={e => setScoreBefore(e.target.value)} style={selectStyle}>
                    <option value="">Before</option>
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <span style={{ fontSize: 14, color: "#d1d5db", flexShrink: 0 }}>{"\u2192"}</span>
                  <select value={scoreAfter} onChange={e => setScoreAfter(e.target.value)} style={selectStyle}>
                    <option value="">After</option>
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </>
              ) : scoreType === "numeric" ? (
                <>
                  <input type="number" value={scoreBefore} onChange={e => setScoreBefore(e.target.value)}
                    placeholder="Before" style={{ ...inputStyle, flex: 1, textAlign: "center" }}
                    onFocus={e => e.target.style.borderColor = "#111"}
                    onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
                  <span style={{ fontSize: 14, color: "#d1d5db", flexShrink: 0 }}>{"\u2192"}</span>
                  <input type="number" value={scoreAfter} onChange={e => setScoreAfter(e.target.value)}
                    placeholder="After" style={{ ...inputStyle, flex: 1, textAlign: "center" }}
                    onFocus={e => e.target.style.borderColor = "#111"}
                    onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
                </>
              ) : (
                <>
                  <input type="text" value={scoreBefore} onChange={e => setScoreBefore(e.target.value)}
                    placeholder="Before" style={{ ...inputStyle, flex: 1, textAlign: "center" }}
                    onFocus={e => e.target.style.borderColor = "#111"}
                    onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
                  <span style={{ fontSize: 14, color: "#d1d5db", flexShrink: 0 }}>{"\u2192"}</span>
                  <input type="text" value={scoreAfter} onChange={e => setScoreAfter(e.target.value)}
                    placeholder="After" style={{ ...inputStyle, flex: 1, textAlign: "center" }}
                    onFocus={e => e.target.style.borderColor = "#111"}
                    onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
                </>
              )}
            </div>
          </div>
        );
      })()}

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

// ─── FEATURED REVIEW (pinned review on card) ────────────
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

// ─── OWNER CARD ─────────────────────────────────────────
function OwnerCard({ tutor, accent, vouchCount, averageRating, reviewCount, inquiryCount, hasUnreadInquiries, onShare, onSignature, onInquiries, featuredReview }: {
  tutor: TutorRow; accent: string; vouchCount: number; averageRating: number | null; reviewCount: number; inquiryCount: number; hasUnreadInquiries: boolean; onShare: () => void; onSignature: () => void; onInquiries: () => void; featuredReview: ReviewData | null;
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
          <div
            onClick={onInquiries}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: 20, border: "1px solid #e5e7eb", fontSize: 12.5, cursor: "pointer", transition: "background 0.15s", position: "relative" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <Icon name="mail" size={12} style={{ color: "#6b7280" }} /><span style={{ fontWeight: 600, color: "#111" }}>{inquiryCount}</span><span style={{ color: "#9ca3af" }}>{inquiryCount === 1 ? "inquiry" : "inquiries"}</span>
            {hasUnreadInquiries && <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", border: "2px solid white" }} />}
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 5, marginTop: 12 }}>
          {(tutor.exams || []).map((s: string) => <span key={s} style={{ padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 500, color: "#374151", background: "#f3f4f6" }}>{s}</span>)}
        </div>
      </div>
      <div style={{ height: 1, background: "#f3f4f6", margin: "0 20px" }} />
      {featuredReview && (() => {
        const hasScores = !!(featuredReview.scoreBefore && featuredReview.scoreAfter);
        const imp = hasScores ? Number(featuredReview.scoreAfter) - Number(featuredReview.scoreBefore) : null;
        return <FeaturedReview a={featuredReview} hasScores={hasScores} imp={imp} />;
      })()}
      <div style={{ padding: "8px 12px" }}>
        {(tutor.links || []).map((link: TutorLink, i: number) => {
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
            <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="tc-link" style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 12, cursor: "pointer", transition: "background 0.15s", textDecoration: "none", color: "inherit" }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name={iconName} size={15} style={{ color: "#374151" }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#111", flex: 1 }}>{label}</span>
              <Icon name="chevron" size={13} style={{ color: "#d1d5db" }} />
            </a>
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
      <div style={{ textAlign: "center", paddingBottom: 10 }}>
        <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>
          <span style={{ fontWeight: 600 }}>tutorcard</span>.co/{tutor.slug}
        </p>
      </div>
      {/* Email signature link */}
      <div style={{ borderTop: "1px solid #f3f4f6", padding: "10px 20px", textAlign: "center" }}>
        <button onClick={onSignature} style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
          display: "inline-flex", alignItems: "center", gap: 5,
          color: "#9ca3af", fontSize: 12.5, fontWeight: 500, padding: 0,
          transition: "color 0.15s",
        }}
          onMouseEnter={(e) => { e.currentTarget.style.color = accent; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#9ca3af"; }}
        >
          <Icon name="mail" size={13} />Add to email signature
        </button>
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
function TabContent({ tab, wide, reviews, vouchers, badges, onReviewRequest, onVouchRequest, onReport, onPin, onShare }: {
  tab: string; wide: boolean;
  reviews: ReviewData[]; vouchers: VoucherData[]; badges: BadgeData[];
  onReviewRequest: () => void; onVouchRequest: () => void; onReport: (review: ReviewData) => void; onPin: (review: ReviewData) => void; onShare: (review: ReviewData) => void;
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
                <ReviewRow key={r.id} review={r} wide={wide} onReport={onReport} onPin={onPin} onShare={onShare} />
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

// ─── REPORT STATUS BADGE ────────────────────────────────
function ReportStatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; bg: string; label: string; icon: string }> = {
    pending: { color: "#d97706", bg: "#fffbeb", label: "Under review", icon: "clock" },
    responded: { color: "#0284c7", bg: "#f0f9ff", label: "Response received", icon: "mail" },
    revoked: { color: "#dc2626", bg: "#fef2f2", label: "Removed", icon: "x" },
    denied: { color: "#6b7280", bg: "#f3f4f6", label: "Report denied", icon: "check" },
  };
  const c = config[status] || config.pending;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 20, background: c.bg, fontSize: 10.5, fontWeight: 600, color: c.color }}>
      <Icon name={c.icon} size={10} style={{ color: c.color }} />{c.label}
    </span>
  );
}

// ─── REVIEW ROW ─────────────────────────────────────────
function ReviewRow({ review, wide, onReport, onPin, onShare }: { review: ReviewData; wide: boolean; onReport: (review: ReviewData) => void; onPin: (review: ReviewData) => void; onShare: (review: ReviewData) => void }) {
  const hasScores = review.scoreBefore && review.scoreAfter;
  const imp = hasScores ? Number(review.scoreAfter) - Number(review.scoreBefore) : null;
  const [hoverReport, setHoverReport] = useState(false);
  const [hoverPin, setHoverPin] = useState(false);
  const [hoverShare, setHoverShare] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);
  const quoteRef = useRef<HTMLParagraphElement>(null);
  const rs = review.reportStatus;

  useEffect(() => {
    const el = quoteRef.current;
    if (el) setClamped(el.scrollHeight > el.clientHeight + 1);
  }, [review.quote]);

  const statusMessage = rs === "pending"
    ? "We emailed the reviewer. If no response in 7 days, this review is automatically removed."
    : rs === "responded"
    ? "The reviewer responded. Our team is reviewing both sides. We will notify you of the outcome."
    : rs === "revoked"
    ? "This review has been removed from your public card."
    : rs === "denied"
    ? "Our team reviewed the report and determined this review is legitimate."
    : null;

  const statusColor = rs === "pending" ? "#d97706" : rs === "responded" ? "#0284c7" : rs === "revoked" ? "#dc2626" : rs === "denied" ? "#6b7280" : "#9ca3af";

  const clampStyle: React.CSSProperties = expanded ? {} : {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
  };

  return (
    <div style={{
      background: "#fafafa", borderRadius: 14,
      padding: wide ? "18px 22px" : "14px 16px",
      border: "1px solid #f0f0f0",
      opacity: rs === "revoked" ? 0.5 : 1,
      transition: "opacity 0.2s",
    }}>
      {/* Top section: exam tag, scores, improvement badge */}
      {(review.exam || hasScores) && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: wide ? 8 : 5, marginBottom: 10, flexWrap: "nowrap", overflow: "hidden" }}>
            {review.exam && (
              <span style={{ fontSize: wide ? 10.5 : 10, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#6b7280", background: "#e5e7eb", padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flexShrink: 1, minWidth: 0 }}>{review.exam}</span>
            )}
            {rs && <ReportStatusBadge status={rs} />}
            {hasScores && (
              <>
                <span style={{ fontSize: wide ? 20 : 16, fontWeight: 700, color: "#b0b0b0", flexShrink: 0 }}>{review.scoreBefore}</span>
                <span style={{ fontSize: wide ? 13 : 11, color: "#d1d5db", flexShrink: 0 }}>&rarr;</span>
                <span style={{ fontSize: wide ? 20 : 16, fontWeight: 700, color: "#111", flexShrink: 0 }}>{review.scoreAfter}</span>
              </>
            )}
            {imp != null && imp > 0 && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 2, background: "#059669", color: "white", padding: wide ? "2px 7px" : "2px 6px", borderRadius: 20, fontSize: wide ? 10.5 : 10, fontWeight: 700, flexShrink: 0 }}>
                <Icon name="arrowUp" size={wide ? 9 : 8} />+{imp}
              </span>
            )}
            {review.months && (
              <span style={{ fontSize: wide ? 12 : 11, color: "#9ca3af", marginLeft: "auto", whiteSpace: "nowrap", flexShrink: 0 }}>
                {review.months} months
              </span>
            )}
          </div>
          <div style={{ height: 1, background: "#ebebeb", marginBottom: 10 }} />
        </>
      )}
      {/* If no exam/scores, still show report status */}
      {!review.exam && !hasScores && rs && (
        <div style={{ marginBottom: 10 }}>
          <ReportStatusBadge status={rs} />
        </div>
      )}

      {/* Bottom section: quote + reviewer name with stars */}
      <p ref={quoteRef} style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, margin: "0 0 4px", fontStyle: "italic", ...clampStyle }}>&ldquo;{review.quote}&rdquo;</p>
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
      <div style={{ display: "flex", flexDirection: wide ? "row" : "column", alignItems: wide ? "center" : "flex-start", justifyContent: wide ? "space-between" : undefined, gap: wide ? 0 : 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ display: "flex", gap: 1, flexShrink: 0 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Icon key={i} name="star" size={10} style={{ color: i < review.rating ? "#f59e0b" : "#e5e7eb" }} />
            ))}
          </div>
          <p style={{ fontSize: 11.5, color: "#9ca3af", margin: 0, fontWeight: 500 }}>— {review.reviewerName}{review.reviewerRole ? `, ${review.reviewerRole}` : ""}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, alignSelf: wide ? undefined : "flex-end" }}>
          <button
            onClick={() => onShare(review)}
            onMouseEnter={() => setHoverShare(true)}
            onMouseLeave={() => setHoverShare(false)}
            style={{
              display: "flex", alignItems: "center", gap: 4, background: "none", border: "none",
              color: hoverShare ? "#111" : "#d1d5db", fontSize: 11.5, fontWeight: 500,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif", padding: 0, transition: "color 0.15s",
            }}
          >
            <Icon name="share" size={11} />Share
          </button>
          {!rs && (
            <>
              <button
                onClick={() => onPin(review)}
                onMouseEnter={() => setHoverPin(true)}
                onMouseLeave={() => setHoverPin(false)}
                style={{
                  display: "flex", alignItems: "center", gap: 4, background: "none", border: "none",
                  color: review.isPinned ? "#111" : hoverPin ? "#111" : "#d1d5db", fontSize: 11.5, fontWeight: 500,
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif", padding: 0, transition: "color 0.15s",
                }}
              >
                <Icon name="pin" size={11} />{review.isPinned ? "Pinned" : "Pin"}
              </button>
              <button
                onClick={() => onReport(review)}
                onMouseEnter={() => setHoverReport(true)}
                onMouseLeave={() => setHoverReport(false)}
                style={{
                  display: "flex", alignItems: "center", gap: 4, background: "none", border: "none",
                  color: hoverReport ? "#dc2626" : "#d1d5db", fontSize: 11.5, fontWeight: 500,
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif", padding: 0, transition: "color 0.15s",
                }}
              >
                <Icon name="flag" size={11} />Report
              </button>
            </>
          )}
        </div>
      </div>
      {statusMessage && (
        <p style={{ fontSize: 11.5, color: statusColor, margin: "4px 0 0", lineHeight: 1.4 }}>{statusMessage}</p>
      )}
    </div>
  );
}

// ─── SHARE REVIEW GRAPHIC ──────────────────────────────
const ShareReviewGraphic = forwardRef<HTMLDivElement, { review: ReviewData; tutor: TutorRow; accent: string }>(
  function ShareReviewGraphic({ review, tutor, accent }, ref) {
    const hasScores = review.scoreBefore && review.scoreAfter;
    const imp = hasScores ? Number(review.scoreAfter) - Number(review.scoreBefore) : null;
    const accentText = toac(accent);
    const initials = `${tutor.first_name[0] || ""}${tutor.last_name[0] || ""}`.toUpperCase();
    const fullName = `${tutor.first_name} ${tutor.last_name}`;
    const dimText = accentText === "white" ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.4)";
    const pillBg = accentText === "white" ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.1)";

    return (
      <div ref={ref} style={{ width: 480, fontFamily: "'DM Sans', sans-serif", borderRadius: 20, overflow: "hidden", background: "white" }}>
        {/* Top colored section */}
        {hasScores ? (
          <div style={{ background: accent, padding: "32px 36px 28px", textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
              {review.exam && (
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: accentText, background: pillBg, padding: "4px 10px", borderRadius: 20 }}>{review.exam}</span>
              )}
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: dimText }}>VERIFIED RESULT</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 16, marginBottom: 16 }}>
              <span style={{ fontSize: 64, fontWeight: 300, color: dimText, lineHeight: 1 }}>{review.scoreBefore}</span>
              <span style={{ fontSize: 24, color: dimText }}>→</span>
              <span style={{ fontSize: 64, fontWeight: 800, color: accentText, lineHeight: 1 }}>{review.scoreAfter}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
              {imp != null && (
                <span style={{ background: accentText === "white" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.12)", color: accentText, padding: "5px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>+{imp} points</span>
              )}
              {review.months && (
                <span style={{ fontSize: 14, color: dimText }}>{review.months} month{review.months !== 1 ? "s" : ""}</span>
              )}
              <div style={{ display: "flex", gap: 2 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width={14} height={14} viewBox="0 0 24 24" fill={i < review.rating ? (accentText === "white" ? "#fbbf24" : "#f59e0b") : (accentText === "white" ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)")} stroke="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: "28px 36px 0", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", gap: 2 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} width={16} height={16} viewBox="0 0 24 24" fill={i < review.rating ? "#f59e0b" : "#e5e7eb"} stroke="none">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>
            {review.exam && (
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#6b7280", background: "#f3f4f6", padding: "3px 8px", borderRadius: 4 }}>{review.exam}</span>
            )}
          </div>
        )}

        {/* Quote section */}
        <div style={{ padding: hasScores ? "28px 36px" : "20px 36px 28px" }}>
          <p style={{ fontSize: 17, color: "#374151", lineHeight: 1.6, margin: "0 0 14px", fontStyle: "italic" }}>
            &ldquo;{review.quote}&rdquo;
          </p>
          <p style={{ fontSize: 14, color: "#9ca3af", margin: 0, fontWeight: 500 }}>
            – {review.reviewerName}{review.reviewerRole ? `, ${review.reviewerRole}` : ""}
          </p>
        </div>

        {/* Bottom tutor section */}
        <div style={{ padding: "16px 36px 20px", borderTop: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {tutor.profile_image_url ? (
              <img src={tutor.profile_image_url} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center", color: accentText, fontSize: 14, fontWeight: 700 }}>{initials}</div>
            )}
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#111", margin: 0, lineHeight: 1.3 }}>{fullName}</p>
              {tutor.title && <p style={{ fontSize: 12, color: "#9ca3af", margin: 0, lineHeight: 1.3 }}>{tutor.title}</p>}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 18, height: 18, borderRadius: 4, background: accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 8, fontWeight: 800, color: accentText }}>tc</span>
            </div>
            <span style={{ fontSize: 12, color: "#b0b0b0", fontWeight: 500 }}>tutorcard.co</span>
          </div>
        </div>
      </div>
    );
  }
);

// ─── SHARE REVIEW POPUP ───────────────────────────────
function ShareReviewPopup({ review, tutor, accent, onClose }: { review: ReviewData; tutor: TutorRow; accent: string; onClose: () => void }) {
  const graphicRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const cardUrl = typeof window !== "undefined" ? `${window.location.origin}/${tutor.slug}` : `/${tutor.slug}`;

  const capture = async () => {
    const node = graphicRef.current;
    if (!node) return null;
    await document.fonts.ready;
    return node;
  };

  const handleCopy = async () => {
    setGenerating(true);
    try {
      const node = await capture();
      if (!node) return;
      const blob = await toBlob(node, { pixelRatio: 2, cacheBust: true });
      if (!blob) return;
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard may not be available */ }
    setGenerating(false);
  };

  const handleDownload = async () => {
    setGenerating(true);
    try {
      const node = await capture();
      if (!node) return;
      const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement("a");
      a.download = `tutorcard-review-${review.id.slice(0, 8)}.png`;
      a.href = dataUrl;
      a.click();
    } catch { /* fallback: nothing */ }
    setGenerating(false);
  };

  const socialBtns: { icon: string; label: string; onClick: () => void }[] = [
    { icon: "linkedin", label: "LinkedIn", onClick: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(cardUrl)}`, "_blank") },
    { icon: "facebook", label: "Facebook", onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cardUrl)}`, "_blank") },
    { icon: "x", label: "X / Twitter", onClick: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent("Check out this review on TutorCard!")}&url=${encodeURIComponent(cardUrl)}`, "_blank") },
  ];

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Share this review" onClose={onClose} />

      {/* Scaled preview */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20, overflow: "hidden", borderRadius: 14, border: "1px solid #f0f0f0" }}>
        <div style={{ transform: "scale(0.88)", transformOrigin: "top center", marginBottom: -20 }}>
          <ShareReviewGraphic ref={graphicRef} review={review} tutor={tutor} accent={accent} />
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <button
          onClick={handleCopy}
          disabled={generating}
          style={{
            padding: "10px", borderRadius: 10, border: "1px solid #e5e7eb",
            background: copied ? "#ecfdf5" : "white", cursor: generating ? "wait" : "pointer",
            fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center",
            gap: 6, fontSize: 13, fontWeight: 500, color: copied ? "#059669" : "#374151", transition: "all 0.15s",
          }}
        >
          <Icon name={copied ? "check" : "copy"} size={14} />{copied ? "Copied!" : "Copy image"}
        </button>
        <button
          onClick={handleDownload}
          disabled={generating}
          style={{
            padding: "10px", borderRadius: 10, border: "1px solid #e5e7eb",
            background: "white", cursor: generating ? "wait" : "pointer",
            fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center",
            gap: 6, fontSize: 13, fontWeight: 500, color: "#374151", transition: "all 0.15s",
          }}
        >
          <Icon name="download" size={14} />Download PNG
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
        {socialBtns.map(b => (
          <button
            key={b.icon}
            onClick={b.onClick}
            style={{
              padding: "10px", borderRadius: 10, border: "1px solid #e5e7eb",
              background: "white", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center",
              gap: 6, fontSize: 12, fontWeight: 500, color: "#374151", transition: "all 0.15s",
            }}
          >
            <Icon name={b.icon} size={14} />{b.label}
          </button>
        ))}
      </div>

      <p style={{ fontSize: 11.5, color: "#9ca3af", margin: 0, textAlign: "center", lineHeight: 1.4 }}>
        Download the image and attach it to your post for best results
      </p>
    </Modal>
  );
}

// ─── REPORT REVIEW POPUP ────────────────────────────────
function ReportReviewPopup({ review, tutorId, onClose, onSubmitted }: { review: ReviewData; tutorId: string; onClose: () => void; onSubmitted: () => void }) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canSubmit = reason.trim().length >= 20 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/review-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: review.id, reason: reason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit report");
        return;
      }
      onSubmitted();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  void tutorId; // used for future extensibility

  return (
    <Modal onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="flag" size={18} style={{ color: "#dc2626" }} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: 0 }}>Report this review</h3>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>by {review.reviewerName}</p>
        </div>
        <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6b7280" }}><Icon name="x" size={15} /></button>
      </div>

      {/* Review summary */}
      <div style={{ background: "#fafafa", borderRadius: 12, padding: "14px 16px", border: "1px solid #f0f0f0", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          {review.exam && <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#6b7280", background: "#e5e7eb", padding: "2px 7px", borderRadius: 4 }}>{review.exam}</span>}
          {review.scoreBefore && review.scoreAfter && (
            <>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#b0b0b0" }}>{review.scoreBefore}</span>
              <span style={{ fontSize: 12, color: "#d1d5db" }}>&rarr;</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>{review.scoreAfter}</span>
            </>
          )}
          <div style={{ display: "flex", gap: 1, marginLeft: "auto" }}>
            {[1,2,3,4,5].map(i => <Icon key={i} name="star" size={9} style={{ color: review.rating >= i ? "#f59e0b" : "#d1d5db" }} />)}
          </div>
        </div>
        <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5, margin: "0 0 4px", fontStyle: "italic" }}>&ldquo;{review.quote}&rdquo;</p>
        <p style={{ fontSize: 11.5, color: "#9ca3af", margin: 0 }}>— {review.reviewerName}{review.reviewerRole ? `, ${review.reviewerRole}` : ""}</p>
      </div>

      {/* Reason */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Why are you reporting this review?</label>
        <textarea
          value={reason} onChange={e => setReason(e.target.value)}
          placeholder="Describe why you believe this review is fraudulent, inaccurate, or inappropriate. For example: this person was never my student, the scores listed are incorrect, I don't recognize this reviewer..."
          style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, color: "#111", outline: "none", boxSizing: "border-box", background: "white", fontFamily: "'DM Sans', sans-serif", minHeight: 120, resize: "vertical" }}
          onFocus={e => { e.target.style.borderColor = "#111"; }}
          onBlur={e => { e.target.style.borderColor = "#e5e7eb"; }}
        />
        <p style={{ fontSize: 12, color: reason.trim().length >= 20 ? "#059669" : "#d1d5db", margin: "6px 0 0" }}>
          {reason.trim().length < 20 ? `${20 - reason.trim().length} more characters needed` : "Looks good"}
        </p>
      </div>

      {/* Process explanation */}
      <div style={{ background: "#fafafa", borderRadius: 12, padding: "16px", border: "1px solid #f0f0f0", marginBottom: 24 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", margin: "0 0 10px" }}>What happens next</p>
        {[
          "We email the reviewer with your report and ask them to respond within 7 days.",
          "If they respond, our team reviews both sides and makes a decision.",
          "If they don't respond within 7 days, the review is automatically removed.",
        ].map((text, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: i < 2 ? 8 : 0 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#6b7280" }}>{i + 1}</span>
            </div>
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0, lineHeight: 1.45 }}>{text}</p>
          </div>
        ))}
      </div>

      {error && <p style={{ fontSize: 13, color: "#dc2626", margin: "0 0 16px" }}>{error}</p>}

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={handleSubmit} disabled={!canSubmit} style={{
          padding: "13px 28px", borderRadius: 14, border: "none",
          background: canSubmit ? "#dc2626" : "#e5e7eb", color: canSubmit ? "white" : "#9ca3af",
          fontSize: 15, fontWeight: 600, cursor: canSubmit ? "pointer" : "default",
          fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 8,
        }}>
          <Icon name="flag" size={15} />{submitting ? "Submitting..." : "Submit report"}
        </button>
        <button onClick={onClose} style={{ padding: "13px 20px", borderRadius: 14, border: "1px solid #e5e7eb", background: "white", color: "#9ca3af", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
          Cancel
        </button>
      </div>
    </Modal>
  );
}

// ─── REPORT CONFIRMATION POPUP ──────────────────────────
function ReportConfirmationPopup({ review, onClose }: { review: ReviewData; onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <Icon name="clock" size={28} style={{ color: "#d97706" }} />
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: "#111", margin: "0 0 8px" }}>Report submitted</h3>
        <p style={{ fontSize: 14, color: "#9ca3af", margin: "0 0 24px", lineHeight: 1.5 }}>
          We have sent an email to <span style={{ fontWeight: 600, color: "#374151" }}>{review.reviewerName}</span> asking them to respond within 7 days.
        </p>
        <div style={{ background: "#fafafa", borderRadius: 12, padding: "14px 16px", border: "1px solid #f0f0f0", textAlign: "left", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="clock" size={13} style={{ color: "#d97706" }} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#111", margin: 0 }}>Review marked as under review</p>
              <p style={{ fontSize: 11.5, color: "#9ca3af", margin: 0 }}>It remains visible while the report is open.</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="mail" size={13} style={{ color: "#6b7280" }} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#111", margin: 0 }}>We will notify you of the outcome</p>
              <p style={{ fontSize: 11.5, color: "#9ca3af", margin: 0 }}>You will receive an email when resolved.</p>
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{ padding: "13px 28px", borderRadius: 14, border: "none", background: "#111", color: "white", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
          Got it
        </button>
      </div>
    </Modal>
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
      <Link
        href={`/${vouch.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        title={`${fullName} — ${vouch.title || "Tutor"}`}
        style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0, padding: wide ? "5px 12px" : "4px 10px", borderRadius: 20, background: "white", border: "1px solid #e5e7eb", fontSize: wide ? 12 : 11, fontWeight: 500, color: "#6b7280", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", textDecoration: "none", transition: "border-color 0.15s, color 0.15s" }}
      >
        {fullName}<Icon name="ext" size={wide ? 11 : 10} />
      </Link>
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

// ─── INQUIRY ROW ────────────────────────────────────────
function InquiryRow({ inquiry }: { inquiry: InquiryData }) {
  const [expanded, setExpanded] = useState(false);
  const timeAgo = getTimeAgo(inquiry.createdAt);
  return (
    <div style={{ background: inquiry.read ? "#fff" : "#fafbff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "14px 16px", transition: "background 0.15s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14.5, fontWeight: 600, color: "#111" }}>{inquiry.senderName}</span>
          {!inquiry.read && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#3b82f6", flexShrink: 0 }} />}
        </div>
        <span style={{ fontSize: 12, color: "#9ca3af", flexShrink: 0 }}>{timeAgo}</span>
      </div>
      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4 }}>
        <a href={`mailto:${inquiry.senderEmail}`} style={{ color: "#6b7280", textDecoration: "none" }}>{inquiry.senderEmail}</a>
        {inquiry.senderPhone && (
          <>
            <span style={{ color: "#d1d5db" }}>&middot;</span>
            <a href={`tel:${inquiry.senderPhone.replace(/[^+\d]/g, "")}`} style={{ color: "#6b7280", textDecoration: "none" }}>{inquiry.senderPhone}</a>
          </>
        )}
      </div>
      {inquiry.examsOfInterest.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
          {inquiry.examsOfInterest.map(exam => (
            <span key={exam} style={{ padding: "2px 8px", borderRadius: 5, fontSize: 11.5, fontWeight: 500, color: "#374151", background: "#f3f4f6" }}>{exam}</span>
          ))}
        </div>
      )}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          background: "none", border: "none", padding: 0, cursor: "pointer",
          fontSize: 13.5, color: "#374151", lineHeight: 1.5, textAlign: "left",
          fontFamily: "'DM Sans', sans-serif", display: "block", width: "100%",
        }}
      >
        {expanded ? (
          <span style={{ whiteSpace: "pre-wrap" }}>{inquiry.message}</span>
        ) : (
          <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {inquiry.message}
          </span>
        )}
      </button>
      {inquiry.message.length > 100 && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{ background: "none", border: "none", padding: "4px 0 0", cursor: "pointer", fontSize: 12, color: "#9ca3af", fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

// ─── INQUIRIES POPUP ────────────────────────────────────
function InquiriesPopup({ onClose, inquiries, onMarkRead }: { onClose: () => void; inquiries: InquiryData[]; onMarkRead: () => void }) {
  useEffect(() => {
    onMarkRead();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, animation: "fadeIn 0.15s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 520, padding: "28px", animation: "scaleIn 0.2s ease", maxHeight: "90vh", overflow: "auto", margin: "0 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: 0 }}>Inquiries</h3>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", background: "#f3f4f6", padding: "2px 8px", borderRadius: 10 }}>{inquiries.length}</span>
          </div>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6b7280" }}><Icon name="x" size={15} /></button>
        </div>
        {inquiries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <Icon name="mail" size={22} style={{ color: "#9ca3af" }} />
            </div>
            <p style={{ fontSize: 14, color: "#9ca3af", margin: 0 }}>No inquiries yet. They&apos;ll appear here when someone reaches out through your TutorCard.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {inquiries.map(inq => <InquiryRow key={inq.id} inquiry={inq} />)}
          </div>
        )}
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
  inquiries,
  inviteCodes,
}: DashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState("reviews");
  const [popup, setPopup] = useState<null | "share" | "review" | "vouch" | "invite" | "report" | "reportConfirmed" | "signature" | "shareReview" | "inquiries">(null);
  const [reportingReview, setReportingReview] = useState<ReviewData | null>(null);
  const [sharingReview, setSharingReview] = useState<ReviewData | null>(null);
  const [localReportStatuses, setLocalReportStatuses] = useState<Record<string, string>>({});
  const [isMobile, setIsMobile] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 800);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setCardHeight(entry.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (searchParams.get("inquiries") === "true") {
      setPopup("inquiries");
    }
  }, [searchParams]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const close = () => { setPopup(null); setReportingReview(null); setSharingReview(null); };

  const handleReport = (review: ReviewData) => {
    setReportingReview(review);
    setPopup("report");
  };

  const handleShareReview = (review: ReviewData) => {
    setSharingReview(review);
    setPopup("shareReview");
  };

  const handleReportSubmitted = () => {
    if (reportingReview) {
      setLocalReportStatuses(prev => ({ ...prev, [reportingReview.id]: "pending" }));
    }
    setPopup("reportConfirmed");
  };

  const [localPinId, setLocalPinId] = useState<string | null>(() => {
    const pinned = reviews.find(r => r.isPinned);
    return pinned ? pinned.id : null;
  });
  const pinInFlight = useRef(false);

  // Sync localPinId when reviews prop changes (e.g. server re-render),
  // but skip during in-flight pin operations to preserve optimistic state
  useEffect(() => {
    if (!pinInFlight.current) {
      const pinned = reviews.find(r => r.isPinned);
      setLocalPinId(pinned ? pinned.id : null);
    }
  }, [reviews]);

  const handlePin = async (review: ReviewData) => {
    const prevPinId = localPinId;
    const newPinId = localPinId === review.id ? null : review.id;
    setLocalPinId(newPinId);
    pinInFlight.current = true;
    try {
      const res = await fetch("/api/reviews/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: review.id, pin: newPinId !== null }),
      });
      if (!res.ok) setLocalPinId(prevPinId);
    } catch {
      setLocalPinId(prevPinId);
    } finally {
      pinInFlight.current = false;
    }
  };

  const handleMarkInquiriesRead = async () => {
    const unreadIds = inquiries.filter(i => !i.read).map(i => i.id);
    if (unreadIds.length === 0) return;
    try {
      const supabase = createClient();
      await supabase.from("inquiries").update({ read: true }).in("id", unreadIds);
    } catch {
      // silent — will reflect on next page load
    }
  };

  // Merge server report statuses with local (optimistic) ones
  const reviewsWithReportStatus = reviews.map(r => ({
    ...r,
    reportStatus: (localReportStatuses[r.id] || r.reportStatus) as ReviewData["reportStatus"],
    isPinned: localPinId === r.id,
  }));

  const pinnedReview = reviewsWithReportStatus.find(r => r.isPinned) || null;
  const hasUnreadInquiries = inquiries.some(i => !i.read);

  // No tutor — empty state
  if (!tutor) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
          * { box-sizing: border-box; }
        `}</style>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif", background: "#f5f5f4", width: "100%" }}>
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

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif", background: "#f5f5f4", width: "100%" }}>
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
              <OwnerCard tutor={tutor} accent={accent} vouchCount={vouchCount} averageRating={averageRating} reviewCount={reviewCount} inquiryCount={inquiryCount} hasUnreadInquiries={hasUnreadInquiries} onShare={() => setPopup("share")} onSignature={() => setPopup("signature")} onInquiries={() => setPopup("inquiries")} featuredReview={pinnedReview} />
              <div style={{ marginTop: 20, background: "white", borderRadius: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)", padding: "18px 20px" }}>
                <TabBar tab={tab} setTab={setTab} />
                <TabContent tab={tab} wide={false} reviews={reviewsWithReportStatus} vouchers={vouchers} badges={badges}
                  onReviewRequest={() => setPopup("review")}
                  onVouchRequest={() => setPopup("vouch")}
                  onReport={handleReport}
                  onPin={handlePin}
                  onShare={handleShareReview}
                />
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 32px 60px", display: "flex", gap: 28, alignItems: "flex-start" }}>
              <div ref={cardRef} style={{ flex: "0 0 360px", position: "sticky", top: 88 }}>
                <OwnerCard tutor={tutor} accent={accent} vouchCount={vouchCount} averageRating={averageRating} reviewCount={reviewCount} inquiryCount={inquiryCount} hasUnreadInquiries={hasUnreadInquiries} onShare={() => setPopup("share")} onSignature={() => setPopup("signature")} onInquiries={() => setPopup("inquiries")} featuredReview={pinnedReview} />
              </div>
              <div style={{ flex: 1, minWidth: 0, height: cardHeight, display: "flex", flexDirection: "column" as const }}>
                <div style={{ background: "white", borderRadius: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)", padding: "24px 28px", flex: 1, display: "flex", flexDirection: "column" as const, overflow: "hidden", minHeight: 0 }}>
                  <TabBar tab={tab} setTab={setTab} />
                  <div style={{ flex: 1, overflowY: "auto" as const, minHeight: 0 }}>
                    <TabContent tab={tab} wide={true} reviews={reviewsWithReportStatus} vouchers={vouchers} badges={badges}
                      onReviewRequest={() => setPopup("review")}
                      onVouchRequest={() => setPopup("vouch")}
                      onReport={handleReport}
                      onPin={handlePin}
                      onShare={handleShareReview}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
        <footer style={{ padding: "20px 24px", display: "flex", justifyContent: "center", width: "100%" }}>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: 0, textAlign: "center" }}>
            &copy; 2026 TutorCard &middot; A <a href="https://studyspaces.com/" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, color: "#9ca3af", textDecoration: "underline" }}>StudySpaces</a> product
          </p>
        </footer>
      </div>

      {popup === "share" && <SharePopup onClose={close} slug={tutor.slug} />}
      {popup === "review" && <ReviewRequestPopup onClose={close} slug={tutor.slug} tutor={tutor} />}
      {popup === "vouch" && <VouchRequestPopup onClose={close} slug={tutor.slug} />}
      {popup === "invite" && <InvitePopup onClose={close} codes={inviteCodes} />}
      {popup === "report" && reportingReview && <ReportReviewPopup review={reportingReview} tutorId={tutor.id} onClose={close} onSubmitted={handleReportSubmitted} />}
      {popup === "reportConfirmed" && reportingReview && <ReportConfirmationPopup review={reportingReview} onClose={close} />}
      {popup === "signature" && <SignaturePopup onClose={close} tutor={tutor} accent={accent} vouchCount={vouchCount} averageRating={averageRating} reviewCount={reviewCount} />}
      {popup === "shareReview" && sharingReview && <ShareReviewPopup review={sharingReview} tutor={tutor} accent={accent} onClose={close} />}
      {popup === "inquiries" && <InquiriesPopup onClose={close} inquiries={inquiries} onMarkRead={handleMarkInquiriesRead} />}
    </>
  );
}
