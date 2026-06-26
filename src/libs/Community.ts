import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { cache } from 'react';
import {
  communityCommentSchema,
  communityPostSchema,
  communityReportSchema,
  communityVoteSchema,
  profileSchema,
} from '@/models/Schema';
import type {
  CommunityCategorySlug,
  CommunityReportReason,
  CommunitySort,
  CommunityTarget,
} from '@/types/Community';
import { COMMUNITY_PAGE_SIZE } from '@/validations/CommunityValidation';
import { db } from './DB';
import { createNotification } from './Notification';

type CommunityAuthor = {
  id: string;
  handle: string;
  displayName: string | null;
  avatarUrl: string | null;
};

type CommunityPost = typeof communityPostSchema.$inferSelect;
type CommunityComment = typeof communityCommentSchema.$inferSelect;

/** A vote value as seen by a viewer: upvoted (+1), none (0), or downvoted (−1). */
export type VoteValue = -1 | 0 | 1;

export type PostListItem = CommunityPost & { author: CommunityAuthor; viewerVote: VoteValue };
export type CommentListItem = CommunityComment & { author: CommunityAuthor; viewerVote: VoteValue };

// Author columns selected on every post/comment join.
const authorColumns = {
  id: profileSchema.id,
  handle: profileSchema.handle,
  displayName: profileSchema.displayName,
  avatarUrl: profileSchema.avatarUrl,
};

// Builds the ORDER BY for a post list. `hot` decays score by age (Hacker-News style
// gravity), so fresh, well-received posts float without a background job.
function orderFor(sort: CommunitySort) {
  if (sort === 'new') {
    return [desc(communityPostSchema.createdAt)];
  }

  if (sort === 'top') {
    return [desc(communityPostSchema.score), desc(communityPostSchema.createdAt)];
  }

  // hot: decay score by age so fresh, well-received posts float to the top.
  return [
    desc(
      sql`${communityPostSchema.score}::float / power((extract(epoch from (now() - ${communityPostSchema.createdAt})) / 3600) + 2, 1.5)`,
    ),
    desc(communityPostSchema.createdAt),
  ];
}

// Loads the viewer's votes for a set of targets, as a map of targetId → value.
async function viewerVotes(props: {
  viewerId?: string;
  targetType: CommunityTarget;
  targetIds: string[];
}) {
  const map = new Map<string, VoteValue>();

  if (!props.viewerId || props.targetIds.length === 0) {
    return map;
  }

  const rows = await db
    .select({ targetId: communityVoteSchema.targetId, value: communityVoteSchema.value })
    .from(communityVoteSchema)
    .where(
      and(
        eq(communityVoteSchema.userId, props.viewerId),
        eq(communityVoteSchema.targetType, props.targetType),
        inArray(communityVoteSchema.targetId, props.targetIds),
      ),
    );

  for (const row of rows) {
    map.set(row.targetId, row.value);
  }

  return map;
}

/**
 * Lists posts for one page of a category feed (or all categories when omitted).
 * @param props - Optional category, the sort, the viewer id (for vote state), and page.
 * @returns The page of posts with author and the viewer's vote, plus the total count.
 */
export async function listPosts(props: {
  category?: CommunityCategorySlug;
  sort: CommunitySort;
  viewerId?: string;
  page: number;
}) {
  const where = props.category
    ? and(
        eq(communityPostSchema.isRemoved, false),
        eq(communityPostSchema.category, props.category),
      )
    : eq(communityPostSchema.isRemoved, false);
  const offset = (props.page - 1) * COMMUNITY_PAGE_SIZE;

  const [rows, [totals]] = await Promise.all([
    db
      .select({ post: communityPostSchema, author: authorColumns })
      .from(communityPostSchema)
      .innerJoin(profileSchema, eq(profileSchema.id, communityPostSchema.authorId))
      .where(where)
      .orderBy(...orderFor(props.sort))
      .limit(COMMUNITY_PAGE_SIZE)
      .offset(offset),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(communityPostSchema)
      .where(where),
  ]);

  const votes = await viewerVotes({
    viewerId: props.viewerId,
    targetType: 'post',
    targetIds: rows.map((row) => row.post.id),
  });

  const items: PostListItem[] = rows.map((row) => ({
    ...row.post,
    author: row.author,
    viewerVote: votes.get(row.post.id) ?? 0,
  }));

  return { items, total: totals?.value ?? 0 };
}

// Loads the post + author join keyed only by id. Wrapped in `cache` so a page and its
// `generateMetadata` (which pass different `viewerId`s to `getPost`) share one join query.
const getPostRow = cache(async (id: string) => {
  const [row] = await db
    .select({ post: communityPostSchema, author: authorColumns })
    .from(communityPostSchema)
    .innerJoin(profileSchema, eq(profileSchema.id, communityPostSchema.authorId))
    .where(and(eq(communityPostSchema.id, id), eq(communityPostSchema.isRemoved, false)))
    .limit(1);

  return row;
});

/**
 * Loads a single post with its author and the viewer's vote.
 * @param props - The post id and optional viewer id.
 * @returns The post, or undefined when missing or removed.
 */
export async function getPost(props: { id: string; viewerId?: string }) {
  const row = await getPostRow(props.id);

  const votes = await viewerVotes({
    viewerId: props.viewerId,
    targetType: 'post',
    targetIds: row ? [row.post.id] : [],
  });

  return row
    ? { ...row.post, author: row.author, viewerVote: votes.get(row.post.id) ?? 0 }
    : undefined;
}

/** A single post with its author and the viewer's vote, as returned by {@link getPost}. */
export type PostDetailItem = NonNullable<Awaited<ReturnType<typeof getPost>>>;

/**
 * Lists a post's comments (flat, oldest first) with author and the viewer's vote.
 * The caller builds the reply tree from `parentId`.
 * @param props - The post id and optional viewer id.
 * @returns The comments, including removed ones (rendered as tombstones) to keep threads intact.
 */
export async function listComments(props: { postId: string; viewerId?: string }) {
  const rows = await db
    .select({ comment: communityCommentSchema, author: authorColumns })
    .from(communityCommentSchema)
    .innerJoin(profileSchema, eq(profileSchema.id, communityCommentSchema.authorId))
    .where(eq(communityCommentSchema.postId, props.postId))
    .orderBy(communityCommentSchema.createdAt);

  const votes = await viewerVotes({
    viewerId: props.viewerId,
    targetType: 'comment',
    targetIds: rows.map((row) => row.comment.id),
  });

  const items: CommentListItem[] = rows.map((row) => ({
    ...row.comment,
    author: row.author,
    viewerVote: votes.get(row.comment.id) ?? 0,
  }));

  return items;
}

/**
 * Creates a new post under a category.
 * @param props - The author id, category slug, title, and body.
 * @returns The created post row.
 */
export async function createPost(props: {
  authorId: string;
  category: CommunityCategorySlug;
  title: string;
  body: string;
}) {
  const [row] = await db
    .insert(communityPostSchema)
    .values({
      authorId: props.authorId,
      category: props.category,
      title: props.title,
      body: props.body,
    })
    .returning();

  if (!row) {
    throw new Error('Failed to create post');
  }

  return row;
}

/**
 * Edits a post's title and body, but only when the acting user is the author.
 * @param props - The post id, the acting author id, and the new title/body.
 * @returns The updated post, or undefined when the user is not the author.
 */
export async function updatePost(props: {
  id: string;
  authorId: string;
  title: string;
  body: string;
}) {
  const [row] = await db
    .update(communityPostSchema)
    .set({ title: props.title, body: props.body })
    .where(
      and(
        eq(communityPostSchema.id, props.id),
        eq(communityPostSchema.authorId, props.authorId),
        eq(communityPostSchema.isRemoved, false),
      ),
    )
    .returning();

  return row;
}

/**
 * Soft-deletes a post the acting user authored.
 * @param props - The post id and the acting author id.
 * @returns The removed post, or undefined when the user is not the author.
 */
export async function removePost(props: { id: string; authorId: string }) {
  const [row] = await db
    .update(communityPostSchema)
    .set({ isRemoved: true })
    .where(
      and(
        eq(communityPostSchema.id, props.id),
        eq(communityPostSchema.authorId, props.authorId),
        eq(communityPostSchema.isRemoved, false),
      ),
    )
    .returning();

  return row;
}

// Notifies the right person for a new comment: a reply notifies the parent comment's
// author; a top-level comment notifies the post's author. Self-comments are dropped by
// createNotification. Best-effort and outside the insert transaction.
async function notifyOnComment(comment: CommunityComment) {
  if (comment.parentId) {
    const [parent] = await db
      .select({ authorId: communityCommentSchema.authorId })
      .from(communityCommentSchema)
      .where(eq(communityCommentSchema.id, comment.parentId))
      .limit(1);

    if (parent) {
      await createNotification({
        userId: parent.authorId,
        actorId: comment.authorId,
        type: 'comment_reply',
        postId: comment.postId,
        commentId: comment.id,
      });
    }

    return;
  }

  const [post] = await db
    .select({ authorId: communityPostSchema.authorId })
    .from(communityPostSchema)
    .where(eq(communityPostSchema.id, comment.postId))
    .limit(1);

  if (post) {
    await createNotification({
      userId: post.authorId,
      actorId: comment.authorId,
      type: 'post_comment',
      postId: comment.postId,
      commentId: comment.id,
    });
  }
}

/**
 * Adds a comment (or threaded reply) and bumps the post's cached comment count.
 * @param props - The post id, optional parent comment id, author id, and body.
 * @returns The created comment row.
 */
export async function createComment(props: {
  postId: string;
  parentId?: string;
  authorId: string;
  body: string;
}) {
  const row = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(communityCommentSchema)
      .values({
        postId: props.postId,
        parentId: props.parentId ?? null,
        authorId: props.authorId,
        body: props.body,
      })
      .returning();

    if (!created) {
      throw new Error('Failed to create comment');
    }

    await tx
      .update(communityPostSchema)
      .set({ commentCount: sql`${communityPostSchema.commentCount} + 1` })
      .where(eq(communityPostSchema.id, props.postId));

    return created;
  });

  await notifyOnComment(row);

  return row;
}

/**
 * Soft-deletes a comment the acting user authored and decrements the post count once.
 * @param props - The comment id and the acting author id.
 * @returns The removed comment, or undefined when the user is not the author.
 */
export async function removeComment(props: { id: string; authorId: string }) {
  return await db.transaction(async (tx) => {
    const [row] = await tx
      .update(communityCommentSchema)
      .set({ isRemoved: true })
      .where(
        and(
          eq(communityCommentSchema.id, props.id),
          eq(communityCommentSchema.authorId, props.authorId),
          eq(communityCommentSchema.isRemoved, false),
        ),
      )
      .returning();

    if (row) {
      await tx
        .update(communityPostSchema)
        .set({ commentCount: sql`greatest(${communityPostSchema.commentCount} - 1, 0)` })
        .where(eq(communityPostSchema.id, row.postId));
    }

    return row;
  });
}

// Notifies the author of an upvoted post or comment. Resolves the author (and the post id
// a comment belongs to, so the link points at the thread) before recording the event.
async function notifyOnUpvote(props: {
  userId: string;
  targetType: CommunityTarget;
  targetId: string;
}) {
  if (props.targetType === 'post') {
    const [post] = await db
      .select({ authorId: communityPostSchema.authorId })
      .from(communityPostSchema)
      .where(eq(communityPostSchema.id, props.targetId))
      .limit(1);

    if (post) {
      await createNotification({
        userId: post.authorId,
        actorId: props.userId,
        type: 'post_upvote',
        postId: props.targetId,
      });
    }

    return;
  }

  const [comment] = await db
    .select({ authorId: communityCommentSchema.authorId, postId: communityCommentSchema.postId })
    .from(communityCommentSchema)
    .where(eq(communityCommentSchema.id, props.targetId))
    .limit(1);

  if (comment) {
    await createNotification({
      userId: comment.authorId,
      actorId: props.userId,
      type: 'comment_upvote',
      postId: comment.postId,
      commentId: props.targetId,
    });
  }
}

/**
 * Casts, changes, or clears a viewer's vote on a post or comment, keeping the
 * target's cached `score` in sync in one transaction.
 * @param props - The voter id, target type/id, and new value (`0` clears the vote).
 */
export async function vote(props: {
  userId: string;
  targetType: CommunityTarget;
  targetId: string;
  value: VoteValue;
}) {
  const becameUpvote = await db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ value: communityVoteSchema.value })
      .from(communityVoteSchema)
      .where(
        and(
          eq(communityVoteSchema.userId, props.userId),
          eq(communityVoteSchema.targetType, props.targetType),
          eq(communityVoteSchema.targetId, props.targetId),
        ),
      )
      .limit(1);

    const current = existing?.value ?? 0;

    if (current === props.value) {
      return false;
    }

    const delta = props.value - current;

    await (props.value === 0
      ? tx
          .delete(communityVoteSchema)
          .where(
            and(
              eq(communityVoteSchema.userId, props.userId),
              eq(communityVoteSchema.targetType, props.targetType),
              eq(communityVoteSchema.targetId, props.targetId),
            ),
          )
      : tx
          .insert(communityVoteSchema)
          .values({
            userId: props.userId,
            targetType: props.targetType,
            targetId: props.targetId,
            value: props.value,
          })
          .onConflictDoUpdate({
            target: [
              communityVoteSchema.userId,
              communityVoteSchema.targetType,
              communityVoteSchema.targetId,
            ],
            set: { value: props.value },
          }));

    await (props.targetType === 'post'
      ? tx
          .update(communityPostSchema)
          .set({ score: sql`${communityPostSchema.score} + ${delta}` })
          .where(eq(communityPostSchema.id, props.targetId))
      : tx
          .update(communityCommentSchema)
          .set({ score: sql`${communityCommentSchema.score} + ${delta}` })
          .where(eq(communityCommentSchema.id, props.targetId)));

    return props.value === 1;
  });

  if (becameUpvote) {
    await notifyOnUpvote(props);
  }
}

/**
 * Files a report against a post or comment; a second report by the same user is a no-op.
 * @param props - The reporter id, target type/id, reason, and optional detail.
 */
export async function report(props: {
  reporterId: string;
  targetType: CommunityTarget;
  targetId: string;
  reason: CommunityReportReason;
  detail?: string;
}) {
  await db
    .insert(communityReportSchema)
    .values({
      reporterId: props.reporterId,
      targetType: props.targetType,
      targetId: props.targetId,
      reason: props.reason,
      detail: props.detail ?? null,
    })
    .onConflictDoNothing();
}

/**
 * Counts non-removed posts per category, for the category index.
 * @returns A map of category slug → post count.
 */
export async function getCategoryPostCounts() {
  const rows = await db
    .select({ category: communityPostSchema.category, value: sql<number>`count(*)::int` })
    .from(communityPostSchema)
    .where(eq(communityPostSchema.isRemoved, false))
    .groupBy(communityPostSchema.category);

  return new Map(rows.map((row) => [row.category, row.value]));
}
