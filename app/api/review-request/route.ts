import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { reviewRequestEmail } from "@/lib/email-templates";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { to, slug, exam, scoreBefore, scoreAfter, timeframe } = body;

    if (!to || !slug) {
      return NextResponse.json(
        { error: "to and slug are required" },
        { status: 400 }
      );
    }

    // Verify the user owns this slug
    const { data: tutor } = await supabase
      .from("tutors")
      .select("first_name, last_name, slug")
      .eq("user_id", user.id)
      .eq("slug", slug)
      .single();

    if (!tutor) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Build review URL with optional query params
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tutorcard.co";
    const params = new URLSearchParams();
    if (exam) params.set("exam", exam);
    if (scoreBefore) params.set("before", scoreBefore);
    if (scoreAfter) params.set("after", scoreAfter);
    if (timeframe) params.set("timeframe", timeframe);
    const qs = params.toString();
    const reviewUrl = `${siteUrl}/${slug}/review${qs ? `?${qs}` : ""}`;

    const tutorName = `${tutor.first_name} ${tutor.last_name}`.trim();
    const tpl = reviewRequestEmail(tutorName, reviewUrl);

    await sendEmail({ to: to.trim(), ...tpl });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
