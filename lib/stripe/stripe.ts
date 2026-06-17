import "server-only";
import Stripe from "stripe";

const secret = process.env.STRIPE_SECRET_KEY;

export const stripe = secret
  ? new Stripe(secret, { apiVersion: "2025-02-24.acacia" })
  : null;

export interface PaymentLinkResult {
  url: string | null;
  skipped?: boolean;
  error?: string;
}

/**
 * Creates a one-off Stripe Payment Link for a change-request fee.
 * If STRIPE_SECRET_KEY is missing, returns skipped:true so the invoice flow
 * still proceeds (the admin can attach a link later).
 */
export async function createChangeRequestPaymentLink(opts: {
  title: string;
  amountEuros: number;
}): Promise<PaymentLinkResult> {
  if (!stripe) {
    console.warn("[stripe] STRIPE_SECRET_KEY missing — payment link skipped");
    return { url: null, skipped: true };
  }
  try {
    const price = await stripe.prices.create({
      currency: "eur",
      unit_amount: Math.round(opts.amountEuros * 100),
      product_data: { name: `Change request: ${opts.title}` },
    });
    const link = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
    });
    return { url: link.url };
  } catch (e) {
    return { url: null, error: e instanceof Error ? e.message : "stripe error" };
  }
}
