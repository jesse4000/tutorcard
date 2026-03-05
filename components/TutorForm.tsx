"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import TutorCard from "@/components/TutorCard";
import TagPicker from "@/components/TagPicker";
import LinkBuilder from "@/components/LinkBuilder";
import Toggle from "@/components/Toggle";
import InviteFriends from "@/components/InviteFriends";
import CommunityPicker from "@/components/CommunityPicker";
import type { TutorLink } from "@/components/TutorCard";
import type { FriendInvite } from "@/components/InviteFriends";

const EXAM_PRESETS = [
  "SAT Math",
  "SAT Reading/Writing",
  "ACT Math",
  "ACT Science",
  "ACT English",
  "ISEE",
  "SHSAT",
  "GRE",
  "GMAT",
  "LSAT",
];
const SUBJECT_PRESETS = [
  "AP Calculus",
  "AP Statistics",
  "AP English",
  "AP Chemistry",
  "AP Biology",
  "AP Physics",
  "Algebra",
  "Geometry",
  "Essay Writing",
  "Spanish",
  "French",
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

const COLORS = [
  "#0f172a",
  "#1d4ed8",
  "#7c3aed",
  "#be123c",
  "#065f46",
  "#92400e",
];

const TOTAL_STEPS = 6;

export interface TutorFormData {
  id?: string;
  firstName: string;
  lastName: string;
  title: string;
  slug: string;
  avatarColor: string;
  exams: string[];
  subjects: string[];
  locations: string[];
  links: TutorLink[];
  notifyOnMatch: boolean;
  email: string;
  businessName?: string;
  profileImageUrl?: string;
}

interface TutorFormProps {
  mode: "create" | "edit";
  initialData?: TutorFormData;
}

export default function TutorForm({ mode, initialData }: TutorFormProps) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // Step 1
  const [firstName, setFirstName] = useState(initialData?.firstName || "");
  const [lastName, setLastName] = useState(initialData?.lastName || "");
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [avatarColor, setAvatarColor] = useState(
    initialData?.avatarColor || COLORS[0]
  );
  const [businessName, setBusinessName] = useState(initialData?.businessName || "");
  const [profileImageUrl, setProfileImageUrl] = useState(initialData?.profileImageUrl || "");
  const [uploading, setUploading] = useState(false);

  // Step 2
  const [exams, setExams] = useState<string[]>(initialData?.exams || []);
  const [subjects, setSubjects] = useState<string[]>(
    initialData?.subjects || []
  );
  const [locations, setLocations] = useState<string[]>(
    initialData?.locations || []
  );

  // Step 3
  const [links, setLinks] = useState<TutorLink[]>(
    initialData?.links?.length
      ? initialData.links
      : [{ type: "🌐 Website", url: "", label: "" }]
  );

  // Step 4 — Friends
  const [friendInvites, setFriendInvites] = useState<FriendInvite[]>([]);

  // Step 5 — Communities
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([]);
  const [pendingCommunities, setPendingCommunities] = useState<{ name: string; description: string }[]>([]);

  // Step 6
  const [notifyMe, setNotifyMe] = useState(
    initialData?.notifyOnMatch || false
  );
  const [email, setEmail] = useState(initialData?.email || "");

  // Done state
  const [done, setDone] = useState(false);
  const [copyText, setCopyText] = useState("Copy");

  const cardData = {
    firstName,
    lastName,
    title,
    slug,
    avatarColor,
    exams,
    subjects,
    locations,
    links: links.filter((l) => l.url),
    businessName,
    profileImageUrl,
  };

  function nextStep() {
    if (step === 1) {
      const errs: Record<string, boolean> = {};
      if (!firstName.trim()) errs.firstName = true;
      if (!lastName.trim()) errs.lastName = true;
      if (!slug.trim()) errs.slug = true;
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        setTimeout(() => setErrors({}), 1500);
        return;
      }
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 1));
  }

  function handleJoinCommunity(communityId: string) {
    setJoinedCommunities((prev) =>
      prev.includes(communityId) ? prev : [...prev, communityId]
    );
  }

  function handleLeaveCommunity(communityId: string) {
    setJoinedCommunities((prev) => prev.filter((id) => id !== communityId));
  }

  async function handleCreateCommunity(name: string, description: string) {
    if (mode === "create") {
      // During onboarding, tutor doesn't exist yet — defer creation
      setPendingCommunities((prev) => [...prev, { name, description }]);
      return;
    }
    try {
      const res = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.community?.id) {
          setJoinedCommunities((prev) => [...prev, data.community.id]);
        }
      }
    } catch {
      // ignore
    }
  }

  async function joinCommunitiesAfterCreate() {
    for (const communityId of joinedCommunities) {
      try {
        await fetch("/api/communities/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ communityId }),
        });
      } catch {
        // best effort
      }
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const payload = {
        ...(mode === "edit" && initialData?.id ? { id: initialData.id } : {}),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        title: title.trim(),
        slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        avatarColor,
        exams,
        subjects,
        locations,
        links: links.filter((l) => l.url),
        notifyOnMatch: notifyMe,
        email: email.trim(),
        businessName: businessName.trim(),
        profileImageUrl: profileImageUrl || null,
      };

      const res = await fetch("/api/tutors", {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error?.includes("slug")) {
          setStep(1);
          setErrors({ slug: true });
          alert("That card URL is already taken. Please choose another.");
        } else {
          alert("Something went wrong. Please try again.");
        }
        setSubmitting(false);
        return;
      }

      // Create any communities that were deferred during onboarding
      for (const pc of pendingCommunities) {
        try {
          const cRes = await fetch("/api/communities", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: pc.name, description: pc.description }),
          });
          if (cRes.ok) {
            const cData = await cRes.json();
            if (cData.community?.id) {
              joinedCommunities.push(cData.community.id);
            }
          }
        } catch {
          // best effort
        }
      }

      // Join communities now that the tutor card exists
      if (joinedCommunities.length > 0) {
        await joinCommunitiesAfterCreate();
      }

      setDone(true);
    } catch {
      alert("Network error. Please try again.");
    }
    setSubmitting(false);
  }

  function copyUrl() {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopyText("Copied!");
    setTimeout(() => setCopyText("Copy"), 2000);
  }

  function shareAction(platform: string) {
    const url = `${window.location.origin}/${slug}`;
    const text = `Check out my TutorCard — all my info, specialties, and availability in one place.`;
    const map: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=My TutorCard&body=${encodeURIComponent(text + "\n\n" + url)}`,
    };
    window.open(map[platform], "_blank");
  }

  const pct = done ? 100 : (step / TOTAL_STEPS) * 100;
  const stepLabel = done
    ? mode === "edit"
      ? "✓ Card updated!"
      : "✓ Card created!"
    : `Step <span>${step}</span> of ${TOTAL_STEPS}`;

  const doneTitle = mode === "edit" ? "Card updated!" : "Your card is live!";
  const doneSub =
    mode === "edit"
      ? "Your changes are live. Share your updated card."
      : "Share it anywhere — Facebook groups, parent communities, your email signature, or just let people scan your QR code.";

  return (
    <>
      <Navbar mode="create" stepInfo={stepLabel} />

      <div className="progress-bar-wrap">
        <div className="progress-bar" style={{ width: `${pct}%` }} />
      </div>

      <div className="app-layout">
        {/* LEFT: Form */}
        <div className="left-panel">
          {!done ? (
            <>
              {step === 1 && (
                <div style={{ animation: "stepIn 0.4s ease both" }}>
                  <div className="step-eyebrow">Step 1 of 6</div>
                  <div className="step-title">
                    {mode === "edit" ? (
                      "Edit the basics."
                    ) : (
                      <>
                        Let&apos;s start with
                        <br />
                        the basics.
                      </>
                    )}
                  </div>
                  <div className="step-sub">
                    This is what parents and tutors will see first on your card.
                  </div>

                  <div className="avatar-row">
                    <div
                      className="avatar-preview"
                      style={{ background: profileImageUrl ? "transparent" : avatarColor }}
                    >
                      {profileImageUrl ? (
                        <img
                          src={profileImageUrl}
                          alt="Profile"
                          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                        />
                      ) : (
                        firstName?.[0]?.toUpperCase() || "?"
                      )}
                    </div>
                    <div>
                      <div className="field-label" style={{ marginBottom: 6 }}>
                        Your card color
                      </div>
                      <div className="color-dots">
                        {COLORS.map((c) => (
                          <div
                            key={c}
                            className={`color-dot${avatarColor === c ? " selected" : ""}`}
                            style={{ background: c }}
                            onClick={() => setAvatarColor(c)}
                          />
                        ))}
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <label className="field-label" style={{ marginBottom: 4, display: "block" }}>
                          Profile photo
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploading}
                          style={{ fontSize: 13 }}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 2 * 1024 * 1024) {
                              alert("Image must be under 2MB");
                              return;
                            }
                            setUploading(true);
                            try {
                              const fd = new FormData();
                              fd.append("file", file);
                              const res = await fetch("/api/upload", { method: "POST", body: fd });
                              if (res.ok) {
                                const data = await res.json();
                                setProfileImageUrl(data.url);
                              } else {
                                alert("Upload failed. Please try again.");
                              }
                            } catch {
                              alert("Upload failed. Please try again.");
                            }
                            setUploading(false);
                          }}
                        />
                        {uploading && <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>Uploading...</div>}
                      </div>
                    </div>
                  </div>

                  <div className="field-row">
                    <div className="field">
                      <label className="field-label">First name *</label>
                      <input
                        className={`field-input${errors.firstName ? " error" : ""}`}
                        type="text"
                        placeholder="Sarah"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label className="field-label">Last name *</label>
                      <input
                        className={`field-input${errors.lastName ? " error" : ""}`}
                        type="text"
                        placeholder="Chen"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label className="field-label">Business name</label>
                    <div className="field-hint">
                      Optional — displayed below your name on the card.
                    </div>
                    <input
                      className="field-input"
                      type="text"
                      placeholder="Chen Tutoring LLC"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">Your tutor title</label>
                    <div className="field-hint">
                      How would you describe yourself in one line?
                    </div>
                    <input
                      className="field-input"
                      type="text"
                      placeholder="SAT & ACT Tutor · New York & New Jersey"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">Card URL *</label>
                    <div className="field-hint">
                      This becomes your shareable link.
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        border: `1.5px solid ${errors.slug ? "var(--red)" : "var(--border)"}`,
                        borderRadius: 10,
                        background: "white",
                        overflow: "hidden",
                        transition: "border-color 0.15s",
                      }}
                    >
                      <span
                        style={{
                          padding: "12px 12px 12px 14px",
                          fontSize: 13,
                          color: "var(--ink-3)",
                          whiteSpace: "nowrap",
                          borderRight: "1px solid var(--border)",
                          background: "var(--bg)",
                        }}
                      >
                        {typeof window !== "undefined" ? window.location.host : "studyspaces.com"}/
                      </span>
                      <input
                        style={{
                          flex: 1,
                          padding: "12px 14px",
                          border: "none",
                          outline: "none",
                          fontSize: 14,
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          color: "var(--ink)",
                          background: "white",
                        }}
                        type="text"
                        placeholder="sarah-chen"
                        value={slug}
                        onChange={(e) =>
                          setSlug(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, "-")
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="step-nav">
                    <div />
                    <button className="btn-next" onClick={nextStep}>
                      Continue
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div style={{ animation: "stepIn 0.4s ease both" }}>
                  <div className="step-eyebrow">Step 2 of 6</div>
                  <div className="step-title">
                    What do you
                    <br />
                    teach?
                  </div>
                  <div className="step-sub">
                    Select all that apply. This is how tutors find you for
                    referrals.
                  </div>

                  <TagPicker
                    label="Exams"
                    presets={EXAM_PRESETS}
                    selected={exams}
                    onChange={setExams}
                    customPlaceholder="Add another exam..."
                  />
                  <TagPicker
                    label="Subjects"
                    presets={SUBJECT_PRESETS}
                    selected={subjects}
                    onChange={setSubjects}
                    customPlaceholder="Add another subject..."
                  />
                  <TagPicker
                    label="Locations"
                    presets={LOCATION_PRESETS}
                    selected={locations}
                    onChange={setLocations}
                    customPlaceholder="Add your city or region..."
                  />

                  <div className="step-nav">
                    <button className="btn-back" onClick={prevStep}>
                      ← Back
                    </button>
                    <button className="btn-next" onClick={nextStep}>
                      Continue
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div style={{ animation: "stepIn 0.4s ease both" }}>
                  <div className="step-eyebrow">Step 3 of 6</div>
                  <div className="step-title">Add your links.</div>
                  <div className="step-sub">
                    These become action buttons on your card. Parents and
                    students tap them directly.
                  </div>

                  <LinkBuilder links={links} onChange={setLinks} />

                  <div className="step-nav" style={{ marginTop: 28 }}>
                    <button className="btn-back" onClick={prevStep}>
                      ← Back
                    </button>
                    <button className="btn-next" onClick={nextStep}>
                      Continue
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div style={{ animation: "stepIn 0.4s ease both" }}>
                  <div className="step-eyebrow">Step 4 of 6</div>
                  <div className="step-title">
                    Invite fellow
                    <br />
                    tutors.
                  </div>
                  <div className="step-sub">
                    Add tutors you know. They&apos;ll get an invite to connect
                    with you and can send or receive referrals.
                  </div>

                  <InviteFriends
                    invites={friendInvites}
                    onChange={setFriendInvites}
                  />

                  {friendInvites.length > 0 && (
                    <div className="joined-summary">
                      {friendInvites.filter((i) => i.status === "sent").length > 0
                        ? `${friendInvites.filter((i) => i.status === "sent").length} invite${friendInvites.filter((i) => i.status === "sent").length !== 1 ? "s" : ""} sent`
                        : `${friendInvites.length} invite${friendInvites.length !== 1 ? "s" : ""} ready to send`}
                    </div>
                  )}

                  <div className="step-nav" style={{ marginTop: 28 }}>
                    <button className="btn-back" onClick={prevStep}>
                      &larr; Back
                    </button>
                    <button className="btn-next" onClick={nextStep}>
                      Continue
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  <div className="step-skip">
                    <button
                      className="btn-skip"
                      onClick={nextStep}
                      type="button"
                    >
                      Skip for now
                    </button>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div style={{ animation: "stepIn 0.4s ease both" }}>
                  <div className="step-eyebrow">Step 5 of 6</div>
                  <div className="step-title">
                    Join a<br />
                    community.
                  </div>
                  <div className="step-sub">
                    Communities are groups of tutors who share referrals,
                    resources, and support each other.
                  </div>

                  <CommunityPicker
                    joined={joinedCommunities}
                    onJoin={handleJoinCommunity}
                    onLeave={handleLeaveCommunity}
                    onCreate={handleCreateCommunity}
                  />

                  {joinedCommunities.length > 0 && (
                    <div className="joined-summary">
                      You&apos;ve joined {joinedCommunities.length} communit
                      {joinedCommunities.length === 1 ? "y" : "ies"}
                    </div>
                  )}

                  <div className="step-nav" style={{ marginTop: 28 }}>
                    <button className="btn-back" onClick={prevStep}>
                      &larr; Back
                    </button>
                    <button className="btn-next" onClick={nextStep}>
                      Continue
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  <div className="step-skip">
                    <button
                      className="btn-skip"
                      onClick={nextStep}
                      type="button"
                    >
                      Skip for now
                    </button>
                  </div>
                </div>
              )}

              {step === 6 && (
                <div style={{ animation: "stepIn 0.4s ease both" }}>
                  <div className="step-eyebrow">Step 6 of 6</div>
                  <div className="step-title">Almost done.</div>
                  <div className="step-sub">
                    Set your referral preferences and your card is ready to
                    share.
                  </div>

                  <Toggle
                    title="Notify me of matching referrals"
                    subtitle="Get an email when a tutor posts a student that matches your subjects and location."
                    checked={notifyMe}
                    onChange={setNotifyMe}
                  />

                  <div className="field" style={{ marginTop: 8 }}>
                    <label className="field-label">
                      Email for notifications
                    </label>
                    <input
                      className="field-input"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="step-nav">
                    <button className="btn-back" onClick={prevStep}>
                      ← Back
                    </button>
                    <button
                      className="btn-next amber"
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting
                        ? mode === "edit"
                          ? "Saving..."
                          : "Creating..."
                        : mode === "edit"
                          ? "Save changes"
                          : "Create my card"}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* DONE STATE */
            <div style={{ animation: "stepIn 0.4s ease both" }}>
              <div className="done-icon">{mode === "edit" ? "✅" : "🎉"}</div>
              <div className="done-title">{doneTitle}</div>
              <div className="done-sub">{doneSub}</div>

              <div className="done-card">
                <div className="share-url-row">
                  <div className="share-url">
                    {typeof window !== "undefined" && window.location.origin}/{slug}
                  </div>
                  <button
                    className="copy-btn"
                    onClick={copyUrl}
                    style={
                      copyText === "Copied!"
                        ? { background: "var(--green)" }
                        : undefined
                    }
                  >
                    {copyText}
                  </button>
                </div>
                <div className="share-actions">
                  <button
                    className="share-action"
                    onClick={() => shareAction("facebook")}
                  >
                    <span className="share-action-icon">👥</span> Facebook Group
                  </button>
                  <button
                    className="share-action"
                    onClick={() => shareAction("whatsapp")}
                  >
                    <span className="share-action-icon">💬</span> WhatsApp
                  </button>
                  <button
                    className="share-action"
                    onClick={() => shareAction("linkedin")}
                  >
                    <span className="share-action-icon">💼</span> LinkedIn
                  </button>
                  <button
                    className="share-action"
                    onClick={() => shareAction("email")}
                  >
                    <span className="share-action-icon">✉️</span> Email
                  </button>
                </div>
              </div>

              <div className="next-steps">
                <div className="next-steps-title">What&apos;s next</div>
                <a
                  href={`/${slug}`}
                  className="next-step-item"
                  style={{ textDecoration: "none" }}
                >
                  <span className="nsi-icon">👁️</span>
                  <div>
                    <div>View your live card</div>
                    <div className="nsi-sub">
                      See what others see when they visit your link.
                    </div>
                  </div>
                  <span className="nsi-arr">→</span>
                </a>
                <Link
                  href="/dashboard"
                  className="next-step-item"
                  style={{ textDecoration: "none" }}
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = "/dashboard";
                  }}
                >
                  <span className="nsi-icon">📋</span>
                  <div>
                    <div>Go to your dashboard</div>
                    <div className="nsi-sub">
                      Manage your card, edit details, and more.
                    </div>
                  </div>
                  <span className="nsi-arr">→</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Live Preview */}
        <div className="right-panel">
          <div className="preview-label">Live preview</div>
          <TutorCard data={cardData} variant="preview" />
        </div>
      </div>
    </>
  );
}
