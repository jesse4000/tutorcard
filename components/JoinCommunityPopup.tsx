"use client";

import { useState, useEffect, useCallback } from "react";

interface AppQuestion {
  id: string;
  text: string;
  required: boolean;
}

interface CommunityInfo {
  id: string;
  name: string;
  description: string;
  avatar_color: string;
  require_approval: boolean;
  application_questions: AppQuestion[] | null;
  hasPendingRequest: boolean;
  memberCount: number;
}

interface JoinCommunityPopupProps {
  communityId: string;
  onClose: () => void;
  onJoined: (communityId: string) => void;
  onPending: (communityId: string) => void;
}

export default function JoinCommunityPopup({
  communityId,
  onClose,
  onJoined,
  onPending,
}: JoinCommunityPopupProps) {
  const [community, setCommunity] = useState<CommunityInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [joinMessage, setJoinMessage] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const fetchCommunity = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/communities/${communityId}`);
      if (res.ok) {
        const data = await res.json();
        setCommunity(data.community);
        if (data.community?.hasPendingRequest) {
          setRequestSent(true);
        }
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, [communityId]);

  useEffect(() => {
    fetchCommunity();
  }, [fetchCommunity]);

  async function handleSubmit() {
    if (!community) return;

    const questions = community.application_questions || [];
    for (const q of questions) {
      if (q.required && !answers[q.id]?.trim()) {
        return;
      }
    }

    setSubmitting(true);
    try {
      // If there are questions or approval is required, submit a join request
      if (questions.length > 0 || community.require_approval) {
        const res = await fetch(`/api/communities/${communityId}/join-requests`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: joinMessage,
            answers: Object.keys(answers).length > 0 ? answers : null,
          }),
        });
        if (res.ok) {
          setRequestSent(true);
          onPending(communityId);
        }
      } else {
        // Direct join (no approval needed, no form)
        const res = await fetch("/api/communities/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ communityId }),
        });
        const data = await res.json();
        if (data.status === "joined") {
          onJoined(communityId);
          onClose();
        } else if (data.status === "pending") {
          setRequestSent(true);
          onPending(communityId);
        }
      }
    } catch {
      // ignore
    }
    setSubmitting(false);
  }

  const hasQuestions =
    community?.application_questions &&
    community.application_questions.length > 0;

  return (
    <div className="join-popup-overlay" onClick={onClose}>
      <div className="join-popup" onClick={(e) => e.stopPropagation()}>
        <button className="join-popup-close" onClick={onClose}>
          &times;
        </button>

        {loading ? (
          <div className="join-popup-loading">Loading...</div>
        ) : !community ? (
          <div className="join-popup-loading">Community not found.</div>
        ) : (
          <>
            {/* Community header */}
            <div className="join-popup-header">
              <div
                className="join-popup-avatar"
                style={{ background: community.avatar_color }}
              >
                {community.name[0].toUpperCase()}
              </div>
              <div className="join-popup-info">
                <h2 className="join-popup-name">{community.name}</h2>
                {community.description && (
                  <p className="join-popup-desc">{community.description}</p>
                )}
                <span className="join-popup-meta">
                  {community.memberCount} member
                  {community.memberCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {requestSent ? (
              <div className="join-popup-sent">
                Your application has been submitted! The community owner will
                review it shortly.
              </div>
            ) : (
              <div className="join-popup-form">
                {community.require_approval && (
                  <p className="join-popup-form-desc">
                    {hasQuestions
                      ? "Fill out the application below. The community owner will review your request."
                      : "This community requires approval to join. You can add an optional message."}
                  </p>
                )}

                {/* Custom application questions */}
                {hasQuestions &&
                  community.application_questions!.map((q) => (
                    <div key={q.id} className="join-popup-field">
                      <label className="join-popup-label">
                        {q.text}
                        {q.required && (
                          <span className="join-popup-required">*</span>
                        )}
                      </label>
                      <textarea
                        className="join-popup-textarea"
                        placeholder="Your answer..."
                        value={answers[q.id] || ""}
                        onChange={(e) =>
                          setAnswers((prev) => ({
                            ...prev,
                            [q.id]: e.target.value,
                          }))
                        }
                        rows={3}
                      />
                    </div>
                  ))}

                {/* Freeform message (shown when approval required) */}
                {community.require_approval && (
                  <div className="join-popup-field">
                    <label className="join-popup-label">
                      {hasQuestions
                        ? "Additional message (optional)"
                        : "Message (optional)"}
                    </label>
                    <textarea
                      className="join-popup-textarea"
                      placeholder="Hi! I'd love to join because..."
                      value={joinMessage}
                      onChange={(e) => setJoinMessage(e.target.value)}
                      rows={3}
                    />
                  </div>
                )}

                <button
                  className="join-popup-submit"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting
                    ? "Submitting..."
                    : community.require_approval
                    ? "Submit application"
                    : "Join community"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
