"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";

import LogoSvg from "@/components/LogoSvg";

export default function LandingPage() {
  const [heroEmail, setHeroEmail] = useState("");
  const [finalEmail, setFinalEmail] = useState("");
  const [heroSubmitted, setHeroSubmitted] = useState(false);
  const [finalSubmitted, setFinalSubmitted] = useState(false);
  const [heroError, setHeroError] = useState(false);
  const [finalError, setFinalError] = useState(false);

  async function handleSubmit(
    email: string,
    setSubmitted: (v: boolean) => void,
    setError: (v: boolean) => void
  ) {
    if (!email.includes("@")) {
      setError(true);
      setTimeout(() => setError(false), 1500);
      return;
    }
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // still show success for MVP
    }
    setSubmitted(true);
  }

  return (
    <>
      <Navbar mode="landing" />

      {/* HERO */}
      <section className="hero">
        <div className="pill">✦ Free for every tutor, forever</div>
        <h1 className="hero-title">
          <span>Your digital</span>
          <br />
          <em>tutor business card.</em>
        </h1>
        <p className="hero-sub">
          One link that shows who you are and how to reach you — subjects,
          exams, locations, booking page, and resources. Share it anywhere.
        </p>
        {!heroSubmitted ? (
          <div className="email-row">
            <input
              className={`e-input${heroError ? " error" : ""}`}
              type="email"
              placeholder="your@email.com"
              value={heroEmail}
              onChange={(e) => setHeroEmail(e.target.value)}
              style={heroError ? { borderColor: "#f87171" } : undefined}
            />
            <button
              className="e-btn"
              onClick={() =>
                handleSubmit(heroEmail, setHeroSubmitted, setHeroError)
              }
            >
              Get early access
            </button>
          </div>
        ) : (
          <div className="ok-msg show">
            🎉 You&apos;re in! We&apos;ll send your setup link at launch.
          </div>
        )}
        <p className="fine">Free forever. No credit card.</p>
      </section>

      {/* HERO CARD */}
      <div className="card-stage">
        <MockCard />
        <div className="card-url">studyspaces.com/sarah-chen</div>
      </div>

      <div className="rule" />

      {/* FEATURE SECTION */}
      <ThingsSection />

      {/* PROOF */}
      <div className="proof">
        <div className="proof-avs">
          <div
            className="proof-av"
            style={{
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              marginLeft: 0,
            }}
          >
            M
          </div>
          <div
            className="proof-av"
            style={{
              background: "linear-gradient(135deg,#ec4899,#f43f5e)",
            }}
          >
            R
          </div>
          <div
            className="proof-av"
            style={{
              background: "linear-gradient(135deg,#14b8a6,#06b6d4)",
            }}
          >
            J
          </div>
          <div
            className="proof-av"
            style={{
              background: "linear-gradient(135deg,#f59e0b,#ef4444)",
            }}
          >
            A
          </div>
        </div>
        <p className="proof-copy">
          <strong>Built for tutors already doing this</strong> — just with a lot
          less DM chaos.
        </p>
      </div>

      <div className="rule" />

      {/* FINAL CTA */}
      <section className="final" id="waitlist">
        <div className="section-label">Get early access</div>
        <h2>Be the first tutor with a card.</h2>
        <p>Free to create. Free forever. Setup link sent at launch.</p>
        {!finalSubmitted ? (
          <div className="email-row" style={{ justifyContent: "center" }}>
            <input
              className={`e-input${finalError ? " error" : ""}`}
              type="email"
              placeholder="your@email.com"
              value={finalEmail}
              onChange={(e) => setFinalEmail(e.target.value)}
              style={finalError ? { borderColor: "#f87171" } : undefined}
            />
            <button
              className="e-btn"
              onClick={() =>
                handleSubmit(
                  finalEmail,
                  setFinalSubmitted,
                  setFinalError
                )
              }
            >
              Get early access
            </button>
          </div>
        ) : (
          <div className="ok-msg show">
            🎉 You&apos;re in! We&apos;ll send your setup link at launch.
          </div>
        )}
        <p className="fine">Free forever. No credit card.</p>
      </section>

      {/* FOOTER */}
      <footer>
        <a href="#" className="logo">
          <div className="logo-mark">
            <LogoSvg />
          </div>
          <span className="logo-name">TutorCard</span>
          <span className="logo-sub">&nbsp;by StudySpaces</span>
        </a>
        <span className="footer-r">
          © 2025 StudySpaces · Free for every tutor
        </span>
      </footer>
    </>
  );
}

/* ── Mock card in hero ── */
function MockCard() {
  return (
    <div className="mock-card">
      <div className="mc-head">
        <div className="mc-av">S</div>
        <div>
          <div className="mc-name">Sarah Chen</div>
          <div className="mc-title">
            SAT &amp; ACT Tutor · New York &amp; New Jersey
          </div>
        </div>
      </div>
      <div className="mc-tags">
        <span className="tag">SAT Math</span>
        <span className="tag">ACT Science</span>
        <span className="tag accent">AP Calculus</span>
        <span className="tag">NYC</span>
        <span className="tag">New Jersey</span>
      </div>
      <div className="mc-rule" />
      <div className="mc-actions">
        <div className="mc-action-btn primary">
          <span className="btn-icon">🌐</span> Visit sarahchen.com{" "}
          <span className="btn-arrow">↗</span>
        </div>
        <div className="mc-action-btn">
          <span className="btn-icon">📅</span> Book a free 20-min consult{" "}
          <span className="btn-arrow">↗</span>
        </div>
        <div className="mc-action-btn amber">
          <span className="btn-icon">📋</span> Free SAT score guide ↓{" "}
          <span className="btn-arrow">↗</span>
        </div>
      </div>
    </div>
  );
}

/* ── Feature section ── */
function ThingsSection() {
  return (
    <section className="things-section">
      <div className="things-header">
        <div className="section-label">What it does</div>
        <h2>Your digital tutor business card.</h2>
      </div>

      <ThingRow flip={false}>
        <div className="thing-text">
          <div className="thing-num-badge n1">1</div>
          <div className="thing-title">Everything about you in one link</div>
          <div className="thing-body">
            Subjects, exams, location, website, booking page, and free
            resources. Parents and students tap the buttons to take action
            instantly. Comes with a QR code to share offline too.
          </div>
        </div>
        <div className="thing-visual">
          <Step1Visual />
        </div>
      </ThingRow>
    </section>
  );
}

function ThingRow({
  flip,
  children,
}: {
  flip: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`thing-row${flip ? " flip" : ""}${
        visible ? " visible" : ""
      }`}
    >
      {children}
    </div>
  );
}

function Step1Visual() {
  return (
    <div className="step1-card">
      <div className="s1-head">
        <div className="s1-av">S</div>
        <div>
          <div className="s1-name">Sarah Chen</div>
          <div className="s1-sub">SAT &amp; ACT · NYC &amp; New Jersey</div>
        </div>
      </div>
      <div className="s1-tags">
        <span className="s1-tag">SAT Math</span>
        <span className="s1-tag a">AP Calc</span>
        <span className="s1-tag">ACT</span>
        <span className="s1-tag">NYC · NJ</span>
      </div>
      <div className="s1-rule" />
      <div className="s1-btns">
        <div className="s1-btn p">
          <span className="s1-btn-icon">🌐</span> Visit sarahchen.com{" "}
          <span className="s1-btn-arr">↗</span>
        </div>
        <div className="s1-btn">
          <span className="s1-btn-icon">📅</span> Book a free consult{" "}
          <span className="s1-btn-arr">↗</span>
        </div>
        <div className="s1-btn a">
          <span className="s1-btn-icon">📋</span> Free SAT guide ↓{" "}
          <span className="s1-btn-arr">↗</span>
        </div>
      </div>
    </div>
  );
}
