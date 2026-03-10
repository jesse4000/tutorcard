"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import GoogleSignInButton from "@/components/GoogleSignInButton";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <form className="auth-card" onSubmit={handleLogin}>
      <div className="auth-title">Welcome back</div>
      <div className="auth-subtitle">
        Log in to manage your tutor card.
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div className="field">
        <label className="field-label">Email</label>
        <input
          className="field-input"
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="field">
        <label className="field-label">Password</label>
        <input
          className="field-input"
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button
        className="btn-next"
        type="submit"
        disabled={loading}
        style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
      >
        {loading ? "Logging in..." : "Log in"}
      </button>

      <div className="auth-divider">or</div>
      <GoogleSignInButton redirectTo={redirect} />

      <div className="auth-footer">
        Don&apos;t have an account?{" "}
        <Link href={`/signup${redirect !== "/dashboard" ? `?redirect=${redirect}` : ""}`}>
          Sign up
        </Link>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <>
      <Navbar mode="landing" />
      <div className="auth-page">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </>
  );
}
