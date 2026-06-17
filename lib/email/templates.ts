import type { ProjectStage } from "@/lib/supabase/database.types";
import { STAGE_META } from "@/lib/stages";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/** Shared dark-mode email shell so every message looks on-brand. */
function shell(body: string, opts: { cta?: { label: string; href: string } } = {}) {
  const cta = opts.cta
    ? `<tr><td style="padding-top:8px">
         <a href="${opts.cta.href}" style="display:inline-block;background:#6366F1;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:10px">${opts.cta.label}</a>
       </td></tr>`
    : "";
  return `
  <div style="background:#0A0A0A;padding:40px 0;font-family:-apple-system,Segoe UI,Inter,Helvetica,Arial,sans-serif">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#111111;border:1px solid #1F1F1F;border-radius:16px;overflow:hidden">
          <tr><td style="padding:28px 32px 0">
            <span style="color:#FAFAFA;font-size:17px;font-weight:800;letter-spacing:-0.02em">Tamplo</span>
          </td></tr>
          <tr><td style="padding:20px 32px 32px">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${body}
              ${cta}
            </table>
          </td></tr>
        </table>
        <p style="color:#52525B;font-size:12px;margin-top:20px">Tamplo · Project Studio</p>
      </td></tr>
    </table>
  </div>`;
}

function h(text: string) {
  return `<tr><td style="color:#FAFAFA;font-size:22px;font-weight:800;letter-spacing:-0.02em;padding-bottom:12px">${text}</td></tr>`;
}
function p(text: string) {
  return `<tr><td style="color:#A1A1AA;font-size:14px;line-height:1.6;padding-bottom:16px">${text}</td></tr>`;
}

export function welcomeEmail(opts: {
  name: string;
  email: string;
  password: string;
  projectTitle: string;
}) {
  return {
    subject: `Your Tamplo project portal is ready`,
    html: shell(
      h(`Welcome, ${opts.name.split(" ")[0]}`) +
        p(`Your project <strong style="color:#FAFAFA">${opts.projectTitle}</strong> is set up and ready. Use the details below to sign in to your portal.`) +
        `<tr><td style="background:#0D0D0D;border:1px solid #1F1F1F;border-radius:10px;padding:16px;margin-bottom:8px">
          <div style="color:#71717A;font-size:12px;text-transform:uppercase;letter-spacing:0.06em">Email</div>
          <div style="color:#FAFAFA;font-size:14px;padding:2px 0 12px">${opts.email}</div>
          <div style="color:#71717A;font-size:12px;text-transform:uppercase;letter-spacing:0.06em">Temporary password</div>
          <div style="color:#FAFAFA;font-size:14px;font-family:monospace;padding-top:2px">${opts.password}</div>
        </td></tr>` +
        p(`<span style="color:#71717A;font-size:13px">We recommend changing your password after your first sign-in.</span>`),
      { cta: { label: "Open your portal", href: `${APP_URL}/login` } },
    ),
  };
}

const STAGE_MESSAGE: Record<ProjectStage, string> = {
  discovery: "We've kicked things off. We're defining goals, scope, and direction for your project.",
  wireframes: "We're now structuring the layout and user flow with wireframes.",
  design: "Design has begun. We're crafting the visual identity of your project.",
  development: "We're building it for real now, turning the designs into a working product.",
  review: "We're in the final review. Time for polish and your sign-off.",
  launched: "Your project is live. Congratulations!",
};

export function stageAdvancedEmail(opts: {
  name: string;
  projectTitle: string;
  stage: ProjectStage;
}) {
  const meta = STAGE_META[opts.stage];
  return {
    subject: `${opts.projectTitle} is now in ${meta.label}`,
    html: shell(
      h(`Now in ${meta.label}`) +
        p(`Hi ${opts.name.split(" ")[0]}, your project <strong style="color:#FAFAFA">${opts.projectTitle}</strong> has moved to the <strong style="color:#6366F1">${meta.label}</strong> stage.`) +
        p(STAGE_MESSAGE[opts.stage]),
      { cta: { label: "View your dashboard", href: `${APP_URL}/dashboard` } },
    ),
  };
}

export function projectLiveEmail(opts: { name: string; projectTitle: string }) {
  return {
    subject: `🎉 ${opts.projectTitle} is live`,
    html: shell(
      h(`You're live!`) +
        p(`Congratulations ${opts.name.split(" ")[0]} — <strong style="color:#FAFAFA">${opts.projectTitle}</strong> is now launched and live to the world.`) +
        p(`Need a change down the line? You can submit post-launch requests right from your portal.`),
      { cta: { label: "Open your portal", href: `${APP_URL}/dashboard` } },
    ),
  };
}

export function invoiceEmail(opts: {
  name: string;
  title: string;
  amountLabel: string;
  payUrl: string;
}) {
  return {
    subject: `Invoice for "${opts.title}" — ${opts.amountLabel}`,
    html: shell(
      h(`Invoice ready`) +
        p(`Hi ${opts.name.split(" ")[0]}, here's the invoice for your change request <strong style="color:#FAFAFA">${opts.title}</strong>.`) +
        p(`Amount due: <strong style="color:#FAFAFA">${opts.amountLabel}</strong>`),
      { cta: { label: "Pay invoice", href: opts.payUrl } },
    ),
  };
}
