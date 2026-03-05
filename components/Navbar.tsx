"use client";

import { useState } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);

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
        <>
          <div className="nav-right">
            {userEmail && <span className="nav-user-email">{userEmail}</span>}
            {onSignOut && (
              <button className="nav-link" onClick={onSignOut}>
                Sign out
              </button>
            )}
          </div>
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {menuOpen ? (
                <>
                  <line x1="4" y1="4" x2="16" y2="16" />
                  <line x1="16" y1="4" x2="4" y2="16" />
                </>
              ) : (
                <>
                  <line x1="3" y1="5" x2="17" y2="5" />
                  <line x1="3" y1="10" x2="17" y2="10" />
                  <line x1="3" y1="15" x2="17" y2="15" />
                </>
              )}
            </svg>
          </button>
          {menuOpen && (
            <div className="nav-mobile-menu">
              {userEmail && (
                <span className="nav-mobile-email">{userEmail}</span>
              )}
              {onSignOut && (
                <button
                  className="nav-mobile-link"
                  onClick={() => {
                    setMenuOpen(false);
                    onSignOut();
                  }}
                >
                  Sign out
                </button>
              )}
            </div>
          )}
        </>
      )}
    </nav>
  );
}
