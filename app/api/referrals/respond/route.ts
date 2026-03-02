import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/referrals/respond — accept or decline an application
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

    const { data: ownerTutor } = await supabase
      .from("tutors")
      .select("id, first_name, last_name")
      .eq("user_id", user.id)
      .single();

    if (!ownerTutor) {
      return NextResponse.json(
        { error: "You need a TutorCard first" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { applicationId, action } = body;

    if (!applicationId || !["accepted", "declined"].includes(action)) {
      return NextResponse.json(
        { error: "applicationId and action (accepted/declined) are required" },
        { status: 400 }
      );
    }

    // Verify ownership: the application must belong to a referral this tutor owns
    const { data: application } = await supabase
      .from("referral_applications")
      .select(
        `id, referral_id, applicant_tutor_id, referrals!inner(tutor_id, subject)`
      )
      .eq("id", applicationId)
      .single();

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const referral = application.referrals as unknown as {
      tutor_id: string;
      subject: string;
    };

    if (referral.tutor_id !== ownerTutor.id) {
      return NextResponse.json(
        { error: "You don't own this referral" },
        { status: 403 }
      );
    }

    // Update application status
    const { data, error } = await supabase
      .from("referral_applications")
      .update({
        status: action,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId)
      .select()
      .single();

    if (error) {
      console.error("Respond error:", error);
      return NextResponse.json(
        { error: "Failed to update application" },
        { status: 500 }
      );
    }

    // Notify applicant via email
    const { data: applicantTutor } = await supabase
      .from("tutors")
      .select("email, first_name")
      .eq("id", application.applicant_tutor_id)
      .single();

    if (applicantTutor?.email) {
      const origin = request.headers.get("origin") || "";
      sendResponseEmail({
        to: applicantTutor.email,
        applicantName: applicantTutor.first_name,
        ownerName: `${ownerTutor.first_name} ${ownerTutor.last_name}`,
        subject: referral.subject,
        action,
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

async function sendResponseEmail(params: {
  to: string;
  applicantName: string;
  ownerName: string;
  subject: string;
  action: string;
  origin: string;
}) {
  const { to, applicantName, ownerName, subject, action, origin } = params;
  const isAccepted = action === "accepted";
  const emoji = isAccepted ? "🎉" : "😔";
  const statusText = isAccepted ? "accepted" : "declined";
  const message = isAccepted
    ? `Great news! <strong>${ownerName}</strong> accepted your application for their <strong>${subject}</strong> referral. They'll be reaching out to connect you with the student.`
    : `<strong>${ownerName}</strong> has decided to go with another tutor for their <strong>${subject}</strong> referral. Don't worry — more referrals are posted regularly!`;

  try {
    await fetch(`${origin}/api/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to,
        subject: `${emoji} Your ${subject} referral application was ${statusText}`,
        html: `
          <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 480px; margin: 0 auto;">
            <p>Hi ${applicantName},</p>
            <p>${message}</p>
            <p><a href="${origin}/dashboard" style="display: inline-block; background: #18181b; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">Go to Dashboard</a></p>
            <p style="color: #a1a1aa; font-size: 13px; margin-top: 24px;">— TutorCard by StudySpaces</p>
          </div>
        `,
      }),
    });
  } catch (err) {
    console.error("Failed to send response email:", err);
  }
}
