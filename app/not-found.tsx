import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function NotFound() {
  return (
    <>
      <Navbar mode="landing" />
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "100px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h1
          style={{
            fontFamily: "'Lora', serif",
            fontSize: 28,
            fontStyle: "italic",
            fontWeight: 400,
            marginBottom: 10,
          }}
        >
          Card not found
        </h1>
        <p style={{ color: "var(--ink-2)", marginBottom: 24, fontSize: 15 }}>
          This tutor card doesn&apos;t exist yet.
        </p>
        <Link
          href="/create"
          style={{
            background: "var(--ink)",
            color: "white",
            padding: "12px 24px",
            borderRadius: 9,
            fontSize: 14,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Create your own card →
        </Link>
      </div>
    </>
  );
}
