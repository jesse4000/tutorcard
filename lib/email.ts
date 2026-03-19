import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const FROM_HELLO = "TutorCard <hello@tutorcard.co>";
export const FROM_NOTIFICATIONS = "TutorCard <notifications@tutorcard.co>";

/**
 * Resolves the best email address for a tutor: uses tutor.email if set,
 * otherwise falls back to the auth user's email via user_id.
 */
export async function getTutorNotificationEmail(tutorId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data: tutor } = await admin
    .from("tutors")
    .select("email, user_id")
    .eq("id", tutorId)
    .single();

  if (!tutor) return null;

  if (tutor.email) return tutor.email;

  if (tutor.user_id) {
    const { data: authUser } = await admin.auth.admin.getUserById(tutor.user_id);
    if (authUser?.user?.email) return authUser.user.email;
  }

  return null;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: SendEmailOptions) {
  if (!resend) {
    console.log(`[Email dev] To: ${to} | Subject: ${subject}`);
    return { success: true, dev: true };
  }

  const { error } = await resend.emails.send({
    from: from || FROM_NOTIFICATIONS,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return { success: true };
}
