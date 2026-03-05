"use client";

import { useState } from "react";

interface FriendInvite {
  id: string;
  email: string;
  status: "pending" | "sent" | "error";
  name?: string;
}

interface InviteFriendsProps {
  invites: FriendInvite[];
  onChange: (invites: FriendInvite[]) => void;
}

export type { FriendInvite };

export default function InviteFriends({ invites, onChange }: InviteFriendsProps) {
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);

  function addEmail() {
    const email = inputValue.trim().toLowerCase();
    if (!email) return;

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    // Don't add duplicates
    if (invites.some((i) => i.email === email)) {
      setInputValue("");
      return;
    }

    onChange([
      ...invites,
      { id: crypto.randomUUID(), email, status: "pending" },
    ]);
    setInputValue("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmail();
    }
  }

  function removeInvite(id: string) {
    onChange(invites.filter((i) => i.id !== id));
  }

  async function sendAll() {
    if (invites.length === 0) return;
    setSending(true);

    // Mark all as sent (in a real app, this would call /api/friends for each)
    const updated = invites.map((i) => ({
      ...i,
      status: "sent" as const,
    }));
    onChange(updated);

    // Send friend requests via API
    for (const invite of invites) {
      if (invite.status !== "sent") {
        try {
          await fetch("/api/friends", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: invite.email }),
          });
        } catch {
          // Silently handle - tutor may not exist yet
        }
      }
    }
    setSending(false);
  }

  const pendingCount = invites.filter((i) => i.status === "pending").length;

  return (
    <div className="invite-friends">
      <div className="invite-input-row">
        <input
          className="field-input"
          type="email"
          placeholder="colleague@email.com"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="btn-add-invite"
          onClick={addEmail}
          disabled={!inputValue.trim()}
          type="button"
        >
          Add
        </button>
      </div>

      {invites.length > 0 && (
        <div className="invite-list">
          {invites.map((invite) => (
            <div key={invite.id} className="invite-item">
              <div className="invite-avatar">
                {invite.email[0].toUpperCase()}
              </div>
              <div className="invite-email">{invite.email}</div>
              <div className="invite-status">
                {invite.status === "sent" ? (
                  <span className="invite-badge sent">Sent</span>
                ) : invite.status === "error" ? (
                  <span className="invite-badge error">Failed</span>
                ) : null}
              </div>
              <button
                className="invite-remove"
                onClick={() => removeInvite(invite.id)}
                type="button"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}

      {pendingCount > 0 && (
        <button
          className="btn-send-invites"
          onClick={sendAll}
          disabled={sending}
          type="button"
        >
          {sending
            ? "Sending..."
            : `Send ${pendingCount} invite${pendingCount > 1 ? "s" : ""}`}
        </button>
      )}

      {invites.length === 0 && (
        <div className="invite-empty">
          Add email addresses of tutors you know. They&apos;ll get an invite to
          connect with you on TutorCard.
        </div>
      )}
    </div>
  );
}
