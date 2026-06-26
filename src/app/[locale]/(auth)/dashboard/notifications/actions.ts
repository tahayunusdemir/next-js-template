'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { markAllRead, markNotificationRead } from '@/libs/Notification';
import { NotificationIdValidation } from '@/validations/NotificationValidation';

const NOTIFICATIONS_PATH = '/dashboard/notifications';

export type NotificationActionReason = 'auth' | 'invalid';

/**
 * Marks all of the signed-in user's notifications as read.
 * @returns Success, or a typed failure for an anonymous caller.
 */
export async function markAllReadAction(): Promise<
  { ok: true } | { ok: false; reason: NotificationActionReason }
> {
  const { userId } = await auth();

  if (!userId) {
    return { ok: false, reason: 'auth' };
  }

  await markAllRead({ userId });
  revalidatePath(NOTIFICATIONS_PATH);

  return { ok: true };
}

/**
 * Marks a single notification as read for the signed-in user.
 * @param id - The notification id to clear.
 * @returns Success, or a typed failure (anonymous or invalid id).
 */
export async function markReadAction(
  id: string,
): Promise<{ ok: true } | { ok: false; reason: NotificationActionReason }> {
  const { userId } = await auth();

  if (!userId) {
    return { ok: false, reason: 'auth' };
  }

  const parsed = NotificationIdValidation.safeParse(id);

  if (!parsed.success) {
    return { ok: false, reason: 'invalid' };
  }

  await markNotificationRead({ userId, id: parsed.data });
  revalidatePath(NOTIFICATIONS_PATH);

  return { ok: true };
}
