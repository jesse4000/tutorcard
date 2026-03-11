"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { saveCardDraft, loadCardDraft, clearCardDraft } from "@/lib/cardDraft";
import type { OnboardingData, OnboardingLink } from "@/lib/cardDraft";
import GoogleSignInButton from "@/components/GoogleSignInButton";

// ─── UTILS ──────────────────────────────────────────────
function isLight(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}
const toac = (h: string) => isLight(h) ? "#111" : "white";

// ─── ICON ───────────────────────────────────────────────
const Icon = ({ name, size = 16, ...props }: { name: string; size?: number; [key: string]: unknown }) => {
  const d: Record<string, React.ReactNode> = {
    arrowRight: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    arrowLeft: <><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    check: <polyline points="20 6 9 17 4 12"/>,
    star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    wifi: <><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></>,
    globe: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
    phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    chevron: <polyline points="9 18 15 12 9 6"/>,
    msg: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>,
    arrowUp: <><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></>,
    palette: <><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/><path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c.55 0 1-.45 1-1v-.32c0-.45-.12-.89-.36-1.28-.24-.4-.36-.83-.36-1.28 0-.92.75-1.67 1.67-1.67H16c3.31 0 6-2.69 6-6 0-5.17-4.49-8.45-10-8.45z"/></>,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
    share: <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>,
    twitter: <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>,
    linkedin: <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></>,
    mail: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
    camera: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>,
    sparkle: <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>,
    link2: <><path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3"/><line x1="8" y1="12" x2="16" y2="12"/></>,
    zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
    video: <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></>,
    instagram: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></>,
    chevDown: <polyline points="6 9 12 15 18 9"/>,
  };
  const fill = (name === "star" || name === "sparkle") ? "currentColor" : "none";
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={fill === "none" ? "currentColor" : "none"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>{d[name]}</svg>;
};

// ─── CONSTANTS ──────────────────────────────────────────
const COLORS = [
  { n: "Midnight", c: "#111111" }, { n: "Indigo", c: "#4f46e5" },
  { n: "Ocean", c: "#0284c7" }, { n: "Teal", c: "#0d9488" },
  { n: "Emerald", c: "#059669" }, { n: "Amber", c: "#d97706" },
  { n: "Rose", c: "#e11d48" }, { n: "Violet", c: "#7c3aed" },
  { n: "Slate", c: "#475569" }, { n: "Coral", c: "#ea580c" },
];

const EXAMS = ["SAT Math", "SAT R&W", "ACT", "ISEE", "SSAT", "SHSAT", "HSPT", "AP Calculus", "AP Chemistry", "AP Physics", "AP Biology", "AP English", "GRE", "GMAT", "PANCE", "MCAT"];

const LINK_TYPE_OPTIONS = [
  { key: "website", label: "Website", icon: "globe" },
  { key: "booking", label: "Booking", icon: "calendar" },
  { key: "phone", label: "Phone", icon: "phone" },
  { key: "zoom", label: "Zoom", icon: "video" },
  { key: "instagram", label: "Instagram", icon: "instagram" },
  { key: "linkedin", label: "LinkedIn", icon: "linkedin" },
  { key: "other", label: "Other", icon: "link2" },
];

const CITIES = [
  "New York, NY","Los Angeles, CA","Chicago, IL","Houston, TX","Phoenix, AZ","Philadelphia, PA","San Antonio, TX","San Diego, CA","Dallas, TX","San Jose, CA",
  "Austin, TX","Jacksonville, FL","Fort Worth, TX","Columbus, OH","Indianapolis, IN","Charlotte, NC","San Francisco, CA","Seattle, WA","Denver, CO","Washington, DC",
  "Nashville, TN","Oklahoma City, OK","El Paso, TX","Boston, MA","Portland, OR","Las Vegas, NV","Memphis, TN","Louisville, KY","Baltimore, MD","Milwaukee, WI",
  "Albuquerque, NM","Tucson, AZ","Fresno, CA","Mesa, AZ","Sacramento, CA","Atlanta, GA","Kansas City, MO","Omaha, NE","Colorado Springs, CO","Raleigh, NC",
  "Virginia Beach, VA","Long Beach, CA","Miami, FL","Oakland, CA","Minneapolis, MN","Tampa, FL","Tulsa, OK","Arlington, TX","New Orleans, LA","Cleveland, OH",
  "London, UK","Manchester, UK","Birmingham, UK","Edinburgh, UK","Glasgow, UK","Liverpool, UK","Bristol, UK","Leeds, UK","Oxford, UK","Cambridge, UK",
  "Brighton, UK","Cardiff, UK","Belfast, UK","Nottingham, UK","Sheffield, UK","Southampton, UK","Newcastle, UK","Reading, UK","Aberdeen, UK","Bath, UK",
];

// ─── TYPES (imported from @/lib/cardDraft) ──────────────

// ─── HEADER ─────────────────────────────────────────────
function Header({ onLogoClick }: { onLogoClick: () => void }) {
  return (
    <header style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid #f3f4f6", padding: "0 24px", height: 56, display: "flex", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
      <div onClick={onLogoClick} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
        <div style={{ width: 24, height: 24, borderRadius: 6, background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "white" }}>tc</span>
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>tutorcard</span>
      </div>
    </header>
  );
}

// ─── LOCATION AUTOCOMPLETE ──────────────────────────────
function LocationInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleChange = (v: string) => {
    setQuery(v);
    onChange(v);
    if (v.length >= 2) {
      const lv = v.toLowerCase();
      setFiltered(CITIES.filter(c => c.toLowerCase().includes(lv)).slice(0, 8));
      setOpen(true);
    } else { setOpen(false); }
  };

  return (
    <div ref={ref} style={{ position: "relative", marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Location</label>
      <input value={query} onChange={e => handleChange(e.target.value)} placeholder="Start typing your city..."
        style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, color: "#111", outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.15s", background: "white" }}
        onFocus={e => { e.currentTarget.style.borderColor = "#111"; if (query.length >= 2) setOpen(true); }}
        onBlur={e => { e.currentTarget.style.borderColor = "#e5e7eb"; }}
      />
      {open && filtered.length > 0 && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "white", border: "1px solid #e5e7eb", borderRadius: 10, marginTop: 4, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", zIndex: 50, overflow: "hidden" }}>
          {filtered.map(c => (
            <div key={c} onClick={() => { onChange(c); setQuery(c); setOpen(false); }}
              style={{ padding: "10px 14px", fontSize: 14, color: "#111", cursor: "pointer", transition: "background 0.1s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f9fafb"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "white"; }}
            >{c}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CARD PREVIEW ───────────────────────────────────────
function CardPreview({ data, accent }: { data: OnboardingData; accent: string }) {
  const t = toac(accent);
  const initials = data.name ? data.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "TC";
  return (
    <div style={{ background: "white", borderRadius: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)", overflow: "hidden", width: 380 }}>
      <div style={{ padding: "28px 24px 18px", textAlign: "center" }}>
        {data.imageUrl ? (
          <img src={data.imageUrl} alt="" style={{ width: 68, height: 68, borderRadius: "50%", objectFit: "cover", margin: "0 auto 12px", display: "block" }} />
        ) : (
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", transition: "background 0.25s" }}>
            <span style={{ fontSize: 22, color: t, fontWeight: 600 }}>{initials}</span>
          </div>
        )}
        <h2 style={{ fontSize: 21, fontWeight: 700, color: "#111", margin: "0 0 1px", letterSpacing: "-0.02em" }}>{data.name || "Your Name"}</h2>
        <p style={{ fontSize: 13.5, color: data.headline ? "#6b7280" : "#d1d5db", margin: "0 0 8px" }}>{data.headline || "Your headline"}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 12.5, color: "#9ca3af" }}>
          <span>{data.location || "Your city"}</span>
          {data.remote && <><span style={{ color: "#d1d5db" }}>·</span><span style={{ display: "flex", alignItems: "center", gap: 4, color: accent, fontWeight: 500 }}><Icon name="wifi" size={12} style={{ color: accent }} />Remote</span></>}
        </div>
        {data.specialties.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 5, marginTop: 12 }}>
            {data.specialties.map(s => <span key={s} style={{ padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 500, color: "#374151", background: "#f3f4f6" }}>{s}</span>)}
          </div>
        )}
      </div>
      {data.links.filter(l => l.value).length > 0 && <>
        <div style={{ height: 1, background: "#f3f4f6", margin: "0 20px" }} />
        <div style={{ padding: "8px 12px" }}>
          {data.links.filter(l => l.value).map((lk, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name={lk.icon} size={15} style={{ color: "#374151" }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#111", flex: 1 }}>{lk.label || lk.value}</span>
              <Icon name="chevron" size={13} style={{ color: "#d1d5db" }} />
            </div>
          ))}
        </div>
      </>}
      <div style={{ padding: data.links.filter(l => l.value).length > 0 ? "4px 20px 20px" : "0 20px 20px" }}>
        <div style={{ width: "100%", padding: "13px", borderRadius: 14, background: accent, color: t, fontSize: 14.5, fontWeight: 600, textAlign: "center", transition: "background 0.25s" }}>Send a message</div>
      </div>
      <div style={{ textAlign: "center", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, color: "#d1d5db", margin: 0 }}><span style={{ fontWeight: 600 }}>tutorcard</span>.co/{data.slug || (data.name ? data.name.toLowerCase().replace(/[^a-z0-9]/g, "") : "")}</p>
      </div>
    </div>
  );
}

// ─── STEP NAV ───────────────────────────────────────────
function StepNav({ step, goTo, isMobile }: { step: number; goTo: (n: number) => void; isMobile: boolean }) {
  const steps = ["About you", "Specialties", "Links", "Preview"];
  return (
    <div style={{ borderBottom: "1px solid #f3f4f6", padding: isMobile ? "0 20px" : "0 32px" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", gap: 0 }}>
        {steps.map((s, i) => {
          const sn = i + 1;
          const isActive = sn === step;
          const isComplete = sn < step;
          const isClickable = sn < step;
          return (
            <button key={i} onClick={() => isClickable && goTo(sn)} style={{
              padding: "14px 16px", border: "none", background: "none",
              borderBottom: isActive ? "2px solid #111" : "2px solid transparent",
              color: isActive ? "#111" : isComplete ? "#111" : "#d1d5db",
              fontSize: 13, fontWeight: 600, cursor: isClickable ? "pointer" : "default",
              fontFamily: "'DM Sans', sans-serif",
              display: "flex", alignItems: "center", gap: 5,
              transition: "all 0.15s", marginBottom: -1,
            }}>
              {isComplete && <Icon name="check" size={12} style={{ color: "#059669" }} />}
              {!isComplete && <span style={{ fontSize: 12 }}>{sn}</span>}
              {(!isMobile || isActive) && <span>{s}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── STEP SHELL ─────────────────────────────────────────
function StepShell({ step, goTo, title, subtitle, children, onNext, nextLabel, nextDisabled, isMobile, noButton }: {
  step: number;
  goTo: (n: number) => void;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  isMobile: boolean;
  noButton?: boolean;
  totalSteps?: number;
}) {
  return (
    <div style={{ minHeight: "calc(100vh - 56px)", display: "flex", flexDirection: "column" }}>
      <StepNav step={step} goTo={goTo} isMobile={isMobile} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: isMobile ? "32px 20px" : "40px 32px" }}>
        <div style={{ maxWidth: 520, width: "100%", marginBottom: 28 }}>
          <h2 style={{ fontSize: isMobile ? 24 : 28, fontWeight: 800, color: "#111", letterSpacing: "-0.02em", margin: "0 0 6px" }}>{title}</h2>
          <p style={{ fontSize: 15, color: "#9ca3af", margin: 0 }}>{subtitle}</p>
        </div>
        <div style={{ maxWidth: 520, width: "100%", flex: 1 }}>{children}</div>
        {!noButton && (
          <div style={{ maxWidth: 520, width: "100%", paddingTop: 24 }}>
            <button onClick={onNext} disabled={nextDisabled} style={{
              width: "100%", padding: "14px", borderRadius: 14, border: "none",
              background: nextDisabled ? "#e5e7eb" : "#111",
              color: nextDisabled ? "#9ca3af" : "white",
              fontSize: 15, fontWeight: 600, cursor: nextDisabled ? "default" : "pointer",
              fontFamily: "'DM Sans', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s",
            }}>{nextLabel || "Continue"}<Icon name="arrowRight" size={16} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── INPUT ──────────────────────────────────────────────
function Input({ label, value, onChange, placeholder, prefix }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; prefix?: string;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #e5e7eb", borderRadius: 10, overflow: "hidden", background: "white" }}>
        {prefix && <span style={{ padding: "11px 0 11px 14px", fontSize: 14, color: "#9ca3af", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>{prefix}</span>}
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{
          flex: 1, padding: prefix ? "11px 14px 11px 0" : "11px 14px", border: "none", fontSize: 14, color: "#111",
          outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif", background: "white",
        }}
          onFocus={e => { e.currentTarget.parentElement!.style.borderColor = "#111"; }}
          onBlur={e => { e.currentTarget.parentElement!.style.borderColor = "#e5e7eb"; }}
        />
      </div>
    </div>
  );
}

// ─── LINK ROW ───────────────────────────────────────────
function LinkRow({ link, onChange, onRemove }: { link: OnboardingLink; onChange: (l: OnboardingLink) => void; onRemove: () => void }) {
  const [typeOpen, setTypeOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setTypeOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);

  const currentType = LINK_TYPE_OPTIONS.find(o => o.key === link.type) || LINK_TYPE_OPTIONS[0];
  const placeholder = link.type === "phone" ? "(555) 123-4567" : link.type === "instagram" ? "@username" : "https://...";

  return (
    <div style={{
      background: "white", border: "1.5px solid #e5e7eb", borderRadius: 14,
      padding: "14px 16px", marginBottom: 10,
      display: "flex", alignItems: "center", gap: 12,
    }}>
      <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
        <button onClick={() => setTypeOpen(!typeOpen)} style={{
          width: 40, height: 40, borderRadius: 10, border: "1px solid #e5e7eb",
          background: "white", display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", position: "relative",
        }}>
          <Icon name={currentType.icon} size={16} style={{ color: "#374151" }} />
          <div style={{
            position: "absolute", bottom: -2, right: -2, width: 14, height: 14,
            borderRadius: "50%", background: "white", border: "1px solid #e5e7eb",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="chevDown" size={8} style={{ color: "#9ca3af" }} />
          </div>
        </button>
        {typeOpen && (
          <div style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0,
            background: "white", border: "1px solid #e5e7eb", borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)", zIndex: 50, overflow: "hidden", minWidth: 150,
          }}>
            {LINK_TYPE_OPTIONS.map(o => (
              <div key={o.key} onClick={() => {
                onChange({ ...link, type: o.key, icon: o.icon, label: link.label === (LINK_TYPE_OPTIONS.find(x => x.key === link.type)?.label || "") ? o.label : link.label });
                setTypeOpen(false);
              }}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                  fontSize: 13, fontWeight: 500, color: o.key === link.type ? "#111" : "#6b7280",
                  cursor: "pointer", transition: "background 0.1s",
                  background: o.key === link.type ? "#f9fafb" : "white",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f9fafb"; }}
                onMouseLeave={e => { e.currentTarget.style.background = o.key === link.type ? "#f9fafb" : "white"; }}
              >
                <Icon name={o.icon} size={14} style={{ color: "#6b7280" }} />
                {o.label}
                {o.key === link.type && <Icon name="check" size={12} style={{ color: "#059669", marginLeft: "auto" }} />}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <input value={link.value} onChange={e => onChange({ ...link, value: e.target.value })}
          placeholder={placeholder}
          style={{
            width: "100%", padding: "0", border: "none", fontSize: 14, fontWeight: 500,
            color: "#111", outline: "none", fontFamily: "'DM Sans', sans-serif",
            background: "white", lineHeight: 1.4,
          }} />
        <input value={link.label} onChange={e => onChange({ ...link, label: e.target.value })}
          placeholder="Button label..."
          style={{
            width: "100%", padding: "2px 0 0", border: "none", fontSize: 12,
            color: "#9ca3af", outline: "none", fontFamily: "'DM Sans', sans-serif",
            background: "white", lineHeight: 1.4,
          }} />
      </div>

      <button onClick={onRemove} style={{
        background: "none", border: "none", color: "#d1d5db", cursor: "pointer",
        padding: 4, flexShrink: 0, transition: "color 0.15s",
      }}
        onMouseEnter={e => { e.currentTarget.style.color = "#9ca3af"; }}
        onMouseLeave={e => { e.currentTarget.style.color = "#d1d5db"; }}
      >
        <Icon name="x" size={15} />
      </button>
    </div>
  );
}

// ─── DATA MODEL MAPPING ─────────────────────────────────
function splitName(name: string): { firstName: string; lastName: string } {
  const trimmed = name.trim();
  const firstSpace = trimmed.indexOf(" ");
  if (firstSpace === -1) return { firstName: trimmed, lastName: "" };
  return {
    firstName: trimmed.slice(0, firstSpace),
    lastName: trimmed.slice(firstSpace + 1),
  };
}

function mapLinksToApi(links: OnboardingLink[]): { type: string; url: string; label: string }[] {
  const typeMap: Record<string, string> = {
    website: "Website",
    booking: "Booking",
    phone: "Phone",
    zoom: "Zoom",
    instagram: "Instagram",
    linkedin: "LinkedIn",
    other: "Website",
  };
  return links
    .filter(l => l.value)
    .map(l => ({
      type: typeMap[l.type] || "Website",
      url: l.value,
      label: l.label || "",
    }));
}

// ─── MAIN ───────────────────────────────────────────────
export default function TutorCardOnboarding() {
  const [screen, setScreen] = useState("step1");
  const [isMobile, setIsMobile] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customOthers, setCustomOthers] = useState<string[]>([]);
  const [otherInput, setOtherInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<OnboardingData>({
    name: "", headline: "", location: "", remote: true, slug: "",
    imageUrl: null, specialties: [],
    links: [{ id: 1, type: "website", icon: "globe", value: "", label: "Website" }],
    accent: "#4f46e5",
  });

  // Slug availability state
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);

  // Auth state for inline signup
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Invite code state
  const [inviteCode, setInviteCode] = useState("");
  const [inviteCodeValid, setInviteCodeValid] = useState<boolean | null>(null);
  const [inviteCodeChecking, setInviteCodeChecking] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    const ck = () => setIsMobile(window.innerWidth < 800);
    ck(); window.addEventListener("resize", ck);
    return () => window.removeEventListener("resize", ck);
  }, []);

  // Resume flow: after Google OAuth redirects back with ?resume=true
  const resumeHandled = useRef(false);
  useEffect(() => {
    if (resumeHandled.current) return;
    if (searchParams.get("resume") !== "true") return;
    resumeHandled.current = true;

    (async () => {
      const draft = loadCardDraft();
      if (!draft) {
        alert("We couldn't restore your card data. Please fill it out again.");
        window.history.replaceState({}, "", "/create");
        return;
      }

      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        alert("Authentication failed. Please try again.");
        window.history.replaceState({}, "", "/create");
        return;
      }

      // Restore draft data and auto-publish
      setData(draft);
      window.history.replaceState({}, "", "/create");

      // We need to publish with the draft data directly since setState is async
      setSubmitting(true);
      try {
        const { firstName, lastName } = splitName(draft.name);
        const locations: string[] = [];
        if (draft.location) locations.push(draft.location);
        if (draft.remote) locations.push("Online");

        const payload = {
          firstName,
          lastName,
          title: draft.headline.trim(),
          slug: (draft.slug || draft.name.toLowerCase().replace(/[^a-z0-9]/g, "")).trim(),
          avatarColor: draft.accent,
          exams: draft.specialties,
          subjects: [],
          locations,
          links: mapLinksToApi(draft.links),
          notifyOnMatch: false,
          email: authData.user.email || "",
          profileImageUrl: draft.imageUrl || null,
          inviteCode: draft.inviteCode || undefined,
        };

        const res = await fetch("/api/tutors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const result = await res.json();
          if (result.error?.includes("slug")) {
            alert("That card URL is already taken. Please choose another.");
            setScreen("step1");
          } else {
            alert("Something went wrong. Please try again.");
          }
          setSubmitting(false);
          return;
        }

        clearCardDraft();
        setScreen("share");
      } catch {
        alert("Network error. Please try again.");
      }
      setSubmitting(false);
    })();
  }, [searchParams]);

  const upd = <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => setData(p => ({ ...p, [k]: v }));
  const autoSlug = data.slug || (data.name ? data.name.toLowerCase().replace(/[^a-z0-9]/g, "") : "");
  const goTo = (n: number) => setScreen("step" + n);

  // Debounced slug availability check
  useEffect(() => {
    setSlugAvailable(null);
    if (!autoSlug) return;
    setSlugChecking(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tutors/check-slug?slug=${encodeURIComponent(autoSlug)}`);
        const result = await res.json();
        setSlugAvailable(result.available);
      } catch {
        setSlugAvailable(null);
      }
      setSlugChecking(false);
    }, 500);
    return () => { clearTimeout(timer); setSlugChecking(false); };
  }, [autoSlug]);

  // Debounced invite code validation
  useEffect(() => {
    setInviteCodeValid(null);
    const trimmed = inviteCode.trim();
    if (!trimmed) return;
    setInviteCodeChecking(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/invite-codes/validate?code=${encodeURIComponent(trimmed)}`);
        const result = await res.json();
        setInviteCodeValid(result.valid);
      } catch {
        setInviteCodeValid(null);
      }
      setInviteCodeChecking(false);
    }, 500);
    return () => { clearTimeout(timer); setInviteCodeChecking(false); };
  }, [inviteCode]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => upd("imageUrl", ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addLink = () => {
    const id = Date.now();
    upd("links", [...data.links, { id, type: "website", icon: "globe", value: "", label: "Website" }]);
  };

  const updateLink = (id: number, updated: Partial<OnboardingLink>) => {
    upd("links", data.links.map(l => l.id === id ? { ...l, ...updated } : l));
  };

  const removeLink = (id: number) => {
    upd("links", data.links.filter(l => l.id !== id));
  };

  const addCustomOther = () => {
    if (otherInput.trim() && !customOthers.includes(otherInput.trim()) && !data.specialties.includes(otherInput.trim())) {
      const val = otherInput.trim();
      setCustomOthers(p => [...p, val]);
      upd("specialties", [...data.specialties, val]);
      setOtherInput("");
    }
  };

  const handleCopy = () => {
    const url = `${window.location.origin}/${autoSlug}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublish = async () => {
    setSubmitting(true);
    try {
      const { firstName, lastName } = splitName(data.name);
      const locations: string[] = [];
      if (data.location) locations.push(data.location);
      if (data.remote) locations.push("Online");

      const payload = {
        firstName,
        lastName,
        title: data.headline.trim(),
        slug: (data.slug || data.name.toLowerCase().replace(/[^a-z0-9]/g, "")).trim(),
        avatarColor: data.accent,
        exams: data.specialties,
        subjects: [],
        locations,
        links: mapLinksToApi(data.links),
        notifyOnMatch: false,
        email: "",
        profileImageUrl: data.imageUrl || null,
        inviteCode: inviteCode.trim() || undefined,
      };

      const res = await fetch("/api/tutors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const result = await res.json();
        if (result.error?.includes("slug")) {
          alert("That card URL is already taken. Please choose another.");
          setScreen("step1");
        } else {
          alert("Something went wrong. Please try again.");
        }
        setSubmitting(false);
        return;
      }

      setScreen("share");
    } catch {
      alert("Network error. Please try again.");
    }
    setSubmitting(false);
  };

  const shareAction = (platform: string) => {
    const url = `${window.location.origin}/${autoSlug}`;
    const text = `Check out my TutorCard — all my info, specialties, and availability in one place.`;
    const map: Record<string, string> = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text + " " + url)}`,
      email: `mailto:?subject=My TutorCard&body=${encodeURIComponent(text + "\n\n" + url)}`,
      sms: `sms:?body=${encodeURIComponent(text + " " + url)}`,
    };
    if (map[platform]) window.open(map[platform], "_blank");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .cta-main { transition: opacity 0.15s; } .cta-main:hover { opacity: 0.88; }
        .tag-btn { transition: all 0.15s; } .tag-btn:hover { border-color: #111 !important; }
        .color-dot { transition: all 0.15s; cursor: pointer; border: none; } .color-dot:hover { transform: scale(1.12); }
        .share-btn { transition: all 0.15s; } .share-btn:hover { background: #f3f4f6 !important; }
      `}</style>

      <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#fafafa", minHeight: "100vh" }}>
        <Header onLogoClick={() => { window.location.href = "/"; }} />

        {/* STEP 1: ABOUT YOU */}
        {screen === "step1" && (
          <StepShell step={1} totalSteps={4} goTo={goTo} title="About you" subtitle="The basics for your card." onNext={() => setScreen("step2")} nextDisabled={!data.name.trim() || slugAvailable === false} isMobile={isMobile}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <div onClick={() => fileRef.current?.click()} style={{
                width: 64, height: 64, borderRadius: "50%", background: data.imageUrl ? "transparent" : "#f3f4f6",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                overflow: "hidden", border: "2px dashed #d1d5db", flexShrink: 0, transition: "border-color 0.15s",
              }}>
                {data.imageUrl ? (
                  <img src={data.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <Icon name="camera" size={20} style={{ color: "#9ca3af" }} />
                )}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 2px" }}>Profile photo</p>
                <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>Optional. Looks great on your card.</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
            </div>

            <Input label="Full name" value={data.name} onChange={v => upd("name", v)} placeholder="Sarah Mitchell" />
            <Input label="Professional headline" value={data.headline} onChange={v => upd("headline", v)} placeholder="SAT & ACT Specialist" />
            <LocationInput value={data.location} onChange={v => upd("location", v)} />
            <Input label="Your card URL" value={data.slug} onChange={v => upd("slug", v.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder={data.name ? data.name.toLowerCase().replace(/[^a-z0-9]/g, "") : "yourname"} prefix="tutorcard.co/" />
            {autoSlug && (
              <div style={{ fontSize: 12, marginTop: -8, marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>
                {slugChecking && <span style={{ color: "#9ca3af" }}>Checking availability...</span>}
                {!slugChecking && slugAvailable === true && (
                  <span style={{ color: "#059669", display: "flex", alignItems: "center", gap: 4 }}>
                    <Icon name="check" size={12} style={{ color: "#059669" }} /> Available
                  </span>
                )}
                {!slugChecking && slugAvailable === false && (
                  <span style={{ color: "#dc2626" }}>That URL is taken. Try another.</span>
                )}
              </div>
            )}

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Do you tutor remotely?</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[true, false].map(v => (
                  <button key={String(v)} onClick={() => upd("remote", v)} style={{
                    padding: "8px 20px", borderRadius: 10,
                    border: data.remote === v ? "1.5px solid #111" : "1.5px solid #e5e7eb",
                    background: data.remote === v ? "#111" : "white",
                    color: data.remote === v ? "white" : "#6b7280",
                    fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  }}>{v ? "Yes" : "No"}</button>
                ))}
              </div>
            </div>
          </StepShell>
        )}

        {/* STEP 2: SPECIALTIES */}
        {screen === "step2" && (
          <StepShell step={2} totalSteps={4} goTo={goTo} title="Your specialties" subtitle="Select the exams and subjects you teach." onNext={() => setScreen("step3")} nextDisabled={data.specialties.length === 0} isMobile={isMobile}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[...EXAMS, ...customOthers].map(ex => {
                const sel = data.specialties.includes(ex);
                return (
                  <button key={ex} className="tag-btn" onClick={() => {
                    upd("specialties", sel ? data.specialties.filter(s => s !== ex) : [...data.specialties, ex]);
                  }} style={{
                    padding: "8px 16px", borderRadius: 10,
                    border: sel ? "1.5px solid #111" : "1.5px solid #e5e7eb",
                    background: sel ? "#111" : "white", color: sel ? "white" : "#374151",
                    fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  }}>{sel && <span style={{ marginRight: 4 }}>&#10003;</span>}{ex}</button>
                );
              })}
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
              <input value={otherInput} onChange={e => setOtherInput(e.target.value)} placeholder="Add a custom specialty..."
                onKeyDown={e => e.key === "Enter" && addCustomOther()}
                style={{ flex: 1, padding: "9px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 13, color: "#111", outline: "none", fontFamily: "'DM Sans', sans-serif", background: "white" }}
              />
              <button onClick={addCustomOther} style={{
                padding: "9px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb",
                background: "white", color: "#374151", fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                display: "flex", alignItems: "center", gap: 4,
              }}><Icon name="plus" size={13} />Add</button>
            </div>
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 10 }}>{data.specialties.length} selected</p>
          </StepShell>
        )}

        {/* STEP 3: LINKS */}
        {screen === "step3" && (
          <StepShell step={3} totalSteps={4} goTo={goTo} title="Add your links" subtitle="These become action buttons on your card. Parents and students tap them directly." onNext={() => setScreen("step4")} nextDisabled={data.links.some(l => !l.value.trim())} isMobile={isMobile}>
            {data.links.map(lk => (
              <LinkRow key={lk.id} link={lk} onChange={u => updateLink(lk.id, u)} onRemove={() => removeLink(lk.id)} />
            ))}
            <button onClick={addLink} style={{
              width: "100%", padding: "12px", borderRadius: 12,
              border: "1.5px dashed #d1d5db", background: "transparent",
              color: "#9ca3af", fontSize: 13, fontWeight: 500, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              transition: "border-color 0.15s, color 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#111"; e.currentTarget.style.color = "#111"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.color = "#9ca3af"; }}
            ><Icon name="plus" size={14} />Add another link</button>
          </StepShell>
        )}

        {/* STEP 4: PREVIEW + COLOR */}
        {screen === "step4" && (
          <div style={{ minHeight: "calc(100vh - 56px)", display: "flex", flexDirection: "column" }}>
            <StepNav step={4} goTo={goTo} isMobile={isMobile} />

            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: isMobile ? "28px 20px" : "36px 32px" }}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <h2 style={{ fontSize: isMobile ? 24 : 28, fontWeight: 800, color: "#111", letterSpacing: "-0.02em", margin: "0 0 6px" }}>Looking good.</h2>
                <p style={{ fontSize: 15, color: "#9ca3af", margin: 0 }}>Pick a color and preview your card.</p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, padding: "10px 18px", background: "white", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)" }}>
                <Icon name="palette" size={14} style={{ color: "#9ca3af" }} />
                {COLORS.map(c => (
                  <button key={c.c} className="color-dot" onClick={() => upd("accent", c.c)} title={c.n} style={{
                    width: 24, height: 24, borderRadius: 7, background: c.c,
                    boxShadow: data.accent === c.c ? `0 0 0 2px white, 0 0 0 3.5px ${c.c}` : "none",
                  }} />
                ))}
              </div>

              <div style={{ marginBottom: 24 }}>
                <CardPreview data={data} accent={data.accent} />
              </div>

              <div style={{ maxWidth: 380, width: "100%" }}>
                <button onClick={async () => {
                  const supabase = createClient();
                  const { data: authData } = await supabase.auth.getUser();
                  if (authData.user) {
                    handlePublish();
                  } else {
                    setScreen("signup");
                  }
                }} disabled={submitting} className="cta-main" style={{
                  width: "100%", padding: "14px", borderRadius: 14, border: "none",
                  background: submitting ? "#9ca3af" : "#111", color: "white", fontSize: 15, fontWeight: 600,
                  cursor: submitting ? "default" : "pointer", fontFamily: "'DM Sans', sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}><Icon name="sparkle" size={16} />{submitting ? "Publishing..." : "Publish my TutorCard"}</button>
              </div>
            </div>
          </div>
        )}

        {/* SIGNUP / LOGIN (inline during card creation) */}
        {screen === "signup" && (
          <div style={{ minHeight: "calc(100vh - 56px)", display: "flex", flexDirection: "column", alignItems: "center", padding: isMobile ? "32px 16px" : "40px 32px" }}>
            <div style={{ maxWidth: 400, width: "100%" }}>
              <button onClick={() => setScreen("step4")} style={{
                background: "none", border: "none", color: "#9ca3af", fontSize: 13, fontWeight: 500,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 5, marginBottom: 20,
              }}><Icon name="arrowLeft" size={14} />Back to preview</button>

              <div style={{ background: "white", borderRadius: 18, border: "1px solid #e5e7eb", padding: 36, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: "#111", letterSpacing: "-0.02em", margin: "0 0 4px" }}>
                  {authMode === "signup" ? "Create an account" : "Welcome back"}
                </h2>
                <p style={{ fontSize: 14, color: "#9ca3af", margin: "0 0 24px" }}>
                  {authMode === "signup" ? "Sign up to publish your TutorCard." : "Log in to publish your TutorCard."}
                </p>

                {authError && (
                  <div style={{ fontSize: 13, color: "#ef4444", background: "#fef2f2", border: "1px solid rgba(239,68,68,0.15)", padding: "10px 14px", borderRadius: 8, marginBottom: 16 }}>
                    {authError}
                  </div>
                )}

                <GoogleSignInButton
                  redirectTo="/create?resume=true"
                  onClick={() => saveCardDraft({ ...data, inviteCode: inviteCode.trim() || undefined })}
                />

                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0", color: "#9ca3af", fontSize: 13 }}>
                  <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
                  <span>or</span>
                  <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setAuthError("");

                  if (authMode === "signup" && authPassword.length < 6) {
                    setAuthError("Password must be at least 6 characters.");
                    return;
                  }

                  setAuthLoading(true);
                  const supabase = createClient();

                  if (authMode === "signup") {
                    const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
                    if (error) { setAuthError(error.message); setAuthLoading(false); return; }
                  } else {
                    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
                    if (error) { setAuthError(error.message); setAuthLoading(false); return; }
                  }

                  // Publish after successful auth
                  setAuthLoading(false);
                  handlePublish();
                }}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Email</label>
                    <input
                      type="email"
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      placeholder="you@email.com"
                      required
                      style={{
                        width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb",
                        fontSize: 14, color: "#111", outline: "none", boxSizing: "border-box",
                        fontFamily: "'DM Sans', sans-serif", background: "white",
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = "#111"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "#e5e7eb"; }}
                    />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Password</label>
                    <input
                      type="password"
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      placeholder={authMode === "signup" ? "At least 6 characters" : "Your password"}
                      required
                      style={{
                        width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb",
                        fontSize: 14, color: "#111", outline: "none", boxSizing: "border-box",
                        fontFamily: "'DM Sans', sans-serif", background: "white",
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = "#111"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "#e5e7eb"; }}
                    />
                  </div>

                  {authMode === "signup" && (
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>
                        Invite code <span style={{ fontWeight: 400, color: "#9ca3af" }}>(optional)</span>
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="text"
                          value={inviteCode}
                          onChange={e => setInviteCode(e.target.value.toUpperCase())}
                          placeholder="TC-XXXXXX"
                          style={{
                            width: "100%", padding: "11px 14px", paddingRight: 38, borderRadius: 10,
                            border: `1.5px solid ${inviteCode.trim() ? (inviteCodeValid === true ? "#059669" : inviteCodeValid === false ? "#ef4444" : "#e5e7eb") : "#e5e7eb"}`,
                            fontSize: 14, color: "#111", outline: "none", boxSizing: "border-box",
                            fontFamily: "monospace", letterSpacing: "0.05em", background: "white",
                          }}
                          onFocus={e => { if (!inviteCode.trim()) e.currentTarget.style.borderColor = "#111"; }}
                          onBlur={e => { if (!inviteCode.trim()) e.currentTarget.style.borderColor = "#e5e7eb"; }}
                        />
                        {inviteCode.trim() && (
                          <span style={{
                            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                            display: "flex", alignItems: "center",
                          }}>
                            {inviteCodeChecking ? (
                              <span style={{ fontSize: 12, color: "#9ca3af" }}>...</span>
                            ) : inviteCodeValid === true ? (
                              <Icon name="check" size={14} style={{ color: "#059669" }} />
                            ) : inviteCodeValid === false ? (
                              <Icon name="x" size={14} style={{ color: "#ef4444" }} />
                            ) : null}
                          </span>
                        )}
                      </div>
                      {inviteCode.trim() && inviteCodeValid === false && !inviteCodeChecking && (
                        <p style={{ fontSize: 11, color: "#ef4444", margin: "4px 0 0", lineHeight: 1.3 }}>
                          Invalid or already used code
                        </p>
                      )}
                    </div>
                  )}

                  <button type="submit" disabled={authLoading} style={{
                    width: "100%", padding: "14px", borderRadius: 14, border: "none",
                    background: authLoading ? "#9ca3af" : "#111", color: "white",
                    fontSize: 15, fontWeight: 600, cursor: authLoading ? "default" : "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}>
                    <Icon name="sparkle" size={16} />
                    {authLoading
                      ? (authMode === "signup" ? "Creating account..." : "Logging in...")
                      : (authMode === "signup" ? "Create account & publish" : "Log in & publish")
                    }
                  </button>
                </form>

                <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#9ca3af" }}>
                  {authMode === "signup" ? (
                    <>Already have an account?{" "}
                      <button onClick={() => { setAuthMode("login"); setAuthError(""); }} style={{
                        background: "none", border: "none", color: "#d97706", fontWeight: 600,
                        cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                      }}>Log in</button>
                    </>
                  ) : (
                    <>Don&apos;t have an account?{" "}
                      <button onClick={() => { setAuthMode("signup"); setAuthError(""); }} style={{
                        background: "none", border: "none", color: "#d97706", fontWeight: 600,
                        cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                      }}>Sign up</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SHARE */}
        {screen === "share" && (
          <div style={{ minHeight: "calc(100vh - 56px)", display: "flex", flexDirection: "column", alignItems: "center", padding: isMobile ? "40px 16px" : "56px 32px" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Icon name="check" size={28} style={{ color: "#059669" }} />
              </div>
              <h2 style={{ fontSize: isMobile ? 26 : 32, fontWeight: 800, color: "#111", letterSpacing: "-0.02em", margin: "0 0 6px" }}>Your TutorCard is live!</h2>
              <p style={{ fontSize: 15, color: "#6b7280", margin: 0, maxWidth: 400 }}>Share it with your students and parents. The more people see it, the more it works for you.</p>
            </div>

            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 28, alignItems: "flex-start", maxWidth: 820, width: "100%" }}>
              <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <CardPreview data={data} accent={data.accent} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Your card link</p>
                  <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
                    <div style={{ flex: 1, padding: "11px 14px", fontSize: 14, color: "#111", fontFamily: "'DM Sans', sans-serif", background: "white" }}>{typeof window !== "undefined" ? window.location.origin : "tutorcard.co"}/{autoSlug}</div>
                    <button onClick={handleCopy} style={{
                      padding: "11px 16px", border: "none", borderLeft: "1.5px solid #e5e7eb",
                      background: copied ? "#ecfdf5" : "#f9fafb", color: copied ? "#059669" : "#374151",
                      fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                      display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
                    }}><Icon name={copied ? "check" : "copy"} size={14} />{copied ? "Copied!" : "Copy link"}</button>
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Share your card</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {[
                      { icon: "linkedin", label: "Share on LinkedIn", color: "#0A66C2", action: "linkedin" },
                      { icon: "twitter", label: "Share on X", color: "#111", action: "twitter" },
                      { icon: "mail", label: "Send via email", color: "#6b7280", action: "email" },
                      { icon: "msg", label: "Text to parents", color: "#6b7280", action: "sms" },
                    ].map(s => (
                      <button key={s.icon} className="share-btn" onClick={() => shareAction(s.action)} style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 12,
                        border: "1px solid #e5e7eb", background: "white", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                      }}>
                        <Icon name={s.icon} size={16} style={{ color: s.color }} />
                        <span style={{ fontSize: 14, fontWeight: 500, color: "#111", flex: 1, textAlign: "left" }}>{s.label}</span>
                        <Icon name="chevron" size={13} style={{ color: "#d1d5db" }} />
                      </button>
                    ))}
                  </div>
                </div>
                <button className="share-btn" style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderRadius: 12, width: "100%",
                  border: "1px solid #e5e7eb", background: "white", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                }}>
                  <Icon name="download" size={16} style={{ color: "#6b7280" }} />
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#111", flex: 1, textAlign: "left" }}>Download card image</span>
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>PNG</span>
                </button>
                <div style={{ textAlign: "center", marginTop: 24 }}>
                  <button onClick={() => { window.location.href = "/dashboard"; }} style={{ background: "none", border: "none", color: "#9ca3af", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "inline-flex", alignItems: "center", gap: 5 }}>
                    Go to dashboard <Icon name="arrowRight" size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
