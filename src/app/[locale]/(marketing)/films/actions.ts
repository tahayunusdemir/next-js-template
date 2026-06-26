'use server';

import { auth } from '@clerk/nextjs/server';
import type * as z from 'zod';
import type { FilmStatus } from '@/libs/Films';
import { setFilmStatus as persistFilmStatus } from '@/libs/Films';
import { FilmStatusValidation } from '@/validations/FilmValidation';

export type FilmStatusResult =
  | { ok: true; status: FilmStatus }
  | { ok: false; reason: 'auth' | 'invalid' | 'error' };

/**
 * Toggles a film's watched/watchlist flag for the signed-in user.
 * @param values - The movie id, the flag to set, and its new value.
 * @returns The updated status, or a typed failure (anonymous, invalid, or error).
 */
export async function setFilmStatus(
  values: z.infer<typeof FilmStatusValidation>,
): Promise<FilmStatusResult> {
  const { userId } = await auth();

  if (!userId) {
    return { ok: false, reason: 'auth' };
  }

  const parsed = FilmStatusValidation.safeParse(values);

  if (!parsed.success) {
    return { ok: false, reason: 'invalid' };
  }

  const row = await persistFilmStatus({ userId, ...parsed.data });

  if (!row) {
    return { ok: false, reason: 'error' };
  }

  return { ok: true, status: { watched: row.watched, watchlist: row.watchlist } };
}
