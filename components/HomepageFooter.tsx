"use client";

import Link from "next/link";

export default function HomepageFooter({ isMobile }: { isMobile: boolean }) {
  return (
    <footer style={{ background: "white", borderTop: "1px solid #f3f4f6", padding: isMobile ? "32px 20px" : "40px 36px", width: "100%", display: "flex", flexDirection: "column", alignItems: "stretch" }}>
      <div style={{
        display: "flex", flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "center" : "flex-start",
        justifyContent: "space-between", gap: isMobile ? 24 : 0,
        textAlign: isMobile ? "center" : "left",
      }}>
        <div>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: isMobile ? "center" : "flex-start", marginBottom: 6, textDecoration: "none" }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "white" }}>tc</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>tutorcard</span>
          </Link>
          <p style={{ fontSize: 12.5, color: "#9ca3af", margin: 0, maxWidth: 280, lineHeight: 1.5 }}>
            The professional identity platform for tutors. Free to create, easy to share.
          </p>
        </div>
        <div style={{ display: "flex", gap: isMobile ? 32 : 48, marginLeft: isMobile ? 0 : "auto", textAlign: "right" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "#9ca3af", margin: "0 0 10px" }}>Platform</p>
            {["Create a card", "Log in", "For associations", "For parents"].map((l) => (
              <p key={l} style={{ fontSize: 13, color: "#6b7280", margin: "0 0 6px", cursor: "pointer" }}>{l}</p>
            ))}
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "#9ca3af", margin: "0 0 10px" }}>Company</p>
            {["About", "Blog", "Privacy", "Terms"].map((l) => (
              <p key={l} style={{ fontSize: 13, color: "#6b7280", margin: "0 0 6px", cursor: "pointer" }}>{l}</p>
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "center" }}>
        <p style={{ fontSize: 12, color: "#d1d5db", margin: 0 }}>&copy; 2026 TutorCard &middot; A StudySpaces product</p>
      </div>
    </footer>
  );
}
