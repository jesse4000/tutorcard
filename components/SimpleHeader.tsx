import Link from "next/link";

export default function SimpleHeader() {
  return (
    <header style={{
      background: "white", borderBottom: "1px solid #f3f4f6",
      padding: "0 24px", height: 56, display: "flex", alignItems: "center",
      justifyContent: "center", flexShrink: 0,
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
        <div style={{ width: 24, height: 24, borderRadius: 6, background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "white" }}>tc</span>
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>tutorcard</span>
      </Link>
    </header>
  );
}
