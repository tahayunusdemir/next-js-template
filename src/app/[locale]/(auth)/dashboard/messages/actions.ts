'use server';

import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import type * as z from 'zod';
import { getOrCreateDirectConversation, sendMessage, setArchived } from '@/libs/Chat';
import {
  SendMessageValidation,
  SetArchivedValidation,
  StartConversationValidation,
} from '@/validations/ChatValidation';

export type ChatActionReason = 'auth' | 'invalid' | 'forbidden';

const MESSAGES_PATH = '/dashboard/messages';

/**
 * Sends a message into a conversation on behalf of the signed-in user.
 * @param values - The conversation id and message body.
 * @returns Whether the message was sent, with a failure reason otherwise.
 */
export async function sendMessageAction(
  values: z.infer<typeof SendMessageValidation>,
): Promise<{ ok: true } | { ok: false; reason: ChatActionReason }> {
  const user = await currentUser();

  if (!user) {
    return { ok: false, reason: 'auth' };
  }

  const parsed = SendMessageValidation.safeParse(values);

  if (!parsed.success) {
    return { ok: false, reason: 'invalid' };
  }

  const message = await sendMessage({ userId: user.id, ...parsed.data });

  if (!message) {
    return { ok: false, reason: 'forbidden' };
  }

  revalidatePath(MESSAGES_PATH);

  return { ok: true };
}

/**
 * Opens (or reuses) a direct thread with another user and returns its id for routing.
 * @param values - The target user id.
 * @returns The conversation id, or a failure reason.
 */
export async function startConversationAction(
  values: z.infer<typeof StartConversationValidation>,
): Promise<{ ok: true; conversationId: string } | { ok: false; reason: ChatActionReason }> {
  const user = await currentUser();

  if (!user) {
    return { ok: false, reason: 'auth' };
  }

  const parsed = StartConversationValidation.safeParse(values);

  if (!parsed.success) {
    return { ok: false, reason: 'invalid' };
  }

  const conversationId = await getOrCreateDirectConversation({
    userId: user.id,
    targetId: parsed.data.targetId,
  });

  if (!conversationId) {
    return { ok: false, reason: 'forbidden' };
  }

  revalidatePath(MESSAGES_PATH);

  return { ok: true, conversationId };
}

/**
 * Archives or restores a conversation for the signed-in user.
 * @param values - The conversation id and archived flag.
 * @returns Whether the change was applied.
 */
export async function setArchivedAction(
  values: z.infer<typeof SetArchivedValidation>,
): Promise<{ ok: boolean }> {
  const user = await currentUser();

  if (!user) {
    return { ok: false };
  }

  const parsed = SetArchivedValidation.safeParse(values);

  if (!parsed.success) {
    return { ok: false };
  }

  await setArchived({ userId: user.id, ...parsed.data });
  revalidatePath(MESSAGES_PATH);

  return { ok: true };
}
