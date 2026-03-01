export default function QrSvg({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 54 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ borderRadius: 5 }}
    >
      <rect width="54" height="54" fill="white" />
      <rect x="3" y="3" width="14" height="14" rx="2" fill="#18181b" />
      <rect x="5" y="5" width="10" height="10" rx="1" fill="white" />
      <rect x="7" y="7" width="6" height="6" rx="1" fill="#18181b" />
      <rect x="37" y="3" width="14" height="14" rx="2" fill="#18181b" />
      <rect x="39" y="5" width="10" height="10" rx="1" fill="white" />
      <rect x="41" y="7" width="6" height="6" rx="1" fill="#18181b" />
      <rect x="3" y="37" width="14" height="14" rx="2" fill="#18181b" />
      <rect x="5" y="39" width="10" height="10" rx="1" fill="white" />
      <rect x="7" y="41" width="6" height="6" rx="1" fill="#18181b" />
      <rect x="20" y="3" width="3" height="3" rx="0.5" fill="#18181b" />
      <rect x="25" y="3" width="3" height="3" rx="0.5" fill="#18181b" />
      <rect x="31" y="3" width="3" height="3" rx="0.5" fill="#18181b" />
      <rect x="20" y="8" width="3" height="3" rx="0.5" fill="#18181b" />
      <rect x="28" y="8" width="3" height="3" rx="0.5" fill="#18181b" />
      <rect x="20" y="13" width="3" height="3" rx="0.5" fill="#18181b" />
      <rect x="25" y="13" width="3" height="3" rx="0.5" fill="#18181b" />
      <rect x="31" y="13" width="3" height="3" rx="0.5" fill="#18181b" />
      <rect x="31" y="20" width="6" height="3" rx="0.5" fill="#fb923c" />
      <rect x="20" y="25" width="8" height="3" rx="0.5" fill="#18181b" />
      <rect x="3" y="25" width="3" height="3" rx="0.5" fill="#18181b" />
      <rect x="14" y="20" width="3" height="3" rx="0.5" fill="#18181b" />
      <rect x="25" y="37" width="3" height="3" rx="0.5" fill="#18181b" />
      <rect x="39" y="42" width="9" height="3" rx="0.5" fill="#18181b" />
      <rect x="20" y="42" width="6" height="3" rx="0.5" fill="#18181b" />
    </svg>
  );
}
