"use client";

import { useState, useEffect, useCallback } from "react";

interface Community {
  id: string;
  name: string;
  description: string;
  avatar_color: string;
  memberCount?: number;
}

interface CommunityPickerProps {
  joined: string[];
  onJoin: (communityId: string) => void;
  onLeave: (communityId: string) => void;
  onCreate: (name: string, description: string) => Promise<void> | void;
  onOpen?: (communityId: string) => void;
}

export default function CommunityPicker({
  joined,
  onJoin,
  onLeave,
  onCreate,
  onOpen,
}: CommunityPickerProps) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunities = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/communities/search?q=${encodeURIComponent(q)}`
      );
      if (res.ok) {
        const data = await res.json();
        setCommunities(data.communities || []);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Failed to load communities (${res.status})`);
      }
    } catch {
      setError("Network error loading communities");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCommunities("");
  }, [fetchCommunities]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCommunities(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchCommunities]);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await onCreate(newName.trim(), newDesc.trim());
    } catch {
      // ignore
    }
    setNewName("");
    setNewDesc("");
    setShowCreate(false);
    setCreating(false);
    // Refresh list after creation completes
    await fetchCommunities(searchQuery);
  }

  return (
    <div className="community-picker">
      <div className="community-search-row">
        <input
          className="field-input"
          type="text"
          placeholder="Search communities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          className="btn-create-community"
          onClick={() => setShowCreate(!showCreate)}
          type="button"
        >
          {showCreate ? "Cancel" : "+ Create"}
        </button>
      </div>

      {showCreate && (
        <div className="community-create-form">
          <input
            className="field-input"
            type="text"
            placeholder="Community name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            className="field-input"
            type="text"
            placeholder="Short description (optional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            style={{ marginTop: 8 }}
          />
          <button
            className="btn-send-invites"
            onClick={handleCreate}
            disabled={!newName.trim() || creating}
            type="button"
            style={{ marginTop: 10 }}
          >
            {creating ? "Creating..." : "Create community"}
          </button>
        </div>
      )}

      {error && (
        <div className="community-empty" style={{ color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="community-loading">Loading communities...</div>
      ) : communities.length === 0 && !error ? (
        <div className="community-empty">
          {searchQuery
            ? "No communities found. Try a different search or create one!"
            : "No communities yet. Be the first to create one!"}
        </div>
      ) : (
        <div className="community-list">
          {communities.map((c) => {
            const isJoined = joined.includes(c.id);
            return (
              <div key={c.id} className="community-item">
                <div
                  className="community-avatar"
                  style={{ background: c.avatar_color }}
                >
                  {c.name[0].toUpperCase()}
                </div>
                <div
                  className="community-info"
                  style={onOpen ? { cursor: "pointer" } : undefined}
                  onClick={onOpen ? () => onOpen(c.id) : undefined}
                >
                  <div className="community-name">
                    {c.name}
                    {onOpen && <span className="community-open-hint">&rsaquo;</span>}
                  </div>
                  {c.description && (
                    <div className="community-desc">{c.description}</div>
                  )}
                  <div className="community-meta">
                    {c.memberCount ?? 0} member
                    {(c.memberCount ?? 0) !== 1 ? "s" : ""}
                  </div>
                </div>
                <button
                  className={`btn-join-community ${isJoined ? "joined" : ""}`}
                  onClick={() => (isJoined ? onLeave(c.id) : onJoin(c.id))}
                  type="button"
                >
                  {isJoined ? "Joined" : "Join"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
