"use client";

import { useState, useEffect, useCallback } from "react";

interface AppQuestion {
  id: string;
  text: string;
  required: boolean;
}

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
  require_approval: boolean;
  application_questions: AppQuestion[] | null;
  hasPendingRequest: boolean;
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
  answers: Record<string, string> | null;
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
  const [tab, setTab] = useState<"overview" | "members" | "requests" | "settings">(
    "overview"
  );
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  // Settings state
  const [settingsQuestions, setSettingsQuestions] = useState<AppQuestion[]>([]);
  const [settingsRequireApproval, setSettingsRequireApproval] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

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

  // Load settings when settings tab is opened
  useEffect(() => {
    if (community && tab === "settings") {
      setSettingsQuestions(community.application_questions || []);
      setSettingsRequireApproval(community.require_approval);
      setSettingsSaved(false);
    }
  }, [community, tab]);

  async function handleSaveSettings() {
    setSavingSettings(true);
    setSettingsSaved(false);
    try {
      const res = await fetch(`/api/communities/${communityId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requireApproval: settingsRequireApproval,
          applicationQuestions: settingsQuestions.length > 0 ? settingsQuestions : null,
        }),
      });
      if (res.ok) {
        setSettingsSaved(true);
        fetchCommunity();
      }
    } catch {
      // ignore
    }
    setSavingSettings(false);
  }

  function addQuestion() {
    setSettingsQuestions((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: "", required: false },
    ]);
    setSettingsSaved(false);
  }

  function removeQuestion(id: string) {
    setSettingsQuestions((prev) => prev.filter((q) => q.id !== id));
    setSettingsSaved(false);
  }

  function updateQuestion(id: string, field: "text" | "required", value: string | boolean) {
    setSettingsQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
    setSettingsSaved(false);
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
        {community.isOwnerOrAdmin && (
          <button
            className={`cd-tab${tab === "settings" ? " active" : ""}`}
            onClick={() => setTab("settings")}
          >
            Settings
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
                    {/* Show answers to application questions */}
                    {r.answers &&
                      community.application_questions &&
                      community.application_questions.length > 0 && (
                        <div className="cd-request-answers">
                          {community.application_questions.map((q) =>
                            r.answers?.[q.id] ? (
                              <div key={q.id} className="cd-answer-item">
                                <span className="cd-answer-q">{q.text}</span>
                                <span className="cd-answer-a">
                                  {r.answers[q.id]}
                                </span>
                              </div>
                            ) : null
                          )}
                        </div>
                      )}
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

      {tab === "settings" && community.isOwnerOrAdmin && (
        <div className="cd-section">
          <h3 className="cd-section-title">Community settings</h3>

          {/* Require approval toggle */}
          <div className="cd-settings-row">
            <label className="cd-settings-label">
              <input
                type="checkbox"
                checked={settingsRequireApproval}
                onChange={(e) => {
                  setSettingsRequireApproval(e.target.checked);
                  setSettingsSaved(false);
                }}
              />
              <span>Require approval for new members</span>
            </label>
            <p className="cd-settings-hint">
              When enabled, people must submit an application that you approve
              before they can join.
            </p>
          </div>

          {/* Application questions editor */}
          <div className="cd-settings-section">
            <h4 className="cd-settings-subtitle">Application questions</h4>
            <p className="cd-settings-hint">
              Add custom questions that applicants must answer when requesting
              to join.
            </p>

            {settingsQuestions.length > 0 && (
              <div className="cd-questions-editor">
                {settingsQuestions.map((q, idx) => (
                  <div key={q.id} className="cd-question-edit-row">
                    <div className="cd-question-edit-top">
                      <span className="cd-question-num">{idx + 1}.</span>
                      <textarea
                        className="cd-question-input"
                        rows={2}
                        placeholder="Enter your question..."
                        value={q.text}
                        onChange={(e) =>
                          updateQuestion(q.id, "text", e.target.value)
                        }
                      />
                    </div>
                    <div className="cd-question-edit-bottom">
                      <label className="cd-question-req">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) =>
                            updateQuestion(q.id, "required", e.target.checked)
                          }
                        />
                        Required
                      </label>
                      <button
                        className="cd-question-remove"
                        onClick={() => removeQuestion(q.id)}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              className="cd-btn-add-question"
              onClick={addQuestion}
              type="button"
            >
              + Add question
            </button>
          </div>

          {/* Save button */}
          <div className="cd-settings-actions">
            <button
              className="cd-btn-submit"
              onClick={handleSaveSettings}
              disabled={savingSettings}
            >
              {savingSettings ? "Saving..." : "Save settings"}
            </button>
            {settingsSaved && (
              <span className="cd-settings-saved">Settings saved!</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
