import type {
  TmdbMovieDetails,
  TmdbMovieListItem,
  TmdbPagedResponse,
  TmdbPersonListItem,
} from '@/types/Tmdb';
import { Env } from './Env';

// Thin typed wrapper over the TMDB v3 REST API using the Bearer access token.
// See docs/cinepersona-docs/TMDB.md. No SDK dependency. Posters are stored as paths;
// the full URL is built at render with posterUrl()/backdropUrl().

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
const ONE_DAY = 60 * 60 * 24;

type PosterSize = 'w185' | 'w342' | 'w500' | 'w780' | 'original';
type BackdropSize = 'w780' | 'w1280' | 'original';
type ProfileSize = 'w45' | 'w185' | 'h632' | 'original';

// Maps a next-intl locale to a TMDB language tag.
function toLanguage(locale: string) {
  return locale === 'tr' ? 'tr-TR' : 'en-US';
}

/**
 * Performs an authenticated TMDB GET request.
 * @param path - The API path beginning with a slash.
 * @param params - Query parameters appended to the request.
 * @returns The parsed JSON response.
 * @throws When the token is missing or TMDB responds with a non-OK status.
 */
async function tmdbGet<T>(path: string, params: Record<string, string | number> = {}) {
  if (!Env.TMDB_API_READ_TOKEN) {
    throw new Error('TMDB_API_READ_TOKEN is not configured');
  }

  const url = new URL(`${TMDB_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${Env.TMDB_API_READ_TOKEN}`,
      accept: 'application/json',
    },
    next: { revalidate: ONE_DAY },
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed (${response.status}) for ${path}`);
  }

  const data: T = await response.json();

  return data;
}

/**
 * Lists popular movies ordered by descending popularity.
 * @param props - The page number and active locale.
 * @returns A paged list of movie summaries.
 */
export async function discoverPopular(props: { page: number; locale?: string }) {
  return await tmdbGet<TmdbPagedResponse<TmdbMovieListItem>>('/discover/movie', {
    sort_by: 'popularity.desc',
    include_adult: 'false',
    include_video: 'false',
    page: props.page,
    language: toLanguage(props.locale ?? 'en'),
  });
}

/**
 * Lists popular movies for a single release year, ordered by descending popularity.
 * Used by the importer to fan out past TMDB's 500-page discover cap.
 * @param props - The release year, page number and active locale.
 * @returns A paged list of movie summaries for that year.
 */
export async function discoverByYear(props: { year: number; page: number; locale?: string }) {
  return await tmdbGet<TmdbPagedResponse<TmdbMovieListItem>>('/discover/movie', {
    primary_release_year: props.year,
    sort_by: 'popularity.desc',
    include_adult: 'false',
    include_video: 'false',
    page: props.page,
    language: toLanguage(props.locale ?? 'en'),
  });
}

/**
 * Searches people (directors, actors) by name for the CineTest favorite pickers.
 * @param props - The query string, optional locale and page.
 * @returns A paged list of matching people.
 */
export async function searchPeople(props: { query: string; locale?: string; page?: number }) {
  return await tmdbGet<TmdbPagedResponse<TmdbPersonListItem>>('/search/person', {
    query: props.query,
    include_adult: 'false',
    page: props.page ?? 1,
    language: toLanguage(props.locale ?? 'en'),
  });
}

/**
 * Lists popular people ordered by descending popularity. Seeds the CineTest favorite
 * pickers with recognizable faces before the user types a name.
 * @param props - The page number and optional locale.
 * @returns A paged list of popular people.
 */
export async function discoverPopularPeople(props: { page?: number; locale?: string }) {
  return await tmdbGet<TmdbPagedResponse<TmdbPersonListItem>>('/person/popular', {
    page: props.page ?? 1,
    language: toLanguage(props.locale ?? 'en'),
  });
}

/**
 * Discovers popular films matching any of a set of genres, for persona recommendations.
 * @param props - The genre ids to match and the active locale.
 * @returns A paged list of recommended films.
 */
export async function discoverByGenres(props: { genreIds: number[]; locale?: string }) {
  return await tmdbGet<TmdbPagedResponse<TmdbMovieListItem>>('/discover/movie', {
    // Pipe-separated = OR: a film matching any persona genre qualifies. Comma would be
    // AND and, combined with vote_count.gte, leaves most personas with no results.
    with_genres: props.genreIds.join('|'),
    sort_by: 'popularity.desc',
    include_adult: 'false',
    include_video: 'false',
    'vote_count.gte': 300,
    page: 1,
    language: toLanguage(props.locale ?? 'en'),
  });
}

/**
 * Loads full movie details with credits and release dates appended.
 * @param props - The TMDB movie id and active locale.
 * @returns The movie details, or undefined when the id is unknown.
 */
export async function getMovieDetails(props: {
  id: number;
  locale?: string;
}): Promise<TmdbMovieDetails | undefined> {
  try {
    return await tmdbGet<TmdbMovieDetails>(`/movie/${props.id}`, {
      append_to_response: 'credits,release_dates',
      language: toLanguage(props.locale ?? 'en'),
    });
  } catch {
    // Network/auth failure → the caller falls back to the catalogue row.
  }

  return undefined;
}

/**
 * Builds a poster image URL from a TMDB path.
 * @param path - The TMDB poster path, or null.
 * @param size - The poster width preset.
 * @returns The full image URL, or null when no path exists.
 */
export function posterUrl(path: string | null, size: PosterSize = 'w500') {
  return path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null;
}

/**
 * Builds a backdrop image URL from a TMDB path.
 * @param path - The TMDB backdrop path, or null.
 * @param size - The backdrop width preset.
 * @returns The full image URL, or null when no path exists.
 */
export function backdropUrl(path: string | null, size: BackdropSize = 'w1280') {
  return path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null;
}

/**
 * Builds a person profile image URL from a TMDB path.
 * @param path - The TMDB profile path, or null.
 * @param size - The profile width preset.
 * @returns The full image URL, or null when no path exists.
 */
export function profileUrl(path: string | null, size: ProfileSize = 'w185') {
  return path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null;
}
