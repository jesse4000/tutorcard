"use client";

import type { TutorLink } from "./TutorCard";

const LINK_TYPES = [
  "🌐 Website",
  "📅 Booking",
  "📋 Resource",
  "📧 Email",
  "💬 WhatsApp",
];

interface LinkBuilderProps {
  links: TutorLink[];
  onChange: (links: TutorLink[]) => void;
}

export default function LinkBuilder({ links, onChange }: LinkBuilderProps) {
  function updateLink(index: number, field: keyof TutorLink, value: string) {
    const updated = links.map((l, i) =>
      i === index ? { ...l, [field]: value } : l
    );
    onChange(updated);
  }

  function removeLink(index: number) {
    onChange(links.filter((_, i) => i !== index));
  }

  function addLink() {
    onChange([...links, { type: "🌐 Website", url: "", label: "" }]);
  }

  return (
    <div>
      {links.map((link, i) => (
        <div key={i} className="link-item">
          <select
            className="link-type-select"
            value={link.type}
            onChange={(e) => updateLink(i, "type", e.target.value)}
          >
            {LINK_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            <input
              className="link-url-input"
              type="text"
              placeholder="yoursite.com"
              value={link.url}
              onChange={(e) => updateLink(i, "url", e.target.value)}
            />
            <input
              className="link-label-input"
              type="text"
              placeholder="Button label..."
              value={link.label}
              onChange={(e) => updateLink(i, "label", e.target.value)}
            />
          </div>
          <button
            className="link-remove"
            onClick={() => removeLink(i)}
            type="button"
          >
            ×
          </button>
        </div>
      ))}
      <button className="add-link-btn" onClick={addLink} type="button">
        <span style={{ fontSize: 18 }}>+</span>
        Add another link
      </button>
    </div>
  );
}
