"use client";

import Icon from "./Icon";

interface TabBarProps {
  tab: string;
  setTab: (tab: string) => void;
  accent: string;
  reviewCount: number;
  vouchCount: number;
  badgeCount: number;
}

export default function TabBar({ tab, setTab, accent, reviewCount, vouchCount, badgeCount }: TabBarProps) {
  const tabs = [
    { key: "reviews", label: "Reviews", icon: "star", count: reviewCount },
    { key: "vouches", label: "Vouches", icon: "users", count: vouchCount },
    { key: "badges", label: "Badges", icon: "shield", count: badgeCount },
  ];

  return (
    <div style={{ display: "flex", gap: 2, borderBottom: "1px solid #f3f4f6", marginBottom: 20 }}>
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => setTab(t.key)}
          style={{
            padding: "10px 16px",
            border: "none",
            background: "none",
            borderBottom: tab === t.key ? `2px solid ${accent}` : "2px solid transparent",
            color: tab === t.key ? "#111" : "#9ca3af",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            display: "flex",
            alignItems: "center",
            gap: 5,
            transition: "all 0.15s",
            marginBottom: -1,
          }}
        >
          <Icon name={t.icon} size={13} />
          {t.label}
        </button>
      ))}
    </div>
  );
}
