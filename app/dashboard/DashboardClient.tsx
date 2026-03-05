"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "@/components/Navbar";
import TutorCard from "@/components/TutorCard";
import ReferralManager from "@/components/ReferralManager";
import InviteFriends from "@/components/InviteFriends";
import CommunityPicker from "@/components/CommunityPicker";
import CommunityDetail from "@/components/CommunityDetail";
import { createClient } from "@/lib/supabase/client";
import type { TutorLink } from "@/components/TutorCard";
import type { FriendInvite } from "@/components/InviteFriends";

interface TutorRow {
  id: string;
  first_name: string;
  last_name: string;
  title: string | null;
  slug: string;
  avatar_color: string;
  exams: string[];
  subjects: string[];
  locations: string[];
  links: TutorLink[];
  open_to_referrals: boolean;
  notify_on_match: boolean;
  email: string;
}

interface DashboardClientProps {
  tutor: TutorRow | null;
  userEmail: string;
}

interface OpportunityTutor {
  first_name: string;
  last_name: string;
  avatar_color: string;
  slug: string;
}

interface Opportunity {
  id: string;
  subject: string;
  location: string;
  grade_level: string;
  notes: string;
  created_at: string;
  tutor: OpportunityTutor;
  applied: boolean;
  skillMatch: boolean;
}

export default function DashboardClient({
  tutor,
  userEmail,
}: DashboardClientProps) {
  const router = useRouter();
  const [showQR, setShowQR] = useState(false);
  const [view, setView] = useState<"card" | "referrals" | "friends" | "communities">("card");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [oppLoading, setOppLoading] = useState(false);
  const [oppFetched, setOppFetched] = useState(false);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [showCoffee, setShowCoffee] = useState<string | null>(null);

  // Friends state
  const [friendInvites, setFriendInvites] = useState<FriendInvite[]>([]);

  // Communities state
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([]);
  const [openCommunityId, setOpenCommunityId] = useState<string | null>(null);

  const fetchOpportunities = useCallback(async () => {
    setOppLoading(true);
    try {
      const res = await fetch("/api/referrals/opportunities");
      if (res.ok) {
        const data = await res.json();
        setOpportunities(data.opportunities || []);
      }
    } catch {
      // silently fail
    }
    setOppLoading(false);
    setOppFetched(true);
  }, []);

  useEffect(() => {
    if (tutor) {
      fetchOpportunities();
    }
  }, [tutor, fetchOpportunities]);

  async function handleApplyToOpportunity(
    referralId: string,
    boughtCoffee = false
  ) {
    setApplyingTo(referralId);
    try {
      const res = await fetch("/api/referrals/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralId, boughtCoffee }),
      });
      const data = await res.json();
      if (res.ok) {
        setOpportunities((prev) =>
          prev.map((o) => (o.id === referralId ? { ...o, applied: true } : o))
        );
        setShowCoffee(null);
      } else {
        alert(data.error || "Failed to apply");
      }
    } catch {
      alert("Network error. Please try again.");
    }
    setApplyingTo(null);
  }

  async function handleJoinCommunity(communityId: string) {
    setJoinedCommunities((prev) =>
      prev.includes(communityId) ? prev : [...prev, communityId]
    );
    try {
      await fetch("/api/communities/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communityId }),
      });
    } catch {
      setJoinedCommunities((prev) => prev.filter((id) => id !== communityId));
    }
  }

  async function handleLeaveCommunity(communityId: string) {
    setJoinedCommunities((prev) => prev.filter((id) => id !== communityId));
    try {
      await fetch(`/api/communities/join?communityId=${communityId}`, {
        method: "DELETE",
      });
    } catch {
      setJoinedCommunities((prev) => [...prev, communityId]);
    }
  }

  async function handleCreateCommunity(name: string, description: string) {
    const res = await fetch("/api/communities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    const data = await res.json();
    if (res.ok) {
      if (data.community?.id) {
        setJoinedCommunities((prev) => [...prev, data.community.id]);
      }
    } else {
      alert(data.error || "Failed to create community");
    }
  }

  // Fetch joined communities on mount
  useEffect(() => {
    if (!tutor) return;
    async function fetchJoined() {
      try {
        const res = await fetch("/api/communities/joined");
        if (res.ok) {
          const data = await res.json();
          setJoinedCommunities(
            (data.communities || []).map((c: { id: string }) => c.id)
          );
        }
      } catch {
        // ignore
      }
    }
    fetchJoined();
  }, [tutor]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (!tutor) {
    return (
      <>
        <Navbar
          mode="dashboard"
          userEmail={userEmail}
          onSignOut={handleSignOut}
        />
        <div className="dashboard-page">
          <div className="dashboard-empty">
            <div style={{ fontSize: 48, marginBottom: 16 }}>📇</div>
            <h1 className="dashboard-title">Create your first card</h1>
            <p className="dashboard-sub">
              You don&apos;t have a tutor card yet. Create one to start sharing
              your profile with parents and students.
            </p>
            <Link
              href="/create"
              className="btn-next"
              style={{ display: "inline-flex" }}
            >
              Create my card
            </Link>
          </div>
        </div>
      </>
    );
  }

  const tutorData = {
    firstName: tutor.first_name,
    lastName: tutor.last_name,
    title: tutor.title || "",
    slug: tutor.slug,
    avatarColor: tutor.avatar_color || "#0f172a",
    exams: tutor.exams || [],
    subjects: tutor.subjects || [],
    locations: tutor.locations || [],
    links: tutor.links || [],
    openToReferrals: tutor.open_to_referrals || false,
  };

  return (
    <>
      <Navbar
        mode="dashboard"
        userEmail={userEmail}
        onSignOut={handleSignOut}
      />
      <div className="dashboard-page">
        {/* Dashboard Tab Bar */}
        <div className="dash-tabs">
          <button
            className={`dash-tab${view === "card" ? " active" : ""}`}
            onClick={() => setView("card")}
          >
            Card
          </button>
          <button
            className={`dash-tab${view === "friends" ? " active" : ""}`}
            onClick={() => setView("friends")}
          >
            Friends
          </button>
          <button
            className={`dash-tab${view === "communities" ? " active" : ""}`}
            onClick={() => setView("communities")}
          >
            Communities
            {joinedCommunities.length > 0 && (
              <span className="dash-tab-badge">{joinedCommunities.length}</span>
            )}
          </button>
          <button
            className={`dash-tab${view === "referrals" ? " active" : ""}`}
            onClick={() => setView("referrals")}
          >
            Referrals
          </button>
        </div>

        {view === "card" ? (
          <>
            <div className="dashboard-card-wrap">
              <div className="dashboard-header">
                <h1 className="dashboard-title">Your card</h1>
                <div className="dashboard-actions">
                  <Link
                    href="/dashboard/edit"
                    className="dash-icon-btn"
                    title="Edit card"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11.3 1.7a1.6 1.6 0 0 1 2.3 0l.7.7a1.6 1.6 0 0 1 0 2.3L5.7 13.3 2 14l.7-3.7z" />
                    </svg>
                  </Link>
                  <a
                    href={`/${tutor.slug}`}
                    className="dash-icon-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View live"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 3H3v10h10v-3" />
                      <path d="M9 1h6v6" />
                      <path d="M15 1 7 9" />
                    </svg>
                  </a>
                </div>
              </div>
              <TutorCard
                data={tutorData}
                variant="full"
              />

              {/* QR banner */}
              <div className="qr-banner" onClick={() => setShowQR(true)}>
                <div className="qr-banner-info">
                  <span className="qr-banner-label">Show QR code</span>
                  <span className="qr-banner-url">
                    {typeof window !== "undefined"
                      ? window.location.host
                      : ""}
                    /{tutor.slug}
                  </span>
                </div>
                <QRCodeSVG
                  value={
                    typeof window !== "undefined"
                      ? `${window.location.origin}/${tutor.slug}`
                      : `/${tutor.slug}`
                  }
                  size={56}
                  level="M"
                />
              </div>
            </div>
          </>
        ) : view === "referrals" ? (
          /* ── Referrals screen ── */
          <div className="dash-section">
            <h1 className="dashboard-title">Referrals</h1>
            <p className="dashboard-sub">
              Post referrals for students you can&apos;t take, and browse
              opportunities from other tutors.
            </p>

            {/* Your Referrals */}
            <div className="dashboard-referrals">
              <ReferralManager />
            </div>

            {/* Referral Opportunities */}
            <div style={{ marginTop: 24 }}>
              <h2 className="dashboard-title" style={{ fontSize: 18 }}>
                Opportunities from other tutors
              </h2>
              <p className="dashboard-sub" style={{ marginBottom: 16 }}>
                Active referrals that match your skills
              </p>
              {oppLoading && !oppFetched ? (
                <div className="opp-loading">Loading opportunities...</div>
              ) : opportunities.length === 0 ? (
                <div className="opp-empty">
                  <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                  <p className="opp-empty-text">
                    No referral opportunities right now. Check back later as
                    more tutors post referrals.
                  </p>
                </div>
              ) : (
                <div className="opp-list">
                  {opportunities.map((opp) => {
                    const posterName = [
                      opp.tutor.first_name,
                      opp.tutor.last_name,
                    ]
                      .filter(Boolean)
                      .join(" ");
                    const posterInitials = [
                      opp.tutor.first_name?.[0],
                      opp.tutor.last_name?.[0],
                    ]
                      .filter(Boolean)
                      .join("");
                    const isApplying = applyingTo === opp.id;

                    return (
                      <div key={opp.id} className="opp-card">
                        {opp.skillMatch && (
                          <div className="opp-match-badge">
                            Matches your skills
                          </div>
                        )}
                        <div className="opp-card-top">
                          <div className="opp-card-subject">{opp.subject}</div>
                          <div className="opp-card-meta">
                            {[opp.location, opp.grade_level]
                              .filter(Boolean)
                              .join(" · ")}
                          </div>
                          {opp.notes && (
                            <div className="opp-card-notes">
                              &quot;{opp.notes}&quot;
                            </div>
                          )}
                        </div>

                        <div className="opp-card-poster">
                          <div
                            className="opp-poster-av"
                            style={{
                              background:
                                opp.tutor.avatar_color || "#0f172a",
                            }}
                          >
                            {posterInitials}
                          </div>
                          <div className="opp-poster-info">
                            <span className="opp-poster-name">
                              {posterName}
                            </span>
                            <a
                              href={`/${opp.tutor.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="opp-poster-link"
                            >
                              View card ↗
                            </a>
                          </div>
                        </div>

                        <div className="opp-card-actions">
                          {opp.applied ? (
                            <span className="opp-applied">Applied ✓</span>
                          ) : showCoffee === opp.id ? (
                            <div className="opp-coffee-prompt">
                              <button
                                className="opp-apply-btn secondary"
                                onClick={() =>
                                  handleApplyToOpportunity(opp.id, false)
                                }
                                disabled={isApplying}
                              >
                                {isApplying ? "Applying..." : "Just apply"}
                              </button>
                              <button
                                className="opp-coffee-btn"
                                onClick={() =>
                                  handleApplyToOpportunity(opp.id, true)
                                }
                                disabled={isApplying}
                              >
                                ☕ Apply + coffee
                              </button>
                            </div>
                          ) : (
                            <button
                              className="opp-apply-btn"
                              onClick={() => setShowCoffee(opp.id)}
                              disabled={isApplying}
                            >
                              Apply
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : view === "friends" ? (
          /* ── Friends screen ── */
          <div className="dash-section">
            <h1 className="dashboard-title">Invite fellow tutors</h1>
            <p className="dashboard-sub">
              Add tutors you know. They&apos;ll get an invite to connect with you
              and can send or receive referrals.
            </p>
            <InviteFriends
              invites={friendInvites}
              onChange={setFriendInvites}
            />
          </div>
        ) : view === "communities" ? (
          /* ── Communities screen ── */
          openCommunityId ? (
            <CommunityDetail
              communityId={openCommunityId}
              onBack={() => setOpenCommunityId(null)}
            />
          ) : (
            <div className="dash-section">
              <h1 className="dashboard-title">Communities</h1>
              <p className="dashboard-sub">
                Join groups of tutors who share referrals, resources, and support
                each other.
              </p>
              <CommunityPicker
                joined={joinedCommunities}
                onJoin={handleJoinCommunity}
                onLeave={handleLeaveCommunity}
                onCreate={handleCreateCommunity}
                onOpen={(id) => setOpenCommunityId(id)}
              />
              {joinedCommunities.length > 0 && (
                <div className="joined-summary" style={{ marginTop: 16 }}>
                  You&apos;ve joined {joinedCommunities.length} communit
                  {joinedCommunities.length === 1 ? "y" : "ies"}
                </div>
              )}
            </div>
          )
        ) : null}
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="qr-overlay" onClick={() => setShowQR(false)}>
          <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
            <button className="qr-close" onClick={() => setShowQR(false)}>
              &times;
            </button>
            <h2 className="qr-heading">Scan to view card</h2>
            <p className="qr-sub">
              {typeof window !== "undefined" ? window.location.host : ""}/
              {tutor.slug}
            </p>
            <div className="qr-code-wrap">
              <QRCodeSVG
                value={
                  typeof window !== "undefined"
                    ? `${window.location.origin}/${tutor.slug}`
                    : `/${tutor.slug}`
                }
                size={220}
                level="M"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
