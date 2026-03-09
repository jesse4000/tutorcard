"use client";

import { useState } from "react";
import Icon, { textOnAccent } from "./Icon";

interface InquirySheetProps {
  onClose: () => void;
  accent: string;
  tutorId: string;
  tutorExams: string[];
}

export default function InquirySheet({ onClose, accent, tutorId, tutorExams }: InquirySheetProps) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", exams: [] as string[], message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const t = textOnAccent(accent);

  const toggle = (e: string) =>
    setForm((p) => ({
      ...p,
      exams: p.exams.includes(e) ? p.exams.filter((x) => x !== e) : [...p.exams, e],
    }));

  const set = (k: string) => (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: ev.target.value }));

  const inp: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    border: "1.5px solid #e5e7eb",
    fontSize: 14,
    color: "#111",
    outline: "none",
    marginBottom: 8,
    boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.15s",
  };

  async function handleSubmit() {
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutorId,
          senderName: form.name,
          senderEmail: form.email,
          senderPhone: form.phone || undefined,
          examsOfInterest: form.exams.length > 0 ? form.exams : undefined,
          message: form.message,
        }),
      });
      if (res.ok) {
        setSent(true);
      }
    } catch {
      // silent fail for now
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 200,
        animation: "pfFadeIn 0.15s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: "20px 20px 0 0",
          width: "100%",
          maxWidth: 420,
          maxHeight: "85vh",
          overflow: "auto",
          padding: "20px 22px 28px",
          animation: "pfSlideUp 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 17, fontWeight: 600, color: "#111" }}>
            {sent ? "Message sent!" : "Send a message"}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "#f3f4f6",
              border: "none",
              borderRadius: "50%",
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#6b7280",
            }}
          >
            <Icon name="x" size={15} />
          </button>
        </div>

        {sent ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <Icon name="check" size={24} style={{ color: "#059669" }} />
            </div>
            <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
              Your message has been sent. The tutor will get back to you soon.
            </p>
          </div>
        ) : (
          <>
            <input
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={set("name")}
              style={inp}
              onFocus={(e) => (e.target.style.borderColor = accent)}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={set("email")}
              style={inp}
              onFocus={(e) => (e.target.style.borderColor = accent)}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
            <input
              type="tel"
              placeholder="Phone (optional)"
              value={form.phone}
              onChange={set("phone")}
              style={inp}
              onFocus={(e) => (e.target.style.borderColor = accent)}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />

            {tutorExams.length > 0 && (
              <>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", margin: "4px 0 8px" }}>Exam of interest</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                  {tutorExams.map((e) => (
                    <button
                      key={e}
                      onClick={() => toggle(e)}
                      style={{
                        padding: "5px 14px",
                        borderRadius: 20,
                        cursor: "pointer",
                        border: form.exams.includes(e) ? `1.5px solid ${accent}` : "1.5px solid #e5e7eb",
                        background: form.exams.includes(e) ? accent : "white",
                        color: form.exams.includes(e) ? t : "#6b7280",
                        fontSize: 13,
                        fontWeight: 500,
                        fontFamily: "'DM Sans', sans-serif",
                        transition: "all 0.15s",
                      }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </>
            )}

            <textarea
              placeholder="Tell the tutor about your needs..."
              value={form.message}
              onChange={set("message")}
              style={{ ...inp, minHeight: 72, resize: "vertical", marginBottom: 14 }}
              onFocus={(e) => (e.target.style.borderColor = accent)}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />

            <button
              onClick={handleSubmit}
              disabled={sending || !form.name || !form.email || !form.message}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 12,
                border: "none",
                background: accent,
                color: t,
                fontSize: 15,
                fontWeight: 600,
                cursor: sending ? "wait" : "pointer",
                fontFamily: "'DM Sans', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: !form.name || !form.email || !form.message ? 0.5 : 1,
              }}
            >
              <Icon name="send" size={14} />
              {sending ? "Sending..." : "Send Message"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
