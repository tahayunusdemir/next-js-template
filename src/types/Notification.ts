// The events that produce a notification, all reusing the connections/community seam:
// a new follower, a comment on your post, a reply to your comment, and an upvote on
// your post or comment. CineMatch adds two: `match_found` when someone clears the bar with
// you, and `match_connected` when both sides opt in and chat unlocks. A decline is silent,
// so it produces no notification. Messages are excluded — the inbox already carries unread
// state.
const NOTIFICATION_TYPES = [
  'follow',
  'post_comment',
  'comment_reply',
  'post_upvote',
  'comment_upvote',
  'match_found',
  'match_connected',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
