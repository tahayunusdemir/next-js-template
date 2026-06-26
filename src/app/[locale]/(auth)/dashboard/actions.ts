'use server';

import { currentUser } from '@clerk/nextjs/server';
import type * as z from 'zod';
import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { feedbackSchema } from '@/models/Schema';
import { FeedbackValidation } from '@/validations/FeedbackValidation';

export type FeedbackResult = { ok: boolean };

/**
 * Stores dashboard feedback for the signed-in user, capturing their email from the
 * Clerk session so the form never asks for it.
 * @param values - The submitted feedback message.
 * @returns Whether the feedback was accepted.
 */
export async function sendFeedback(
  values: z.infer<typeof FeedbackValidation>,
): Promise<FeedbackResult> {
  const user = await currentUser();

  if (!user) {
    return { ok: false };
  }

  const parsed = FeedbackValidation.safeParse(values);

  if (!parsed.success) {
    return { ok: false };
  }

  const email = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress;

  if (!email) {
    return { ok: false };
  }

  await db.insert(feedbackSchema).values({
    userId: user.id,
    email,
    subject: parsed.data.subject,
    message: parsed.data.message,
  });
  logger.info('Feedback stored');

  return { ok: true };
}
