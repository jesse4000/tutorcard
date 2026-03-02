"use client";

import { useState, useEffect, useCallback } from "react";

interface Applicant {
  id: string;
  first_name: string;
  last_name: string;
  slug: string;
  title: string | null;
  avatar_color: string;
  exams: string[];
  subjects: string[];
  locations: string[];
}

interface Application {
  id: string;
  status: string;
  bought_coffee: boolean;
  created_at: string;
  applicant_tutor_id: string;
  applicant: Applicant;
}

interface Referral {
  id: string;
  subject: string;
  location: string;
  grade_level: string;
  notes: string;
  status: string;
  created_at: string;
  referral_applications: Application[];
}

type View = "list" | "create" | "detail";

const SUBJECT_PRESETS = [
  "SAT Math",
  "SAT Reading/Writing",
  "ACT Math",
  "ACT Science",
  "ACT English",
  "AP Calculus",
  "AP Chemistry",
  "AP Biology",
  "AP Physics",
  "Algebra",
  "Geometry",
  "Essay Writing",
];

const LOCATION_PRESETS = [
  "Online",
  "New York City",
  "New Jersey",
  "Los Angeles",
  "Boston",
  "Chicago",
  "Miami",
];

const GRADE_PRESETS = [
  "6th grade",
  "7th grade",
  "8th grade",
  "9th grade",
  "10th grade",
  "11th grade",
  "12th grade",
  "College",
  "Adult",
];

export default function ReferralManager() {
  const [view, setView] = useState<View>("list");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(
    null
  );

  // Create form state
  const [subject, setSubject] = useState("");
  const [location, setLocation] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [notes, setNotes] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchReferrals = useCallback(async () => {
    try {
      const res = await fetch("/api/referrals?mine=true");
      const data = await res.json();
      setReferrals(data.referrals || []);
    } catch {
      console.error("Failed to fetch referrals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  async function handleCreate() {
    if (!subject.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          location: location.trim() || "Online",
          gradeLevel: gradeLevel.trim(),
          notes: notes.trim(),
        }),
      });
      if (res.ok) {
        setSubject("");
        setLocation("");
        setGradeLevel("");
        setNotes("");
        setView("list");
        await fetchReferrals();
      }
    } catch {
      alert("Failed to create referral");
    }
    setCreating(false);
  }

  async function handleClose(id: string) {
    try {
      await fetch("/api/referrals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "closed" }),
      });
      await fetchReferrals();
      setView("list");
    } catch {
      alert("Failed to close referral");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this referral? This can't be undone.")) return;
    try {
      await fetch(`/api/referrals?id=${id}`, { method: "DELETE" });
      await fetchReferrals();
      setView("list");
    } catch {
      alert("Failed to delete referral");
    }
  }

  async function handleRespond(applicationId: string, action: string) {
    try {
      const res = await fetch("/api/referrals/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, action }),
      });
      if (res.ok) {
        await fetchReferrals();
        // Update the selected referral
        const updated = referrals.find((r) => r.id === selectedReferral?.id);
        if (updated) setSelectedReferral(updated);
      }
    } catch {
      alert("Failed to respond to application");
    }
  }

  const activeReferrals = referrals.filter((r) => r.status === "active");
  const closedReferrals = referrals.filter((r) => r.status === "closed");
  const totalApps = referrals.reduce(
    (sum, r) => sum + (r.referral_applications?.length || 0),
    0
  );
  const pendingApps = referrals.reduce(
    (sum, r) =>
      sum +
      (r.referral_applications?.filter((a) => a.status === "pending").length ||
        0),
    0
  );

  if (loading) {
    return (
      <div className="ref-manager">
        <div className="ref-loading">Loading referrals...</div>
      </div>
    );
  }

  // CREATE VIEW
  if (view === "create") {
    return (
      <div className="ref-manager">
        <button className="ref-back-btn" onClick={() => setView("list")}>
          ← Back to referrals
        </button>
        <h3 className="ref-section-title">List a referral</h3>
        <p className="ref-section-sub">
          Have a student you can&apos;t help? List them here and other tutors
          can apply.
        </p>

        <div className="field">
          <label className="field-label">Subject *</label>
          <div className="field-hint">What does the student need help with?</div>
          <div className="ref-preset-grid">
            {SUBJECT_PRESETS.map((s) => (
              <button
                key={s}
                className={`ref-preset-btn${subject === s ? " selected" : ""}`}
                onClick={() => setSubject(subject === s ? "" : s)}
              >
                {s}
              </button>
            ))}
          </div>
          <input
            className="field-input"
            type="text"
            placeholder="Or type a custom subject..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="field-label">Location</label>
          <div className="ref-preset-grid">
            {LOCATION_PRESETS.map((l) => (
              <button
                key={l}
                className={`ref-preset-btn${location === l ? " selected" : ""}`}
                onClick={() => setLocation(location === l ? "" : l)}
              >
                {l}
              </button>
            ))}
          </div>
          <input
            className="field-input"
            type="text"
            placeholder="Or type a location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="field-label">Grade level</label>
          <div className="ref-preset-grid">
            {GRADE_PRESETS.map((g) => (
              <button
                key={g}
                className={`ref-preset-btn${gradeLevel === g ? " selected" : ""}`}
                onClick={() => setGradeLevel(gradeLevel === g ? "" : g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field-label">Notes (optional)</label>
          <div className="field-hint">
            Budget, schedule preferences, anything helpful for applicants.
          </div>
          <textarea
            className="field-input ref-textarea"
            placeholder='e.g. "Parent prefers weekday evenings, budget ~$80/hr"'
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <div className="step-nav">
          <button className="btn-back" onClick={() => setView("list")}>
            Cancel
          </button>
          <button
            className="btn-next"
            onClick={handleCreate}
            disabled={creating || !subject.trim()}
          >
            {creating ? "Posting..." : "Post referral"}
          </button>
        </div>
      </div>
    );
  }

  // DETAIL VIEW
  if (view === "detail" && selectedReferral) {
    const apps = selectedReferral.referral_applications || [];
    const pending = apps.filter((a) => a.status === "pending");
    const accepted = apps.filter((a) => a.status === "accepted");
    const declined = apps.filter((a) => a.status === "declined");
    const isActive = selectedReferral.status === "active";

    return (
      <div className="ref-manager">
        <button className="ref-back-btn" onClick={() => setView("list")}>
          ← Back to referrals
        </button>

        <div className="ref-detail-header">
          <div>
            <h3 className="ref-detail-subject">
              {selectedReferral.subject}
            </h3>
            <div className="ref-detail-meta">
              {[
                selectedReferral.location,
                selectedReferral.grade_level,
              ]
                .filter(Boolean)
                .join(" · ")}
            </div>
            {selectedReferral.notes && (
              <div className="ref-detail-notes">
                &quot;{selectedReferral.notes}&quot;
              </div>
            )}
          </div>
          <span
            className={`ref-status-badge ${isActive ? "active" : "closed"}`}
          >
            {isActive ? "Active" : "Closed"}
          </span>
        </div>

        {isActive && (
          <div className="ref-detail-actions">
            <button
              className="ref-close-btn"
              onClick={() => handleClose(selectedReferral.id)}
            >
              Close referral
            </button>
            <button
              className="ref-delete-btn"
              onClick={() => handleDelete(selectedReferral.id)}
            >
              Delete
            </button>
          </div>
        )}

        <div className="ref-apps-section">
          <h4 className="ref-apps-title">
            Applications ({apps.length})
          </h4>

          {apps.length === 0 && (
            <div className="ref-empty-apps">
              No applications yet. Share your card to get applicants!
            </div>
          )}

          {pending.length > 0 && (
            <>
              <div className="ref-apps-group-label">
                Pending ({pending.length})
              </div>
              {pending.map((app) => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  onAccept={() => handleRespond(app.id, "accepted")}
                  onDecline={() => handleRespond(app.id, "declined")}
                />
              ))}
            </>
          )}

          {accepted.length > 0 && (
            <>
              <div className="ref-apps-group-label">
                Accepted ({accepted.length})
              </div>
              {accepted.map((app) => (
                <ApplicationCard key={app.id} app={app} />
              ))}
            </>
          )}

          {declined.length > 0 && (
            <>
              <div className="ref-apps-group-label">
                Declined ({declined.length})
              </div>
              {declined.map((app) => (
                <ApplicationCard key={app.id} app={app} />
              ))}
            </>
          )}
        </div>
      </div>
    );
  }

  // LIST VIEW (default)
  return (
    <div className="ref-manager">
      <div className="ref-header">
        <h3 className="ref-section-title">Your referrals</h3>
        <button
          className="btn-next ref-create-btn"
          onClick={() => setView("create")}
        >
          + List a referral
        </button>
      </div>

      {/* Stats */}
      {referrals.length > 0 && (
        <div className="ref-stats">
          <div className="ref-stat">
            <div className="ref-stat-num">{activeReferrals.length}</div>
            <div className="ref-stat-label">Active</div>
          </div>
          <div className="ref-stat">
            <div className="ref-stat-num">{totalApps}</div>
            <div className="ref-stat-label">Applications</div>
          </div>
          <div className="ref-stat">
            <div className="ref-stat-num highlight">{pendingApps}</div>
            <div className="ref-stat-label">Pending review</div>
          </div>
        </div>
      )}

      {referrals.length === 0 ? (
        <div className="ref-empty">
          <div className="ref-empty-icon">🔄</div>
          <div className="ref-empty-title">No referrals yet</div>
          <p className="ref-empty-sub">
            Have a student you can&apos;t help? List a referral and other tutors
            in the network will apply. It&apos;s tutor-to-tutor — no student
            info is shared until you approve.
          </p>
          <button
            className="btn-next ref-create-btn"
            onClick={() => setView("create")}
          >
            + List your first referral
          </button>
        </div>
      ) : (
        <div className="ref-list">
          {activeReferrals.map((ref) => (
            <ReferralCard
              key={ref.id}
              referral={ref}
              onClick={() => {
                setSelectedReferral(ref);
                setView("detail");
              }}
            />
          ))}
          {closedReferrals.length > 0 && (
            <>
              <div className="ref-closed-divider">Closed</div>
              {closedReferrals.map((ref) => (
                <ReferralCard
                  key={ref.id}
                  referral={ref}
                  onClick={() => {
                    setSelectedReferral(ref);
                    setView("detail");
                  }}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ReferralCard({
  referral,
  onClick,
}: {
  referral: Referral;
  onClick: () => void;
}) {
  const appCount = referral.referral_applications?.length || 0;
  const pendingCount =
    referral.referral_applications?.filter((a) => a.status === "pending")
      .length || 0;
  const isActive = referral.status === "active";

  return (
    <div
      className={`ref-card ${isActive ? "" : "closed"}`}
      onClick={onClick}
    >
      <div className="ref-card-left">
        <div className="ref-card-subject">{referral.subject}</div>
        <div className="ref-card-meta">
          {[referral.location, referral.grade_level]
            .filter(Boolean)
            .join(" · ")}
        </div>
      </div>
      <div className="ref-card-right">
        {pendingCount > 0 && (
          <span className="ref-card-badge pending">{pendingCount} new</span>
        )}
        <span className="ref-card-count">{appCount} applied</span>
        <span className="ref-card-arrow">→</span>
      </div>
    </div>
  );
}

function ApplicationCard({
  app,
  onAccept,
  onDecline,
}: {
  app: Application;
  onAccept?: () => void;
  onDecline?: () => void;
}) {
  const tutor = app.applicant;
  const initials = [tutor.first_name?.[0], tutor.last_name?.[0]]
    .filter(Boolean)
    .join("");
  const isPending = app.status === "pending";

  return (
    <div className={`ref-app-card ${app.status}`}>
      <div className="ref-app-head">
        <div
          className="ref-app-avatar"
          style={{ background: tutor.avatar_color || "#0f172a" }}
        >
          {initials}
        </div>
        <div className="ref-app-info">
          <a
            href={`/${tutor.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ref-app-name"
          >
            {tutor.first_name} {tutor.last_name}
          </a>
          <div className="ref-app-title">{tutor.title || "Tutor"}</div>
        </div>
        {app.bought_coffee && <span className="ref-app-coffee">☕</span>}
        {!isPending && (
          <span className={`ref-app-status-badge ${app.status}`}>
            {app.status === "accepted" ? "Accepted" : "Declined"}
          </span>
        )}
      </div>

      <div className="ref-app-tags">
        {[...tutor.exams, ...tutor.subjects, ...tutor.locations]
          .slice(0, 5)
          .map((t, i) => (
            <span key={t + i} className="ref-app-tag">
              {t}
            </span>
          ))}
      </div>

      {isPending && onAccept && onDecline && (
        <div className="ref-app-actions">
          <button className="ref-accept-btn" onClick={onAccept}>
            Accept
          </button>
          <button className="ref-decline-btn" onClick={onDecline}>
            Decline
          </button>
          <a
            href={`/${tutor.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ref-view-card-link"
          >
            View card ↗
          </a>
        </div>
      )}
    </div>
  );
}
