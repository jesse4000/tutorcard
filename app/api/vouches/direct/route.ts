import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, getTutorNotificationEmail } from "@/lib/email";
import { vouchReceivedEmail } from "@/lib/email-templates";

const AVATAR_COLORS = [
  "#4f46e5", "#0f766e", "#b91c1c", "#7c3aed", "#c2410c",
  "#0369a1", "#15803d", "#a16207", "#be185d", "#0f172a",
];

function randomColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

async function generateUniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  firstName: string,
  lastName: string,
) {
  const base = `${firstName}${lastName}`.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!base) return `tutor-${Date.now()}`;

  // Try base slug, then with numeric suffixes
  for (let i = 0; i < 10; i++) {
    const candidate = i === 0 ? base : `${base}${i}`;
    const { data } = await supabase
      .from("tutors")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
  }
  return `${base}${Date.now()}`;
}

// POST: vouch for a tutor (auto-creates tutor card if needed)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Auth required" }, { status: 401 });
    }

    const body = await request.json();
    const { vouchedTutorId } = body;

    if (!vouchedTutorId) {
      return NextResponse.json({ error: "vouchedTutorId required" }, { status: 400 });
    }

    // Get or create tutor record for the voucher
    let { data: tutor } = await supabase
      .from("tutors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!tutor) {
      // Auto-create a minimal tutor record
      const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Tutor";
      const parts = fullName.trim().split(/\s+/);
      const firstName = parts[0] || "Tutor";
      const lastName = parts.slice(1).join(" ") || "";

      const slug = await generateUniqueSlug(supabase, firstName, lastName);

      const { data: newTutor, error: createError } = await supabase
        .from("tutors")
        .insert({
          user_id: user.id,
          first_name: firstName,
          last_name: lastName,
          slug,
          email: user.email || "",
          avatar_color: randomColor(),
        })
        .select("id")
        .single();

      if (createError || !newTutor) {
        return NextResponse.json({ error: "Failed to create tutor card" }, { status: 500 });
      }
      tutor = newTutor;
    }

    if (vouchedTutorId === tutor.id) {
      return NextResponse.json({ error: "Cannot vouch for yourself" }, { status: 400 });
    }

    // Check if already vouched (idempotent — don't toggle)
    const { data: existing } = await supabase
      .from("vouches")
      .select("id")
      .eq("voucher_tutor_id", tutor.id)
      .eq("vouched_tutor_id", vouchedTutorId)
      .maybeSingle();

    if (!existing) {
      const { error } = await supabase.from("vouches").insert({
        voucher_tutor_id: tutor.id,
        vouched_tutor_id: vouchedTutorId,
      });
      if (error) {
        return NextResponse.json({ error: "Failed to vouch" }, { status: 500 });
      }

      // Notify the vouched tutor
      try {
        const vouchedEmail = await getTutorNotificationEmail(vouchedTutorId);
        const { data: vouchedTutor } = await supabase
          .from("tutors")
          .select("first_name, last_name")
          .eq("id", vouchedTutorId)
          .single();
        const { data: voucherTutor } = await supabase
          .from("tutors")
          .select("first_name, last_name, slug")
          .eq("id", tutor.id)
          .single();
        if (vouchedEmail && vouchedTutor && voucherTutor) {
          const vouchedName = `${vouchedTutor.first_name} ${vouchedTutor.last_name}`.trim();
          const voucherName = `${voucherTutor.first_name} ${voucherTutor.last_name}`.trim();
          const tpl = vouchReceivedEmail(vouchedName, voucherName, voucherTutor.slug || null);
          await sendEmail({ to: vouchedEmail, ...tpl });
        }
      } catch (emailErr) {
        console.error("Failed to send vouch notification:", emailErr);
      }
    }

    // Get fresh count
    const { count } = await supabase
      .from("vouches")
      .select("id", { count: "exact", head: true })
      .eq("vouched_tutor_id", vouchedTutorId);

    return NextResponse.json({
      vouched: true,
      vouchCount: count ?? 0,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
