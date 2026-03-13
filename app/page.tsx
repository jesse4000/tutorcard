"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import HomepageHeader from "@/components/HomepageHeader";
import HomepageFooter from "@/components/HomepageFooter";

const Icon = ({ name, size = 16, ...props }: { name: string; size?: number; [key: string]: unknown }) => {
  const d: Record<string, React.ReactNode> = {
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
    globe: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
    phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>,
    star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>,
    arrowUp: <><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    chevron: <polyline points="9 18 15 12 9 6"/>,
    msg: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>,
    wifi: <><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></>,
    award: <><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></>,
    link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
    arrowRight: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    check: <polyline points="20 6 9 17 4 12"/>,
    search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    heart: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>,
    trendUp: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
    sparkle: <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>,
    gift: <><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></>,
  };
  const fill = (name === "star" || name === "sparkle") ? "currentColor" : "none";
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={fill === "none" ? "currentColor" : "none"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>{d[name]}</svg>;
};

// ─── MINI CARD WITH TILT + SHIMMER ──────────────────────
function MiniCard() {
  const accent = "#4f46e5";
  const [tilt, setTilt] = useState({ x: 0, y: 0, active: false });
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({ x: (0.5 - y) * 8, y: (x - 0.5) * 8, active: true });
  };
  const handleMouseLeave = () => setTilt({ x: 0, y: 0, active: false });
  return (
    <div style={{ perspective: 800, flexShrink: 0 }}>
      <div
        className="card-tilt"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          background: "white", borderRadius: 20,
          boxShadow: tilt.active
            ? `${tilt.y * -1.5}px ${4 + Math.abs(tilt.x) * 2}px ${24 + Math.abs(tilt.x + tilt.y) * 3}px rgba(0,0,0,0.1)`
            : "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)",
          overflow: "hidden", width: 320, position: "relative",
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: tilt.active
            ? "transform 0.1s ease-out, box-shadow 0.15s ease-out"
            : "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
          willChange: "transform",
        }}
      >
        {/* Glare */}
        {tilt.active && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none", borderRadius: 20,
            background: `radial-gradient(circle at ${(tilt.y + 4) / 8 * 100}% ${(4 - tilt.x) / 8 * 100}%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 60%)`,
          }} />
        )}
      <div style={{ padding: "24px 20px 16px", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
          <span style={{ fontSize: 18, color: "white", fontWeight: 600 }}>SM</span>
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: "0 0 1px", letterSpacing: "-0.02em" }}>Sarah Mitchell</h3>
        <p style={{ fontSize: 12.5, color: "#6b7280", margin: "0 0 6px" }}>SAT & ACT Specialist</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 11.5, color: "#9ca3af" }}>
          <span>New York, NY</span><span style={{ color: "#d1d5db" }}>·</span>
          <span style={{ display: "flex", alignItems: "center", gap: 3, color: accent, fontWeight: 500 }}><Icon name="wifi" size={10} style={{ color: accent }} />Remote</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 20, border: "1px solid #e5e7eb", fontSize: 11.5 }}>
            <Icon name="users" size={11} style={{ color: "#6b7280" }} /><span style={{ fontWeight: 600, color: "#111" }}>14</span><span style={{ color: "#9ca3af" }}>vouches</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 20, border: "1px solid #e5e7eb", fontSize: 11.5 }}>
            <Icon name="star" size={10} style={{ color: "#f59e0b" }} /><span style={{ fontWeight: 600, color: "#111" }}>4.9</span><span style={{ color: "#9ca3af" }}>(23)</span>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 4, marginTop: 10 }}>
          {["SAT Math", "SAT R&W", "ACT", "AP Calc"].map(s => <span key={s} style={{ padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 500, color: "#374151", background: "#f3f4f6" }}>{s}</span>)}
        </div>
      </div>
      <div style={{ height: 1, background: "#f3f4f6", margin: "0 16px" }} />
      <div style={{ padding: "12px 16px" }}>
        <div style={{ background: "#fafafa", borderRadius: 12, padding: "10px 12px", border: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#6b7280", background: "#e5e7eb", padding: "1px 5px", borderRadius: 3 }}>SAT</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#b0b0b0" }}>1180</span>
            <span style={{ fontSize: 11, color: "#d1d5db" }}>&rarr;</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>1460</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 1, background: accent, color: "white", padding: "1px 5px", borderRadius: 20, fontSize: 9.5, fontWeight: 700, marginLeft: "auto" }}><Icon name="arrowUp" size={8} />+280</span>
          </div>
          <p style={{ fontSize: 11.5, color: "#374151", lineHeight: 1.4, margin: 0, fontStyle: "italic" }}>&quot;Sarah completely transformed my son&apos;s approach...&quot;</p>
        </div>
      </div>
      <div style={{ height: 1, background: "#f3f4f6", margin: "0 16px" }} />
      <div style={{ padding: "6px 10px" }}>
        {[{ l: "Book a free consultation", i: "calendar" }, { l: "sarahmitchell.com", i: "globe" }].map((lk, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 8px", borderRadius: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={lk.i} size={13} style={{ color: "#374151" }} /></div>
            <span style={{ fontSize: 12.5, fontWeight: 500, color: "#111", flex: 1 }}>{lk.l}</span>
            <Icon name="chevron" size={11} style={{ color: "#d1d5db" }} />
          </div>
        ))}
      </div>
      <div style={{ padding: "4px 16px 16px" }}>
        <button className="cta-shimmer" style={{
          width: "100%", padding: "10px", borderRadius: 12,
          background: accent, color: "white", fontSize: 13, fontWeight: 600,
          border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          position: "relative", overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          <Icon name="msg" size={14} />Send a message
        </button>
      </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
        <Icon name={icon} size={20} style={{ color: "#374151" }} />
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111", margin: "0 0 6px", letterSpacing: "-0.01em" }}>{title}</h3>
      <p style={{ fontSize: 14, color: "#6b7280", margin: 0, lineHeight: 1.55 }}>{desc}</p>
    </div>
  );
}

function Step({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div style={{ flex: "1 1 0", minWidth: 200, textAlign: "center" }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#111", color: "white", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 15, fontWeight: 700 }}>{num}</div>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111", margin: "0 0 4px" }}>{title}</h3>
      <p style={{ fontSize: 13.5, color: "#6b7280", margin: 0, lineHeight: 1.5 }}>{desc}</p>
    </div>
  );
}

// ─── DEEP DIVE SECTION (reviews, vouches, badges) ───────
function DeepDive({ icon, badge, title, subtitle, desc, children, flipped, isMobile }: { icon: string; badge: string; title: string; subtitle: string; desc: string; children: React.ReactNode; flipped: boolean; isMobile: boolean }) {
  const content = (
    <div style={{ flex: 1 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: "#f3f4f6", fontSize: 11.5, fontWeight: 600, color: "#6b7280", marginBottom: 14 }}>
        <Icon name={icon} size={13} />{badge}
      </div>
      <h3 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 800, color: "#111", letterSpacing: "-0.02em", margin: "0 0 8px", lineHeight: 1.2 }}>{title}</h3>
      <p style={{ fontSize: 14, color: "#9ca3af", margin: "0 0 14px", fontWeight: 500 }}>{subtitle}</p>
      <p style={{ fontSize: 15, color: "#6b7280", margin: 0, lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
  const visual = <div style={{ flex: "0 0 auto", width: isMobile ? "100%" : 340 }}>{children}</div>;
  return (
    <div style={{
      display: "flex", flexDirection: isMobile ? "column" : (flipped ? "row-reverse" : "row"),
      gap: isMobile ? 28 : 48, alignItems: "center",
      padding: isMobile ? "48px 0" : "64px 0",
      borderBottom: "1px solid #f3f4f6",
    }}>
      {content}{visual}
    </div>
  );
}

// ─── MAIN ───────────────────────────────────────────────
export default function TutorCardLanding() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const ck = () => setIsMobile(window.innerWidth < 800);
    ck(); window.addEventListener("resize", ck);
    return () => window.removeEventListener("resize", ck);
  }, []);
  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) setIsLoggedIn(true);
    });
  }, []);

  const accent = "#4f46e5";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        .cta-main { transition: opacity 0.15s; }
        .cta-main:hover { opacity: 0.88; }
        .cta-ghost { transition: all 0.15s; }
        .cta-ghost:hover { background: #f3f4f6 !important; }
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(250%) skewX(-15deg); }
        }
        @keyframes softPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
          50% { box-shadow: 0 0 0 8px rgba(79, 70, 229, 0.08); }
        }
        /* ── Card button shimmer (hover only) ── */
        .cta-shimmer {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .cta-shimmer::after {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 50%; height: 100%;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 40%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.15) 60%, rgba(255,255,255,0) 100%);
          transform: translateX(-100%) skewX(-15deg);
        }
        /* Card wrapper hover triggers button shimmer */
        .card-tilt:hover .cta-shimmer::after {
          animation: shimmer 1.2s ease-in-out 0.2s forwards;
        }
        /* Direct button hover */
        .cta-shimmer:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(79, 70, 229, 0.25) !important;
        }
        .cta-shimmer:hover::after {
          animation: shimmer 0.8s ease-in-out forwards;
        }
      `}</style>

      <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#fafafa", color: "#111", minHeight: "100vh", display: "flex", flexDirection: "column", width: "100%" }}>

        {/* ═══ HEADER ═══ */}
        <HomepageHeader isMobile={isMobile} isLoggedIn={isLoggedIn} />

        {/* ═══ HERO ═══ */}
        <section style={{
          maxWidth: 1120, margin: "0 auto",
          padding: isMobile ? "48px 20px 40px" : "72px 32px 64px",
          display: "flex", alignItems: isMobile ? "center" : "center",
          flexDirection: isMobile ? "column" : "row", gap: isMobile ? 40 : 56,
        }}>
          <div style={{ flex: 1, textAlign: isMobile ? "center" : "left", maxWidth: 520 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "5px 14px", borderRadius: 20, background: "white",
              border: "1px solid #e5e7eb", fontSize: 12.5, fontWeight: 500, color: "#6b7280", marginBottom: 20,
            }}>
              Free for the first 100 tutors &middot; Set up in 5 minutes
            </div>
            <h1 style={{
              fontSize: isMobile ? 34 : 48, fontWeight: 800,
              lineHeight: 1.1, letterSpacing: "-0.03em", margin: "0 0 16px",
              fontFamily: "'DM Sans', sans-serif", color: "#111",
            }}>
              Your professional identity, <span style={{ color: accent }}>one link.</span>
            </h1>
            <p style={{
              fontSize: isMobile ? 16 : 18, color: "#6b7280", lineHeight: 1.55,
              margin: "0 0 28px", maxWidth: 440,
              marginLeft: isMobile ? "auto" : 0, marginRight: isMobile ? "auto" : 0,
            }}>
              TutorCard gives every tutor a shareable digital card with verified results, peer endorsements, and everything parents need in one place.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: isMobile ? "center" : "flex-start", flexWrap: "wrap" }}>
              <button onClick={() => router.push("/create")} className="cta-main" style={{
                padding: "13px 28px", borderRadius: 14, border: "none",
                background: "#111", color: "white", fontSize: 15, fontWeight: 600,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                display: "flex", alignItems: "center", gap: 6,
              }}>Create your card <Icon name="arrowRight" size={16} /></button>
            </div>
            <p style={{ fontSize: 12.5, color: "#9ca3af", marginTop: 20 }}>
              $20/year. First 100 tutors get in free.
            </p>
          </div>
          {!isMobile && <MiniCard />}
        </section>

        {/* ═══ FEATURES ═══ */}
        <section style={{ maxWidth: 1120, margin: "0 auto", padding: isMobile ? "56px 20px" : "80px 32px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: accent, margin: "0 0 8px" }}>Everything in one card</p>
            <h2 style={{ fontSize: isMobile ? 26 : 34, fontWeight: 800, color: "#111", letterSpacing: "-0.02em", margin: "0 0 10px" }}>
              More than a profile. A professional identity.
            </h2>
            <p style={{ fontSize: 16, color: "#6b7280", margin: "0 auto", maxWidth: 520, lineHeight: 1.5 }}>
              Replace your scattered links, PDFs, and text bios with one card that makes you look like the professional you are.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: isMobile ? 28 : 32 }}>
            <Feature icon="trendUp" title="Verified Results" desc="Structured score improvements with parent quotes. Not just sentiment. 1180 to 1460 in 4 months speaks for itself." />
            <Feature icon="users" title="Peer Vouches" desc="One-click endorsements from fellow tutors. A vouch says 'I would send my own students to this person.' That is trust no review can match." />
            <Feature icon="award" title="Achievement Badges" desc="Display your memberships, certifications, and credentials. Verified through the organization itself. A trust signal parents recognize instantly." />
            <Feature icon="link" title="Links Hub" desc="Your website, Calendly, Zoom, socials, all in one tap. Put it in your email signature, Instagram bio, or on a physical business card." />
            <Feature icon="search" title="SEO Discovery" desc="Your card appears in searches like 'SAT tutors in Tampa.' Parents who have never heard of you can find you and see your verified track record." />
            <Feature icon="msg" title="Direct Inquiries" desc="Parents message you through your card. No commissions, no middlemen. You get their name, email, exam interest, and message. A pre-qualified lead." />
          </div>
        </section>

        {/* ═══ DEEP DIVES (reviews, vouches, badges) ═══ */}
        <section style={{ background: "white", borderTop: "1px solid #f3f4f6" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto", padding: isMobile ? "0 20px" : "0 32px" }}>

            {/* Reviews */}
            <DeepDive
              icon="star" badge="Verified Reviews" flipped={false} isMobile={isMobile}
              title="Results that speak for themselves"
              subtitle="Every review is built around outcomes."
              desc="Each review on TutorCard captures the exam, the score before and after, how long it took, and a parent quote. Parents see real numbers and real stories, not generic 'great tutor' reviews. That is the difference between noise and proof."
            >
              {/* Mini review cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { exam: "SAT", from: 1180, to: 1460, mo: 4, q: '"He went from anxious to confident in just four months."', p: "Rebecca R." },
                  { exam: "ACT", from: 24, to: 33, mo: 3, q: '"Sarah identified exactly where my son was losing points."', p: "Maria L." },
                ].map((r, i) => (
                  <div key={i} style={{ background: "#fafafa", borderRadius: 14, padding: "14px 16px", border: "1px solid #f0f0f0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#6b7280", background: "#e5e7eb", padding: "2px 7px", borderRadius: 4 }}>{r.exam}</span>
                      <span style={{ fontSize: 18, fontWeight: 700, color: "#b0b0b0" }}>{r.from}</span>
                      <span style={{ fontSize: 12, color: "#d1d5db" }}>&rarr;</span>
                      <span style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>{r.to}</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 2, background: accent, color: "white", padding: "2px 7px", borderRadius: 20, fontSize: 10.5, fontWeight: 700, marginLeft: "auto" }}>
                        <Icon name="arrowUp" size={9} />+{r.to - r.from}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>
                      <span>{r.mo} months</span><span style={{ color: "#e5e7eb" }}>&middot;</span>
                      <div style={{ display: "flex", gap: 1 }}>{Array.from({ length: 5 }).map((_, j) => <Icon key={j} name="star" size={10} style={{ color: "#f59e0b" }} />)}</div>
                    </div>
                    <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.45, margin: "0 0 4px", fontStyle: "italic" }}>{r.q}</p>
                    <p style={{ fontSize: 11.5, color: "#9ca3af", margin: 0, fontWeight: 500 }}>- {r.p}, Parent</p>
                  </div>
                ))}
              </div>
            </DeepDive>

            {/* Vouches */}
            <DeepDive
              icon="users" badge="Peer Vouches" flipped={true} isMobile={isMobile}
              title="Trusted by the people who know the work"
              subtitle="Reviews come from clients. Vouches come from peers."
              desc="When a fellow tutor vouches for you, they are putting their name behind yours. It tells parents: 'I know this person professionally and I trust their work.' One click to give, impossible to fake, and visible on your card for everyone to see."
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { name: "James C.", initials: "JC", spec: "SAT & GRE Specialist" },
                  { name: "Priya P.", initials: "PP", spec: "ISEE & SSAT Expert" },
                  { name: "Emily N.", initials: "EN", spec: "ACT Prep Coach" },
                  { name: "Daniel O.", initials: "DO", spec: "SAT Reading & Writing" },
                ].map((v, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#fafafa", borderRadius: 12, border: "1px solid #f0f0f0" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "white" }}>{v.initials}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#111", margin: 0 }}>{v.name}</p>
                      <p style={{ fontSize: 11.5, color: "#6b7280", margin: "1px 0 0" }}>{v.spec}</p>
                    </div>
                    <Icon name="check" size={14} style={{ color: accent }} />
                  </div>
                ))}
                <div style={{ textAlign: "center", padding: "6px 0" }}>
                  <p style={{ fontSize: 12, color: "#9ca3af" }}>Vouched for by <span style={{ fontWeight: 700, color: "#111" }}>14</span> peer tutors</p>
                </div>
              </div>
            </DeepDive>

            {/* Badges */}
            <DeepDive
              icon="award" badge="Achievement Badges" flipped={false} isMobile={isMobile}
              title="Your credentials, finally visible"
              subtitle="Memberships and certifications, right on your card."
              desc="You earned those certifications and paid for those memberships. Now they actually show up somewhere parents can see them. Badges are verified through the organization and displayed on your card. Simple, visible, credible."
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { name: "Professional Tutor Member", org: "American Tutoring Professionals", type: "membership" },
                  { name: "Certified Test Prep Specialist", org: "Professional Tutoring Board", type: "certification" },
                  { name: "AP Certified Instructor", org: "National Academic Board", type: "certification" },
                ].map((b, i) => {
                  const isCert = b.type === "certification";
                  return (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 14px", background: "#fafafa", borderRadius: 12, border: "1px solid #f0f0f0" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: isCert ? accent : "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon name={isCert ? "award" : "shield"} size={17} style={{ color: isCert ? "white" : "#059669" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#111", margin: 0 }}>{b.name}</p>
                          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.03em", textTransform: "uppercase", color: isCert ? accent : "#059669", background: isCert ? `${accent}14` : "#ecfdf5", padding: "1px 6px", borderRadius: 4 }}>{isCert ? "Cert" : "Member"}</span>
                        </div>
                        <p style={{ fontSize: 11.5, color: "#6b7280", margin: "2px 0 0" }}>{b.org}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </DeepDive>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section style={{ borderTop: "1px solid #f3f4f6" }}>
          <div style={{ maxWidth: 800, margin: "0 auto", padding: isMobile ? "56px 20px" : "80px 32px" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: accent, margin: "0 0 8px" }}>How it works</p>
              <h2 style={{ fontSize: isMobile ? 26 : 34, fontWeight: 800, color: "#111", letterSpacing: "-0.02em", margin: 0 }}>Live in 5 minutes</h2>
            </div>
            <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
              <Step num="1" title="Create your card" desc="Add your name, specialties, bio, and links. Choose your accent color. Your unique URL and QR code are generated instantly." />
              <Step num="2" title="Add your proof" desc="Request reviews from parents. Each one captures the exam, score journey, timeframe, and a quote. Structured proof, not noise." />
              <Step num="3" title="Share everywhere" desc="Text it to parents. Put it in your email signature. Print the QR code on your business card. One link that does everything." />
            </div>
          </div>
        </section>

        {/* ═══ WHY WE BUILT TUTORCARD ═══ */}
        <section style={{ background: "white", borderTop: "1px solid #f3f4f6" }}>
          <div style={{
            maxWidth: 760, margin: "0 auto",
            padding: isMobile ? "56px 20px" : "80px 32px",
            textAlign: "center",
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: accent, margin: "0 0 8px" }}>Why we built this</p>
            <h2 style={{ fontSize: isMobile ? 26 : 34, fontWeight: 800, color: "#111", letterSpacing: "-0.02em", margin: "0 0 20px" }}>
              Every industry has its professional network. Tutoring deserved one too.
            </h2>
            <div style={{ textAlign: "left", maxWidth: 620, margin: "0 auto" }}>
              <p style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.7, margin: "0 0 16px" }}>
                Lawyers have Avvo. Designers have Dribbble. Writers have Substack. Every profession has a professional profile. Tutoring never got one.
              </p>
              <p style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.7, margin: "0 0 16px" }}>
                As for LinkedIn, that&apos;s for your uncle to congratulate himself on 15 years at Deloitte.
              </p>
              <p style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.7, margin: "0 0 16px" }}>
                We thought tutors deserved something actually built for them. Not a marketplace. Not a directory. Just a simple, sharp way to show the world you&apos;re great at what you do, without needing a marketing degree to pull it off.
              </p>
              <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
                Built by the team at <a href="https://studyspaces.com/" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, color: "#374151", textDecoration: "none" }}>StudySpaces</a>. Mostly fueled by spite and caffeine.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ PRICING ═══ */}
        <section style={{ borderTop: "1px solid #f3f4f6" }}>
          <div style={{ maxWidth: 800, margin: "0 auto", padding: isMobile ? "56px 20px" : "80px 32px" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: accent, margin: "0 0 8px" }}>Pricing</p>
              <h2 style={{ fontSize: isMobile ? 26 : 34, fontWeight: 800, color: "#111", letterSpacing: "-0.02em", margin: "0 0 10px" }}>
                Not free. On purpose.
              </h2>
              <p style={{ fontSize: 16, color: "#6b7280", margin: "0 auto", maxWidth: 520, lineHeight: 1.55 }}>
                We charge $20/year. Because free tools die, and bots ruin nice things.
              </p>
            </div>
            {/* Price card */}
            <div style={{
              maxWidth: 400, margin: "0 auto",
              background: "white", borderRadius: 20, padding: "32px 28px",
              border: "1px solid #f0f0f0", textAlign: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)",
            }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 48, fontWeight: 800, color: "#111", letterSpacing: "-0.03em", lineHeight: 1 }}>$20</span>
                <span style={{ fontSize: 16, color: "#9ca3af", fontWeight: 500 }}>/year</span>
              </div>
              <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 24px" }}>The whole thing. No tiers. No gotchas.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "left", marginBottom: 24 }}>
                {[
                  "Verified reviews with score data",
                  "Peer vouches from fellow tutors",
                  "Custom card URL and QR code",
                  "Links hub with direct inquiries",
                  "SEO discovery for parents",
                  "Shareable achievement graphics",
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Icon name="check" size={14} style={{ color: "#059669", flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: "#374151" }}>{item}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => router.push("/create")} className="cta-main" style={{
                width: "100%", padding: "13px", borderRadius: 14, border: "none",
                background: "#111", color: "white", fontSize: 15, fontWeight: 600,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>Create your card <Icon name="arrowRight" size={16} /></button>
              {/* First 100 free */}
              <div style={{
                marginTop: 16, padding: "10px 14px", borderRadius: 10,
                background: "#ecfdf5", border: "1px solid #d1fae5",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                <Icon name="sparkle" size={13} style={{ color: "#059669" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#059669" }}>First 100 tutors get it free</span>
              </div>
            </div>
            {/* Free access paths */}
            <div style={{ marginTop: 32, textAlign: "center" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 12px" }}>Other ways to join free</p>
              <div style={{ display: "flex", justifyContent: "center", gap: isMobile ? 12 : 20, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, background: "white", border: "1px solid #e5e7eb" }}>
                  <Icon name="gift" size={14} style={{ color: "#6b7280" }} />
                  <span style={{ fontSize: 13, color: "#6b7280" }}>Invite code from a peer</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, background: "white", border: "1px solid #e5e7eb" }}>
                  <Icon name="shield" size={14} style={{ color: "#6b7280" }} />
                  <span style={{ fontSize: 13, color: "#6b7280" }}>Tutoring association membership</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FINAL CTA ═══ */}
        <section style={{
          maxWidth: 700, margin: "0 auto",
          padding: isMobile ? "64px 20px" : "96px 32px",
          textAlign: "center",
        }}>
          <h2 style={{
            fontSize: isMobile ? 28 : 40, fontWeight: 800, color: "#111",
            letterSpacing: "-0.03em", margin: "0 0 10px", lineHeight: 1.15,
          }}>
            Be first in your community with a card.
          </h2>
          <p style={{ fontSize: 16, color: "#6b7280", margin: "0 auto 28px", maxWidth: 400, lineHeight: 1.5 }}>
            $20/year. First 100 tutors join free.
          </p>
          <button onClick={() => router.push("/create")} className="cta-main" style={{
            padding: "15px 36px", borderRadius: 14, border: "none",
            background: "#111", color: "white", fontSize: 16, fontWeight: 700,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>Create your TutorCard <Icon name="arrowRight" size={18} /></button>
        </section>

        {/* ═══ FOOTER ═══ */}
        <HomepageFooter isMobile={isMobile} />
      </div>
    </>
  );
}
