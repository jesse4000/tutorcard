export default function LogoSvg({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 34 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2" y="7" width="26" height="18" rx="4" fill="#18181b" />
      <rect x="2" y="7" width="26" height="5" rx="4" fill="#27272a" />
      <rect x="2" y="10" width="26" height="2" fill="#27272a" />
      <rect
        x="23"
        y="2"
        width="7"
        height="3"
        rx="1.5"
        fill="#fb923c"
        transform="rotate(45 23 2)"
      />
      <rect
        x="25.5"
        y="4.5"
        width="7"
        height="3"
        fill="#fcd34d"
        transform="rotate(45 25.5 4.5)"
      />
      <polygon points="28,7 30,9 29,9.5" fill="#e07b00" />
      <rect
        x="6"
        y="16"
        width="10"
        height="1.5"
        rx="0.75"
        fill="rgba(255,255,255,0.25)"
      />
      <rect
        x="6"
        y="19.5"
        width="7"
        height="1.5"
        rx="0.75"
        fill="rgba(255,255,255,0.15)"
      />
      <circle cx="22" cy="19.5" r="3" fill="#fb923c" />
    </svg>
  );
}
