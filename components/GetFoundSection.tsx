"use client";

export default function GetFoundSection() {
  const T = {
    primary: "#111111",
    body: "#374151",
    muted: "#6b7280",
    placeholder: "#9ca3af",
    border: "#e5e7eb",
    divider: "#ebebeb",
    surface: "#fafafa",
    accent: "#6C5CE7",
    greenBg: "#ecfdf5",
    greenTxt: "#059669",
    white: "#ffffff",
    font: "'DM Sans', sans-serif",
    outerR: 20,
    innerR: 14,
    shadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)",
  };
  const Fav = ({ children, dark }: { children: React.ReactNode; dark?: boolean }) => (
    <span style={{
      width: 16, height: 16, borderRadius: 4,
      background: dark ? T.primary : T.border,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontSize: 7.5, fontWeight: 700,
      color: dark ? T.white : T.placeholder,
      flexShrink: 0,
    }}>{children}</span>
  );
  return (
    <section style={{
      background: T.white,
      borderTop: "1px solid #f3f4f6",
    }}>
      <div style={{
        maxWidth: 960, margin: "0 auto", padding: "48px 32px 96px",
        fontFamily: T.font, WebkitFontSmoothing: "antialiased",
      }}>
        <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
        {/* ═══ INTRO ═══ */}
        <div style={{ maxWidth: 520, margin: "0 auto 48px", textAlign: "center" }}>
          <div style={{
            fontSize: 11, fontWeight: 600, textTransform: "uppercase",
            letterSpacing: "0.06em", color: T.placeholder, marginBottom: 16,
          }}>
            Get Found
          </div>
          <h2 style={{
            fontSize: 28, fontWeight: 700, lineHeight: 1.22,
            color: T.primary, margin: "0 0 16px", fontFamily: T.font,
          }}>
            8 in 10 tutoring clients come from word of mouth.
          </h2>
          <p style={{
            fontSize: 15, lineHeight: 1.65, color: T.body,
            margin: "0 auto", maxWidth: 460,
          }}>
            A parent hears your name at school pickup, from a friend, from another tutor.
            Great. That part&apos;s working. Then they do what every parent does: they Google you.
          </p>
          <p style={{
            fontSize: 15, lineHeight: 1.65, color: T.body,
            margin: "14px auto 0", maxWidth: 460,
          }}>
            And they get a LinkedIn you forgot existed,
            a site that wants $39 before they can even message you,
            and a dentist in New Jersey.
          </p>
          <p style={{
            fontSize: 14, lineHeight: 1.6, color: T.placeholder,
            margin: "14px auto 0", maxWidth: 460,
            fontStyle: "italic",
          }}>
            The dentist is doing great, by the way. Five stars. Not relevant.
          </p>
        </div>
        {/* ═══ SERP ═══ */}
        <div style={{
          background: T.white, borderRadius: T.outerR, boxShadow: T.shadow,
          overflow: "hidden", border: "1px solid rgba(0,0,0,0.04)",
          maxWidth: 600, margin: "0 auto",
        }}>
          {/* Browser chrome */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "11px 16px", borderBottom: `1px solid ${T.divider}`, background: T.surface,
          }}>
            <div style={{ display: "flex", gap: 5 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: T.border, display: "inline-block" }} />
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: T.border, display: "inline-block" }} />
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: T.border, display: "inline-block" }} />
            </div>
            <div style={{
              flex: 1, display: "flex", alignItems: "center", gap: 6,
              background: T.white, border: `1px solid ${T.border}`,
              borderRadius: 7, padding: "5px 10px", fontSize: 12, color: T.muted,
            }}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="#9ca3af" />
                <path d="M4 6h4M6 4v4" stroke="#9ca3af" />
              </svg>
              google.com
            </div>
          </div>
          <div style={{ padding: "20px 20px 4px" }}>
            {/* Search bar */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 14px", border: `1.5px solid ${T.border}`,
              borderRadius: 22, marginBottom: 16,
            }}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="4.5" stroke="#9ca3af" strokeWidth="1.5" />
                <path d="M10 10L14 14" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: 13.5, color: T.primary }}>Sarah Mitchell SAT tutor</span>
              <span style={{
                display: "inline-block", width: 1.5, height: 16,
                background: T.primary, animation: "blink 1s step-end infinite", marginLeft: -2,
              }} />
            </div>
            {/* Tabs */}
            <div style={{ display: "flex", gap: 20, borderBottom: `1px solid ${T.divider}`, marginBottom: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: T.primary, paddingBottom: 8, borderBottom: "2px solid #111", position: "relative", bottom: -1 }}>All</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: T.placeholder, paddingBottom: 8 }}>Maps</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: T.placeholder, paddingBottom: 8 }}>Images</span>
            </div>
            {/* ── TUTORCARD ── */}
            <div style={{
              background: "linear-gradient(135deg, rgba(236,253,245,0.55) 0%, rgba(236,253,245,0.12) 100%)",
              border: "1px solid rgba(5,150,105,0.12)",
              borderRadius: T.innerR, padding: "14px 16px 16px",
              marginTop: 14, position: "relative",
            }}>
              <div style={{
                position: "absolute", top: 10, right: 10,
                fontSize: 10, fontWeight: 600, textTransform: "uppercase",
                letterSpacing: "0.04em", color: T.greenTxt,
                background: T.greenBg, padding: "3px 8px", borderRadius: 6,
              }}>With TutorCard</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: T.muted, marginBottom: 3 }}>
                <Fav dark>tc</Fav>
                <span>tutorcard.co &rsaquo; sarah-mitchell</span>
              </div>
              <div style={{ fontSize: 15.5, fontWeight: 500, color: "#1a0dab", marginBottom: 5, lineHeight: 1.3, paddingRight: 90 }}>
                Sarah Mitchell &mdash; SAT &amp; ACT Specialist | TutorCard
              </div>
              <div style={{ fontSize: 12.5, lineHeight: 1.55, color: T.body }}>
                SAT tutor in New York, NY.{" "}
                <span style={{
                  display: "inline-flex", alignItems: "center",
                  background: T.greenBg, color: T.greenTxt,
                  padding: "1px 7px", borderRadius: 4, fontWeight: 600, fontSize: 11.5,
                }}>+280 avg score gain</span>{" "}
                14 peer vouches from fellow tutors. Book a free consultation.
              </div>
            </div>
            {/* ── DIVIDER ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0 4px" }}>
              <div style={{ flex: 1, height: 1, background: "#eeeeee" }} />
              <span style={{ fontSize: 9.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "#d1d5db" }}>
                without it
              </span>
              <div style={{ flex: 1, height: 1, background: "#eeeeee" }} />
            </div>
            {/* ── LINKEDIN ── */}
            <div style={{ padding: "12px 0 13px", opacity: 0.40 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: T.muted, marginBottom: 3 }}>
                <Fav>in</Fav>
                <span>linkedin.com &rsaquo; in &rsaquo; sarah-mitchell-8a3b2f</span>
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 500, color: T.muted, marginBottom: 4, lineHeight: 1.3 }}>
                Sarah Mitchell &mdash; Self-Employed | LinkedIn
              </div>
              <div style={{ fontSize: 12.5, lineHeight: 1.5, color: T.placeholder }}>
                Education: BA, English Literature. Experience: Self-Employed (2019 &ndash; Present). 3 connections.
              </div>
            </div>
            {/* ── MARKETPLACE ── */}
            <div style={{ padding: "12px 0 13px", borderTop: "1px solid #f5f5f5", opacity: 0.32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: T.muted, marginBottom: 3 }}>
                <Fav>W</Fav>
                <span>tutormarketplace.com &rsaquo; tutors &rsaquo; sarah-m</span>
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 500, color: T.muted, marginBottom: 4, lineHeight: 1.3 }}>
                Sarah M. &mdash; SAT Tutor | TutorMarketplace
              </div>
              <div style={{ fontSize: 12.5, lineHeight: 1.5, color: T.placeholder }}>
                Find Sarah M. and 24 other SAT tutors near you. Booking fee: $39. &quot;Parents also viewed: James K., Priya R...&quot;
              </div>
            </div>
            {/* ── DENTIST ── */}
            <div style={{ padding: "12px 0 14px", borderTop: "1px solid #f5f5f5", opacity: 0.24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: T.muted, marginBottom: 3 }}>
                <Fav>H</Fav>
                <span>healthgrades.com &rsaquo; sarah-mitchell-dds</span>
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 500, color: T.muted, marginBottom: 4, lineHeight: 1.3 }}>
                Dr. Sarah Mitchell, DDS &mdash; Dentist in Newark, NJ
              </div>
              <div style={{ fontSize: 12.5, lineHeight: 1.5, color: T.placeholder }}>
                Dr. Sarah Mitchell is a general dentist in Newark, NJ accepting new patients...
              </div>
            </div>
          </div>
        </div>
        {/* ═══ CLOSER ═══ */}
        <div style={{ maxWidth: 440, margin: "36px auto 0", textAlign: "center" }}>
          <p style={{
            fontSize: 15, lineHeight: 1.6, color: T.body, margin: 0,
          }}>
            Your reputation gets you the referral.
            TutorCard makes sure the Google search doesn&apos;t blow it.
          </p>
          <p style={{
            fontSize: 13, color: T.placeholder, margin: "10px 0 0",
          }}>
            Takes about 2 minutes. The dentist will understand.
          </p>
        </div>
      </div>
    </section>
  );
}
