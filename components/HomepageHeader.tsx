"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

const Icon = ({ name, size = 16, ...props }: { name: string; size?: number; [key: string]: unknown }) => {
  const d: Record<string, React.ReactNode> = {
    plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {d[name]}
    </svg>
  );
};

export default function HomepageHeader({ isMobile, isLoggedIn }: { isMobile: boolean; isLoggedIn?: boolean }) {
  const router = useRouter();

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.92)",
      backdropFilter: "blur(12px)", borderBottom: "1px solid #f3f4f6",
      padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
        <div style={{ width: 24, height: 24, borderRadius: 6, background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "white" }}>tc</span>
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>tutorcard</span>
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {isLoggedIn ? (
          <button
            onClick={() => router.push("/dashboard")}
            className="cta-main"
            style={{
              padding: "7px 16px", borderRadius: 10, border: "none", background: "#111",
              color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 5,
            }}
          >
            Go to Dashboard
          </button>
        ) : (
          <>
            {!isMobile && (
              <button
                className="cta-ghost"
                onClick={() => router.push("/login")}
                style={{
                  padding: "7px 14px", borderRadius: 10, border: "none", background: "transparent",
                  color: "#6b7280", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Log in
              </button>
            )}
            <button
              onClick={() => router.push("/create")}
              className="cta-main"
              style={{
                padding: "7px 16px", borderRadius: 10, border: "none", background: "#111",
                color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 5,
              }}
            >
              <Icon name="plus" size={14} />Create your card
            </button>
          </>
        )}
      </div>
    </header>
  );
}
