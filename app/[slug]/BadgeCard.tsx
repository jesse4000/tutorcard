"use client";

import Icon, { textOnAccent } from "./Icon";
import type { BadgeData } from "./types";

interface BadgeCardProps {
  badge: BadgeData;
  accent: string;
  wide: boolean;
}

export default function BadgeCard({ badge, accent, wide }: BadgeCardProps) {
  const isCert = badge.badgeType === "certification";

  if (wide) {
    return (
      <div style={{ background: "#fafafa", borderRadius: 14, padding: "18px 22px", border: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex", gap: 0 }}>
          <div style={{ flex: "0 0 60px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: isCert ? accent : "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name={isCert ? "award" : "shield"} size={22} style={{ color: isCert ? textOnAccent(accent) : "#059669" }} />
            </div>
          </div>
          <div style={{ width: 1, background: "#ebebeb", margin: "0 18px", alignSelf: "stretch" }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#111", margin: 0 }}>{badge.name}</p>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.03em", textTransform: "uppercase", color: isCert ? accent : "#059669", background: isCert ? `${accent}14` : "#ecfdf5", padding: "2px 7px", borderRadius: 4 }}>
                {isCert ? "Certification" : "Membership"}
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: "#6b7280", margin: "0 0 6px" }}>
              {badge.organization}{badge.sinceYear ? ` · Since ${badge.sinceYear}` : ""}
            </p>
            {badge.description && (
              <p style={{ fontSize: 13, color: "#9ca3af", margin: 0, lineHeight: 1.5 }}>{badge.description}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#fafafa", borderRadius: 14, padding: "12px 14px", border: "1px solid #f0f0f0" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: isCert ? accent : "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name={isCert ? "award" : "shield"} size={17} style={{ color: isCert ? textOnAccent(accent) : "#059669" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#111", margin: 0 }}>{badge.name}</p>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.03em", textTransform: "uppercase", color: isCert ? accent : "#059669", background: isCert ? `${accent}14` : "#ecfdf5", padding: "1px 6px", borderRadius: 4 }}>
              {isCert ? "Cert" : "Member"}
            </span>
          </div>
          <p style={{ fontSize: 11.5, color: "#6b7280", margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {badge.organization}{badge.sinceYear ? ` · Since ${badge.sinceYear}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
