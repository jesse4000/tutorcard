"use client";

import Link from "next/link";
import Icon, { textOnAccent } from "./Icon";
import type { VoucherData } from "./types";

interface VouchCardProps {
  vouch: VoucherData;
  accent: string;
  wide: boolean;
}

export default function VouchCard({ vouch, accent, wide }: VouchCardProps) {
  const initials = [vouch.firstName?.[0], vouch.lastName?.[0]].filter(Boolean).join("");

  return (
    <div style={{ display: "flex", alignItems: "center", gap: wide ? 14 : 12, padding: wide ? "14px 22px" : "10px 12px", background: "#fafafa", borderRadius: wide ? 14 : 12, border: "1px solid #f0f0f0" }}>
      <div style={{ width: wide ? 42 : 36, height: wide ? 42 : 36, borderRadius: "50%", background: vouch.profileImageUrl ? "transparent" : vouch.avatarColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
        {vouch.profileImageUrl ? (
          <img src={vouch.profileImageUrl} alt={`${vouch.firstName} ${vouch.lastName}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: wide ? 14 : 12, fontWeight: 600, color: textOnAccent(vouch.avatarColor) }}>{initials}</span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: wide ? 14 : 13, fontWeight: 600, color: "#111", margin: 0, lineHeight: 1.3 }}>
          {vouch.firstName} {vouch.lastName}
        </p>
        <p style={{ fontSize: wide ? 13 : 11.5, color: "#6b7280", margin: "1px 0 0" }}>
          {vouch.title || "Tutor"}
        </p>
      </div>
      <Link
        href={`/${vouch.slug}`}
        className="pf-view-btn"
        title={`${vouch.firstName} ${vouch.lastName} — ${vouch.title || "Tutor"}`}
        style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0, padding: wide ? "5px 12px" : "4px 10px", borderRadius: 20, background: "white", border: "1px solid #e5e7eb", fontSize: wide ? 12 : 11, fontWeight: 500, color: "#6b7280", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", textDecoration: "none", transition: "border-color 0.15s, color 0.15s" }}
      >
        {vouch.firstName} {vouch.lastName}<Icon name="ext" size={wide ? 11 : 10} />
      </Link>
    </div>
  );
}
