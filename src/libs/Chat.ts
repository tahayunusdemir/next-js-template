import { and, count, desc, eq, gt, inArray, isNull, ne, or } from 'drizzle-orm';
import {
  blockSchema,
  conversationParticipantSchema,
  conversationSchema,
  followSchema,
  messageSchema,
  profileSchema,
} from '@/models/Schema';
import type { ChatGroup } from '@/types/Chat';
import { db } from './DB';
import { getRelationship } from './Social';
import type { Relationship } from './Social';

export type ChatParticipant = {
  id: string;
  handle: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type ConversationSummary = {
  id: string;
  participant: ChatParticipant;
  lastMessagePreview: string | null;
  lastMessageFromMe: boolean;
  lastMessageAt: Date;
  unreadCount: number;
  isArchived: boolean;
  isRequest: boolean;
  group: ChatGroup;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  body: string;
  createdAt: Date;
  editedAt: Date | null;
};

export type ConversationDetail = {
  id: string;
  participant: ChatParticipant;
  relationship: Relationship;
  isArchived: boolean;
  messages: ChatMessage[];
};

const PROFILE_COLUMNS = {
  id: profileSchema.id,
  handle: profileSchema.handle,
  displayName: profileSchema.displayName,
  avatarUrl: profileSchema.avatarUrl,
} as const;

// Stable thread key for a 1:1 pair: the two user ids sorted and joined, so the same two
// people always resolve to one conversation regardless of who opens it.
function pairKeyFor(a: string, b: string) {
  return [a, b].toSorted().join(':');
}

// Buckets a thread by its last activity: today, yesterday, or earlier (server local time).
function chatGroupFor(date: Date): ChatGroup {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  if (date >= startOfToday) {
    return 'today';
  }

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  if (date >= startOfYesterday) {
    return 'yesterday';
  }

  return 'earlier';
}

// Returns whether either user has blocked the other.
async function isBlockedEitherWay(a: string, b: string) {
  const [row] = await db
    .select({ blockerId: blockSchema.blockerId })
    .from(blockSchema)
    .where(
      or(
        and(eq(blockSchema.blockerId, a), eq(blockSchema.blockedId, b)),
        and(eq(blockSchema.blockerId, b), eq(blockSchema.blockedId, a)),
      ),
    )
    .limit(1);

  return Boolean(row);
}

// Loads the signed-in user's participant row for a conversation, or undefined when they
// are not a member (the membership gate for every read and write).
async function getMembership(props: { userId: string; conversationId: string }) {
  const [row] = await db
    .select({
      conversationId: conversationParticipantSchema.conversationId,
      isArchived: conversationParticipantSchema.isArchived,
    })
    .from(conversationParticipantSchema)
    .where(
      and(
        eq(conversationParticipantSchema.conversationId, props.conversationId),
        eq(conversationParticipantSchema.userId, props.userId),
      ),
    )
    .limit(1);

  return row;
}

// Resolves the other member of a 1:1 conversation with their public profile.
async function getOtherParticipant(props: { userId: string; conversationId: string }) {
  const [row] = await db
    .select(PROFILE_COLUMNS)
    .from(conversationParticipantSchema)
    .innerJoin(profileSchema, eq(profileSchema.id, conversationParticipantSchema.userId))
    .where(
      and(
        eq(conversationParticipantSchema.conversationId, props.conversationId),
        ne(conversationParticipantSchema.userId, props.userId),
      ),
    )
    .limit(1);

  return row;
}

// Returns the subset of `otherIds` that are blocked by, or have blocked, the user.
async function blockedAmong(props: { userId: string; otherIds: string[] }) {
  if (props.otherIds.length === 0) {
    return new Set<string>();
  }

  const rows = await db
    .select({ blockerId: blockSchema.blockerId, blockedId: blockSchema.blockedId })
    .from(blockSchema)
    .where(
      or(
        and(
          eq(blockSchema.blockerId, props.userId),
          inArray(blockSchema.blockedId, props.otherIds),
        ),
        and(
          eq(blockSchema.blockedId, props.userId),
          inArray(blockSchema.blockerId, props.otherIds),
        ),
      ),
    );

  const blocked = new Set<string>();
  for (const row of rows) {
    blocked.add(row.blockerId === props.userId ? row.blockedId : row.blockerId);
  }

  return blocked;
}

/**
 * Lists the signed-in user's direct threads with the other member, a last-message
 * preview, unread count, and request/archive flags, newest first and date-bucketed.
 * Threads with a block in either direction are hidden. `requests` are threads with
 * people the user doesn't follow; `archived` is per-user inbox state.
 * @param props - The acting user id and the inbox filter.
 * @returns The matching conversation summaries, sorted by last activity.
 */
export async function listConversations(props: {
  userId: string;
  filter: 'all' | 'unread' | 'requests' | 'archived';
}): Promise<ConversationSummary[]> {
  const myRows = await db
    .select({
      conversationId: conversationParticipantSchema.conversationId,
      isArchived: conversationParticipantSchema.isArchived,
      lastMessageAt: conversationSchema.lastMessageAt,
    })
    .from(conversationParticipantSchema)
    .innerJoin(
      conversationSchema,
      eq(conversationSchema.id, conversationParticipantSchema.conversationId),
    )
    .where(eq(conversationParticipantSchema.userId, props.userId))
    .orderBy(desc(conversationSchema.lastMessageAt));

  if (myRows.length === 0) {
    return [];
  }

  const ids = myRows.map((row) => row.conversationId);

  const [others, previews, unreadRows, following] = await Promise.all([
    db
      .select({
        conversationId: conversationParticipantSchema.conversationId,
        profile: PROFILE_COLUMNS,
      })
      .from(conversationParticipantSchema)
      .innerJoin(profileSchema, eq(profileSchema.id, conversationParticipantSchema.userId))
      .where(
        and(
          inArray(conversationParticipantSchema.conversationId, ids),
          ne(conversationParticipantSchema.userId, props.userId),
        ),
      ),
    db
      .selectDistinctOn([messageSchema.conversationId], {
        conversationId: messageSchema.conversationId,
        body: messageSchema.body,
        senderId: messageSchema.senderId,
      })
      .from(messageSchema)
      .where(and(inArray(messageSchema.conversationId, ids), isNull(messageSchema.deletedAt)))
      .orderBy(messageSchema.conversationId, desc(messageSchema.createdAt)),
    db
      .select({ conversationId: messageSchema.conversationId, value: count() })
      .from(messageSchema)
      .innerJoin(
        conversationParticipantSchema,
        and(
          eq(conversationParticipantSchema.conversationId, messageSchema.conversationId),
          eq(conversationParticipantSchema.userId, props.userId),
        ),
      )
      .where(
        and(
          inArray(messageSchema.conversationId, ids),
          ne(messageSchema.senderId, props.userId),
          isNull(messageSchema.deletedAt),
          or(
            isNull(conversationParticipantSchema.lastReadAt),
            gt(messageSchema.createdAt, conversationParticipantSchema.lastReadAt),
          ),
        ),
      )
      .groupBy(messageSchema.conversationId),
    db
      .select({ id: followSchema.followingId })
      .from(followSchema)
      .where(eq(followSchema.followerId, props.userId)),
  ]);

  const otherByConversation = new Map(others.map((row) => [row.conversationId, row.profile]));
  const previewByConversation = new Map(previews.map((row) => [row.conversationId, row]));
  const unreadByConversation = new Map(unreadRows.map((row) => [row.conversationId, row.value]));
  const followingIds = new Set(following.map((row) => row.id));

  const otherIds = others.map((row) => row.profile.id);
  const blockedIds = await blockedAmong({ userId: props.userId, otherIds });

  const summaries: ConversationSummary[] = [];

  for (const row of myRows) {
    const participant = otherByConversation.get(row.conversationId);

    if (!participant || blockedIds.has(participant.id)) {
      continue;
    }

    const preview = previewByConversation.get(row.conversationId);
    const { isArchived } = row;
    const isRequest = !followingIds.has(participant.id);

    const matchesFilter =
      props.filter === 'archived'
        ? isArchived
        : !isArchived &&
          (props.filter === 'all' ||
            (props.filter === 'unread' &&
              (unreadByConversation.get(row.conversationId) ?? 0) > 0) ||
            (props.filter === 'requests' && isRequest));

    if (!matchesFilter) {
      continue;
    }

    summaries.push({
      id: row.conversationId,
      participant,
      lastMessagePreview: preview?.body ?? null,
      lastMessageFromMe: preview?.senderId === props.userId,
      lastMessageAt: row.lastMessageAt,
      unreadCount: unreadByConversation.get(row.conversationId) ?? 0,
      isArchived,
      isRequest,
      group: chatGroupFor(row.lastMessageAt),
    });
  }

  return summaries;
}

/**
 * Loads a conversation's messages, the other member, and the viewer's relationship to
 * them. Returns null when the viewer is not a member of the conversation.
 * @param props - The acting user id and the conversation id.
 * @returns The conversation detail, or null when unauthorized or missing.
 */
export async function getConversation(props: {
  userId: string;
  conversationId: string;
}): Promise<ConversationDetail | null> {
  const membership = await getMembership(props);

  if (!membership) {
    return null;
  }

  const participant = await getOtherParticipant(props);

  if (!participant) {
    return null;
  }

  const [messages, relationship] = await Promise.all([
    db
      .select({
        id: messageSchema.id,
        senderId: messageSchema.senderId,
        body: messageSchema.body,
        createdAt: messageSchema.createdAt,
        editedAt: messageSchema.editedAt,
      })
      .from(messageSchema)
      .where(
        and(
          eq(messageSchema.conversationId, props.conversationId),
          isNull(messageSchema.deletedAt),
        ),
      )
      .orderBy(messageSchema.createdAt),
    getRelationship({ viewerId: props.userId, targetId: participant.id }),
  ]);

  return {
    id: props.conversationId,
    participant,
    relationship,
    isArchived: membership.isArchived,
    messages,
  };
}

/**
 * Finds the 1:1 thread between the user and a target, creating it when missing. Returns
 * null for a self-message or when either side has blocked the other.
 * @param props - The acting user id and the target user id.
 * @returns The conversation id, or null when not allowed.
 */
export async function getOrCreateDirectConversation(props: {
  userId: string;
  targetId: string;
}): Promise<string | null> {
  if (props.userId === props.targetId) {
    return null;
  }

  const [target] = await db
    .select({ id: profileSchema.id })
    .from(profileSchema)
    .where(eq(profileSchema.id, props.targetId))
    .limit(1);

  if (!target || (await isBlockedEitherWay(props.userId, props.targetId))) {
    return null;
  }

  const pairKey = pairKeyFor(props.userId, props.targetId);

  const [existing] = await db
    .select({ id: conversationSchema.id })
    .from(conversationSchema)
    .where(eq(conversationSchema.pairKey, pairKey))
    .limit(1);

  if (existing) {
    return existing.id;
  }

  return await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(conversationSchema)
      .values({ pairKey })
      .onConflictDoNothing({ target: conversationSchema.pairKey })
      .returning({ id: conversationSchema.id });

    if (!created) {
      const [row] = await tx
        .select({ id: conversationSchema.id })
        .from(conversationSchema)
        .where(eq(conversationSchema.pairKey, pairKey))
        .limit(1);

      return row?.id ?? null;
    }

    await tx.insert(conversationParticipantSchema).values([
      { conversationId: created.id, userId: props.userId },
      { conversationId: created.id, userId: props.targetId },
    ]);

    return created.id;
  });
}

/**
 * Sends a message into a conversation, bumping its last-activity time and marking the
 * sender's own read cursor. Returns null when the user is not a member or a block exists.
 * @param props - The acting user id, conversation id, and message body.
 * @returns The created message, or null when not allowed.
 */
export async function sendMessage(props: {
  userId: string;
  conversationId: string;
  body: string;
}): Promise<ChatMessage | null> {
  const membership = await getMembership(props);

  if (!membership) {
    return null;
  }

  const other = await getOtherParticipant(props);

  if (!other || (await isBlockedEitherWay(props.userId, other.id))) {
    return null;
  }

  const now = new Date();

  return await db.transaction(async (tx) => {
    const [message] = await tx
      .insert(messageSchema)
      .values({ conversationId: props.conversationId, senderId: props.userId, body: props.body })
      .returning({
        id: messageSchema.id,
        senderId: messageSchema.senderId,
        body: messageSchema.body,
        createdAt: messageSchema.createdAt,
        editedAt: messageSchema.editedAt,
      });

    await tx
      .update(conversationSchema)
      .set({ lastMessageAt: now })
      .where(eq(conversationSchema.id, props.conversationId));

    await tx
      .update(conversationParticipantSchema)
      .set({ lastReadAt: now })
      .where(
        and(
          eq(conversationParticipantSchema.conversationId, props.conversationId),
          eq(conversationParticipantSchema.userId, props.userId),
        ),
      );

    return message ?? null;
  });
}

/**
 * Advances the user's read cursor for a conversation to now, clearing its unread count.
 * @param props - The acting user id and the conversation id.
 */
export async function markRead(props: { userId: string; conversationId: string }) {
  await db
    .update(conversationParticipantSchema)
    .set({ lastReadAt: new Date() })
    .where(
      and(
        eq(conversationParticipantSchema.conversationId, props.conversationId),
        eq(conversationParticipantSchema.userId, props.userId),
      ),
    );
}

/**
 * Archives or restores a conversation for the signed-in user only.
 * @param props - The acting user id, conversation id, and archived flag.
 */
export async function setArchived(props: {
  userId: string;
  conversationId: string;
  archived: boolean;
}) {
  await db
    .update(conversationParticipantSchema)
    .set({ isArchived: props.archived })
    .where(
      and(
        eq(conversationParticipantSchema.conversationId, props.conversationId),
        eq(conversationParticipantSchema.userId, props.userId),
      ),
    );
}
