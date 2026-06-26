'use server';

import { currentUser } from '@clerk/nextjs/server';
import type * as z from 'zod';
import { ensureProfile, updateProfile } from '@/libs/Profile';
import { ProfileValidation } from '@/validations/ProfileValidation';

export type ProfileResult = { ok: boolean };

// Maps an empty or missing string to null for storage.
function blankToNull(value?: string) {
  return value && value.length > 0 ? value : null;
}

/**
 * Persists the owned-by-us profile fields for the signed-in user.
 * Re-mirrors Clerk identity first so handle/name/avatar stay in sync.
 * @param values - The submitted profile fields.
 * @returns Whether the update was accepted.
 */
export async function saveProfile(
  values: z.infer<typeof ProfileValidation>,
): Promise<ProfileResult> {
  const user = await currentUser();

  if (!user) {
    return { ok: false };
  }

  const parsed = ProfileValidation.safeParse(values);

  if (!parsed.success) {
    return { ok: false };
  }

  await ensureProfile(user);
  await updateProfile({
    id: user.id,
    values: {
      bio: blankToNull(parsed.data.bio),
      country: blankToNull(parsed.data.country),
      website: blankToNull(parsed.data.website),
    },
  });

  return { ok: true };
}
