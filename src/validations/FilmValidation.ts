import * as z from 'zod';

// Constant page size for the films grid. The density toggle (compact 12-col / comfortable
// 6-col) only changes poster size/columns, never the page size, so pagination is stable.
export const FILM_PAGE_SIZE = 72;

export const FILM_SORTS = ['popularity', 'rating', 'release', 'title'] as const;
const FILM_DENSITIES = ['compact', 'comfortable'] as const;
const FILM_STATUS_FIELDS = ['watched', 'watchlist'] as const;

export type FilmSort = (typeof FILM_SORTS)[number];
export type FilmDensity = (typeof FILM_DENSITIES)[number];
export type FilmStatusField = (typeof FILM_STATUS_FIELDS)[number];

// List search params → coerced + defaulted. Parse with `safeParse` and fall back to
// `FilmsSearchValidation.parse({})` so a single malformed param never throws.
export const FilmsSearchValidation = z.object({
  page: z.coerce.number().int().min(1).default(1),
  q: z.string().trim().max(80).optional(),
  genre: z.coerce.number().int().optional(),
  decade: z.coerce.number().int().optional(),
  sort: z.enum(FILM_SORTS).default('popularity'),
  density: z.enum(FILM_DENSITIES).default('compact'),
});

// Server action payload for toggling a film's watched/watchlist status.
export const FilmStatusValidation = z.object({
  movieId: z.coerce.number().int(),
  field: z.enum(FILM_STATUS_FIELDS),
  value: z.boolean(),
});
