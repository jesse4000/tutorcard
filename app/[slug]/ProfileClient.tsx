"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import TutorCard from "@/components/TutorCard";
import type { TutorData } from "@/components/TutorCard";
import LogoSvg from "@/components/LogoSvg";

export default function ProfileClient({ tutor }: { tutor: TutorData }) {
  return (
    <>
      <Navbar mode="profile" />
      <div className="profile-page">
        <div className="profile-card-wrap">
          <TutorCard data={tutor} variant="full" />
          <div className="card-url" style={{ marginTop: 12 }}>
            studyspaces.com/{tutor.slug}
          </div>
        </div>
      </div>
      <footer>
        <Link href="/" className="logo">
          <div className="logo-mark">
            <LogoSvg />
          </div>
          <span className="logo-name">TutorCard</span>
          <span className="logo-sub">&nbsp;by StudySpaces</span>
        </Link>
        <span className="footer-r">
          © 2025 StudySpaces · Free for every tutor
        </span>
      </footer>
    </>
  );
}
