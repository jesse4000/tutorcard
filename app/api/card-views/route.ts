import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tutorId } = body;

    if (!tutorId) {
      return NextResponse.json({ error: "tutorId required" }, { status: 400 });
    }

    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      "unknown";
    const ua = headersList.get("user-agent") || "unknown";

    const visitorHash = createHash("sha256")
      .update(`${ip}::${ua}`)
      .digest("hex");

    const referrer = headersList.get("referer") || null;

    const supabase = createAdminClient();

    // Skip if same visitor viewed same tutor within last 30 minutes
    const { data: recent } = await supabase
      .from("card_views")
      .select("id")
      .eq("tutor_id", tutorId)
      .eq("visitor_hash", visitorHash)
      .gte("created_at", new Date(Date.now() - 30 * 60 * 1000).toISOString())
      .limit(1);

    if (recent && recent.length > 0) {
      return NextResponse.json({ success: true, deduplicated: true });
    }

    const { error } = await supabase.from("card_views").insert({
      tutor_id: tutorId,
      visitor_hash: visitorHash,
      referrer,
    });

    if (error) {
      console.error("Card view insert error:", error.message);
      return NextResponse.json(
        { error: "Failed to record view" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
