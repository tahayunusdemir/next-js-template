// Client-safe author display helpers shared by the community post and comment rows.
// Structural param so both the server `CommunityAuthor` and any lighter author shape fit.

/**
 * Resolves an author's display name, falling back to their `@handle`.
 * @param author - The author's display name and handle.
 * @returns The trimmed display name, or `@handle` when no name is set.
 */
export function authorName(author: { displayName: string | null; handle: string }) {
  return author.displayName?.trim() ? author.displayName : `@${author.handle}`;
}

/**
 * Builds up-to-two-letter initials for an avatar fallback from a display name.
 * @param name - The resolved display name (may start with `@`).
 * @returns Uppercase initials, or `U` when none can be derived.
 */
export function authorInitials(name: string) {
  return name.replace('@', '').trim().slice(0, 2).toUpperCase() || 'U';
}
