"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import GoogleSignInButton from "@/components/GoogleSignInButton";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignUp(e: React.FormEvent) {
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
    <form className="auth-card" onSubmit={handleSignUp}>
      <div className="auth-title">Create your account</div>
      <div className="auth-subtitle">
        Sign up to create and manage your tutor card.
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
          placeholder="At least 6 characters"
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
        {loading ? "Creating account..." : "Sign up"}
      </button>

      <div className="auth-divider">or</div>
      <GoogleSignInButton redirectTo={redirect} />

      <div className="auth-footer">
        Already have an account?{" "}
        <Link href={`/login${redirect !== "/dashboard" ? `?redirect=${redirect}` : ""}`}>
          Log in
        </Link>
      </div>
    </form>
  );
}

export default function SignUpPage() {
  return (
    <>
      <Navbar mode="landing" />
      <div className="auth-page">
        <Suspense>
          <SignUpForm />
        </Suspense>
      </div>
    </>
  );
}
