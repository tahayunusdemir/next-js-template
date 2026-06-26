/**
 * One-off importer that seeds up to ~50,000 films from TMDB into the `movie` table. Not a
 * runtime path. Re-running refreshes popularity/votes (idempotent upsert).
 *
 * TMDB caps `/discover/movie` pagination at 500 pages (~10,000 rows per query), so the
 * importer runs in two phases: (1) global popularity for the top ~10k, then (2) a fan-out
 * by release year to gather the long tail until TARGET is reached.
 *
 * Run with the session pooler in production (DIRECT_URL), per
 * docs/cinepersona-docs/supabase-migration.md §5:
 *
 *   dotenv -c -- npx tsx src/scripts/import-movies.ts
 *
 * Locally, start the dev PGlite server first (`npm run dev`) so DATABASE_URL is reachable.
 */
import { setTimeout as sleep } from 'node:timers/promises';
import { sql } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { discoverByYear, discoverPopular } from '@/libs/Tmdb';
import { movieSchema } from '@/models/Schema';
import type { TmdbMovieListItem } from '@/types/Tmdb';

const TARGET = 10_000; // desired catalogue size (unique films)
const POPULAR_PAGES = 500; // TMDB hard cap for a single discover query
const MAX_PAGES_PER_YEAR = 500; // same cap, applied per release year
const FIRST_YEAR = new Date().getUTCFullYear();
const LAST_YEAR = 1900;
const THROTTLE_MS = 80; // ~12.5 req/s, well under TMDB's ~40 req/s ceiling
const MAX_RETRIES = 5; // attempts after the first try before giving up
const RETRY_BASE_MS = 500; // first backoff; doubles each attempt (0.5s → 8s)

/**
 * Retries a TMDB request with exponential backoff and jitter, so a single transient failure
 * (rate limit, network blip, 5xx) doesn't abort an import of thousands of sequential requests.
 * The backoff schedule (0.5s→8s) comfortably subsumes TMDB's typical ~1s rate-limit window.
 * @param label - A short request label used in retry log lines.
 * @param fn - The request to run; retried on any thrown error.
 * @param args - Arguments forwarded to `fn` on every attempt.
 * @returns The first successful result.
 * @throws The last error when all retries are exhausted.
 */
async function withRetry<A extends unknown[], T>(
  label: string,
  fn: (...args: A) => Promise<T>,
  ...args: A
) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await fn(...args);
    } catch (error) {
      if (attempt >= MAX_RETRIES) {
        throw error;
      }
      const delay = RETRY_BASE_MS * 2 ** attempt + Math.floor(Math.random() * RETRY_BASE_MS);
      console.warn(
        `${label} failed (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying in ${delay}ms: ${String(error)}`,
      );
      await sleep(delay);
    }
  }
}

// drizzle helper: reference the conflicting row's incoming value (EXCLUDED.<col>).
function sqlExcluded(column: string) {
  return sql.raw(`excluded.${column}`);
}

function toRow(item: TmdbMovieListItem) {
  return {
    tmdbId: item.id,
    title: item.title,
    originalTitle: item.original_title,
    overview: item.overview,
    posterPath: item.poster_path,
    backdropPath: item.backdrop_path,
    releaseDate: item.release_date || null,
    popularity: item.popularity,
    voteAverage: item.vote_average,
    voteCount: item.vote_count,
    genreIds: item.genre_ids,
    originalLanguage: item.original_language,
    adult: item.adult,
  };
}

async function upsertPage(items: TmdbMovieListItem[]) {
  if (items.length === 0) {
    return;
  }

  await db
    .insert(movieSchema)
    .values(items.map(toRow))
    .onConflictDoUpdate({
      target: movieSchema.tmdbId,
      set: {
        title: sqlExcluded('title'),
        popularity: sqlExcluded('popularity'),
        voteAverage: sqlExcluded('vote_average'),
        voteCount: sqlExcluded('vote_count'),
        posterPath: sqlExcluded('poster_path'),
        backdropPath: sqlExcluded('backdrop_path'),
      },
    });
}

// Unique films currently stored — the source of truth for progress, since upserts dedupe.
async function catalogueSize() {
  const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(movieSchema);
  return row?.count ?? 0;
}

// Phase 1: the globally most popular films (capped by TMDB at 500 pages ≈ 10k rows).
async function importPopular() {
  for (let page = 1; page <= POPULAR_PAGES; page += 1) {
    const data = await withRetry(`popular p${page}`, discoverPopular, { page });
    await upsertPage(data.results);

    if (page % 50 === 0 || page === POPULAR_PAGES) {
      console.warn(`Popular page ${page}/${POPULAR_PAGES} → ${await catalogueSize()} films`);
    }

    await sleep(THROTTLE_MS);
  }
}

// Phase 2: fan out by release year to get past the per-query page cap, until TARGET.
async function importByYear() {
  for (let year = FIRST_YEAR; year >= LAST_YEAR; year -= 1) {
    const first = await withRetry(`${year} p1`, discoverByYear, { year, page: 1 });
    await upsertPage(first.results);
    const pages = Math.min(first.total_pages, MAX_PAGES_PER_YEAR);

    let total = await catalogueSize();
    for (let page = 2; page <= pages && total < TARGET; page += 1) {
      const data = await withRetry(`${year} p${page}`, discoverByYear, { year, page });
      await upsertPage(data.results);
      if (page % 25 === 0) {
        total = await catalogueSize();
      }
      await sleep(THROTTLE_MS);
    }

    total = await catalogueSize();
    console.warn(`Year ${year} → ${total} films`);
    if (total >= TARGET) {
      return;
    }
  }
}

async function main() {
  await importPopular();

  if ((await catalogueSize()) < TARGET) {
    await importByYear();
  }

  console.warn(`Done. Catalogue has ${await catalogueSize()} films.`);
}

try {
  await main();
  process.exit(0);
} catch (error) {
  console.error(error);
  process.exit(1);
}
