// Inbox filters for the direct-messages list. `requests` surfaces threads from people
// the signed-in user doesn't follow back; `archived` shows per-user archived threads.
export const CHAT_FILTERS = ['all', 'unread', 'requests', 'archived'] as const;

export type ChatFilter = (typeof CHAT_FILTERS)[number];

// Date buckets the conversation list groups threads into, newest first.
export const CHAT_GROUPS = ['today', 'yesterday', 'earlier'] as const;

export type ChatGroup = (typeof CHAT_GROUPS)[number];
