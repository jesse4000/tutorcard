import { ImageResponse } from "@vercel/og";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const alt = "TutorCard Profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let tutor: Record<string, unknown> | null = null;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("tutors")
      .select("*")
      .eq("slug", slug)
      .single();
    tutor = data;
  } catch (e) {
    console.error("OG image fetch error:", e);
  }

  if (!tutor) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
            borderRadius: 24,
            width: 1100,
            height: 530,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ fontSize: 36, color: "#94a3b8", display: "flex" }}>
            Card not found
          </div>
        </div>
      </div>,
      { ...size }
    );
  }

  const name = `${tutor.first_name} ${tutor.last_name}`;
  const accent = (tutor.avatar_color as string) || "#f59e0b";
  const locations = (tutor.locations as string[]) || [];
  const initials = `${((tutor.first_name as string) || "")[0] || ""}${((tutor.last_name as string) || "")[0] || ""}`.toUpperCase();
  const title = tutor.title as string | null;
  const profileImageUrl = tutor.profile_image_url as string | null;

  // Load font
  let fontData: ArrayBuffer | undefined;
  try {
    const cssRes = await fetch(
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap"
    );
    const css = await cssRes.text();
    const fontFileUrl = css.match(/url\(([^)]+)\)/)?.[1];
    if (fontFileUrl) {
      const fontRes = await fetch(fontFileUrl);
      fontData = await fontRes.arrayBuffer();
    }
  } catch {
    // Fall back to default font
  }

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Card */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          borderRadius: 24,
          width: 1100,
          height: 530,
          position: "relative",
        }}
      >
        {/* Avatar */}
        <div style={{ display: "flex", marginBottom: 24 }}>
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              width={120}
              height={120}
              style={{
                borderRadius: 60,
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: 44,
                fontWeight: 700,
              }}
            >
              {initials}
            </div>
          )}
        </div>

        {/* Name */}
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: "#1a1a1a",
            lineHeight: 1.1,
            display: "flex",
            textAlign: "center",
          }}
        >
          {name}
        </div>

        {/* Title / Headline */}
        {title && (
          <div
            style={{
              fontSize: 22,
              color: "#6b7280",
              lineHeight: 1.4,
              display: "flex",
              textAlign: "center",
              marginTop: 10,
            }}
          >
            {title.length > 80 ? title.slice(0, 77) + "..." : title}
          </div>
        )}

        {/* Location */}
        {locations.length > 0 && (
          <div
            style={{
              fontSize: 20,
              color: "#9ca3af",
              marginTop: 8,
              display: "flex",
              textAlign: "center",
            }}
          >
            {locations.slice(0, 3).join("  \u00b7  ")}
          </div>
        )}

        {/* Footer branding */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              backgroundColor: "#333333",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            tc
          </div>
          <div
            style={{
              fontSize: 19,
              color: "#9ca3af",
              fontWeight: 600,
              display: "flex",
            }}
          >
            tutorcard.co
          </div>
        </div>
      </div>
    </div>,
    {
      ...size,
      ...(fontData
        ? {
            fonts: [
              {
                name: "Plus Jakarta Sans",
                data: fontData,
                style: "normal" as const,
                weight: 600 as const,
              },
            ],
          }
        : {}),
    }
  );
}
