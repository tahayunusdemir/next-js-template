'use server';

import type * as z from 'zod';
import { getPlan, isPaidPlan } from '@/lib/plans';
import { logger } from '@/libs/Logger';
import { CheckoutValidation } from '@/validations/CheckoutValidation';

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; reason: 'invalid' | 'unavailable' };

/**
 * Starts a checkout for the selected plan. Stripe billing is not live yet, so
 * this validates the request and reports that checkout is unavailable.
 *
 * When Stripe is wired up, resolve the price id and create a session here:
 *   const stripe = new Stripe(Env.STRIPE_SECRET_KEY);
 *   const session = await stripe.checkout.sessions.create({
 *     mode: 'subscription',
 *     line_items: [{ price: plan.stripePriceId[values.billing], quantity: 1 }],
 *     customer_email: values.email,
 *     success_url: `${Env.NEXT_PUBLIC_APP_URL}/dashboard`,
 *     cancel_url: `${Env.NEXT_PUBLIC_APP_URL}/pricing`,
 *   });
 *   return { ok: true, url: session.url };
 *
 * @param values - The submitted checkout payload (plan, billing period, contact).
 * @returns A redirect URL once billing is live, or why checkout was rejected.
 */
export async function createCheckoutSession(
  values: z.infer<typeof CheckoutValidation>,
): Promise<CheckoutResult> {
  const parsed = CheckoutValidation.safeParse(values);

  if (!parsed.success) {
    return { ok: false, reason: 'invalid' };
  }

  const plan = getPlan(parsed.data.plan);

  if (!plan || !isPaidPlan(plan)) {
    return { ok: false, reason: 'invalid' };
  }

  // Billing is not live yet, so no plan carries a Stripe price id. Once it does,
  // create and return the checkout session here (see the example above); the
  // awaited Stripe call also satisfies the async server-action contract.
  logger.info('Checkout requested before billing is live', { plan: plan.id });
  await Promise.resolve();

  return { ok: false, reason: 'unavailable' };
}
