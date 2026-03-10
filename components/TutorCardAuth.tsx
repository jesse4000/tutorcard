"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import GoogleSignInButton from "@/components/GoogleSignInButton";

const Icon = ({ name, size = 16, ...props }: { name: string; size?: number; [key: string]: any }) => {
  const d: Record<string, React.ReactNode> = {
    mail: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    eyeOff: <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    arrowRight: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>{d[name]}</svg>;
};

function Header() {
  return (
    <header style={{
      background: "white", borderBottom: "1px solid #f3f4f6",
      padding: "0 24px", height: 56, display: "flex", alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 24, height: 24, borderRadius: 6, background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "white" }}>tc</span>
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>tutorcard</span>
      </div>
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

function AuthForm({ mode, onToggle, redirectTo }: { mode: string; onToggle: () => void; redirectTo: string }) {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (isSignup && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    if (isSignup) {
      const { error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }
    }

    router.push(redirectTo);
    router.refresh();
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px 12px 42px", borderRadius: 10,
    border: "1.5px solid #e5e7eb", fontSize: 14, color: "#111",
    outline: "none", boxSizing: "border-box", background: "white",
    fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.15s",
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 400 }}>
      {/* Heading */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{
          fontSize: 28, fontWeight: 800, color: "#111",
          letterSpacing: "-0.02em", margin: "0 0 6px",
        }}>
          {isSignup ? "Join TutorCard" : "Welcome back"}
        </h1>
        <p style={{ fontSize: 15, color: "#9ca3af", margin: 0 }}>
          {isSignup ? "Create your free professional card in minutes." : "Sign in to manage your card."}
        </p>
      </div>

      {/* Google button */}
      <GoogleSignInButton redirectTo={redirectTo} />

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "24px 0" }}>
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

      {/* Form fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {isSignup && (
          <div style={{ position: "relative" }}>
            <Icon name="user" size={16} style={{ position: "absolute", left: 14, top: 14, color: "#9ca3af" }} />
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Full name" style={inputStyle}
              onFocus={e => e.target.style.borderColor = "#111"}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"}
            />
          </div>
        )}

        <div style={{ position: "relative" }}>
          <Icon name="mail" size={16} style={{ position: "absolute", left: 14, top: 14, color: "#9ca3af" }} />
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email address" style={inputStyle} required
            onFocus={e => e.target.style.borderColor = "#111"}
            onBlur={e => e.target.style.borderColor = "#e5e7eb"}
          />
        </div>

        <div style={{ position: "relative" }}>
          <Icon name="lock" size={16} style={{ position: "absolute", left: 14, top: 14, color: "#9ca3af" }} />
          <input
            type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Password" style={{ ...inputStyle, paddingRight: 42 }} required
            onFocus={e => e.target.style.borderColor = "#111"}
            onBlur={e => e.target.style.borderColor = "#e5e7eb"}
          />
          <button type="button" onClick={() => setShowPass(!showPass)} style={{
            position: "absolute", right: 12, top: 12,
            background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0,
          }}>
            <Icon name={showPass ? "eyeOff" : "eye"} size={16} />
          </button>
        </div>

        {!isSignup && (
          <div style={{ textAlign: "right", marginTop: -4 }}>
            <button type="button" style={{
              background: "none", border: "none", color: "#9ca3af",
              fontSize: 13, fontWeight: 500, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", transition: "color 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.color = "#374151"}
              onMouseLeave={e => e.currentTarget.style.color = "#9ca3af"}
            >Forgot password?</button>
          </div>
        )}
      </div>

      {/* Submit */}
      <button type="submit" disabled={loading} style={{
        width: "100%", padding: "13px", borderRadius: 12, border: "none",
        background: "#111", color: "white", fontSize: 15, fontWeight: 600,
        cursor: loading ? "default" : "pointer", fontFamily: "'DM Sans', sans-serif",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        marginTop: 20, transition: "opacity 0.15s",
        opacity: loading ? 0.7 : 1,
      }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = "0.88"; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = loading ? "0.7" : "1"; }}
      >
        {loading
          ? (isSignup ? "Creating account..." : "Signing in...")
          : (isSignup ? "Create your card" : "Sign in")}
        {!loading && <Icon name="arrowRight" size={16} />}
      </button>

      {/* Toggle */}
      <p style={{ textAlign: "center", fontSize: 13.5, color: "#9ca3af", marginTop: 20 }}>
        {isSignup ? "Already have a card? " : "Don\u2019t have a card? "}
        <button type="button" onClick={onToggle} style={{
          background: "none", border: "none", color: "#111",
          fontSize: 13.5, fontWeight: 600, cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", textDecoration: "underline",
          textUnderlineOffset: 2,
        }}>
          {isSignup ? "Sign in" : "Create one free"}
        </button>
      </p>
    </form>
  );
}

function TutorCardAuthInner({ defaultMode = "login" }: { defaultMode?: string }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const [mode, setMode] = useState(defaultMode);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
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
          <div style={{
            background: "white", borderRadius: 20,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)",
            padding: "40px 36px",
            width: "100%", maxWidth: 472,
          }}>
            <AuthForm
              mode={mode}
              onToggle={() => setMode(mode === "login" ? "signup" : "login")}
              redirectTo={redirect}
            />
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

export default function TutorCardAuth({ defaultMode = "login" }: { defaultMode?: string }) {
  return (
    <Suspense>
      <TutorCardAuthInner defaultMode={defaultMode} />
    </Suspense>
  );
}
