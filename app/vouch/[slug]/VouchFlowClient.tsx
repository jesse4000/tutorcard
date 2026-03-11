"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import Icon, { textOnAccent } from "@/app/[slug]/Icon";

interface TutorData {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  slug: string;
  avatarColor: string;
  exams: string[];
  locations: string[];
  profileImageUrl: string;
}

interface VouchFlowProps {
  tutor: TutorData;
  vouchCount: number;
  averageRating: number | null;
  reviewCount: number;
  isAuthenticated: boolean;
  hasTutorCard: boolean;
  hasAlreadyVouched: boolean;
  isOwnCard: boolean;
  autoComplete: boolean;
}

type Screen = "landing" | "signup" | "confirmation";

function Header() {
  return (
    <header style={{
      background: "white", borderBottom: "1px solid #f3f4f6",
      padding: "0 24px", height: 56, display: "flex", alignItems: "center",
      justifyContent: "center", flexShrink: 0,
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
        <div style={{ width: 24, height: 24, borderRadius: 6, background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "white" }}>tc</span>
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>tutorcard</span>
      </Link>
    </header>
  );
}

function Footer() {
  return (
    <footer style={{ padding: "20px 24px", textAlign: "center" }}>
      <p style={{ fontSize: 12, color: "#d1d5db", margin: 0 }}>
        &copy; 2026 TutorCard &middot; A <span style={{ fontWeight: 600, color: "#9ca3af" }}>StudySpaces</span> product
      </p>
    </footer>
  );
}

// ─── TUTOR PREVIEW CARD ─────────────────────────────────
function TutorPreview({ tutor, accent }: { tutor: TutorData; accent: string }) {
  const t = textOnAccent(accent);
  const initials = `${tutor.firstName[0] || ""}${tutor.lastName[0] || ""}`.toUpperCase();
  const location = tutor.locations?.[0] || "";

  return (
    <div style={{
      background: "white", borderRadius: 16, border: "1px solid #f0f0f0",
      padding: "20px", display: "flex", alignItems: "center", gap: 14,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: "50%", background: accent,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        overflow: "hidden",
      }}>
        {tutor.profileImageUrl ? (
          <img src={tutor.profileImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: 18, color: t, fontWeight: 600 }}>{initials}</span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111", margin: "0 0 2px", letterSpacing: "-0.01em" }}>
          {tutor.firstName} {tutor.lastName}
        </h3>
        {tutor.title && (
          <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 6px" }}>{tutor.title}</p>
        )}
        {location && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#9ca3af" }}>
            <span>{location}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SCREEN 1: VOUCH LANDING ────────────────────────────
function VouchLanding({
  tutor, accent, vouchCount, averageRating, reviewCount, onVouch, loading,
}: {
  tutor: TutorData; accent: string; vouchCount: number;
  averageRating: number | null; reviewCount: number;
  onVouch: () => void; loading: boolean;
}) {
  return (
    <div style={{ width: "100%", maxWidth: 440 }}>
      <div style={{
        background: "white", borderRadius: 20,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)",
        padding: "36px 32px",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: "#f3f4f6", display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 16px",
          }}>
            <Icon name="users" size={24} style={{ color: "#6b7280" }} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111", letterSpacing: "-0.02em", margin: "0 0 6px" }}>
            Vouch for {tutor.firstName}
          </h1>
          <p style={{ fontSize: 14, color: "#9ca3af", margin: 0, lineHeight: 1.5 }}>
            {tutor.firstName} {tutor.lastName} is asking you to vouch for them on TutorCard. A vouch is a one-click endorsement that shows parents you trust their work.
          </p>
        </div>

        {/* Tutor preview */}
        <TutorPreview tutor={tutor} accent={accent} />

        {/* Stats */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: 20, border: "1px solid #e5e7eb", fontSize: 12.5 }}>
            <Icon name="users" size={12} style={{ color: "#6b7280" }} />
            <span style={{ fontWeight: 600, color: "#111" }}>{vouchCount}</span>
            <span style={{ color: "#9ca3af" }}>vouches</span>
          </div>
          {averageRating !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: 20, border: "1px solid #e5e7eb", fontSize: 12.5 }}>
              <Icon name="star" size={11} style={{ color: "#f59e0b" }} />
              <span style={{ fontWeight: 600, color: "#111" }}>{averageRating.toFixed(1)}</span>
              <span style={{ color: "#9ca3af" }}>({reviewCount})</span>
            </div>
          )}
        </div>

        {/* Specialties */}
        {tutor.exams.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 5, marginTop: 14 }}>
            {tutor.exams.map(s => (
              <span key={s} style={{ padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 500, color: "#374151", background: "#f3f4f6" }}>{s}</span>
            ))}
          </div>
        )}

        {/* CTA */}
        <button onClick={onVouch} disabled={loading} style={{
          width: "100%", padding: "14px", borderRadius: 14, border: "none",
          background: "#111", color: "white", fontSize: 15, fontWeight: 600,
          cursor: loading ? "default" : "pointer", fontFamily: "'DM Sans', sans-serif",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          marginTop: 24, transition: "opacity 0.15s",
          opacity: loading ? 0.7 : 1,
        }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = "0.88"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = loading ? "0.7" : "1"; }}
        >
          <Icon name="check" size={16} />
          {loading ? "Vouching..." : `Vouch for ${tutor.firstName}`}
        </button>

        {/* View card link */}
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <Link href={`/${tutor.slug}`} style={{
            background: "none", border: "none", color: "#9ca3af",
            fontSize: 13, fontWeight: 500, textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 4,
          }}>
            View full card <Icon name="ext" size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN 2: QUICK SIGNUP ─────────────────────────────
function QuickSignup({ tutor, accent, onComplete }: {
  tutor: TutorData; accent: string;
  onComplete: (newVouchCount: number) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px 12px 42px", borderRadius: 10,
    border: "1.5px solid #e5e7eb", fontSize: 14, color: "#111",
    outline: "none", boxSizing: "border-box", background: "white",
    fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.15s",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Now vouch
    try {
      const res = await fetch("/api/vouches/direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vouchedTutorId: tutor.id }),
      });
      const data = await res.json();
      if (res.ok) {
        onComplete(data.vouchCount);
      } else {
        // Auth succeeded but vouch failed — still go to confirmation
        onComplete(-1);
      }
    } catch {
      onComplete(-1);
    }
  }

  return (
    <div style={{ width: "100%", maxWidth: 440 }}>
      <div style={{
        background: "white", borderRadius: 20,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)",
        padding: "36px 32px",
      }}>
        {/* Context banner */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
          background: "#fafafa", borderRadius: 12, border: "1px solid #f0f0f0",
          marginBottom: 24,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", background: accent,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            overflow: "hidden",
          }}>
            {tutor.profileImageUrl ? (
              <img src={tutor.profileImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: 11, color: textOnAccent(accent), fontWeight: 600 }}>
                {`${tutor.firstName[0] || ""}${tutor.lastName[0] || ""}`.toUpperCase()}
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
            Vouching for <span style={{ fontWeight: 600, color: "#111" }}>{tutor.firstName} {tutor.lastName}</span>
          </p>
          <Icon name="check" size={14} style={{ color: "#059669", marginLeft: "auto" }} />
        </div>

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111", letterSpacing: "-0.02em", margin: "0 0 6px" }}>
            Create your card to vouch
          </h2>
          <p style={{ fontSize: 14, color: "#9ca3af", margin: 0, lineHeight: 1.5 }}>
            You need a TutorCard to vouch. It takes 30 seconds and it is free.
          </p>
        </div>

        {/* Google */}
        <GoogleSignInButton redirectTo={`/vouch/${tutor.slug}?action=complete`} />

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "20px 0" }}>
          <div style={{ flex: 1, height: 1, background: "#f3f4f6" }} />
          <span style={{ fontSize: 12, color: "#d1d5db", fontWeight: 500 }}>or</span>
          <div style={{ flex: 1, height: 1, background: "#f3f4f6" }} />
        </div>

        {error && (
          <div style={{
            background: "#fef2f2", color: "#dc2626", fontSize: 13,
            padding: "10px 14px", borderRadius: 10, marginBottom: 12,
          }}>
            {error}
          </div>
        )}

        {/* Fields */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ position: "relative" }}>
              <Icon name="user" size={16} style={{ position: "absolute", left: 14, top: 14, color: "#9ca3af" }} />
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#111"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
            </div>
            <div style={{ position: "relative" }}>
              <Icon name="mail" size={16} style={{ position: "absolute", left: 14, top: 14, color: "#9ca3af" }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#111"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
            </div>
            <div style={{ position: "relative" }}>
              <Icon name="lock" size={16} style={{ position: "absolute", left: 14, top: 14, color: "#9ca3af" }} />
              <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a password" style={{ ...inputStyle, paddingRight: 42 }}
                onFocus={e => e.target.style.borderColor = "#111"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: 12, background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0 }}>
                <Icon name={showPass ? "eyeOff" : "eye"} size={16} />
              </button>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "13px", borderRadius: 12, border: "none",
            background: "#111", color: "white", fontSize: 15, fontWeight: 600,
            cursor: loading ? "default" : "pointer", fontFamily: "'DM Sans', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            marginTop: 16, transition: "opacity 0.15s",
            opacity: loading ? 0.7 : 1,
          }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = "0.88"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = loading ? "0.7" : "1"; }}
          >
            {loading ? "Creating..." : "Create card and vouch"}
            {!loading && <Icon name="arrowRight" size={16} />}
          </button>
        </form>

        <p style={{ fontSize: 12, color: "#d1d5db", textAlign: "center", marginTop: 12, lineHeight: 1.45 }}>
          You can finish setting up your card later from your dashboard.
        </p>
      </div>
    </div>
  );
}

// ─── SCREEN 3: CONFIRMATION ─────────────────────────────
function VouchConfirmation({ tutor, accent, newVouchCount }: {
  tutor: TutorData; accent: string; newVouchCount: number;
}) {
  const t = textOnAccent(accent);
  const initials = `${tutor.firstName[0] || ""}${tutor.lastName[0] || ""}`.toUpperCase();

  return (
    <div style={{ width: "100%", maxWidth: 440 }}>
      <div style={{
        background: "white", borderRadius: 20,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)",
        padding: "40px 32px", textAlign: "center",
      }}>
        {/* Success icon */}
        <div style={{
          width: 64, height: 64, borderRadius: "50%", background: "#ecfdf5",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <Icon name="check" size={32} style={{ color: "#059669" }} />
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#111", letterSpacing: "-0.02em", margin: "0 0 8px" }}>
          You vouched for {tutor.firstName}!
        </h2>
        <p style={{ fontSize: 14, color: "#9ca3af", margin: "0 0 24px", lineHeight: 1.5 }}>
          Your name now appears on {tutor.firstName}&apos;s card as a peer endorsement. Thanks for helping a fellow tutor build their reputation.
        </p>

        {/* Vouch preview */}
        <div style={{
          background: "#fafafa", borderRadius: 14, padding: "14px 16px",
          border: "1px solid #f0f0f0", marginBottom: 24,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%", background: accent,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            overflow: "hidden",
          }}>
            {tutor.profileImageUrl ? (
              <img src={tutor.profileImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: 14, color: t, fontWeight: 600 }}>{initials}</span>
            )}
          </div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#111", margin: 0 }}>{tutor.firstName} {tutor.lastName}</p>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: "1px 0 0" }}>
              Now has <span style={{ fontWeight: 600, color: "#111" }}>{newVouchCount > 0 ? newVouchCount : "..."}</span> vouches
            </p>
          </div>
          <Icon name="check" size={16} style={{ color: "#059669" }} />
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "#f3f4f6", marginBottom: 24 }} />

        {/* Own card prompt */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "#f3f4f6", display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 12px",
          }}>
            <Icon name="sparkle" size={20} style={{ color: "#6b7280" }} />
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111", margin: "0 0 6px" }}>Your card is ready to set up</h3>
          <p style={{ fontSize: 13.5, color: "#9ca3af", margin: 0, lineHeight: 1.5, maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}>
            Add your specialties, links, and photo to start sharing your own TutorCard with parents and students.
          </p>
        </div>

        <Link href="/dashboard/edit" style={{ textDecoration: "none" }}>
          <button style={{
            width: "100%", padding: "14px", borderRadius: 14, border: "none",
            background: "#111", color: "white", fontSize: 15, fontWeight: 600,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "opacity 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            Set up my card
            <Icon name="arrowRight" size={16} />
          </button>
        </Link>

        <Link href={`/${tutor.slug}`} style={{
          background: "none", border: "none", color: "#9ca3af",
          fontSize: 13, fontWeight: 500, textDecoration: "none",
          fontFamily: "'DM Sans', sans-serif", marginTop: 12,
          display: "inline-flex", alignItems: "center", gap: 4,
        }}>
          I&apos;ll do this later
        </Link>
      </div>
    </div>
  );
}

// ─── MAIN FLOW ──────────────────────────────────────────
export default function VouchFlowClient({
  tutor, vouchCount, averageRating, reviewCount,
  isAuthenticated, hasTutorCard, hasAlreadyVouched, isOwnCard, autoComplete,
}: VouchFlowProps) {
  const initialScreen: Screen = hasAlreadyVouched ? "confirmation" : "landing";
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [finalVouchCount, setFinalVouchCount] = useState(hasAlreadyVouched ? vouchCount : vouchCount);
  const [vouchLoading, setVouchLoading] = useState(false);
  const autoCompleteRef = useRef(false);

  // Auto-complete vouch after OAuth redirect
  useEffect(() => {
    if (autoComplete && isAuthenticated && !hasAlreadyVouched && !isOwnCard && !autoCompleteRef.current) {
      autoCompleteRef.current = true;
      submitVouch();
    }
  }, [autoComplete, isAuthenticated, hasAlreadyVouched, isOwnCard]);

  async function submitVouch() {
    setVouchLoading(true);
    try {
      const res = await fetch("/api/vouches/direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vouchedTutorId: tutor.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setFinalVouchCount(data.vouchCount);
      }
    } catch {
      // Continue to confirmation even on error
    }
    setVouchLoading(false);
    setScreen("confirmation");
  }

  function handleLandingVouch() {
    if (isAuthenticated) {
      submitVouch();
    } else {
      setScreen("signup");
    }
  }

  function handleSignupComplete(newCount: number) {
    if (newCount > 0) setFinalVouchCount(newCount);
    setScreen("confirmation");
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
      `}</style>

      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        fontFamily: "'DM Sans', sans-serif", background: "#f5f5f4",
      }}>
        <Header />

        <main style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          padding: "40px 20px",
        }}>
          {isOwnCard ? (
            <div style={{ width: "100%", maxWidth: 440 }}>
              <div style={{
                background: "white", borderRadius: 20,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)",
                padding: "40px 32px", textAlign: "center",
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: "#f3f4f6", display: "flex", alignItems: "center",
                  justifyContent: "center", margin: "0 auto 16px",
                }}>
                  <Icon name="users" size={24} style={{ color: "#6b7280" }} />
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111", letterSpacing: "-0.02em", margin: "0 0 8px" }}>
                  This is your own card
                </h2>
                <p style={{ fontSize: 14, color: "#9ca3af", margin: "0 0 24px", lineHeight: 1.5 }}>
                  You can&apos;t vouch for yourself. Share this link with a fellow tutor to get a vouch.
                </p>
                <Link href={`/${tutor.slug}`} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "12px 24px", borderRadius: 12, background: "#111",
                  color: "white", fontSize: 14, fontWeight: 600,
                  textDecoration: "none", fontFamily: "'DM Sans', sans-serif",
                  transition: "opacity 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  View your card <Icon name="arrowRight" size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {screen === "landing" && (
                <VouchLanding
                  tutor={tutor}
                  accent={tutor.avatarColor}
                  vouchCount={vouchCount}
                  averageRating={averageRating}
                  reviewCount={reviewCount}
                  onVouch={handleLandingVouch}
                  loading={vouchLoading}
                />
              )}
              {screen === "signup" && (
                <QuickSignup
                  tutor={tutor}
                  accent={tutor.avatarColor}
                  onComplete={handleSignupComplete}
                />
              )}
              {screen === "confirmation" && (
                <VouchConfirmation
                  tutor={tutor}
                  accent={tutor.avatarColor}
                  newVouchCount={finalVouchCount}
                />
              )}
            </>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
