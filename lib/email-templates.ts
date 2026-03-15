const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tutorcard.co";

// ─── BASE LAYOUT ────────────────────────────────────────
function baseLayout(content: string): string {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
      <div style="padding: 32px 24px;">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 28px;">
          <div style="width: 24px; height: 24px; border-radius: 6px; background: #111; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 11px; font-weight: 700; color: white;">tc</span>
          </div>
          <span style="font-size: 15px; font-weight: 700; color: #111;">tutorcard</span>
        </div>
        ${content}
        <div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            &copy; TutorCard &middot; <a href="${SITE_URL}" style="color: #9ca3af;">tutorcard.co</a>
          </p>
        </div>
      </div>
    </div>
  `;
}

function button(text: string, href: string): string {
  return `<a href="${href}" style="display: inline-block; padding: 14px 28px; background: #111; color: white; text-decoration: none; border-radius: 12px; font-size: 15px; font-weight: 600;">${text}</a>`;
}

function p(text: string): string {
  return `<p style="font-size: 15px; color: #374151; line-height: 1.6; margin: 0 0 20px;">${text}</p>`;
}

function heading(text: string): string {
  return `<h1 style="font-size: 22px; font-weight: 700; margin: 0 0 12px; color: #111;">${text}</h1>`;
}

function quote(text: string): string {
  return `
    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px 18px; margin: 0 0 20px;">
      <p style="font-size: 14px; color: #6b7280; line-height: 1.55; margin: 0; font-style: italic;">"${text}"</p>
    </div>
  `;
}

function muted(text: string): string {
  return `<p style="font-size: 13px; color: #9ca3af; line-height: 1.5; margin: 24px 0 0;">${text}</p>`;
}

// ─── TEMPLATES ──────────────────────────────────────────

export function welcomeEmail(tutorName: string, slug: string) {
  const profileUrl = `${SITE_URL}/${slug}`;
  const dashboardUrl = `${SITE_URL}/dashboard`;
  return {
    subject: "Welcome to TutorCard!",
    html: baseLayout(`
      ${heading(`Welcome to TutorCard, ${tutorName}!`)}
      ${p("Your TutorCard is live. Parents and students can now find you, read your reviews, and reach out directly.")}
      ${p("Here's what to do next:")}
      <ul style="font-size: 15px; color: #374151; line-height: 1.8; margin: 0 0 20px; padding-left: 20px;">
        <li><strong>Share your card</strong> — Send your link to parents and students</li>
        <li><strong>Request reviews</strong> — Ask past students to leave a review</li>
        <li><strong>Get vouched</strong> — Invite fellow tutors to vouch for you</li>
      </ul>
      ${button("View your card", profileUrl)}
      ${muted(`Or manage everything from your <a href="${dashboardUrl}" style="color: #9ca3af;">dashboard</a>.`)}
    `),
  };
}

export function newReviewEmail(
  tutorName: string,
  reviewerName: string,
  rating: number,
  exam: string | null,
  quoteText: string,
) {
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
  const examLine = exam ? ` for <strong>${exam}</strong>` : "";
  return {
    subject: `New review from ${reviewerName}`,
    html: baseLayout(`
      ${heading("You received a new review")}
      ${p(`Hi ${tutorName}, <strong>${reviewerName}</strong> just left you a ${rating}-star review${examLine}.`)}
      <div style="margin-bottom: 20px; font-size: 18px; color: #f59e0b; letter-spacing: 2px;">${stars}</div>
      ${quote(quoteText.length > 200 ? quoteText.slice(0, 200) + "…" : quoteText)}
      ${p("Log in to your dashboard to see the full review and manage your reviews.")}
      ${button("View your reviews", `${SITE_URL}/dashboard`)}
    `),
  };
}

export function vouchReceivedEmail(tutorName: string, voucherName: string, voucherSlug: string | null) {
  const voucherLink = voucherSlug
    ? `<a href="${SITE_URL}/${voucherSlug}" style="color: #111; font-weight: 600;">${voucherName}</a>`
    : `<strong>${voucherName}</strong>`;
  return {
    subject: `${voucherName} vouched for you on TutorCard`,
    html: baseLayout(`
      ${heading("You received a vouch!")}
      ${p(`Hi ${tutorName}, ${voucherLink} just vouched for you on TutorCard. Vouches from fellow tutors help build trust with parents and students.`)}
      ${button("View your card", `${SITE_URL}/dashboard`)}
    `),
  };
}

export function newInquiryEmail(
  tutorName: string,
  senderName: string,
  senderEmail: string,
  message: string,
  exams: string[],
) {
  const examsLine = exams.length > 0
    ? `<p style="font-size: 13px; color: #6b7280; margin: 0 0 8px;"><strong>Interested in:</strong> ${exams.join(", ")}</p>`
    : "";
  return {
    subject: `New inquiry from ${senderName}`,
    html: baseLayout(`
      ${heading("You have a new inquiry")}
      ${p(`Hi ${tutorName}, <strong>${senderName}</strong> (${senderEmail}) sent you a message through your TutorCard.`)}
      ${examsLine}
      ${quote(message.length > 300 ? message.slice(0, 300) + "…" : message)}
      ${p("Log in to your dashboard to view the full message and respond.")}
      ${button("View inquiries", `${SITE_URL}/dashboard`)}
      ${muted("You can reply directly to this person at " + senderEmail)}
    `),
  };
}

export function reviewFlaggedEmail(
  reviewerName: string,
  tutorName: string,
  reason: string,
  respondUrl: string,
) {
  return {
    subject: "Your review on TutorCard has been flagged",
    html: baseLayout(`
      ${heading("Your review has been flagged")}
      ${p(`Hi ${reviewerName},`)}
      ${p(`Your review for <strong>${tutorName}</strong> on TutorCard has been flagged by the tutor for the following reason:`)}
      ${quote(reason)}
      ${p(`You have <strong>7 days</strong> to respond with additional information to support your review. If you do not respond, your review will be automatically removed.`)}
      ${button("Respond to this report", respondUrl)}
      ${muted("If you did not leave this review, you can safely ignore this email and the review will be removed automatically.")}
    `),
  };
}

export function reviewReportResolvedEmail(
  tutorName: string,
  action: "revoked" | "denied",
  reviewerName: string,
) {
  const isRevoked = action === "revoked";
  const outcomeText = isRevoked
    ? `The review by <strong>${reviewerName}</strong> has been <strong>removed</strong> from your card.`
    : `After review, the report on <strong>${reviewerName}</strong>'s review has been <strong>denied</strong>. The review will remain on your card.`;
  return {
    subject: isRevoked
      ? "Flagged review has been removed"
      : "Review report update",
    html: baseLayout(`
      ${heading(isRevoked ? "Review removed" : "Review report update")}
      ${p(`Hi ${tutorName},`)}
      ${p(outcomeText)}
      ${button("View your card", `${SITE_URL}/dashboard`)}
    `),
  };
}

export function inviteCodeClaimedEmail(
  referrerName: string,
  claimedByName: string,
  claimedBySlug: string,
) {
  const profileUrl = `${SITE_URL}/${claimedBySlug}`;
  return {
    subject: `${claimedByName} joined TutorCard with your invite!`,
    html: baseLayout(`
      ${heading("Your invite was used!")}
      ${p(`Hi ${referrerName}, <strong>${claimedByName}</strong> just joined TutorCard using your invite code.`)}
      ${button("View their card", profileUrl)}
      ${muted("Share more invite codes from your dashboard to grow the TutorCard community.")}
    `),
  };
}

export function reviewRequestEmail(
  tutorName: string,
  reviewUrl: string,
) {
  return {
    subject: `${tutorName} is requesting a review on TutorCard`,
    html: baseLayout(`
      ${heading("Review request")}
      ${p(`<strong>${tutorName}</strong> would like you to leave a review on their TutorCard profile.`)}
      ${p("It only takes a minute — your feedback helps other families find great tutors.")}
      ${button("Leave a review", reviewUrl)}
      ${muted("If you don't know this person, you can safely ignore this email.")}
    `),
  };
}
