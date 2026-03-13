"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function NotFound() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 800);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const accent = "#4f46e5";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .notfound-home-btn { transition: opacity 0.15s; }
        .notfound-home-btn:hover { opacity: 0.88; }
        .notfound-link { transition: all 0.15s; text-decoration: none; }
        .notfound-link:hover { background: #f3f4f6 !important; }
      `}</style>

      <div
        style={{
          fontFamily: "'DM Sans', sans-serif",
          background: "#fafafa",
          color: "#111",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          width: "100%",
        }}
      >
        {/* Header */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid #f3f4f6",
            padding: "0 24px",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: "#111",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: "white" }}>
                tc
              </span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>
              tutorcard
            </span>
          </Link>
        </header>

        {/* Main content */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: isMobile ? "48px 20px" : "64px 32px",
            textAlign: "center",
          }}
        >
          {/* 404 number */}
          <div
            style={{
              fontSize: isMobile ? 80 : 120,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              background: `linear-gradient(135deg, ${accent}, #818cf8)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: 16,
            }}
          >
            404
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: isMobile ? 24 : 32,
              fontWeight: 800,
              color: "#111",
              letterSpacing: "-0.02em",
              margin: "0 0 12px",
              lineHeight: 1.2,
            }}
          >
            This page doesn&apos;t exist
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: isMobile ? 15 : 17,
              color: "#6b7280",
              lineHeight: 1.55,
              margin: "0 0 32px",
              maxWidth: 440,
            }}
          >
            The link you followed may be broken, or the page may have been
            removed. Don&apos;t worry — let&apos;s get you back on track.
          </p>

          {/* CTA buttons */}
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Link
              href="/"
              className="notfound-home-btn"
              style={{
                padding: "13px 28px",
                borderRadius: 14,
                border: "none",
                background: "#111",
                color: "white",
                fontSize: 15,
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              Go to homepage
              <svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link
              href="/create"
              className="notfound-link"
              style={{
                padding: "13px 28px",
                borderRadius: 14,
                border: "1px solid #e5e7eb",
                background: "white",
                color: "#374151",
                fontSize: 15,
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              Create your card
            </Link>
          </div>

          {/* Helpful links */}
          <div
            style={{
              marginTop: 48,
              padding: "24px 28px",
              background: "white",
              borderRadius: 16,
              border: "1px solid #f3f4f6",
              maxWidth: 400,
              width: "100%",
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "#9ca3af",
                margin: "0 0 14px",
              }}
            >
              Looking for something?
            </p>
            {[
              {
                label: "Browse the homepage",
                href: "/",
                desc: "Learn what TutorCard is all about",
              },
              {
                label: "Create a free card",
                href: "/create",
                desc: "Set up your tutor profile in minutes",
              },
              {
                label: "Log in to your account",
                href: "/login",
                desc: "Access your existing TutorCard",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="notfound-link"
                style={{
                  display: "block",
                  padding: "10px 12px",
                  borderRadius: 10,
                  textDecoration: "none",
                  marginBottom: 4,
                }}
              >
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#111",
                    margin: "0 0 2px",
                  }}
                >
                  {item.label}
                </p>
                <p style={{ fontSize: 12.5, color: "#9ca3af", margin: 0 }}>
                  {item.desc}
                </p>
              </Link>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer
          style={{
            borderTop: "1px solid #f3f4f6",
            padding: "20px 24px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 12, color: "#d1d5db", margin: 0 }}>
            &copy; 2026 TutorCard &middot; A StudySpaces product
          </p>
        </footer>
      </div>
    </>
  );
}
