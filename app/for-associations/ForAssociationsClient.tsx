"use client";

import { useState, useEffect } from "react";
import HomepageHeader from "@/components/HomepageHeader";
import HomepageFooter from "@/components/HomepageFooter";

const accent = "#4f46e5";

const Icon = ({ name, size = 16, ...props }: { name: string; size?: number; [key: string]: unknown }) => {
  const d: Record<string, React.ReactNode> = {
    arrowRight: <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
    check: <polyline points="20 6 9 17 4 12" />,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    award: <><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></>,
    mail: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>,
    star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
    trendUp: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>,
    gift: <><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></>,
  };
  const fill = name === "star" ? "currentColor" : "none";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={fill === "none" ? "currentColor" : "none"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {d[name]}
    </svg>
  );
};

export default function ForAssociationsClient() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const ck = () => setIsMobile(window.innerWidth < 800);
    ck();
    window.addEventListener("resize", ck);
    return () => window.removeEventListener("resize", ck);
  }, []);

  return (
    <>
      <style>{`
        .cta-main { transition: opacity 0.15s; }
        .cta-main:hover { opacity: 0.88; }
      `}</style>
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#fafafa", color: "#111" }}>
        <HomepageHeader isMobile={isMobile} />

        {/* Hero */}
        <section style={{ maxWidth: 760, margin: "0 auto", padding: isMobile ? "48px 20px 40px" : "72px 32px 56px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 20, background: "white", border: "1px solid #e5e7eb", fontSize: 12.5, fontWeight: 500, color: "#6b7280", marginBottom: 20 }}>
            <Icon name="shield" size={13} style={{ color: accent }} />For associations and organizations
          </div>
          <h1 style={{ fontSize: isMobile ? 30 : 42, fontWeight: 800, color: "#111", lineHeight: 1.1, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
            Give your members a professional edge.
          </h1>
          <p style={{ fontSize: isMobile ? 16 : 18, color: "#6b7280", lineHeight: 1.55, margin: "0 auto 32px", maxWidth: 520 }}>
            Partner with TutorCard to give every member in your organization a professional card with verified credentials, peer endorsements, and a shareable link parents trust — included with their membership, courtesy of your organization.
          </p>
          <a href="https://calendly.com/jesse-studyspaces/30min" target="_blank" rel="noopener noreferrer" className="cta-main" style={{ padding: "13px 28px", borderRadius: 14, border: "none", background: "#111", color: "white", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
            Get in touch <Icon name="arrowRight" size={16} />
          </a>
        </section>

        {/* What your members get */}
        <section style={{ background: "white", borderTop: "1px solid #f3f4f6" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "56px 20px" : "80px 32px" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: accent, margin: "0 0 8px" }}>Member benefits</p>
              <h2 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 800, color: "#111", letterSpacing: "-0.02em", margin: "0 0 10px" }}>
                What your members get
              </h2>
              <p style={{ fontSize: 16, color: "#6b7280", margin: "0 auto", maxWidth: 480, lineHeight: 1.5 }}>
                Every member in your organization gets a TutorCard account at no cost — covered by your organization as a member benefit.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 20 }}>
              {[
                { icon: "gift", title: "Free access", desc: "Your members skip the $20/year fee entirely. Membership in your organization is their ticket in." },
                { icon: "shield", title: "Association badge", desc: "A verified badge on their card showing they belong to your organization. Visible to every parent who views their profile." },
                { icon: "star", title: "Verified credentials", desc: "Their certifications and memberships displayed prominently. Parents see proof, not claims." },
                { icon: "trendUp", title: "Verified reviews", desc: "Structured score data from parents. Real outcomes tied to real tutors in your network." },
                { icon: "users", title: "Peer vouches", desc: "One-click endorsements between members. Strengthens the trust layer across your entire organization." },
                { icon: "award", title: "Shareable graphics", desc: "Members can download and share branded achievement graphics on socials. Your organization's name travels with them." },
              ].map((item, i) => (
                <div key={i} style={{ padding: "22px 20px", borderRadius: 14, background: "#fafafa", border: "1px solid #f0f0f0" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                    <Icon name={item.icon} size={18} style={{ color: "#374151" }} />
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111", margin: "0 0 6px" }}>{item.title}</h3>
                  <p style={{ fontSize: 13.5, color: "#6b7280", margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section style={{ borderTop: "1px solid #f3f4f6" }}>
          <div style={{ maxWidth: 760, margin: "0 auto", padding: isMobile ? "56px 20px" : "80px 32px" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: accent, margin: "0 0 8px" }}>How it works</p>
              <h2 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 800, color: "#111", letterSpacing: "-0.02em", margin: 0 }}>
                Simple for you. Valuable for them.
              </h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 560, margin: "0 auto" }}>
              {[
                { num: "1", title: "We set up your organization", desc: "We create your association profile on TutorCard with your logo, name, and a unique access code for your members." },
                { num: "2", title: "Members sign up at no cost", desc: "They enter your organization's code during signup and get full access — the $20/year fee is covered by your organization. Your badge appears on their card automatically." },
                { num: "3", title: "You get visibility", desc: "Every card with your badge links back to your organization. As your members share their cards, your reach grows with them." },
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 16, padding: "20px", background: "white", borderRadius: 14, border: "1px solid #f0f0f0" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#111", color: "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 15, fontWeight: 700 }}>{step.num}</div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111", margin: "0 0 4px" }}>{step.title}</h3>
                    <p style={{ fontSize: 14, color: "#6b7280", margin: 0, lineHeight: 1.5 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: "white", borderTop: "1px solid #f3f4f6" }}>
          <div style={{ maxWidth: 600, margin: "0 auto", padding: isMobile ? "56px 20px" : "80px 32px", textAlign: "center" }}>
            <h2 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 800, color: "#111", letterSpacing: "-0.02em", margin: "0 0 10px" }}>
              Interested? Let&apos;s talk.
            </h2>
            <p style={{ fontSize: 16, color: "#6b7280", margin: "0 auto 28px", maxWidth: 420, lineHeight: 1.5 }}>
              We work with tutoring associations of all sizes. Reach out and we will get your members set up.
            </p>
            <a href="https://calendly.com/jesse-studyspaces/30min" target="_blank" rel="noopener noreferrer" className="cta-main" style={{ padding: "15px 36px", borderRadius: 14, border: "none", background: "#111", color: "white", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <Icon name="calendar" size={18} />Get in touch
            </a>
          </div>
        </section>

        <HomepageFooter isMobile={isMobile} />
      </div>
    </>
  );
}
