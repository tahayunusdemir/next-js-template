'use server';

import type * as z from 'zod';
import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { contactMessageSchema } from '@/models/Schema';
import { ContactValidation, NewsletterValidation } from '@/validations/LeadValidation';

export type LeadResult = { ok: boolean };

/**
 * Validates a newsletter subscription on the server.
 * @param values - The submitted email payload.
 * @returns Whether the subscription was accepted.
 */
export async function subscribeNewsletter(
  values: z.infer<typeof NewsletterValidation>,
): Promise<LeadResult> {
  const parsed = NewsletterValidation.safeParse(values);

  if (!parsed.success) {
    return { ok: false };
  }

  // TODO: persist the address or forward it to an email provider.
  await Promise.resolve();
  return { ok: true };
}

/**
 * Validates a contact form submission on the server.
 * @param values - The submitted contact payload.
 * @returns Whether the message was accepted.
 */
export async function sendContactMessage(
  values: z.infer<typeof ContactValidation>,
): Promise<LeadResult> {
  const parsed = ContactValidation.safeParse(values);

  if (!parsed.success) {
    return { ok: false };
  }

  await db.insert(contactMessageSchema).values(parsed.data);
  logger.info('Contact message stored');

  return { ok: true };
}
