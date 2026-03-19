import type { Metadata } from "next";
import RespondClient from "./RespondClient";

export const metadata: Metadata = {
  title: "Respond to Review Report",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function RespondPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", background: "#f5f5f4" }}>
        <div style={{ textAlign: "center", padding: 32 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111", margin: "0 0 8px" }}>Invalid link</h1>
          <p style={{ fontSize: 14, color: "#9ca3af" }}>This response link is missing or invalid.</p>
        </div>
      </div>
    );
  }

  return <RespondClient token={token} />;
}
