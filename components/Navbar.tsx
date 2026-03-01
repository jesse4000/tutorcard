"use client";

import Link from "next/link";
import LogoSvg from "./LogoSvg";

interface NavbarProps {
  mode?: "landing" | "create" | "profile";
  stepInfo?: string;
}

export default function Navbar({ mode = "landing", stepInfo }: NavbarProps) {
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
        <Link href="/create" className="nav-cta">
          Get early access
        </Link>
      )}
      {mode === "create" && stepInfo && (
        <div
          className="nav-step-info"
          dangerouslySetInnerHTML={{ __html: stepInfo }}
        />
      )}
    </nav>
  );
}
