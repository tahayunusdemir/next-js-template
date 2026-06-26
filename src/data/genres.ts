// TMDB movie genre ids → stable i18n key suffixes. Ids are stable across the TMDB API,
// so we keep this static instead of fetching /genre/movie/list. Labels live in next-intl
// under the `Films` namespace (`genre_<key>`), keeping `t()` keys a literal union.

export const movieGenres = [
  { id: 28, key: 'action' },
  { id: 12, key: 'adventure' },
  { id: 16, key: 'animation' },
  { id: 35, key: 'comedy' },
  { id: 80, key: 'crime' },
  { id: 99, key: 'documentary' },
  { id: 18, key: 'drama' },
  { id: 10_751, key: 'family' },
  { id: 14, key: 'fantasy' },
  { id: 36, key: 'history' },
  { id: 27, key: 'horror' },
  { id: 10_402, key: 'music' },
  { id: 9648, key: 'mystery' },
  { id: 10_749, key: 'romance' },
  { id: 878, key: 'science_fiction' },
  { id: 10_770, key: 'tv_movie' },
  { id: 53, key: 'thriller' },
  { id: 10_752, key: 'war' },
  { id: 37, key: 'western' },
] as const;

/** Stable i18n key suffix for a movie genre, e.g. `science_fiction`. */
export type MovieGenreKey = (typeof movieGenres)[number]['key'];

const byId = new Map<number, (typeof movieGenres)[number]>(
  movieGenres.map((genre) => [genre.id, genre]),
);

/**
 * Resolves the i18n key suffix for a TMDB genre id.
 * @param id - The TMDB genre id.
 * @returns The key suffix, or undefined when the id is unknown.
 */
export function genreKey(id: number) {
  return byId.get(id)?.key;
}
