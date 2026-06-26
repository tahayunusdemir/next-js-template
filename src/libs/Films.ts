import { and, asc, count, desc, eq, gte, ilike, inArray, lte, sql } from 'drizzle-orm';
import { cache } from 'react';
import { movieSchema, userMovieSchema } from '@/models/Schema';
import type { FilmSort, FilmStatusField } from '@/validations/FilmValidation';
import { FILM_PAGE_SIZE } from '@/validations/FilmValidation';
import { db } from './DB';

type CollectionFilters = {
  page: number;
  sort: FilmSort;
  query?: string;
  genre?: number;
  decade?: number;
};

export type Movie = typeof movieSchema.$inferSelect;
export type FilmStatus = { watched: boolean; watchlist: boolean };

// Builds the ORDER BY clause for a given sort key.
function orderFor(sort: FilmSort) {
  switch (sort) {
    case 'rating': {
      return [desc(movieSchema.voteAverage), desc(movieSchema.voteCount)];
    }
    case 'release': {
      return [desc(movieSchema.releaseDate)];
    }
    case 'title': {
      return [asc(movieSchema.title)];
    }
    case 'popularity': {
      return [desc(movieSchema.popularity)];
    }
    default: {
      return [desc(movieSchema.popularity)];
    }
  }
}

// Combines the active list filters into a single WHERE expression.
function whereFor(props: { query?: string; genre?: number; decade?: number }) {
  const filters = [];

  if (props.query) {
    filters.push(ilike(movieSchema.title, `%${props.query}%`));
  }

  if (props.genre) {
    filters.push(sql`${movieSchema.genreIds} @> ${JSON.stringify([props.genre])}::jsonb`);
  }

  if (props.decade) {
    filters.push(
      and(
        gte(movieSchema.releaseDate, `${props.decade}-01-01`),
        lte(movieSchema.releaseDate, `${props.decade + 9}-12-31`),
      ),
    );
  }

  return filters.length ? and(...filters) : undefined;
}

/**
 * Lists catalogue movies for one page of the films grid.
 * @param props - The page number, sort, and optional query/genre/decade filters.
 * @returns The page of movies and the total matching count.
 */
export async function listMovies(props: {
  page: number;
  sort: FilmSort;
  query?: string;
  genre?: number;
  decade?: number;
}) {
  const where = whereFor(props);
  const offset = (props.page - 1) * FILM_PAGE_SIZE;

  const [items, [totals]] = await Promise.all([
    db
      .select()
      .from(movieSchema)
      .where(where)
      .orderBy(...orderFor(props.sort))
      .limit(FILM_PAGE_SIZE)
      .offset(offset),
    db.select({ value: count() }).from(movieSchema).where(where),
  ]);

  return { items, total: totals?.value ?? 0 };
}

/**
 * Lists the most popular catalogue movies for compact showcases like the dashboard home.
 * @param props - How many movies to return.
 * @returns The most popular movies, capped at `props.limit`.
 */
export async function getPopularMovies(props: { limit: number }) {
  return await db
    .select()
    .from(movieSchema)
    .orderBy(desc(movieSchema.popularity))
    .limit(props.limit);
}

/**
 * Loads a single catalogue movie by its TMDB id. Wrapped in `cache` so a page and its
 * `generateMetadata` share one query per request.
 * @param id - The TMDB movie id.
 * @returns The movie row, or undefined when it is not in the catalogue.
 */
export const getMovie = cache(async (id: number) => {
  const [row] = await db.select().from(movieSchema).where(eq(movieSchema.tmdbId, id)).limit(1);

  return row;
});

/**
 * Loads catalogue movies for a set of TMDB ids, returned in the same order as the input
 * (ids not in the catalogue are dropped). Used to render a viewer's picked films as posters.
 * @param props - The TMDB movie ids to look up.
 * @returns The matching movie rows, ordered to match `props.ids`.
 */
export async function getMoviesByIds(props: { ids: number[] }) {
  if (props.ids.length === 0) {
    return [];
  }

  const rows = await db.select().from(movieSchema).where(inArray(movieSchema.tmdbId, props.ids));
  const byId = new Map(rows.map((row) => [row.tmdbId, row]));

  return props.ids.map((id) => byId.get(id)).filter((row): row is Movie => row !== undefined);
}

/**
 * Loads the watched/watchlist status for a user across a set of movies.
 * @param props - The user id and the movie ids to look up.
 * @returns A map keyed by movie id with the user's status for each.
 */
export async function getUserFilmStatus(props: { userId: string; movieIds: number[] }) {
  const map = new Map<number, FilmStatus>();

  if (props.movieIds.length === 0) {
    return map;
  }

  const rows = await db
    .select({
      movieId: userMovieSchema.movieId,
      watched: userMovieSchema.watched,
      watchlist: userMovieSchema.watchlist,
    })
    .from(userMovieSchema)
    .where(
      and(
        eq(userMovieSchema.userId, props.userId),
        inArray(userMovieSchema.movieId, props.movieIds),
      ),
    );

  for (const row of rows) {
    map.set(row.movieId, { watched: row.watched, watchlist: row.watchlist });
  }

  return map;
}

/**
 * Sets one watched/watchlist flag for a user/movie pair, upserting the row.
 * @param props - The user id, movie id, the flag to set, and its new value.
 * @returns The updated user-movie row.
 */
export async function setFilmStatus(props: {
  userId: string;
  movieId: number;
  field: FilmStatusField;
  value: boolean;
}) {
  const watchedAt = props.field === 'watched' && props.value ? new Date() : null;

  const [row] = await db
    .insert(userMovieSchema)
    .values({
      userId: props.userId,
      movieId: props.movieId,
      [props.field]: props.value,
      watchedAt,
    })
    .onConflictDoUpdate({
      target: [userMovieSchema.userId, userMovieSchema.movieId],
      set: { [props.field]: props.value, watchedAt },
    })
    .returning();

  return row;
}

/**
 * Counts how many users watched or watchlisted a film.
 * @param movieId - The TMDB movie id.
 * @returns The watched and watchlist counts.
 */
export async function getFilmCounts(movieId: number) {
  const [row] = await db
    .select({
      watched: count(sql`CASE WHEN ${userMovieSchema.watched} THEN 1 END`),
      watchlist: count(sql`CASE WHEN ${userMovieSchema.watchlist} THEN 1 END`),
    })
    .from(userMovieSchema)
    .where(eq(userMovieSchema.movieId, movieId));

  return { watched: row?.watched ?? 0, watchlist: row?.watchlist ?? 0 };
}

/**
 * Lists a user's watched or watchlisted films, joined to the catalogue.
 * @param props - The user id and which collection to load.
 * @returns The movies in that collection, most recent first.
 */
export async function getUserFilms(props: {
  userId: string;
  kind: FilmStatusField;
  limit?: number;
}) {
  const flag = props.kind === 'watched' ? userMovieSchema.watched : userMovieSchema.watchlist;

  const query = db
    .select({ movie: movieSchema })
    .from(userMovieSchema)
    .innerJoin(movieSchema, eq(userMovieSchema.movieId, movieSchema.tmdbId))
    .where(and(eq(userMovieSchema.userId, props.userId), eq(flag, true)))
    .orderBy(desc(userMovieSchema.updatedAt));

  const rows = await (props.limit ? query.limit(props.limit) : query);

  return rows.map((row) => row.movie);
}

/**
 * Lists one page of a user's watched or watchlisted films with the catalogue filters.
 * @param props - The user id, collection kind, page, sort, and optional query/genre/decade.
 * @returns The page of movies in that collection and the total matching count.
 */
export async function listUserFilms(
  props: { userId: string; kind: FilmStatusField } & CollectionFilters,
) {
  const flag = props.kind === 'watched' ? userMovieSchema.watched : userMovieSchema.watchlist;
  const where = and(eq(userMovieSchema.userId, props.userId), eq(flag, true), whereFor(props));
  const offset = (props.page - 1) * FILM_PAGE_SIZE;

  const [rows, [totals]] = await Promise.all([
    db
      .select({ movie: movieSchema })
      .from(userMovieSchema)
      .innerJoin(movieSchema, eq(userMovieSchema.movieId, movieSchema.tmdbId))
      .where(where)
      .orderBy(...orderFor(props.sort))
      .limit(FILM_PAGE_SIZE)
      .offset(offset),
    db
      .select({ value: count() })
      .from(userMovieSchema)
      .innerJoin(movieSchema, eq(userMovieSchema.movieId, movieSchema.tmdbId))
      .where(where),
  ]);

  return { items: rows.map((row) => row.movie), total: totals?.value ?? 0 };
}
