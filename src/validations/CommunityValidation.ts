import * as z from 'zod';
import {
  COMMUNITY_CATEGORY_SLUGS,
  COMMUNITY_REPORT_REASONS,
  COMMUNITY_SORTS,
  COMMUNITY_TARGETS,
} from '@/types/Community';

/** Field limits, shared by the forms and the server. */
export const POST_TITLE_MIN = 3;
export const POST_TITLE_MAX = 200;
export const POST_BODY_MAX = 10_000;
export const COMMENT_BODY_MAX = 4000;
export const REPORT_DETAIL_MAX = 500;

/** Posts per page on the category and feed lists. */
export const COMMUNITY_PAGE_SIZE = 20;

// Feed list search params → coerced + defaulted. Parse with `safeParse` and fall back to
// `CommunityFeedValidation.parse({})` so a single malformed param never throws.
export const CommunityFeedValidation = z.object({
  sort: z.enum(COMMUNITY_SORTS).default('hot'),
  page: z.coerce.number().int().min(1).default(1),
});

// Payload for opening a new post under a category.
export const PostCreateValidation = z.object({
  category: z.enum(COMMUNITY_CATEGORY_SLUGS),
  title: z.string().trim().min(POST_TITLE_MIN).max(POST_TITLE_MAX),
  body: z.string().trim().min(1).max(POST_BODY_MAX),
});

// A bare post/comment id, for delete actions that take only the target id.
export const CommunityIdValidation = z.uuid();

// Payload for editing one's own post; the category is fixed once created.
export const PostUpdateValidation = z.object({
  postId: z.uuid(),
  title: z.string().trim().min(POST_TITLE_MIN).max(POST_TITLE_MAX),
  body: z.string().trim().min(1).max(POST_BODY_MAX),
});

// Payload for a comment or threaded reply (`parentId` set for replies).
export const CommentCreateValidation = z.object({
  postId: z.uuid(),
  parentId: z.uuid().optional(),
  body: z.string().trim().min(1).max(COMMENT_BODY_MAX),
});

// Payload for voting on a post or comment. `0` clears the viewer's vote.
export const VoteValidation = z.object({
  targetType: z.enum(COMMUNITY_TARGETS),
  targetId: z.uuid(),
  value: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
});

// Payload for reporting a post or comment.
export const ReportValidation = z.object({
  targetType: z.enum(COMMUNITY_TARGETS),
  targetId: z.uuid(),
  reason: z.enum(COMMUNITY_REPORT_REASONS),
  detail: z.string().trim().max(REPORT_DETAIL_MAX).optional(),
});
