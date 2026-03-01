"use client";

import { useState } from "react";

interface TagPickerProps {
  label: string;
  presets: string[];
  selected: string[];
  onChange: (tags: string[]) => void;
  customPlaceholder?: string;
}

export default function TagPicker({
  label,
  presets,
  selected,
  onChange,
  customPlaceholder = "Add another...",
}: TagPickerProps) {
  const [customValue, setCustomValue] = useState("");

  const allOptions = [...new Set([...presets, ...selected])];

  function toggle(tag: string) {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  }

  function addCustom() {
    const val = customValue.trim();
    if (!val) return;
    if (!selected.includes(val)) {
      onChange([...selected, val]);
    }
    setCustomValue("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustom();
    }
  }

  return (
    <div className="field">
      <label className="field-label">{label}</label>
      <div className="tag-grid">
        {allOptions.map((tag) => (
          <div
            key={tag}
            className={`tag-option${selected.includes(tag) ? " selected" : ""}`}
            onClick={() => toggle(tag)}
          >
            {tag}
          </div>
        ))}
      </div>
      <div className="tag-custom-row">
        <input
          className="tag-custom-input"
          type="text"
          placeholder={customPlaceholder}
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="tag-custom-btn" onClick={addCustom} type="button">
          + Add
        </button>
      </div>
    </div>
  );
}
