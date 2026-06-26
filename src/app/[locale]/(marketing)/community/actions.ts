'use server';

import { auth } from '@clerk/nextjs/server';
import type * as z from 'zod';
import {
  createComment,
  createPost,
  removeComment,
  removePost,
  report,
  updatePost,
  vote,
} from '@/libs/Community';
import {
  CommentCreateValidation,
  CommunityIdValidation,
  PostCreateValidation,
  PostUpdateValidation,
  ReportValidation,
  VoteValidation,
} from '@/validations/CommunityValidation';

// Failure reasons shared by every community action. `forbidden` covers acting on a
// post/comment the user does not own; `auth` is an anonymous caller.
type Reason = 'auth' | 'invalid' | 'forbidden';

/**
 * Opens a new post under a category for the signed-in user.
 * @param values - The category, title, and body.
 * @returns The new post id, or a typed failure.
 */
export async function createPostAction(
  values: z.infer<typeof PostCreateValidation>,
): Promise<{ ok: true; postId: string } | { ok: false; reason: Reason }> {
  const { userId } = await auth();

  if (!userId) {
    return { ok: false, reason: 'auth' };
  }

  const parsed = PostCreateValidation.safeParse(values);

  if (!parsed.success) {
    return { ok: false, reason: 'invalid' };
  }

  const post = await createPost({ authorId: userId, ...parsed.data });

  return { ok: true, postId: post.id };
}

/**
 * Edits the signed-in user's own post.
 * @param values - The post id and the new title/body.
 * @returns Success, or a typed failure (`forbidden` when not the author).
 */
export async function updatePostAction(
  values: z.infer<typeof PostUpdateValidation>,
): Promise<{ ok: true } | { ok: false; reason: Reason }> {
  const { userId } = await auth();

  if (!userId) {
    return { ok: false, reason: 'auth' };
  }

  const parsed = PostUpdateValidation.safeParse(values);

  if (!parsed.success) {
    return { ok: false, reason: 'invalid' };
  }

  const row = await updatePost({
    id: parsed.data.postId,
    authorId: userId,
    title: parsed.data.title,
    body: parsed.data.body,
  });

  return row ? { ok: true } : { ok: false, reason: 'forbidden' };
}

/**
 * Soft-deletes the signed-in user's own post.
 * @param postId - The post id to remove.
 * @returns Success, or a typed failure (`forbidden` when not the author).
 */
export async function removePostAction(
  postId: string,
): Promise<{ ok: true } | { ok: false; reason: Reason }> {
  const { userId } = await auth();

  if (!userId) {
    return { ok: false, reason: 'auth' };
  }

  const parsed = CommunityIdValidation.safeParse(postId);

  if (!parsed.success) {
    return { ok: false, reason: 'invalid' };
  }

  const row = await removePost({ id: parsed.data, authorId: userId });

  return row ? { ok: true } : { ok: false, reason: 'forbidden' };
}

/**
 * Adds a comment or threaded reply for the signed-in user.
 * @param values - The post id, optional parent comment id, and body.
 * @returns The new comment id, or a typed failure.
 */
export async function createCommentAction(
  values: z.infer<typeof CommentCreateValidation>,
): Promise<{ ok: true; commentId: string } | { ok: false; reason: Reason }> {
  const { userId } = await auth();

  if (!userId) {
    return { ok: false, reason: 'auth' };
  }

  const parsed = CommentCreateValidation.safeParse(values);

  if (!parsed.success) {
    return { ok: false, reason: 'invalid' };
  }

  const comment = await createComment({ authorId: userId, ...parsed.data });

  return { ok: true, commentId: comment.id };
}

/**
 * Soft-deletes the signed-in user's own comment.
 * @param commentId - The comment id to remove.
 * @returns Success, or a typed failure (`forbidden` when not the author).
 */
export async function removeCommentAction(
  commentId: string,
): Promise<{ ok: true } | { ok: false; reason: Reason }> {
  const { userId } = await auth();

  if (!userId) {
    return { ok: false, reason: 'auth' };
  }

  const parsed = CommunityIdValidation.safeParse(commentId);

  if (!parsed.success) {
    return { ok: false, reason: 'invalid' };
  }

  const row = await removeComment({ id: parsed.data, authorId: userId });

  return row ? { ok: true } : { ok: false, reason: 'forbidden' };
}

/**
 * Casts, changes, or clears the signed-in user's vote on a post or comment.
 * @param values - The target type/id and the new value (`0` clears the vote).
 * @returns Success, or a typed failure.
 */
export async function voteAction(
  values: z.infer<typeof VoteValidation>,
): Promise<{ ok: true } | { ok: false; reason: Reason }> {
  const { userId } = await auth();

  if (!userId) {
    return { ok: false, reason: 'auth' };
  }

  const parsed = VoteValidation.safeParse(values);

  if (!parsed.success) {
    return { ok: false, reason: 'invalid' };
  }

  await vote({ userId, ...parsed.data });

  return { ok: true };
}

/**
 * Files a report against a post or comment for the signed-in user.
 * @param values - The target type/id, reason, and optional detail.
 * @returns Success, or a typed failure.
 */
export async function reportAction(
  values: z.infer<typeof ReportValidation>,
): Promise<{ ok: true } | { ok: false; reason: Reason }> {
  const { userId } = await auth();

  if (!userId) {
    return { ok: false, reason: 'auth' };
  }

  const parsed = ReportValidation.safeParse(values);

  if (!parsed.success) {
    return { ok: false, reason: 'invalid' };
  }

  await report({ reporterId: userId, ...parsed.data });

  return { ok: true };
}
