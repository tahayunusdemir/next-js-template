import type { User } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { cache } from 'react';
import { profileSchema } from '@/models/Schema';
import type { CineTypeSlug } from '@/types/CineType';
import { db } from './DB';

export type Profile = typeof profileSchema.$inferSelect;

/** Mirror fields kept in sync with Clerk so public pages never call Clerk. */
type ClerkMirror = {
  id: string;
  handle: string;
  displayName: string | null;
  avatarUrl: string | null;
};

/**
 * Loads a public profile by its handle (Clerk username, case-insensitive).
 * Memoized per request so `generateMetadata` and the page share one query.
 * @param handle - The handle without the leading `@`.
 * @returns The profile row, or undefined when no profile matches.
 */
export const getProfileByHandle = cache(async (handle: string) => {
  const [row] = await db
    .select()
    .from(profileSchema)
    .where(eq(profileSchema.handle, handle.toLowerCase()))
    .limit(1);

  return row;
});

// Derives the mirrored handle/name/avatar fields from a Clerk user.
function clerkMirror(user: User): ClerkMirror {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  const handle = (user.username ?? user.id).toLowerCase();

  return {
    id: user.id,
    handle,
    displayName: fullName || null,
    avatarUrl: user.imageUrl || null,
  };
}

/**
 * Creates the profile row if missing and refreshes its Clerk-mirrored fields.
 * Idempotent; safe to call on every authenticated profile load.
 * @param user - The current Clerk user.
 * @returns The up-to-date profile row.
 */
export async function ensureProfile(user: User) {
  const mirror = clerkMirror(user);

  const [row] = await db
    .insert(profileSchema)
    .values(mirror)
    .onConflictDoUpdate({
      target: profileSchema.id,
      set: {
        handle: mirror.handle,
        displayName: mirror.displayName,
        avatarUrl: mirror.avatarUrl,
      },
    })
    .returning();

  return row;
}

/**
 * Persists the owned-by-us profile fields for a user.
 * @param props - The Clerk user id and the validated profile fields to store.
 * @returns The updated profile row.
 */
export async function updateProfile(props: {
  id: string;
  values: Pick<Profile, 'bio' | 'country' | 'website'>;
}) {
  const [row] = await db
    .update(profileSchema)
    .set(props.values)
    .where(eq(profileSchema.id, props.id))
    .returning();

  return row;
}

/**
 * Stores a user's CineTest result type on their profile. No-op if no profile exists.
 * @param props - The Clerk user id and the resolved CineType slug.
 */
export async function setProfileCineType(props: { id: string; cineType: CineTypeSlug }) {
  await db
    .update(profileSchema)
    .set({ cineType: props.cineType })
    .where(eq(profileSchema.id, props.id));
}
