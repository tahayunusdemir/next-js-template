import { and, count, desc, eq, isNull } from 'drizzle-orm';
import { communityPostSchema, notificationSchema, profileSchema } from '@/models/Schema';
import type { NotificationType } from '@/types/Notification';
import { db } from './DB';

type NotificationActor = {
  id: string;
  handle: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type NotificationItem = {
  id: string;
  type: NotificationType;
  actor: NotificationActor;
  // Dashboard-relative link to the thing the notification is about: the actor's public
  // profile for a follow, the community thread for a comment/reply/upvote.
  href: string;
  postTitle: string | null;
  isRead: boolean;
  createdAt: Date;
};

/**
 * Records a notification for a recipient, skipping the no-op case where the actor is the
 * recipient (you never notify yourself for acting on your own content).
 * @param props - The recipient and actor ids, the event type, and optional community target.
 */
export async function createNotification(props: {
  userId: string;
  actorId: string;
  type: NotificationType;
  postId?: string;
  commentId?: string;
  matchId?: string;
}) {
  if (props.userId === props.actorId) {
    return;
  }

  await db.insert(notificationSchema).values({
    userId: props.userId,
    actorId: props.actorId,
    type: props.type,
    postId: props.postId ?? null,
    commentId: props.commentId ?? null,
    matchId: props.matchId ?? null,
  });
}

// Resolves the dashboard-relative target of a notification: the match for a CineMatch
// event, the community thread for a comment/reply/upvote, the actor's profile otherwise.
function hrefFor(row: {
  type: NotificationType;
  matchId: string | null;
  postId: string | null;
  postCategory: string | null;
  actorHandle: string;
}) {
  if ((row.type === 'match_found' || row.type === 'match_connected') && row.matchId) {
    return `/dashboard/matches/${row.matchId}`;
  }

  if (row.type === 'follow' || !row.postCategory) {
    return `/u/${row.actorHandle}`;
  }

  return `/dashboard/community/${row.postCategory}/${row.postId}`;
}

/**
 * Lists a user's notifications, newest first, joined to the actor's profile and the
 * community post (when any) so each item carries a ready-to-render link and title.
 * @param props - The recipient id and an optional cap on how many to return.
 * @returns The notification items, most recent first.
 */
export async function listNotifications(props: {
  userId: string;
  limit?: number;
}): Promise<NotificationItem[]> {
  const rows = await db
    .select({
      id: notificationSchema.id,
      type: notificationSchema.type,
      postId: notificationSchema.postId,
      matchId: notificationSchema.matchId,
      readAt: notificationSchema.readAt,
      createdAt: notificationSchema.createdAt,
      actorId: profileSchema.id,
      actorHandle: profileSchema.handle,
      actorDisplayName: profileSchema.displayName,
      actorAvatarUrl: profileSchema.avatarUrl,
      postCategory: communityPostSchema.category,
      postTitle: communityPostSchema.title,
    })
    .from(notificationSchema)
    .innerJoin(profileSchema, eq(profileSchema.id, notificationSchema.actorId))
    .leftJoin(communityPostSchema, eq(communityPostSchema.id, notificationSchema.postId))
    .where(eq(notificationSchema.userId, props.userId))
    .orderBy(desc(notificationSchema.createdAt))
    .limit(props.limit ?? 30);

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    actor: {
      id: row.actorId,
      handle: row.actorHandle,
      displayName: row.actorDisplayName,
      avatarUrl: row.actorAvatarUrl,
    },
    href: hrefFor(row),
    postTitle: row.postTitle,
    isRead: row.readAt !== null,
    createdAt: row.createdAt,
  }));
}

/**
 * Counts a user's unread notifications, for the header bell badge.
 * @param props - The recipient id.
 * @returns The number of unread notifications.
 */
export async function getUnreadCount(props: { userId: string }) {
  const [row] = await db
    .select({ value: count() })
    .from(notificationSchema)
    .where(and(eq(notificationSchema.userId, props.userId), isNull(notificationSchema.readAt)));

  return row?.value ?? 0;
}

/**
 * Marks all of a user's unread notifications as read.
 * @param props - The recipient id.
 */
export async function markAllRead(props: { userId: string }) {
  await db
    .update(notificationSchema)
    .set({ readAt: new Date() })
    .where(and(eq(notificationSchema.userId, props.userId), isNull(notificationSchema.readAt)));
}

/**
 * Marks a single notification as read, scoped to its owner so a user can only clear
 * their own.
 * @param props - The recipient id and the notification id.
 */
export async function markNotificationRead(props: { userId: string; id: string }) {
  await db
    .update(notificationSchema)
    .set({ readAt: new Date() })
    .where(and(eq(notificationSchema.id, props.id), eq(notificationSchema.userId, props.userId)));
}
