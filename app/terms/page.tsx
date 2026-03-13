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

export default function TermsConditions() {
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
          <h1 style={{ fontSize: isMobile ? 28 : 36, fontWeight: 800, color: "#111", letterSpacing: "-0.02em", margin: "0 0 8px" }}>Terms of Service</h1>
          <p style={{ fontSize: 16, color: "#6b7280", margin: "0 0 40px", lineHeight: 1.5 }}>
            The straightforward version: use TutorCard for its intended purpose, be honest on your profile, and don&apos;t ruin it for everyone else.
          </p>

          <div style={{ background: "white", borderRadius: 20, padding: isMobile ? "28px 20px" : "36px 32px", border: "1px solid #f0f0f0" }}>
            <Section title="Agreement">
              <P>By creating a TutorCard account, you agree to these terms. TutorCard is operated by Better Search Corporation (doing business as StudySpaces). If something in here doesn&apos;t sit right, email us at hello@tutorcard.co before using the platform.</P>
            </Section>

            <Section title="Your account">
              <P>You need to be at least 18 years old to create a TutorCard account. You are responsible for keeping your login credentials secure. If someone accesses your account because your password was compromised, that&apos;s on you, not us.</P>
              <P>One person, one account. Don&apos;t create multiple accounts or share your account with others.</P>
            </Section>

            <Section title="Your card">
              <P>Everything on your TutorCard must be accurate and truthful. Your name, qualifications, score data, and credentials should reflect reality. If we find that information on your card is fabricated or misleading, we reserve the right to suspend or remove your account.</P>
              <P>Your card is public. Anything you put on it can be seen by anyone with your card URL. Keep that in mind when adding personal information.</P>
            </Section>

            <Section title="Reviews and vouches">
              <P>Reviews are submitted by parents and students. You may not submit reviews for yourself, incentivize reviews with payment or discounts, or pressure anyone into leaving a review.</P>
              <P>Vouches are endorsements from other TutorCard users. You may not create fake accounts to vouch for yourself or coordinate inauthentic vouch exchanges.</P>
              <P>We have a review moderation process. If a review is reported, we contact the reviewer and give them 7 days to respond. If they don&apos;t respond, the review is removed. If they do, we review both sides and make a decision. Our moderation decisions are final.</P>
            </Section>

            <Section title="Payment and billing">
              <P>TutorCard costs $20/year. This fee is billed annually and is non-refundable. If you cancel, your card remains active until the end of your billing period.</P>
              <P>Some users receive free access through invite codes, association memberships, or early adopter promotions. Free access is subject to the same terms as paid access.</P>
            </Section>

            <Section title="Invite codes">
              <P>Each TutorCard user receives a limited number of invite codes. These codes give the recipient a free year of access. Invite codes are non-transferable and cannot be sold. If we find invite codes being distributed in bulk or sold, we reserve the right to void them and suspend the associated accounts.</P>
            </Section>

            <Section title="What you can't do">
              <P>Don&apos;t use TutorCard to misrepresent your qualifications. Don&apos;t scrape, copy, or redistribute content from other tutors&apos; cards. Don&apos;t use the platform to harass, spam, or deceive anyone. Don&apos;t attempt to game the review or vouch system. Don&apos;t use automated tools to interact with the platform.</P>
              <P>If you do any of these things, we will remove your account. We won&apos;t warn you first if the violation is obvious.</P>
            </Section>

            <Section title="Our rights">
              <P>We can modify, suspend, or discontinue any part of TutorCard at any time. We can remove content or accounts that violate these terms. We can update these terms, and if we make meaningful changes, we will notify you by email before they take effect.</P>
            </Section>

            <Section title="Liability">
              <P>TutorCard is provided as-is. We do our best to keep it running and useful, but we don&apos;t guarantee uptime, data preservation, or that the platform will meet every specific need you have. We are not liable for any lost revenue, missed leads, or damages resulting from your use of the platform.</P>
            </Section>

            <Section title="Content ownership">
              <P>You own the content you put on your card. By using TutorCard, you grant us a license to display that content on the platform and in related materials (such as directory listings and search results). If you delete your account, this license ends.</P>
              <P>Reviews belong to the person who wrote them. Vouches belong to the person who gave them. Neither can be transferred between accounts.</P>
            </Section>

            <Section title="Account deletion">
              <P>You can delete your account at any time from your dashboard. When you do, your public card is removed immediately, and your personal data is deleted within 30 days. Reviews you received are removed. Vouches you gave to others remain on their cards.</P>
            </Section>

            <Section title="Governing law">
              <P>These terms are governed by the laws of the State of Florida, United States. Any disputes will be resolved in the courts of Hillsborough County, Florida.</P>
            </Section>

            <div style={{ paddingTop: 20, borderTop: "1px solid #f3f4f6" }}>
              <P>Questions about these terms? Email us at <a href="mailto:hello@tutorcard.co" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: 600 }}>hello@tutorcard.co</a></P>
            </div>
          </div>
        </main>

        <HomepageFooter isMobile={isMobile} />
      </div>
    </>
  );
}
