'use server';

import { auth } from '@clerk/nextjs/server';
import type * as z from 'zod';
import { block, follow, unblock, unfollow } from '@/libs/Social';
import { FollowValidation } from '@/validations/FollowValidation';

export type RelationshipResult = { ok: true } | { ok: false; reason: 'auth' | 'invalid' | 'self' };

const HANDLERS = { follow, unfollow, block, unblock };

/**
 * Applies a follow/unfollow/block/unblock action for the signed-in user against a target.
 * @param values - The target user id and the action to apply.
 * @returns Success, or a typed failure (anonymous, invalid, or self-target).
 */
export async function setRelationship(
  values: z.infer<typeof FollowValidation>,
): Promise<RelationshipResult> {
  const { userId } = await auth();

  if (!userId) {
    return { ok: false, reason: 'auth' };
  }

  const parsed = FollowValidation.safeParse(values);

  if (!parsed.success) {
    return { ok: false, reason: 'invalid' };
  }

  if (parsed.data.targetId === userId) {
    return { ok: false, reason: 'self' };
  }

  await HANDLERS[parsed.data.action]({ userId, targetId: parsed.data.targetId });

  return { ok: true };
}
