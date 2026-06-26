import * as z from 'zod';

const FOLLOW_ACTIONS = ['follow', 'unfollow', 'block', 'unblock'] as const;

export type FollowAction = (typeof FOLLOW_ACTIONS)[number];

// Server action payload for mutating the follow/block graph against one target user.
export const FollowValidation = z.object({
  targetId: z.string().min(1),
  action: z.enum(FOLLOW_ACTIONS),
});
