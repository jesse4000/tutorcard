import { ImageResponse } from "@vercel/og";

export const alt = "TutorCard Profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

// Use direct REST fetch to avoid any client library issues in OG image context
async function fetchTutor(slug: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const res = await fetch(
    `${url}/rest/v1/tutors?slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return rows?.[0] ?? null;
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let tutor: Record<string, unknown> | null = null;
  try {
    tutor = await fetchTutor(slug);
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
          backgroundColor: "#f8fafc",
          fontSize: 48,
          color: "#64748b",
        }}
      >
        Card not found
      </div>,
      { ...size }
    );
  }

  const name = `${tutor.first_name} ${tutor.last_name}`;
  const accent = (tutor.avatar_color as string) || "#0f172a";
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
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fafafa",
        position: "relative",
      }}
    >
      {/* Card container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
        }}
      >
        {/* Avatar */}
        <div
          style={{
            display: "flex",
            marginBottom: 28,
          }}
        >
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              width={140}
              height={140}
              style={{
                borderRadius: 70,
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: 70,
                backgroundColor: accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: 52,
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
            fontSize: 48,
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
              fontSize: 24,
              color: "#4a4a4a",
              lineHeight: 1.4,
              display: "flex",
              textAlign: "center",
              marginTop: 12,
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
              color: "#888888",
              marginTop: 10,
              display: "flex",
              textAlign: "center",
            }}
          >
            {locations.slice(0, 3).join("  ·  ")}
          </div>
        )}
      </div>

      {/* Footer branding */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* Small dark rounded square icon */}
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
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          tc
        </div>
        <div
          style={{
            fontSize: 20,
            color: "#888888",
            fontWeight: 600,
            display: "flex",
          }}
        >
          tutorcard.co
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
