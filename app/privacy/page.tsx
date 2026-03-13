"use client";

import { useState, useEffect } from "react";
import HomepageFooter from "@/components/HomepageFooter";
import HomepageHeader from "@/components/HomepageHeader";
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: "0 0 12px" }}>{title}</h2>
      {children}
    </div>
  );
}
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.7, margin: "0 0 12px" }}>{children}</p>;
}
export default function PrivacyPolicy() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const ck = () => setIsMobile(window.innerWidth < 800);
    ck(); window.addEventListener("resize", ck);
    return () => window.removeEventListener("resize", ck);
  }, []);
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .cta-main { transition: opacity 0.15s; }
        .cta-main:hover { opacity: 0.88; }
      `}</style>
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#fafafa", color: "#111" }}>
        <HomepageHeader isMobile={isMobile} />
        {/* Content */}
        <main style={{ maxWidth: 680, margin: "0 auto", padding: isMobile ? "40px 20px 60px" : "56px 32px 80px" }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#9ca3af", margin: "0 0 8px" }}>Last updated: March 2026</p>
          <h1 style={{ fontSize: isMobile ? 28 : 36, fontWeight: 800, color: "#111", letterSpacing: "-0.02em", margin: "0 0 8px" }}>Privacy Policy</h1>
          <p style={{ fontSize: 16, color: "#6b7280", margin: "0 0 40px", lineHeight: 1.5 }}>
            Short version: we collect what we need to run TutorCard, we don&apos;t sell your data, and we don&apos;t do anything weird with it.
          </p>
          <div style={{ background: "white", borderRadius: 20, padding: isMobile ? "28px 20px" : "36px 32px", border: "1px solid #f0f0f0" }}>
            <Section title="Who we are">
              <P>TutorCard is a product of Better Search Corporation, operating as StudySpaces. If you have questions about this policy, email us at hello@tutorcard.co.</P>
            </Section>
            <Section title="What we collect">
              <P>When you create a TutorCard account, we collect your name, email address, location, professional headline, specialties, and any links or content you add to your card.</P>
              <P>When a parent submits a review through your card, we collect their name, email address, star rating, and review text. Their email is used for verification and moderation purposes and is never displayed publicly.</P>
              <P>We also collect basic usage data such as page views, card views, and inquiry counts to provide analytics to tutors and to improve the platform.</P>
            </Section>
            <Section title="How we use it">
              <P>Your profile information is used to build and display your public TutorCard. Your email is used for account access, notifications, and moderation communications.</P>
              <P>Reviewer emails are used solely to verify review authenticity and to contact reviewers during moderation disputes. They are never shared with the tutor or displayed publicly.</P>
              <P>Usage data is used to show you how your card is performing and to help us understand how tutors use the platform so we can improve it.</P>
            </Section>
            <Section title="What we don't do">
              <P>We don&apos;t sell your data. We don&apos;t share your personal information with advertisers. We don&apos;t run ads on TutorCard. We don&apos;t use your data to train AI models. We don&apos;t give third parties access to your information unless required by law.</P>
            </Section>
            <Section title="What's public">
              <P>Your TutorCard profile is public by design. Your name, headline, location, specialties, links, reviews, vouches, and badges are all visible to anyone who visits your card URL. Reviewer names are displayed with their reviews. Reviewer emails are never displayed.</P>
            </Section>
            <Section title="Cookies and tracking">
              <P>We use essential cookies to keep you logged in and to remember your preferences. We use basic analytics to understand how the platform is used. We don&apos;t use third-party advertising trackers.</P>
            </Section>
            <Section title="Data retention">
              <P>Your account data is retained as long as your account is active. If you delete your account, we remove your profile and personal data within 30 days. Some anonymized usage data may be retained for analytics purposes.</P>
            </Section>
            <Section title="Your rights">
              <P>You can export your data, update your information, or delete your account at any time from your dashboard. If you need help with any of this, email us at hello@tutorcard.co and we will take care of it.</P>
            </Section>
            <Section title="Changes to this policy">
              <P>If we make meaningful changes to this policy, we will notify you by email before they take effect. We won&apos;t quietly change the rules on you.</P>
            </Section>
            <div style={{ paddingTop: 20, borderTop: "1px solid #f3f4f6" }}>
              <P>Questions? Reach out at <a href="mailto:hello@tutorcard.co" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: 600 }}>hello@tutorcard.co</a></P>
            </div>
          </div>
        </main>
        <HomepageFooter isMobile={isMobile} />
      </div>
    </>
  );
}
