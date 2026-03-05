"use client";

import { useState, useEffect, useCallback } from "react";

interface CommunityData {
  id: string;
  name: string;
  description: string;
  avatar_color: string;
  created_by: string;
  memberCount: number;
  referralCount: number;
  pendingRequests: number;
  userRole: string | null;
  isOwnerOrAdmin: boolean;
}

interface MemberInfo {
  tutorId: string;
  role: string;
  joinedAt: string;
  tutor: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_color: string;
    slug: string;
  };
}

interface JoinRequest {
  id: string;
  tutorId: string;
  message: string;
  status: string;
  createdAt: string;
  tutor: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_color: string;
    slug: string;
  };
}

interface CommunityDetailProps {
  communityId: string;
  onBack: () => void;
}

export default function CommunityDetail({
  communityId,
  onBack,
}: CommunityDetailProps) {
  const [community, setCommunity] = useState<CommunityData | null>(null);
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "members" | "requests" | "form">(
    "overview"
  );
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  // Join request form state
  const [joinMessage, setJoinMessage] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const fetchCommunity = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/communities/${communityId}`);
      if (res.ok) {
        const data = await res.json();
        setCommunity(data.community);
        setMembers(data.members || []);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, [communityId]);

  const fetchRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const res = await fetch(
        `/api/communities/${communityId}/join-requests?status=pending`
      );
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch {
      // ignore
    }
    setRequestsLoading(false);
  }, [communityId]);

  useEffect(() => {
    fetchCommunity();
  }, [fetchCommunity]);

  useEffect(() => {
    if (community?.isOwnerOrAdmin && tab === "requests") {
      fetchRequests();
    }
  }, [community?.isOwnerOrAdmin, tab, fetchRequests]);

  async function handleReviewRequest(requestId: string, action: "approved" | "declined") {
    setReviewingId(requestId);
    try {
      const res = await fetch(`/api/communities/${communityId}/join-requests`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
        if (action === "approved") {
          setCommunity((prev) =>
            prev
              ? {
                  ...prev,
                  memberCount: prev.memberCount + 1,
                  pendingRequests: Math.max(0, prev.pendingRequests - 1),
                }
              : prev
          );
          fetchCommunity();
        } else {
          setCommunity((prev) =>
            prev
              ? { ...prev, pendingRequests: Math.max(0, prev.pendingRequests - 1) }
              : prev
          );
        }
      }
    } catch {
      // ignore
    }
    setReviewingId(null);
  }

  async function handleSubmitJoinRequest() {
    setSubmittingRequest(true);
    try {
      const res = await fetch(`/api/communities/${communityId}/join-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: joinMessage }),
      });
      if (res.ok) {
        setRequestSent(true);
        setJoinMessage("");
      }
    } catch {
      // ignore
    }
    setSubmittingRequest(false);
  }

  if (loading) {
    return (
      <div className="cd-page">
        <button className="cd-back-btn" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4 6 9l5 5" />
          </svg>
          Back
        </button>
        <div className="cd-loading">Loading community...</div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="cd-page">
        <button className="cd-back-btn" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4 6 9l5 5" />
          </svg>
          Back
        </button>
        <div className="cd-empty">Community not found.</div>
      </div>
    );
  }

  const isMember = community.userRole !== null;

  return (
    <div className="cd-page">
      <button className="cd-back-btn" onClick={onBack}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4 6 9l5 5" />
        </svg>
        Back
      </button>

      {/* Community Header */}
      <div className="cd-header">
        <div className="cd-avatar" style={{ background: community.avatar_color }}>
          {community.name[0].toUpperCase()}
        </div>
        <div className="cd-header-info">
          <h1 className="cd-title">{community.name}</h1>
          {community.description && (
            <p className="cd-description">{community.description}</p>
          )}
          {community.userRole && (
            <span className={`cd-role-badge cd-role-${community.userRole}`}>
              {community.userRole}
            </span>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="cd-stats">
        <div className="cd-stat">
          <span className="cd-stat-num">{community.memberCount}</span>
          <span className="cd-stat-label">
            Member{community.memberCount !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="cd-stat">
          <span className="cd-stat-num">{community.referralCount}</span>
          <span className="cd-stat-label">
            Referral{community.referralCount !== 1 ? "s" : ""}
          </span>
        </div>
        {community.isOwnerOrAdmin && (
          <div className="cd-stat cd-stat-pending">
            <span className="cd-stat-num">{community.pendingRequests}</span>
            <span className="cd-stat-label">Pending</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="cd-tabs">
        <button
          className={`cd-tab${tab === "overview" ? " active" : ""}`}
          onClick={() => setTab("overview")}
        >
          Overview
        </button>
        <button
          className={`cd-tab${tab === "members" ? " active" : ""}`}
          onClick={() => setTab("members")}
        >
          Members
        </button>
        {community.isOwnerOrAdmin && (
          <button
            className={`cd-tab${tab === "requests" ? " active" : ""}`}
            onClick={() => setTab("requests")}
          >
            Applications
            {community.pendingRequests > 0 && (
              <span className="cd-tab-badge">{community.pendingRequests}</span>
            )}
          </button>
        )}
        {!isMember && (
          <button
            className={`cd-tab${tab === "form" ? " active" : ""}`}
            onClick={() => setTab("form")}
          >
            Join
          </button>
        )}
      </div>

      {/* Tab Content */}
      {tab === "overview" && (
        <div className="cd-section">
          <div className="cd-overview-card">
            <h3 className="cd-section-title">About this community</h3>
            <p className="cd-overview-text">
              {community.description || "No description provided."}
            </p>
          </div>
          <div className="cd-overview-card">
            <h3 className="cd-section-title">Quick stats</h3>
            <div className="cd-quick-stats">
              <div className="cd-quick-stat">
                <span className="cd-qs-label">Total members</span>
                <span className="cd-qs-value">{community.memberCount}</span>
              </div>
              <div className="cd-quick-stat">
                <span className="cd-qs-label">Total referrals</span>
                <span className="cd-qs-value">{community.referralCount}</span>
              </div>
              {community.isOwnerOrAdmin && (
                <div className="cd-quick-stat">
                  <span className="cd-qs-label">Pending applications</span>
                  <span className="cd-qs-value">{community.pendingRequests}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "members" && (
        <div className="cd-section">
          {members.length === 0 ? (
            <div className="cd-empty">No members yet.</div>
          ) : (
            <div className="cd-members-list">
              {members.map((m) => {
                const name = [m.tutor.first_name, m.tutor.last_name]
                  .filter(Boolean)
                  .join(" ");
                const initials = [m.tutor.first_name?.[0], m.tutor.last_name?.[0]]
                  .filter(Boolean)
                  .join("");
                return (
                  <div key={m.tutorId} className="cd-member-row">
                    <div
                      className="cd-member-av"
                      style={{ background: m.tutor.avatar_color || "#0f172a" }}
                    >
                      {initials}
                    </div>
                    <div className="cd-member-info">
                      <span className="cd-member-name">{name}</span>
                      <span className={`cd-member-role cd-role-${m.role}`}>
                        {m.role}
                      </span>
                    </div>
                    <a
                      href={`/${m.tutor.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cd-member-link"
                    >
                      View card
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "requests" && community.isOwnerOrAdmin && (
        <div className="cd-section">
          <h3 className="cd-section-title">Pending applications</h3>
          {requestsLoading ? (
            <div className="cd-loading">Loading applications...</div>
          ) : requests.length === 0 ? (
            <div className="cd-empty">No pending applications.</div>
          ) : (
            <div className="cd-requests-list">
              {requests.map((r) => {
                const name = [r.tutor.first_name, r.tutor.last_name]
                  .filter(Boolean)
                  .join(" ");
                const initials = [r.tutor.first_name?.[0], r.tutor.last_name?.[0]]
                  .filter(Boolean)
                  .join("");
                const isReviewing = reviewingId === r.id;
                return (
                  <div key={r.id} className="cd-request-card">
                    <div className="cd-request-top">
                      <div
                        className="cd-member-av"
                        style={{ background: r.tutor.avatar_color || "#0f172a" }}
                      >
                        {initials}
                      </div>
                      <div className="cd-request-info">
                        <span className="cd-member-name">{name}</span>
                        <span className="cd-request-date">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {r.message && (
                      <div className="cd-request-message">
                        &ldquo;{r.message}&rdquo;
                      </div>
                    )}
                    <div className="cd-request-actions">
                      <button
                        className="cd-btn-approve"
                        onClick={() => handleReviewRequest(r.id, "approved")}
                        disabled={isReviewing}
                      >
                        {isReviewing ? "..." : "Approve"}
                      </button>
                      <button
                        className="cd-btn-decline"
                        onClick={() => handleReviewRequest(r.id, "declined")}
                        disabled={isReviewing}
                      >
                        Decline
                      </button>
                      <a
                        href={`/${r.tutor.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cd-member-link"
                      >
                        View card
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "form" && !isMember && (
        <div className="cd-section">
          <div className="cd-join-form">
            <h3 className="cd-section-title">Request to join</h3>
            {requestSent ? (
              <div className="cd-request-sent">
                Your request has been submitted! The community owner will review
                it shortly.
              </div>
            ) : (
              <>
                <p className="cd-form-desc">
                  Introduce yourself to the community owner. Tell them why
                  you&apos;d like to join.
                </p>
                <textarea
                  className="cd-join-textarea"
                  placeholder="Hi! I'd love to join because..."
                  value={joinMessage}
                  onChange={(e) => setJoinMessage(e.target.value)}
                  rows={4}
                />
                <button
                  className="cd-btn-submit"
                  onClick={handleSubmitJoinRequest}
                  disabled={submittingRequest}
                >
                  {submittingRequest ? "Submitting..." : "Submit request"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
