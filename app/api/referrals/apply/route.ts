import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/referrals/apply — apply to a referral
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { data: applicantTutor } = await supabase
      .from("tutors")
      .select("id, first_name, last_name, slug")
      .eq("user_id", user.id)
      .single();

    if (!applicantTutor) {
      return NextResponse.json(
        { error: "You need a TutorCard to apply. Create one first!" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { referralId, boughtCoffee } = body;

    if (!referralId) {
      return NextResponse.json(
        { error: "Referral ID is required" },
        { status: 400 }
      );
    }

    // Check referral exists and is active
    const { data: referral } = await supabase
      .from("referrals")
      .select("id, tutor_id, subject")
      .eq("id", referralId)
      .eq("status", "active")
      .single();

    if (!referral) {
      return NextResponse.json(
        { error: "Referral not found or is no longer active" },
        { status: 404 }
      );
    }

    // Can't apply to your own referral
    if (referral.tutor_id === applicantTutor.id) {
      return NextResponse.json(
        { error: "You can't apply to your own referral" },
        { status: 400 }
      );
    }

    // Insert application
    const { data, error } = await supabase
      .from("referral_applications")
      .insert({
        referral_id: referralId,
        applicant_tutor_id: applicantTutor.id,
        bought_coffee: boughtCoffee || false,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "You've already applied to this referral" },
          { status: 409 }
        );
      }
      console.error("Apply error:", error);
      return NextResponse.json(
        { error: "Failed to apply" },
        { status: 500 }
      );
    }

    // Send email notification to referral owner
    const { data: ownerTutor } = await supabase
      .from("tutors")
      .select("email, first_name")
      .eq("id", referral.tutor_id)
      .single();

    if (ownerTutor?.email) {
      // Fire and forget — don't block the response
      const origin = request.headers.get("origin") || "";
      sendApplicationEmail({
        to: ownerTutor.email,
        ownerName: ownerTutor.first_name,
        applicantName: `${applicantTutor.first_name} ${applicantTutor.last_name}`,
        applicantSlug: applicantTutor.slug,
        subject: referral.subject,
        boughtCoffee: boughtCoffee || false,
        origin,
      }).catch((err) => console.error("Email send error:", err));
    }

    return NextResponse.json({ success: true, application: data });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

async function sendApplicationEmail(params: {
  to: string;
  ownerName: string;
  applicantName: string;
  applicantSlug: string;
  subject: string;
  boughtCoffee: boolean;
  origin: string;
}) {
  // Use Supabase Edge Function or external email service
  // For now, we'll use a simple fetch to a /api/email endpoint
  const { to, ownerName, applicantName, applicantSlug, subject, boughtCoffee, origin } = params;
  const coffeeNote = boughtCoffee ? ` and bought you a coffee ☕` : "";
  const cardUrl = `${origin}/${applicantSlug}`;

  try {
    await fetch(`${origin}/api/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to,
        subject: `${applicantName} applied to your ${subject} referral`,
        html: `
          <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 480px; margin: 0 auto;">
            <p>Hi ${ownerName},</p>
            <p><strong>${applicantName}</strong> applied to your <strong>${subject}</strong> referral${coffeeNote}.</p>
            <p>View their TutorCard to see if they're a good fit:</p>
            <p><a href="${cardUrl}" style="display: inline-block; background: #18181b; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">View ${applicantName}'s Card</a></p>
            <p>You can accept or decline this application from your <a href="${origin}/dashboard">dashboard</a>.</p>
            <p style="color: #a1a1aa; font-size: 13px; margin-top: 24px;">— TutorCard by StudySpaces</p>
          </div>
        `,
      }),
    });
  } catch (err) {
    console.error("Failed to send application email:", err);
  }
}
