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
          <span>Your tutor card.</span>
          <br />
          <em>Your referral network.</em>
        </h1>
        <p className="hero-sub">
          One link that shows who you are and how to reach you — plus a
          community that notifies you the moment a student matches your
          specialty.
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

      {/* THREE THINGS */}
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
        <h2>Be first in your community with a card.</h2>
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
        <div className="open-badge">Open to referrals</div>
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
      <div className="mc-ref">
        <div>
          <div className="mc-ref-lbl">Active referral</div>
          <div className="mc-ref-val">
            SAT Math · New Jersey · 10th grade
          </div>
        </div>
        <div className="mc-ref-n">4</div>
      </div>
    </div>
  );
}

/* ── Three things section ── */
function ThingsSection() {
  return (
    <section className="things-section">
      <div className="things-header">
        <div className="section-label">What it does</div>
        <h2>Three things. All free.</h2>
      </div>

      <ThingRow flip={false}>
        <div className="thing-text">
          <div className="thing-num-badge n1">1</div>
          <div className="thing-title">Your digital tutor business card</div>
          <div className="thing-body">
            Everything about you in one shareable link — subjects, exams,
            location, website, booking page, and free resources. Parents and
            students tap the buttons to take action instantly. Comes with a QR
            code to share offline too.
          </div>
        </div>
        <div className="thing-visual">
          <Step1Visual />
        </div>
      </ThingRow>

      <ThingRow flip>
        <div className="thing-text">
          <div className="thing-num-badge n2">2</div>
          <div className="thing-title">Post referrals, skip the DM chaos</div>
          <div className="thing-body">
            Have a student you can&apos;t take? Post a referral with one link
            instead of writing &quot;DM me&quot; in a group. Interested tutors
            submit their profile directly. You see all submissions, vet them,
            and pick the best fit. The tutor you choose can tip you a coffee as
            a thank-you — no obligation, just good karma.
          </div>
        </div>
        <div className="thing-visual">
          <Step2Visual />
        </div>
      </ThingRow>

      <ThingRow flip={false}>
        <div className="thing-text">
          <div className="thing-num-badge n3">3</div>
          <div className="thing-title">
            Get notified when students match you
          </div>
          <div className="thing-body">
            When any tutor in the TutorCard community posts a student they
            can&apos;t take, we instantly notify every tutor who matches — by
            subject, exam, and location. No more scrolling through group posts
            and missing opportunities buried in comment threads.
          </div>
        </div>
        <div className="thing-visual">
          <Step3Visual />
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
        <div className="s1-open">Open</div>
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
      <div className="s1-ref">
        <div>
          <div className="s1-ref-lbl">Active referral</div>
          <div className="s1-ref-val">SAT Math · New Jersey</div>
        </div>
        <div className="s1-ref-n">4</div>
      </div>
    </div>
  );
}

function Step2Visual() {
  return (
    <div className="step2-visual">
      <div className="s2-post">
        <div className="s2-post-lbl">Your referral post</div>
        <div className="s2-post-title">
          SAT Math · New Jersey · 10th grade
        </div>
        <div className="s2-post-sub">
          Starting ASAP · 3 submissions so far
        </div>
      </div>
      <div className="s2-subs">
        <div className="s2-subs-lbl">Tutors who applied</div>
        <div className="s2-sub">
          <div
            className="s2-av"
            style={{
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            }}
          >
            M
          </div>
          <div>
            <div className="s2-name">Marcus T.</div>
            <div className="s2-detail">SAT Math · NJ · 4 yrs exp</div>
          </div>
          <div className="s2-rate">$85/hr</div>
        </div>
        <div className="s2-sub">
          <div
            className="s2-av"
            style={{
              background: "linear-gradient(135deg,#ec4899,#f43f5e)",
            }}
          >
            R
          </div>
          <div>
            <div className="s2-name">Rachel K.</div>
            <div className="s2-detail">SAT/ACT · NYC+NJ · 6 yrs</div>
          </div>
          <div className="s2-rate">$95/hr</div>
        </div>
        <button className="s2-accept">✓ Send referral to Marcus</button>
        <div className="s2-coffee">
          <span>☕</span>
          <div className="s2-coffee-text">
            Marcus sent you a $5 thank-you tip!
          </div>
        </div>
      </div>
    </div>
  );
}

function Step3Visual() {
  return (
    <div className="step3-visual">
      <div className="s3-header">
        <div className="s3-header-title">Your referral matches</div>
        <div className="s3-header-badge">2 new</div>
      </div>
      <div className="s3-list">
        <div className="s3-notif new">
          <div className="s3-dot live" />
          <div className="s3-body">
            <div className="s3-title">SAT Math student · New Jersey</div>
            <div className="s3-sub">
              Posted by Marcus T. · 10th grade · Starting ASAP
            </div>
          </div>
          <div className="s3-time">2m ago</div>
        </div>
        <div className="s3-notif new">
          <div className="s3-dot live" />
          <div className="s3-body">
            <div className="s3-title">AP Calculus student · NYC area</div>
            <div className="s3-sub">
              Posted by Rachel K. · 11th grade · Online OK
            </div>
          </div>
          <div className="s3-time">1h ago</div>
        </div>
        <div className="s3-notif">
          <div className="s3-dot old" />
          <div className="s3-body">
            <div className="s3-title" style={{ color: "var(--ink-3)" }}>
              ACT Science · Brooklyn
            </div>
            <div className="s3-sub">Already filled</div>
          </div>
          <div className="s3-time" style={{ color: "var(--ink-3)" }}>
            3h ago
          </div>
        </div>
      </div>
      <button className="s3-cta">Submit interest →</button>
    </div>
  );
}
