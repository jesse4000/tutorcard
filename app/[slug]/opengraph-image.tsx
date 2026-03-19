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

async function fetchReviewStats(tutorId: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { avgRating: null, reviewCount: 0 };

  const res = await fetch(
    `${url}/rest/v1/reviews?tutor_id=eq.${encodeURIComponent(tutorId)}&is_revoked=eq.false&select=rating`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    }
  );
  if (!res.ok) return { avgRating: null, reviewCount: 0 };
  const reviews = await res.json();
  const ratings = (reviews || []).map((r: { rating: number }) => r.rating);
  const avgRating =
    ratings.length > 0
      ? Math.round((ratings.reduce((s: number, r: number) => s + r, 0) / ratings.length) * 10) / 10
      : null;
  return { avgRating, reviewCount: ratings.length };
}

async function fetchVouchCount(tutorId: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return 0;

  const res = await fetch(
    `${url}/rest/v1/vouches?vouched_tutor_id=eq.${encodeURIComponent(tutorId)}&select=id`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "count=exact",
      },
    }
  );
  if (!res.ok) return 0;
  const countHeader = res.headers.get("content-range");
  if (countHeader) {
    const match = countHeader.match(/\/(\d+)/);
    if (match) return parseInt(match[1], 10);
  }
  const rows = await res.json();
  return rows?.length ?? 0;
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

  const tutorId = tutor.id as string;
  const [{ avgRating, reviewCount }, vouchCount] = await Promise.all([
    fetchReviewStats(tutorId),
    fetchVouchCount(tutorId),
  ]);

  const name = `${tutor.first_name} ${tutor.last_name}`;
  const accent = (tutor.avatar_color as string) || "#0f172a";
  const exams = (tutor.exams as string[]) || [];
  const subjects = (tutor.subjects as string[]) || [];
  const locations = (tutor.locations as string[]) || [];
  const allTags = [...exams, ...subjects].slice(0, 5);
  const initials = `${((tutor.first_name as string) || "")[0] || ""}${((tutor.last_name as string) || "")[0] || ""}`.toUpperCase();
  const title = tutor.title as string | null;
  const profileImageUrl = tutor.profile_image_url as string | null;

  // Load font
  let fontData: ArrayBuffer | undefined;
  try {
    const cssRes = await fetch(
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700&display=swap"
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
        backgroundColor: "#ffffff",
        position: "relative",
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          width: "100%",
          height: 8,
          backgroundColor: accent,
          display: "flex",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          padding: "48px 56px",
          flex: 1,
          gap: 48,
        }}
      >
        {/* Left: Avatar */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              width={160}
              height={160}
              style={{
                borderRadius: 80,
                objectFit: "cover",
                border: `4px solid ${accent}`,
              }}
            />
          ) : (
            <div
              style={{
                width: 160,
                height: 160,
                borderRadius: 80,
                backgroundColor: accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: 56,
                fontWeight: 700,
              }}
            >
              {initials}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#0f172a",
              lineHeight: 1.1,
              display: "flex",
            }}
          >
            {name}
          </div>

          {title && (
            <div
              style={{
                fontSize: 24,
                color: "#475569",
                lineHeight: 1.3,
                display: "flex",
              }}
            >
              {title.length > 80
                ? title.slice(0, 77) + "..."
                : title}
            </div>
          )}

          {/* Tags */}
          {allTags.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 8,
              }}
            >
              {allTags.map((tag) => (
                <div
                  key={tag}
                  style={{
                    backgroundColor: `${accent}18`,
                    color: accent,
                    padding: "6px 16px",
                    borderRadius: 20,
                    fontSize: 20,
                    fontWeight: 600,
                    display: "flex",
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
          )}

          {/* Location */}
          {locations.length > 0 && (
            <div
              style={{
                fontSize: 20,
                color: "#64748b",
                marginTop: 4,
                display: "flex",
              }}
            >
              {locations.slice(0, 3).join("  \u00b7  ")}
            </div>
          )}

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: 32,
              marginTop: 12,
            }}
          >
            {avgRating !== null && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 28, display: "flex" }}>★</div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: "#0f172a",
                    display: "flex",
                  }}
                >
                  {avgRating}/5
                </div>
                <div
                  style={{
                    fontSize: 18,
                    color: "#64748b",
                    display: "flex",
                  }}
                >
                  ({reviewCount} review{reviewCount === 1 ? "" : "s"})
                </div>
              </div>
            )}
            {vouchCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: "#0f172a",
                    display: "flex",
                  }}
                >
                  {vouchCount} vouch{vouchCount === 1 ? "" : "es"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer branding */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "0 56px 32px",
          gap: 12,
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#94a3b8",
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
