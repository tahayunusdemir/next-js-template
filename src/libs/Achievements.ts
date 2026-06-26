import { and, count, eq, or } from 'drizzle-orm';
import {
  achievementGroups,
  ALL_GENRES_TOTAL,
  CLASSIC_BEFORE_YEAR,
  DECADE_RANGE,
  GENRE_IDS,
  HIDDEN_GEM_MAX_VOTES,
  MIDNIGHT_HOURS,
  MODERN_FROM_YEAR,
} from '@/data/achievements';
import { matchSchema, movieSchema, userMovieSchema } from '@/models/Schema';
import type { AchievementMetricValues, AchievementsView } from '@/types/Achievements';
import { db } from './DB';

// Achievements engine: reads a viewer's watched films and matches, reduces them to per-metric
// tallies, and resolves the static catalogue (src/data/achievements.ts) into the page model.
// The reducers are pure (unit-tested, no DB); only the thin query wrappers touch Drizzle.

/** One watched film, reduced to the fields the metrics need. */
export type WatchedFact = {
  genreIds: number[];
  releaseDate: string | null;
  voteCount: number;
  watchedAt: Date | null;
};

const MIDNIGHT_HOUR_SET = new Set<number>(MIDNIGHT_HOURS);

/**
 * Builds a metric record with every metric at zero — the base a viewer's tallies merge onto.
 * @returns Every achievement metric set to zero.
 */
export function zeroMetrics(): AchievementMetricValues {
  return {
    watched: 0,
    comedy: 0,
    horror: 0,
    scifi: 0,
    drama: 0,
    classic: 0,
    modern: 0,
    hidden_gems: 0,
    genre_variety: 0,
    decades: 0,
    archivist: 0,
    matches: 0,
    midnight: 0,
    rewatch: 0,
    directors: 0,
    director_loyalty: 0,
    trilogy: 0,
    festival: 0,
    emotional: 0,
    slow: 0,
    countries: 0,
  };
}

// Parses the four-digit year from a TMDB `YYYY-MM-DD` release date.
function releaseYear(releaseDate: string | null) {
  const year = releaseDate ? Number.parseInt(releaseDate.slice(0, 4), 10) : Number.NaN;

  return Number.isNaN(year) ? undefined : year;
}

/**
 * Reduces a viewer's watched films to the metrics derivable from the catalogue cache.
 * Pure so the counting rules can be unit-tested without a database.
 * @param facts - The viewer's watched films, one `WatchedFact` each.
 * @returns The watched-derived slice of the metric tallies.
 */
export function reduceWatchedFacts(facts: WatchedFact[]): Partial<AchievementMetricValues> {
  const genres = new Set<number>();
  const decades = new Set<number>();
  let comedy = 0;
  let horror = 0;
  let scifi = 0;
  let drama = 0;
  let classic = 0;
  let modern = 0;
  let hiddenGems = 0;
  let midnight = 0;

  for (const fact of facts) {
    for (const id of fact.genreIds) {
      genres.add(id);
    }

    if (fact.genreIds.includes(GENRE_IDS.comedy)) {
      comedy += 1;
    }

    if (fact.genreIds.includes(GENRE_IDS.horror)) {
      horror += 1;
    }

    if (fact.genreIds.includes(GENRE_IDS.scifi)) {
      scifi += 1;
    }

    if (fact.genreIds.includes(GENRE_IDS.drama)) {
      drama += 1;
    }

    const year = releaseYear(fact.releaseDate);

    if (year !== undefined) {
      if (year < CLASSIC_BEFORE_YEAR) {
        classic += 1;
      }

      if (year >= MODERN_FROM_YEAR) {
        modern += 1;
      }

      const decade = Math.floor(year / 10) * 10;

      if (decade >= DECADE_RANGE.from && decade <= DECADE_RANGE.to) {
        decades.add(decade);
      }
    }

    if (fact.voteCount < HIDDEN_GEM_MAX_VOTES) {
      hiddenGems += 1;
    }

    if (fact.watchedAt && MIDNIGHT_HOUR_SET.has(fact.watchedAt.getHours())) {
      midnight += 1;
    }
  }

  const watched = facts.length;

  return {
    watched,
    archivist: watched,
    comedy,
    horror,
    scifi,
    drama,
    classic,
    modern,
    hidden_gems: hiddenGems,
    genre_variety: Math.min(genres.size, ALL_GENRES_TOTAL),
    decades: decades.size,
    midnight,
  };
}

/**
 * Resolves the static catalogue against a viewer's metric tallies. Pure and unlock-only:
 * a badge unlocks when it is `live` and its metric reaches the threshold.
 * @param metrics - The viewer's per-metric tallies.
 * @returns Every group resolved, plus the headline unlocked/total counts.
 */
export function buildAchievementView(metrics: AchievementMetricValues): AchievementsView {
  const groups = achievementGroups.map((group) => {
    const achievements = group.achievements.map((achievement) => {
      const value = metrics[achievement.metric];

      return {
        id: achievement.id,
        medal: achievement.medal,
        reqKind: achievement.reqKind,
        threshold: achievement.threshold,
        live: achievement.live,
        value,
        unlocked: achievement.live && value >= achievement.threshold,
      };
    });

    return {
      id: group.id,
      secret: group.secret ?? false,
      unlockedCount: achievements.filter((achievement) => achievement.unlocked).length,
      total: achievements.length,
      achievements,
    };
  });

  return {
    groups,
    totalUnlocked: groups.reduce((sum, group) => sum + group.unlockedCount, 0),
    totalCount: groups.reduce((sum, group) => sum + group.total, 0),
  };
}

/**
 * Loads a viewer's watched films joined to the catalogue, reduced to the metric fields.
 * @param userId - The Clerk user id.
 * @returns One `WatchedFact` per watched film.
 */
async function getWatchedFacts(userId: string): Promise<WatchedFact[]> {
  return await db
    .select({
      genreIds: movieSchema.genreIds,
      releaseDate: movieSchema.releaseDate,
      voteCount: movieSchema.voteCount,
      watchedAt: userMovieSchema.watchedAt,
    })
    .from(userMovieSchema)
    .innerJoin(movieSchema, eq(userMovieSchema.movieId, movieSchema.tmdbId))
    .where(and(eq(userMovieSchema.userId, userId), eq(userMovieSchema.watched, true)));
}

/**
 * Counts the viewer's connected matches (both sides accepted), the Matches badge metric.
 * @param userId - The Clerk user id.
 * @returns The number of connected matches.
 */
async function countConnectedMatches(userId: string) {
  const [row] = await db
    .select({ value: count() })
    .from(matchSchema)
    .where(
      and(
        or(eq(matchSchema.userAId, userId), eq(matchSchema.userBId, userId)),
        eq(matchSchema.status, 'connected'),
      ),
    );

  return row?.value ?? 0;
}

/**
 * Computes every achievement metric for a viewer. Metrics without a data source stay at zero.
 * @param userId - The Clerk user id.
 * @returns The full per-metric tally record.
 */
export async function getAchievementMetrics(userId: string): Promise<AchievementMetricValues> {
  const [facts, matches] = await Promise.all([
    getWatchedFacts(userId),
    countConnectedMatches(userId),
  ]);

  return { ...zeroMetrics(), ...reduceWatchedFacts(facts), matches };
}
