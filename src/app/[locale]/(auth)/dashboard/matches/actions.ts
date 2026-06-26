'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import type * as z from 'zod';
import { joinPool, leavePool, requestMatch, respondToMatch } from '@/libs/CineMatch';
import type { RequestMatchResult, RespondMatchResult } from '@/types/CineMatch';
import { MatchResponseValidation } from '@/validations/CineMatchValidation';

const MATCHES_PATH = '/dashboard/matches';

export type MatchActionReason = 'auth' | 'invalid';

/**
 * Adds the signed-in user to the matching pool when they are eligible.
 * @returns Whether they are now in the pool, or a typed failure.
 */
export async function joinPoolAction(): Promise<
  { ok: true } | { ok: false; reason: MatchActionReason | 'not_eligible' }
> {
  const { userId } = await auth();

  if (!userId) {
    return { ok: false, reason: 'auth' };
  }

  const result = await joinPool(userId);
  revalidatePath(MATCHES_PATH);

  return result.ok ? { ok: true } : { ok: false, reason: 'not_eligible' };
}

/**
 * Removes the signed-in user from the pool immediately.
 * @returns Success, or a typed failure for an anonymous caller.
 */
export async function leavePoolAction(): Promise<{ ok: true } | { ok: false; reason: 'auth' }> {
  const { userId } = await auth();

  if (!userId) {
    return { ok: false, reason: 'auth' };
  }

  await leavePool(userId);
  revalidatePath(MATCHES_PATH);

  return { ok: true };
}

/**
 * Spends one of the signed-in user's weekly requests and scans the pool.
 * @returns The match result, or a typed failure for an anonymous caller.
 */
export async function requestMatchAction(): Promise<
  RequestMatchResult | { ok: false; reason: 'auth' }
> {
  const { userId } = await auth();

  if (!userId) {
    return { ok: false, reason: 'auth' };
  }

  const result = await requestMatch(userId);
  revalidatePath(MATCHES_PATH);

  return result;
}

/**
 * Responds to a match offer: accept to opt in (connecting when both agree), decline to close
 * it silently.
 * @param values - The match id and the accept/decline decision.
 * @returns The response result, or a typed failure (anonymous or invalid payload).
 */
export async function respondToMatchAction(
  values: z.infer<typeof MatchResponseValidation>,
): Promise<RespondMatchResult | { ok: false; reason: MatchActionReason }> {
  const { userId } = await auth();

  if (!userId) {
    return { ok: false, reason: 'auth' };
  }

  const parsed = MatchResponseValidation.safeParse(values);

  if (!parsed.success) {
    return { ok: false, reason: 'invalid' };
  }

  const result = await respondToMatch({
    userId,
    matchId: parsed.data.matchId,
    decision: parsed.data.decision,
  });
  revalidatePath(MATCHES_PATH);

  return result;
}
