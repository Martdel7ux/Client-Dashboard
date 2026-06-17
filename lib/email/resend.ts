import "server-only";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM_EMAIL ?? "Tamplo <onboarding@resend.dev>";

const resend = apiKey ? new Resend(apiKey) : null;

export interface EmailResult {
  sent: boolean;
  skipped?: boolean;
  error?: string;
}

/**
 * Sends an email via Resend. If no RESEND_API_KEY is configured the call is a
 * no-op (skipped: true) so the surrounding flow never breaks during setup.
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<EmailResult> {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY missing — skipped "${subject}" → ${to}`);
    return { sent: false, skipped: true };
  }
  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) return { sent: false, error: error.message };
    return { sent: true };
  } catch (e) {
    return { sent: false, error: e instanceof Error ? e.message : "send failed" };
  }
}

export { FROM as EMAIL_FROM };
