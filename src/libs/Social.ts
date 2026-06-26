import { and, count, desc, eq, inArray, or } from 'drizzle-orm';
import { blockSchema, followSchema, profileSchema } from '@/models/Schema';
import { db } from './DB';
import { createNotification } from './Notification';

type ProfileLite = {
  id: string;
  handle: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type Connection = ProfileLite & { followers: number; following: number };

export type Relationship = {
  isFollowing: boolean; // viewer follows target
  isFollowedBy: boolean; // target follows viewer
  isBlocked: boolean; // viewer blocked target
  isBlockedBy: boolean; // target blocked viewer
};

// Matches the two block rows that could exist between a pair of users, in either direction.
function blockedPair(a: string, b: string) {
  return or(
    and(eq(blockSchema.blockerId, a), eq(blockSchema.blockedId, b)),
    and(eq(blockSchema.blockerId, b), eq(blockSchema.blockedId, a)),
  );
}

// Matches the two follow rows that could exist between a pair of users, in either direction.
function followPair(a: string, b: string) {
  return or(
    and(eq(followSchema.followerId, a), eq(followSchema.followingId, b)),
    and(eq(followSchema.followerId, b), eq(followSchema.followingId, a)),
  );
}

// Returns whether either user has blocked the other.
async function isBlockedEitherWay(a: string, b: string) {
  const [row] = await db
    .select({ blockerId: blockSchema.blockerId })
    .from(blockSchema)
    .where(blockedPair(a, b))
    .limit(1);

  return Boolean(row);
}

// Joins follower/following counts onto a set of profile rows in two grouped queries.
async function withCounts(rows: ProfileLite[]): Promise<Connection[]> {
  if (rows.length === 0) {
    return [];
  }

  const ids = rows.map((row) => row.id);

  const [followerRows, followingRows] = await Promise.all([
    db
      .select({ id: followSchema.followingId, value: count() })
      .from(followSchema)
      .where(inArray(followSchema.followingId, ids))
      .groupBy(followSchema.followingId),
    db
      .select({ id: followSchema.followerId, value: count() })
      .from(followSchema)
      .where(inArray(followSchema.followerId, ids))
      .groupBy(followSchema.followerId),
  ]);

  const followers = new Map(followerRows.map((row) => [row.id, row.value]));
  const following = new Map(followingRows.map((row) => [row.id, row.value]));

  return rows.map((row) => ({
    ...row,
    followers: followers.get(row.id) ?? 0,
    following: following.get(row.id) ?? 0,
  }));
}

/**
 * Follows a user, unless it is a self-follow or either side has blocked the other.
 * @param props - The acting user id and the target user id.
 */
export async function follow(props: { userId: string; targetId: string }) {
  if (props.userId === props.targetId || (await isBlockedEitherWay(props.userId, props.targetId))) {
    return;
  }

  const [inserted] = await db
    .insert(followSchema)
    .values({ followerId: props.userId, followingId: props.targetId })
    .onConflictDoNothing()
    .returning({ followerId: followSchema.followerId });

  // Only notify on a genuinely new edge, so re-follows don't pile up notifications.
  if (inserted) {
    await createNotification({ userId: props.targetId, actorId: props.userId, type: 'follow' });
  }
}

/**
 * Removes a follow edge from the acting user to the target.
 * @param props - The acting user id and the target user id.
 */
export async function unfollow(props: { userId: string; targetId: string }) {
  await db
    .delete(followSchema)
    .where(
      and(eq(followSchema.followerId, props.userId), eq(followSchema.followingId, props.targetId)),
    );
}

/**
 * Blocks a user and tears down any follow edges between the pair in both directions.
 * @param props - The acting user id and the target user id.
 */
export async function block(props: { userId: string; targetId: string }) {
  if (props.userId === props.targetId) {
    return;
  }

  await db
    .insert(blockSchema)
    .values({ blockerId: props.userId, blockedId: props.targetId })
    .onConflictDoNothing();

  await db.delete(followSchema).where(followPair(props.userId, props.targetId));
}

/**
 * Lifts a block the acting user placed on the target.
 * @param props - The acting user id and the target user id.
 */
export async function unblock(props: { userId: string; targetId: string }) {
  await db
    .delete(blockSchema)
    .where(and(eq(blockSchema.blockerId, props.userId), eq(blockSchema.blockedId, props.targetId)));
}

/**
 * Lists the profiles a user follows, most recently followed first, with counts.
 * @param props - The user id whose following list to load.
 * @returns The followed profiles with follower/following counts.
 */
export async function listFollowing(props: { userId: string }) {
  const rows = await db
    .select({
      id: profileSchema.id,
      handle: profileSchema.handle,
      displayName: profileSchema.displayName,
      avatarUrl: profileSchema.avatarUrl,
    })
    .from(followSchema)
    .innerJoin(profileSchema, eq(profileSchema.id, followSchema.followingId))
    .where(eq(followSchema.followerId, props.userId))
    .orderBy(desc(followSchema.createdAt));

  return await withCounts(rows);
}

/**
 * Lists the profiles that follow a user, most recent first, with counts.
 * @param props - The user id whose followers to load.
 * @returns The follower profiles with follower/following counts.
 */
export async function listFollowers(props: { userId: string }) {
  const rows = await db
    .select({
      id: profileSchema.id,
      handle: profileSchema.handle,
      displayName: profileSchema.displayName,
      avatarUrl: profileSchema.avatarUrl,
    })
    .from(followSchema)
    .innerJoin(profileSchema, eq(profileSchema.id, followSchema.followerId))
    .where(eq(followSchema.followingId, props.userId))
    .orderBy(desc(followSchema.createdAt));

  return await withCounts(rows);
}

/**
 * Lists the profiles a user has blocked, most recent first, with counts.
 * @param props - The user id whose block list to load.
 * @returns The blocked profiles with follower/following counts.
 */
export async function listBlocked(props: { userId: string }) {
  const rows = await db
    .select({
      id: profileSchema.id,
      handle: profileSchema.handle,
      displayName: profileSchema.displayName,
      avatarUrl: profileSchema.avatarUrl,
    })
    .from(blockSchema)
    .innerJoin(profileSchema, eq(profileSchema.id, blockSchema.blockedId))
    .where(eq(blockSchema.blockerId, props.userId))
    .orderBy(desc(blockSchema.createdAt));

  return await withCounts(rows);
}

/**
 * Lists public member profiles, most recently joined first, with counts.
 * @param props - Optional cap on how many members to return.
 * @returns The public member profiles with follower/following counts.
 */
export async function listMembers(props?: { limit?: number }) {
  const rows = await db
    .select({
      id: profileSchema.id,
      handle: profileSchema.handle,
      displayName: profileSchema.displayName,
      avatarUrl: profileSchema.avatarUrl,
    })
    .from(profileSchema)
    .where(eq(profileSchema.isPublic, true))
    .orderBy(desc(profileSchema.createdAt))
    .limit(props?.limit ?? 12);

  return await withCounts(rows);
}

/**
 * Counts a user's followers and following.
 * @param userId - The user id to count edges for.
 * @returns The follower and following totals.
 */
export async function getConnectionCounts(userId: string) {
  const [[followers], [following]] = await Promise.all([
    db.select({ value: count() }).from(followSchema).where(eq(followSchema.followingId, userId)),
    db.select({ value: count() }).from(followSchema).where(eq(followSchema.followerId, userId)),
  ]);

  return { followers: followers?.value ?? 0, following: following?.value ?? 0 };
}

/**
 * Resolves the follow/block relationship between a viewer and a target user.
 * @param props - The viewer id and the target id.
 * @returns The directional follow and block flags driving the action button.
 */
export async function getRelationship(props: {
  viewerId: string;
  targetId: string;
}): Promise<Relationship> {
  const [follows, blocks] = await Promise.all([
    db
      .select({ followerId: followSchema.followerId })
      .from(followSchema)
      .where(followPair(props.viewerId, props.targetId)),
    db
      .select({ blockerId: blockSchema.blockerId })
      .from(blockSchema)
      .where(blockedPair(props.viewerId, props.targetId)),
  ]);

  return {
    isFollowing: follows.some((row) => row.followerId === props.viewerId),
    isFollowedBy: follows.some((row) => row.followerId === props.targetId),
    isBlocked: blocks.some((row) => row.blockerId === props.viewerId),
    isBlockedBy: blocks.some((row) => row.blockerId === props.targetId),
  };
}
