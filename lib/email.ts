import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const FROM_HELLO = "TutorCard <hello@tutorcard.co>";
export const FROM_NOTIFICATIONS = "TutorCard <notifications@tutorcard.co>";

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
