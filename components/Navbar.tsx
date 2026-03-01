"use client";

import Link from "next/link";
import LogoSvg from "./LogoSvg";

interface NavbarProps {
  mode?: "landing" | "create" | "profile" | "dashboard";
  stepInfo?: string;
  userEmail?: string;
  onSignOut?: () => void;
}

export default function Navbar({
  mode = "landing",
  stepInfo,
  userEmail,
  onSignOut,
}: NavbarProps) {
  return (
    <nav>
      <Link href="/" className="logo">
        <div className="logo-mark">
          <LogoSvg />
        </div>
        <span className="logo-name">TutorCard</span>
        <span className="logo-sub">&nbsp;by StudySpaces</span>
      </Link>

      {mode === "landing" && (
        <div className="nav-right">
          <Link href="/login" className="nav-link">
            Log in
          </Link>
          <Link href="/signup" className="nav-cta">
            Get early access
          </Link>
        </div>
      )}

      {mode === "create" && stepInfo && (
        <div
          className="nav-step-info"
          dangerouslySetInnerHTML={{ __html: stepInfo }}
        />
      )}

      {mode === "dashboard" && (
        <div className="nav-right">
          {userEmail && <span className="nav-user-email">{userEmail}</span>}
          {onSignOut && (
            <button className="nav-link" onClick={onSignOut}>
              Sign out
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
