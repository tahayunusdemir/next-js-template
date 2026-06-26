'use server';

import { auth } from '@clerk/nextjs/server';
import type * as z from 'zod';
import { CINETEST_COOLDOWN_MS } from '@/data/cinetest-questions';
import { createCineTestResult, getLatestCineTestResultForUser } from '@/libs/CineTest';
import { scoreAnswers } from '@/libs/CineTestScoring';
import { listMovies } from '@/libs/Films';
import { setProfileCineType } from '@/libs/Profile';
import { discoverPopularPeople, searchPeople } from '@/libs/Tmdb';
import {
  CinePersonRoleValidation,
  CinePersonSearchValidation,
  CineTestSubmitValidation,
} from '@/validations/CineTestValidation';
import { FILM_PAGE_SIZE, FilmsSearchValidation } from '@/validations/FilmValidation';

export type SubmitCineTestResult =
  | { ok: true; id: string }
  | { ok: false; reason: 'invalid' | 'error' }
  | { ok: false; reason: 'cooldown'; nextAvailableAt: string; lastId: string };

/**
 * Scores a submitted CineTest, persists it, and (when signed in) saves the type. Signed-in
 * users can finish only one test per cooldown window; an early retry returns the last
 * result instead of writing a new row.
 * @param values - The validated answer map.
 * @returns The new result id, a cooldown notice, or a typed failure.
 */
export async function submitCineTest(
  values: z.infer<typeof CineTestSubmitValidation>,
): Promise<SubmitCineTestResult> {
  const parsed = CineTestSubmitValidation.safeParse(values);

  if (!parsed.success) {
    return { ok: false, reason: 'invalid' };
  }

  const { userId } = await auth();

  if (userId) {
    const last = await getLatestCineTestResultForUser(userId);
    const nextAt = last ? last.createdAt.getTime() + CINETEST_COOLDOWN_MS : 0;

    if (last && Date.now() < nextAt) {
      return {
        ok: false,
        reason: 'cooldown',
        nextAvailableAt: new Date(nextAt).toISOString(),
        lastId: last.id,
      };
    }
  }

  const result = scoreAnswers(parsed.data.answers);
  const row = await createCineTestResult({
    userId: userId ?? null,
    answers: parsed.data.answers,
    result,
  });

  if (!row) {
    return { ok: false, reason: 'error' };
  }

  if (userId) {
    await setProfileCineType({ id: userId, cineType: result.cineType });
  }

  return { ok: true, id: row.id };
}

export type CinePersonResult = {
  id: number;
  name: string;
  profilePath: string | null;
  department: string;
};

export type SearchCinePeopleResult =
  | { ok: true; people: CinePersonResult[] }
  | { ok: false; reason: 'invalid' | 'error' };

const PEOPLE_LIMIT = 8;

/**
 * Searches TMDB people for the favorite director/actor pickers, role-ranked.
 * @param values - The query string and the role being filled.
 * @returns A slim, role-prioritized people list, or a typed failure.
 */
export async function searchCinePeople(
  values: z.infer<typeof CinePersonSearchValidation>,
): Promise<SearchCinePeopleResult> {
  const parsed = CinePersonSearchValidation.safeParse(values);

  if (!parsed.success) {
    return { ok: false, reason: 'invalid' };
  }

  const wantedDepartment = parsed.data.role === 'director' ? 'Directing' : 'Acting';

  try {
    const response = await searchPeople({ query: parsed.data.query });
    const people = response.results
      .map((person) => ({
        id: person.id,
        name: person.name,
        profilePath: person.profile_path,
        department: person.known_for_department ?? '',
        popularity: person.popularity ?? 0,
      }))
      .toSorted((a, b) => {
        const aMatch = a.department === wantedDepartment ? 1 : 0;
        const bMatch = b.department === wantedDepartment ? 1 : 0;

        return bMatch - aMatch || b.popularity - a.popularity;
      })
      .slice(0, PEOPLE_LIMIT)
      .map(({ popularity: _popularity, ...person }) => person);

    return { ok: true, people };
  } catch {
    return { ok: false, reason: 'error' };
  }
}

// Directors rank far below actors in TMDB's popularity list, so a single page rarely holds
// enough of them; pull a few pages and keep only the wanted department.
const POPULAR_PEOPLE_PAGES = 5;

/**
 * Lists popular directors or actors to seed the favorite picker before the user types.
 * Pulls several pages of TMDB's popular people and keeps those whose known department
 * matches the role, most popular first.
 * @param values - The role being filled.
 * @returns A slim, role-filtered popular people list, or a typed failure.
 */
export async function popularCinePeople(
  values: z.infer<typeof CinePersonRoleValidation>,
): Promise<SearchCinePeopleResult> {
  const parsed = CinePersonRoleValidation.safeParse(values);

  if (!parsed.success) {
    return { ok: false, reason: 'invalid' };
  }

  const wantedDepartment = parsed.data.role === 'director' ? 'Directing' : 'Acting';

  try {
    const pages = await Promise.all(
      Array.from(
        { length: POPULAR_PEOPLE_PAGES },
        async (_value, index) => await discoverPopularPeople({ page: index + 1 }),
      ),
    );
    const people = pages
      .flatMap((page) => page.results)
      .filter((person) => person.known_for_department === wantedDepartment)
      .toSorted((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
      .slice(0, PEOPLE_LIMIT)
      .map((person) => ({
        id: person.id,
        name: person.name,
        profilePath: person.profile_path,
        department: person.known_for_department ?? '',
      }));

    return { ok: true, people };
  } catch {
    return { ok: false, reason: 'error' };
  }
}

/** A slim catalogue movie for the CineTest film picker — enough to render + score a pick. */
export type CineBrowseMovie = {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  genreIds: number[];
};

export type SearchCineFilmsResult =
  | { ok: true; items: CineBrowseMovie[]; total: number; pageSize: number }
  | { ok: false; reason: 'invalid' | 'error' };

/**
 * Lists one page of the film catalogue for the CineTest picker, reusing the same filters,
 * sort, and page size as the `/films` page so the browse experience matches.
 * @param values - The page, sort, and optional query/genre/decade filters.
 * @returns A slim, paged movie list with the total match count, or a typed failure.
 */
export async function searchCineFilms(
  values: z.infer<typeof FilmsSearchValidation>,
): Promise<SearchCineFilmsResult> {
  const parsed = FilmsSearchValidation.safeParse(values);

  if (!parsed.success) {
    return { ok: false, reason: 'invalid' };
  }

  try {
    const { items, total } = await listMovies({
      page: parsed.data.page,
      sort: parsed.data.sort,
      query: parsed.data.q,
      genre: parsed.data.genre,
      decade: parsed.data.decade,
    });

    return {
      ok: true,
      total,
      pageSize: FILM_PAGE_SIZE,
      items: items.map((movie) => ({
        tmdbId: movie.tmdbId,
        title: movie.title,
        posterPath: movie.posterPath,
        releaseDate: movie.releaseDate,
        genreIds: movie.genreIds,
      })),
    };
  } catch {
    return { ok: false, reason: 'error' };
  }
}
