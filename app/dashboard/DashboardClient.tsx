"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "@/components/Navbar";
import TutorCard from "@/components/TutorCard";
import ReferralManager from "@/components/ReferralManager";
import CommunityPicker from "@/components/CommunityPicker";
import CommunityDetail from "@/components/CommunityDetail";
import JoinCommunityPopup from "@/components/JoinCommunityPopup";
import { createClient } from "@/lib/supabase/client";
import type { TutorLink } from "@/components/TutorCard";

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
  business_name: string | null;
  years_experience: number | null;
  profile_image_url: string | null;
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
  message?: string;
  created_at: string;
  tutor: OpportunityTutor;
  applied: boolean;
  applicationStatus?: string | null;
  skillMatch: boolean;
  communityName?: string;
}

interface MyReferral {
  id: string;
  subject: string;
  location: string;
  grade_level: string;
  status: string;
  referral_applications: { id: string; status: string }[];
}

interface CommunityDetail {
  id: string;
  name: string;
  avatar_color: string;
  memberCount?: number;
  newReferralCount?: number;
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1d ago";
  return `${days}d ago`;
}

export default function DashboardClient({
  tutor,
  userEmail,
}: DashboardClientProps) {
  const router = useRouter();
  const [showQR, setShowQR] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [view, setView] = useState<"card" | "referrals" | "communities">("card");
  const [referralTab, setReferralTab] = useState<"home" | "yours" | "opportunities">("home");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [oppLoading, setOppLoading] = useState(false);
  const [oppFetched, setOppFetched] = useState(false);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [showCoffee, setShowCoffee] = useState<string | null>(null);
  const [referralView, setReferralView] = useState<string>("list");
  const [pendingApplicants, setPendingApplicants] = useState(0);

  // Communities state
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([]);
  const [joinedCommunityDetails, setJoinedCommunityDetails] = useState<CommunityDetail[]>([]);
  const [pendingCommunities, setPendingCommunities] = useState<string[]>([]);
  const [ownedCommunities, setOwnedCommunities] = useState<string[]>([]);
  const [openCommunityId, setOpenCommunityId] = useState<string | null>(null);
  const [joinPopupCommunityId, setJoinPopupCommunityId] = useState<string | null>(null);

  // Desktop dashboard state
  const [myReferrals, setMyReferrals] = useState<MyReferral[]>([]);
  const [vouchCount, setVouchCount] = useState(0);
  const [showDesktopCommunities, setShowDesktopCommunities] = useState(false);
  const [desktopNewListing, setDesktopNewListing] = useState(false);

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

  useEffect(() => {
    if (!tutor) return;
    (async () => {
      try {
        const res = await fetch("/api/referrals?mine=true");
        if (res.ok) {
          const data = await res.json();
          const refs = data.referrals || [];
          setMyReferrals(refs);
          const pending = refs.reduce(
            (sum: number, r: { referral_applications?: { status: string }[] }) =>
              sum + (r.referral_applications?.filter((a: { status: string }) => a.status === "pending").length || 0),
            0
          );
          setPendingApplicants(pending);
        }
      } catch {
        // silently fail
      }
    })();
  }, [tutor]);

  // Fetch vouch count
  useEffect(() => {
    if (!tutor) return;
    (async () => {
      try {
        const supabase = createClient();
        const { count } = await supabase
          .from("vouches")
          .select("*", { count: "exact", head: true })
          .eq("vouched_tutor_id", tutor.id);
        setVouchCount(count || 0);
      } catch {
        // silently fail
      }
    })();
  }, [tutor]);

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

  function handleJoinCommunity(communityId: string) {
    // Always open the join popup — it handles both direct join and application forms
    setJoinPopupCommunityId(communityId);
  }

  async function handleLeaveCommunity(communityId: string) {
    const wasJoined = joinedCommunities.includes(communityId);
    setJoinedCommunities((prev) => prev.filter((id) => id !== communityId));
    setPendingCommunities((prev) => prev.filter((id) => id !== communityId));
    try {
      await fetch(`/api/communities/join?communityId=${communityId}`, {
        method: "DELETE",
      });
    } catch {
      if (wasJoined) {
        setJoinedCommunities((prev) => [...prev, communityId]);
      }
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
        setOwnedCommunities((prev) => [...prev, data.community.id]);
      }
    } else {
      alert(data.error || "Failed to create community");
    }
  }

  // Fetch joined communities and pending requests on mount
  useEffect(() => {
    if (!tutor) return;
    async function fetchJoined() {
      try {
        const res = await fetch("/api/communities/joined");
        if (res.ok) {
          const data = await res.json();
          const comms = data.communities || [];
          setJoinedCommunities(
            comms.map((c: { id: string }) => c.id)
          );
          setJoinedCommunityDetails(
            comms.map((c: { id: string; name: string; avatar_color: string; memberCount?: number; newReferralCount?: number }) => ({
              id: c.id,
              name: c.name,
              avatar_color: c.avatar_color,
              memberCount: c.memberCount,
              newReferralCount: c.newReferralCount,
            }))
          );
          setPendingCommunities(data.pendingCommunityIds || []);
          setOwnedCommunities(data.ownedCommunityIds || []);
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
    businessName: tutor.business_name || "",
    profileImageUrl: tutor.profile_image_url || "",
  };

  return (
    <>
      <Navbar
        mode="dashboard"
        userEmail={userEmail}
        onSignOut={handleSignOut}
      />
      <div className="dashboard-page mobile-dashboard">
        {/* Dashboard Tab Bar (hidden when community detail is open) */}
        {view === "communities" && openCommunityId ? (
          <div className="dash-back-bar">
            <button
              className="dash-back-btn"
              onClick={() => setOpenCommunityId(null)}
            >
              ← Communities
            </button>
          </div>
        ) : view === "referrals" && (referralView !== "list" || referralTab !== "home") ? (
          null
        ) : (
          <div className="dash-tabs">
            <button
              className={`dash-tab${view === "card" ? " active" : ""}`}
              onClick={() => setView("card")}
            >
              Card
            </button>
            <button
              className={`dash-tab${view === "communities" ? " active" : ""}`}
              onClick={() => setView("communities")}
            >
              Communities
            </button>
            <button
              className={`dash-tab${view === "referrals" ? " active" : ""}`}
              onClick={() => setView("referrals")}
            >
              Referrals
              {(pendingApplicants + opportunities.length) > 0 && (
                <span className="dash-tab-badge">
                  {(pendingApplicants + opportunities.length) > 99 ? "99+" : pendingApplicants + opportunities.length}
                </span>
              )}
            </button>
          </div>
        )}

        {view === "card" ? (
          <>
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
            <div className="dashboard-card-layout">
              <div className="dashboard-card-wrap">
                <TutorCard
                  data={tutorData}
                  variant="full"
                />
              </div>
              <div className="dashboard-card-sidebar">
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
                {/* Share link banner */}
                <div
                  className="qr-banner"
                  onClick={() => {
                    const url =
                      typeof window !== "undefined"
                        ? `${window.location.origin}/${tutor.slug}`
                        : `/${tutor.slug}`;
                    navigator.clipboard.writeText(url).then(() => {
                      setLinkCopied(true);
                      setTimeout(() => setLinkCopied(false), 2000);
                    });
                  }}
                >
                  <div className="qr-banner-info">
                    <span className="qr-banner-label">
                      {linkCopied ? "Link copied!" : "Share card link"}
                    </span>
                    <span className="qr-banner-url" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>
                        {typeof window !== "undefined"
                          ? window.location.host
                          : ""}
                        /{tutor.slug}
                      </span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ flexShrink: 0, color: "var(--ink-2)" }}
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : view === "referrals" ? (
          /* ── Referrals screen ── */
          <div className="dash-section">
            {referralTab === "home" ? (
              <>
                <h1 className="dashboard-title">Your Referrals</h1>
                <p className="dashboard-sub">
                  Manage your referral listings and discover opportunities from other tutors.
                </p>
                <div className="listings-widgets">
                  <div
                    className="listings-widget"
                    onClick={() => setReferralTab("yours")}
                  >
                    <div className="listings-widget-icon" style={{ background: "#0f172a" }}>
                      📋
                    </div>
                    <div className="listings-widget-info">
                      <div className="listings-widget-name">Your Listings</div>
                      <div className="listings-widget-desc">Manage your referral listings</div>
                    </div>
                    {pendingApplicants > 0 && (
                      <span className="listings-widget-badge">
                        {pendingApplicants > 99 ? "99+" : pendingApplicants}
                      </span>
                    )}
                    <span className="listings-widget-arrow">&rsaquo;</span>
                  </div>
                  <div
                    className="listings-widget"
                    onClick={() => setReferralTab("opportunities")}
                  >
                    <div className="listings-widget-icon" style={{ background: "#16a34a" }}>
                      🔍
                    </div>
                    <div className="listings-widget-info">
                      <div className="listings-widget-name">Opportunities</div>
                      <div className="listings-widget-desc">Browse referrals from other tutors</div>
                    </div>
                    {opportunities.length > 0 && (
                      <span className="listings-widget-badge">
                        {opportunities.length > 99 ? "99+" : opportunities.length}
                      </span>
                    )}
                    <span className="listings-widget-arrow">&rsaquo;</span>
                  </div>
                </div>
              </>
            ) : referralTab === "yours" ? (
              <>
                <button
                  className="listings-back-btn"
                  onClick={() => { setReferralTab("home"); setReferralView("list"); }}
                >
                  ← Back to referrals
                </button>
                <div className="dashboard-referrals">
                  <ReferralManager onViewChange={setReferralView} communities={joinedCommunityDetails} />
                </div>
              </>
            ) : (
              <>
                <button
                  className="listings-back-btn"
                  onClick={() => setReferralTab("home")}
                >
                  ← Back to referrals
                </button>
                <div>
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

                          {opp.applicationStatus === "accepted" && opp.message && (
                            <div className="opp-message-reveal">
                              <div className="opp-message-label">Message from {opp.tutor.first_name}:</div>
                              <div className="opp-message-text">{opp.message}</div>
                            </div>
                          )}

                          <div className="opp-card-actions">
                            {opp.applied ? (
                              <span className={`opp-applied${opp.applicationStatus === "accepted" ? " accepted" : opp.applicationStatus === "declined" ? " declined" : ""}`}>
                                {opp.applicationStatus === "accepted"
                                  ? "Accepted"
                                  : opp.applicationStatus === "declined"
                                  ? "Declined"
                                  : "Applied"}
                              </span>
                            ) : (
                              <button
                                className="opp-apply-btn"
                                onClick={() =>
                                  handleApplyToOpportunity(opp.id, false)
                                }
                                disabled={isApplying}
                              >
                                {isApplying ? "Applying..." : "Apply"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                </div>
              </>
            )}
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
                pending={pendingCommunities}
                owned={ownedCommunities}
                onJoin={handleJoinCommunity}
                onLeave={handleLeaveCommunity}
                onCreate={handleCreateCommunity}
                onOpen={(id) => setOpenCommunityId(id)}
                onApply={(id) => setJoinPopupCommunityId(id)}
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

      {/* ── DESKTOP UNIFIED DASHBOARD ── */}
      <div className="desktop-dashboard">
        {/* Desktop drill-down views */}
        {openCommunityId ? (
          <div style={{ width: "100%" }}>
            <CommunityDetail
              communityId={openCommunityId}
              onBack={() => setOpenCommunityId(null)}
            />
          </div>
        ) : showDesktopCommunities ? (
          <div style={{ width: "100%" }}>
            <button className="listings-back-btn" onClick={() => setShowDesktopCommunities(false)}>
              ← Back to dashboard
            </button>
            <h1 className="dashboard-title" style={{ marginBottom: 16 }}>Communities</h1>
            <CommunityPicker
              joined={joinedCommunities}
              pending={pendingCommunities}
              owned={ownedCommunities}
              onJoin={handleJoinCommunity}
              onLeave={handleLeaveCommunity}
              onCreate={handleCreateCommunity}
              onOpen={(id) => setOpenCommunityId(id)}
              onApply={(id) => setJoinPopupCommunityId(id)}
            />
          </div>
        ) : desktopNewListing ? (
          <div style={{ width: "100%" }}>
            <button className="listings-back-btn" onClick={() => setDesktopNewListing(false)}>
              ← Back to dashboard
            </button>
            <div className="dashboard-referrals">
              <ReferralManager onViewChange={setReferralView} communities={joinedCommunityDetails} />
            </div>
          </div>
        ) : (
          <>
            {/* LEFT SIDEBAR */}
            <aside className="dd-sidebar">
              <div className="dd-profile-card">
                <div className="dd-profile-head">
                  <div
                    className="dd-avatar"
                    style={{ background: tutor.profile_image_url ? "transparent" : (tutor.avatar_color || "#0f172a") }}
                  >
                    {tutor.profile_image_url ? (
                      <img
                        src={tutor.profile_image_url}
                        alt={tutorData.firstName}
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                      />
                    ) : (
                      [tutor.first_name?.[0], tutor.last_name?.[0]].filter(Boolean).join("")
                    )}
                  </div>
                  <div>
                    <div className="dd-name">
                      {[tutor.first_name, tutor.last_name].filter(Boolean).join(" ")}
                    </div>
                    <div className="dd-title-text">{tutor.title || "Tutor"}</div>
                  </div>
                </div>

                <div className="dd-tags">
                  {[...tutorData.exams, ...tutorData.locations].map((tag, i) => (
                    <span key={tag + i} className={`dd-tag${i === 0 ? " accent" : ""}`}>{tag}</span>
                  ))}
                </div>

                <div className="dd-stats">
                  <div className="dd-stat">
                    <span className="dd-stat-num">{myReferrals.length}</span>
                    <span className="dd-stat-label">LISTINGS</span>
                  </div>
                  <div className="dd-stat">
                    <span className="dd-stat-num">
                      {myReferrals.reduce((sum, r) => sum + (r.referral_applications?.length || 0), 0)}
                    </span>
                    <span className="dd-stat-label">PASSED</span>
                  </div>
                  <div className="dd-stat">
                    <span className="dd-stat-num">{vouchCount}</span>
                    <span className="dd-stat-label">VOUCHES</span>
                  </div>
                </div>

                <div className="dd-actions">
                  <button className="dd-action-btn" onClick={() => setShowQR(true)}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="1" width="6" height="6" rx="1" />
                      <rect x="9" y="1" width="6" height="6" rx="1" />
                      <rect x="1" y="9" width="6" height="6" rx="1" />
                      <rect x="11" y="11" width="2" height="2" />
                    </svg>
                    QR CODE
                  </button>
                  <button
                    className="dd-action-btn"
                    onClick={() => {
                      const url = typeof window !== "undefined"
                        ? `${window.location.origin}/${tutor.slug}`
                        : `/${tutor.slug}`;
                      navigator.clipboard.writeText(url).then(() => {
                        setLinkCopied(true);
                        setTimeout(() => setLinkCopied(false), 2000);
                      });
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 2.5l1.5-1.5a2 2 0 0 1 3 3L13 5.5M6 10l-1.5 1.5a2 2 0 0 1-3-3L3 7" />
                      <path d="M6 10l4-4" />
                    </svg>
                    {linkCopied ? "COPIED!" : "SHARE"}
                  </button>
                  <Link href="/dashboard/edit" className="dd-action-btn">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11.3 1.7a1.6 1.6 0 0 1 2.3 0l.7.7a1.6 1.6 0 0 1 0 2.3L5.7 13.3 2 14l.7-3.7z" />
                    </svg>
                    EDIT
                  </Link>
                </div>
              </div>

              {/* Communities Section */}
              <div className="dd-communities">
                <div className="dd-comm-header">
                  <span className="dd-comm-title">Communities</span>
                  <button className="dd-comm-browse" onClick={() => setShowDesktopCommunities(true)}>
                    Browse &rarr;
                  </button>
                </div>
                {joinedCommunityDetails.map((comm) => (
                  <div
                    key={comm.id}
                    className="dd-comm-item"
                    onClick={() => setOpenCommunityId(comm.id)}
                  >
                    <div
                      className="dd-comm-avatar"
                      style={{ background: comm.avatar_color || "#0f172a" }}
                    >
                      {comm.name.slice(0, 3).toUpperCase()}
                    </div>
                    <div className="dd-comm-info">
                      <div className="dd-comm-name">{comm.name}</div>
                      <div className="dd-comm-meta">
                        {comm.memberCount || 0} member{(comm.memberCount || 0) !== 1 ? "s" : ""}
                        {(comm.newReferralCount || 0) > 0 && (
                          <> &middot; {comm.newReferralCount} new referral{(comm.newReferralCount || 0) !== 1 ? "s" : ""}</>
                        )}
                      </div>
                    </div>
                    {(comm.newReferralCount || 0) > 0 && <span className="dd-comm-dot" />}
                  </div>
                ))}
                <button
                  className="dd-comm-join"
                  onClick={() => setShowDesktopCommunities(true)}
                >
                  + Join a community
                </button>
              </div>
            </aside>

            {/* RIGHT MAIN CONTENT */}
            <main className="dd-main">
              {/* Match Banner */}
              {opportunities.filter((o) => o.skillMatch).length > 0 && (
                <div className="dd-match-banner">
                  <div className="dd-match-info">
                    <span className="dd-match-icon">&#x1F4E3;</span>
                    <div>
                      <div className="dd-match-title">
                        {opportunities.filter((o) => o.skillMatch).length} new referral{opportunities.filter((o) => o.skillMatch).length !== 1 ? "s" : ""} match your profile
                      </div>
                      <div className="dd-match-sub">
                        {[...new Set(opportunities.filter((o) => o.skillMatch).map((o) => o.subject))].slice(0, 2).join(", ")}
                        {" "}&middot; posted in the last 24h
                      </div>
                    </div>
                  </div>
                  <button
                    className="dd-match-btn"
                    onClick={() => {
                      const el = document.getElementById("dd-opps-section");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    View matches
                  </button>
                </div>
              )}

              {/* Your Listings */}
              <section className="dd-listings-section">
                <div className="dd-section-header">
                  <h2 className="dd-section-title">Your listings</h2>
                  <button className="dd-section-link" onClick={() => setDesktopNewListing(true)}>
                    + New listing
                  </button>
                </div>
                <div className="dd-listings-row">
                  {myReferrals.map((ref) => {
                    const pendingCount = ref.referral_applications?.filter((a) => a.status === "pending").length || 0;
                    const isActive = ref.status === "open";
                    return (
                      <div
                        key={ref.id}
                        className="dd-listing-card"
                        onClick={() => setDesktopNewListing(true)}
                      >
                        <div className="dd-listing-subject">{ref.subject}</div>
                        <div className="dd-listing-meta">
                          {[ref.location, ref.grade_level].filter(Boolean).join(" \u00B7 ")}
                        </div>
                        {pendingCount > 0 ? (
                          <span className="dd-listing-badge applicants">
                            {pendingCount} APPLICANT{pendingCount !== 1 ? "S" : ""}
                          </span>
                        ) : (
                          <span className={`dd-listing-badge ${isActive ? "active" : "closed"}`}>
                            {isActive ? "ACTIVE" : "CLOSED"}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  <div
                    className="dd-listing-card dd-listing-add"
                    onClick={() => setDesktopNewListing(true)}
                  >
                    <div className="dd-listing-add-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v8M8 12h8" />
                      </svg>
                    </div>
                    <span className="dd-listing-add-text">List a referral</span>
                  </div>
                </div>
              </section>

              {/* Opportunities */}
              <section className="dd-opps-section" id="dd-opps-section">
                <div className="dd-section-header">
                  <h2 className="dd-section-title">Opportunities</h2>
                  {opportunities.length > 5 && (
                    <span className="dd-section-link" style={{ cursor: "default" }}>
                      See all
                    </span>
                  )}
                </div>
                {opportunities.length === 0 ? (
                  <div className="dd-opps-empty">
                    No referral opportunities right now. Check back later.
                  </div>
                ) : (
                  <div className="dd-opps-list">
                    {opportunities.slice(0, 5).map((opp) => {
                      const posterName = [opp.tutor.first_name, opp.tutor.last_name].filter(Boolean).join(" ");
                      const posterInitials = [opp.tutor.first_name?.[0], opp.tutor.last_name?.[0]].filter(Boolean).join("");
                      const isApplying = applyingTo === opp.id;
                      const timeAgo = getTimeAgo(opp.created_at);

                      return (
                        <div key={opp.id} className="dd-opp-card">
                          <div className="dd-opp-top">
                            <div className="dd-opp-subject">{opp.subject}</div>
                            <div className="dd-opp-time-row">
                              <span className="dd-opp-time">{timeAgo}</span>
                              {opp.skillMatch && <span className="dd-opp-match">MATCH</span>}
                            </div>
                          </div>

                          <div className="dd-opp-tags">
                            {[opp.subject.split(" ")[0], opp.location, opp.grade_level].filter(Boolean).map((tag, i) => (
                              <span key={tag + i} className={`dd-opp-tag${i === 0 && opp.skillMatch ? " accent" : ""}`}>{tag}</span>
                            ))}
                          </div>

                          {opp.notes && (
                            <div className="dd-opp-notes">
                              {opp.notes}
                            </div>
                          )}

                          <div className="dd-opp-footer">
                            <div className="dd-opp-poster">
                              <div
                                className="dd-opp-poster-av"
                                style={{ background: opp.tutor.avatar_color || "#0f172a" }}
                              >
                                {posterInitials}
                              </div>
                              <span className="dd-opp-poster-name">
                                {opp.communityName ? `via ${opp.communityName} \u00B7 ` : ""}{posterName}
                              </span>
                            </div>
                            {opp.applied ? (
                              <span className={`dd-opp-status${opp.applicationStatus === "accepted" ? " accepted" : opp.applicationStatus === "declined" ? " declined" : ""}`}>
                                {opp.applicationStatus === "accepted" ? "Accepted" : opp.applicationStatus === "declined" ? "Declined" : "Applied"}
                              </span>
                            ) : (
                              <button
                                className="dd-opp-apply"
                                onClick={() => handleApplyToOpportunity(opp.id, false)}
                                disabled={isApplying}
                              >
                                {isApplying ? "Applying..." : "Apply"} &rarr;
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </main>
          </>
        )}
      </div>

      {/* Join Community Popup */}
      {joinPopupCommunityId && (
        <JoinCommunityPopup
          communityId={joinPopupCommunityId}
          onClose={() => setJoinPopupCommunityId(null)}
          onJoined={(id) => {
            setJoinedCommunities((prev) =>
              prev.includes(id) ? prev : [...prev, id]
            );
            setJoinPopupCommunityId(null);
          }}
          onPending={(id) => {
            setPendingCommunities((prev) =>
              prev.includes(id) ? prev : [...prev, id]
            );
          }}
        />
      )}

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
