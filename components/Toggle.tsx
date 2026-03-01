"use client";

interface ToggleProps {
  title: string;
  subtitle: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

export default function Toggle({
  title,
  subtitle,
  checked,
  onChange,
}: ToggleProps) {
  return (
    <div
      className={`toggle-row${checked ? " on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <div className="toggle-info">
        <div className="toggle-title">{title}</div>
        <div className="toggle-sub">{subtitle}</div>
      </div>
      <div className="toggle-switch" />
    </div>
  );
}
