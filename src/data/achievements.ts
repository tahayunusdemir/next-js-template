import type { AchievementGroup } from '@/types/Achievements';
import { movieGenres } from './genres';

// Static catalogue for the Achievements page — the single source of truth for every badge,
// its group, medal rung, unlock threshold, and the metric it counts against. Display copy is
// keyed off the ids/medals/reqKinds and resolved via next-intl (`DashboardAchievementsPage`).
// Mirrors the shape of src/data/cinetype.ts: a typed `as const`-style table with no behaviour.
//
// Badges whose metric has no data source yet (rewatch, directors, trilogies, festival winners,
// emotional, slow, countries) are flagged `live: false` and render locked at 0% until the data
// lands — no schema change is needed to ship the rest.

// --- Tunable thresholds for the live metrics (consumed by src/libs/Achievements.ts) ---------

/** A film counts as "classic" when released strictly before this year. */
export const CLASSIC_BEFORE_YEAR = 1970;
/** A film counts as "modern" when released in or after this year. */
export const MODERN_FROM_YEAR = 2000;
/** A watched film is a "hidden gem" when its TMDB vote count is below this. */
export const HIDDEN_GEM_MAX_VOTES = 100_000;
/** Inclusive decade range the "Cinema Historian" badge spans (1920…2020 → 11 decades). */
export const DECADE_RANGE = { from: 1920, to: 2020 } as const;
/** Local hours counted as "after midnight" for the Midnight Cinephile badge. */
export const MIDNIGHT_HOURS = [0, 1, 2, 3, 4, 5] as const;

/** Number of decades in DECADE_RANGE — the "every decade" unlock threshold. */
const DECADES_TOTAL = (DECADE_RANGE.to - DECADE_RANGE.from) / 10 + 1;

/** TMDB genre ids used by the per-genre paths. */
export const GENRE_IDS = {
  comedy: 35,
  horror: 27,
  scifi: 878,
  drama: 18,
} as const satisfies Record<string, number>;

/** Distinct-genre count needed for the "all genres" badge. */
export const ALL_GENRES_TOTAL = movieGenres.length;

// --- The catalogue --------------------------------------------------------------------------

export const achievementGroups: AchievementGroup[] = [
  {
    id: 'total',
    achievements: [
      {
        id: 'total-bronze',
        metric: 'watched',
        threshold: 25,
        medal: 'bronze',
        reqKind: 'films',
        live: true,
      },
      {
        id: 'total-silver',
        metric: 'watched',
        threshold: 100,
        medal: 'silver',
        reqKind: 'films',
        live: true,
      },
      {
        id: 'total-gold',
        metric: 'watched',
        threshold: 300,
        medal: 'gold',
        reqKind: 'films',
        live: true,
      },
      {
        id: 'total-legendary',
        metric: 'watched',
        threshold: 700,
        medal: 'legendary',
        reqKind: 'films',
        live: true,
      },
      {
        id: 'total-mythic',
        metric: 'watched',
        threshold: 1500,
        medal: 'mythic',
        reqKind: 'films',
        live: true,
      },
    ],
  },
  {
    id: 'comedy',
    achievements: [
      {
        id: 'comedy-bronze',
        metric: 'comedy',
        threshold: 20,
        medal: 'bronze',
        reqKind: 'comedy_films',
        live: true,
      },
      {
        id: 'comedy-silver',
        metric: 'comedy',
        threshold: 60,
        medal: 'silver',
        reqKind: 'comedy_films',
        live: true,
      },
      {
        id: 'comedy-gold',
        metric: 'comedy',
        threshold: 120,
        medal: 'gold',
        reqKind: 'comedy_films',
        live: true,
      },
      {
        id: 'comedy-legendary',
        metric: 'comedy',
        threshold: 250,
        medal: 'legendary',
        reqKind: 'comedy_films',
        live: true,
      },
    ],
  },
  {
    id: 'horror',
    achievements: [
      {
        id: 'horror-bronze',
        metric: 'horror',
        threshold: 20,
        medal: 'bronze',
        reqKind: 'horror_films',
        live: true,
      },
      {
        id: 'horror-silver',
        metric: 'horror',
        threshold: 60,
        medal: 'silver',
        reqKind: 'horror_films',
        live: true,
      },
      {
        id: 'horror-gold',
        metric: 'horror',
        threshold: 120,
        medal: 'gold',
        reqKind: 'horror_films',
        live: true,
      },
      {
        id: 'horror-legendary',
        metric: 'horror',
        threshold: 250,
        medal: 'legendary',
        reqKind: 'horror_films',
        live: true,
      },
    ],
  },
  {
    id: 'scifi',
    achievements: [
      {
        id: 'scifi-bronze',
        metric: 'scifi',
        threshold: 20,
        medal: 'bronze',
        reqKind: 'scifi_films',
        live: true,
      },
      {
        id: 'scifi-silver',
        metric: 'scifi',
        threshold: 60,
        medal: 'silver',
        reqKind: 'scifi_films',
        live: true,
      },
      {
        id: 'scifi-gold',
        metric: 'scifi',
        threshold: 120,
        medal: 'gold',
        reqKind: 'scifi_films',
        live: true,
      },
      {
        id: 'scifi-legendary',
        metric: 'scifi',
        threshold: 250,
        medal: 'legendary',
        reqKind: 'scifi_films',
        live: true,
      },
    ],
  },
  {
    id: 'drama',
    achievements: [
      {
        id: 'drama-bronze',
        metric: 'drama',
        threshold: 20,
        medal: 'bronze',
        reqKind: 'drama_films',
        live: true,
      },
      {
        id: 'drama-silver',
        metric: 'drama',
        threshold: 60,
        medal: 'silver',
        reqKind: 'drama_films',
        live: true,
      },
      {
        id: 'drama-gold',
        metric: 'drama',
        threshold: 120,
        medal: 'gold',
        reqKind: 'drama_films',
        live: true,
      },
      {
        id: 'drama-legendary',
        metric: 'drama',
        threshold: 250,
        medal: 'legendary',
        reqKind: 'drama_films',
        live: true,
      },
    ],
  },
  {
    id: 'classic',
    achievements: [
      {
        id: 'classic-bronze',
        metric: 'classic',
        threshold: 10,
        medal: 'bronze',
        reqKind: 'classic_films',
        live: true,
      },
      {
        id: 'classic-silver',
        metric: 'classic',
        threshold: 30,
        medal: 'silver',
        reqKind: 'classic_films',
        live: true,
      },
      {
        id: 'classic-gold',
        metric: 'classic',
        threshold: 70,
        medal: 'gold',
        reqKind: 'classic_films',
        live: true,
      },
      {
        id: 'classic-legendary',
        metric: 'classic',
        threshold: 150,
        medal: 'legendary',
        reqKind: 'classic_films',
        live: true,
      },
    ],
  },
  {
    id: 'modern',
    achievements: [
      {
        id: 'modern-bronze',
        metric: 'modern',
        threshold: 20,
        medal: 'bronze',
        reqKind: 'modern_films',
        live: true,
      },
      {
        id: 'modern-silver',
        metric: 'modern',
        threshold: 80,
        medal: 'silver',
        reqKind: 'modern_films',
        live: true,
      },
      {
        id: 'modern-gold',
        metric: 'modern',
        threshold: 150,
        medal: 'gold',
        reqKind: 'modern_films',
        live: true,
      },
      {
        id: 'modern-legendary',
        metric: 'modern',
        threshold: 300,
        medal: 'legendary',
        reqKind: 'modern_films',
        live: true,
      },
    ],
  },
  {
    id: 'rewatch',
    achievements: [
      {
        id: 'rewatch-bronze',
        metric: 'rewatch',
        threshold: 5,
        medal: 'bronze',
        reqKind: 'rewatches',
        live: false,
      },
      {
        id: 'rewatch-silver',
        metric: 'rewatch',
        threshold: 20,
        medal: 'silver',
        reqKind: 'rewatches',
        live: false,
      },
      {
        id: 'rewatch-gold',
        metric: 'rewatch',
        threshold: 50,
        medal: 'gold',
        reqKind: 'rewatches',
        live: false,
      },
      {
        id: 'rewatch-legendary',
        metric: 'rewatch',
        threshold: 120,
        medal: 'legendary',
        reqKind: 'rewatches',
        live: false,
      },
    ],
  },
  {
    id: 'matches',
    achievements: [
      {
        id: 'matches-bronze',
        metric: 'matches',
        threshold: 3,
        medal: 'bronze',
        reqKind: 'matches',
        live: true,
      },
      {
        id: 'matches-silver',
        metric: 'matches',
        threshold: 10,
        medal: 'silver',
        reqKind: 'matches',
        live: true,
      },
      {
        id: 'matches-gold',
        metric: 'matches',
        threshold: 30,
        medal: 'gold',
        reqKind: 'matches',
        live: true,
      },
      {
        id: 'matches-legendary',
        metric: 'matches',
        threshold: 80,
        medal: 'legendary',
        reqKind: 'matches',
        live: true,
      },
    ],
  },
  {
    id: 'discovery',
    achievements: [
      {
        id: 'discovery-bronze',
        metric: 'hidden_gems',
        threshold: 10,
        medal: 'bronze',
        reqKind: 'hidden_gems_intro',
        live: true,
      },
      {
        id: 'discovery-silver',
        metric: 'hidden_gems',
        threshold: 40,
        medal: 'silver',
        reqKind: 'hidden_gems',
        live: true,
      },
      {
        id: 'discovery-gold',
        metric: 'hidden_gems',
        threshold: 80,
        medal: 'gold',
        reqKind: 'hidden_gems',
        live: true,
      },
      {
        id: 'discovery-legendary',
        metric: 'hidden_gems',
        threshold: 150,
        medal: 'legendary',
        reqKind: 'hidden_gems',
        live: true,
      },
    ],
  },
  {
    id: 'directors',
    achievements: [
      {
        id: 'directors-bronze',
        metric: 'directors',
        threshold: 5,
        medal: 'bronze',
        reqKind: 'directors',
        live: false,
      },
      {
        id: 'directors-silver',
        metric: 'directors',
        threshold: 10,
        medal: 'silver',
        reqKind: 'directors',
        live: false,
      },
      {
        id: 'directors-gold',
        metric: 'directors',
        threshold: 20,
        medal: 'gold',
        reqKind: 'directors',
        live: false,
      },
      {
        id: 'directors-legendary',
        metric: 'directors',
        threshold: 40,
        medal: 'legendary',
        reqKind: 'directors',
        live: false,
      },
    ],
  },
  {
    id: 'emotional',
    achievements: [
      {
        id: 'emotional-bronze',
        metric: 'emotional',
        threshold: 10,
        medal: 'bronze',
        reqKind: 'emotional_films',
        live: false,
      },
      {
        id: 'emotional-silver',
        metric: 'emotional',
        threshold: 40,
        medal: 'silver',
        reqKind: 'emotional_films',
        live: false,
      },
      {
        id: 'emotional-gold',
        metric: 'emotional',
        threshold: 90,
        medal: 'gold',
        reqKind: 'emotional_films',
        live: false,
      },
      {
        id: 'emotional-legendary',
        metric: 'emotional',
        threshold: 180,
        medal: 'legendary',
        reqKind: 'emotional_films',
        live: false,
      },
    ],
  },
  {
    id: 'slow',
    achievements: [
      {
        id: 'slow-bronze',
        metric: 'slow',
        threshold: 5,
        medal: 'bronze',
        reqKind: 'slow_films',
        live: false,
      },
      {
        id: 'slow-silver',
        metric: 'slow',
        threshold: 20,
        medal: 'silver',
        reqKind: 'slow_films',
        live: false,
      },
      {
        id: 'slow-gold',
        metric: 'slow',
        threshold: 50,
        medal: 'gold',
        reqKind: 'slow_films',
        live: false,
      },
      {
        id: 'slow-legendary',
        metric: 'slow',
        threshold: 100,
        medal: 'legendary',
        reqKind: 'slow_films',
        live: false,
      },
    ],
  },
  {
    id: 'genres',
    achievements: [
      {
        id: 'genres-bronze',
        metric: 'genre_variety',
        threshold: 5,
        medal: 'bronze',
        reqKind: 'genres',
        live: true,
      },
      {
        id: 'genres-silver',
        metric: 'genre_variety',
        threshold: 8,
        medal: 'silver',
        reqKind: 'genres',
        live: true,
      },
      {
        id: 'genres-gold',
        metric: 'genre_variety',
        threshold: 11,
        medal: 'gold',
        reqKind: 'genres',
        live: true,
      },
      {
        id: 'genres-legendary',
        metric: 'genre_variety',
        threshold: ALL_GENRES_TOTAL,
        medal: 'legendary',
        reqKind: 'all_genres',
        live: true,
      },
    ],
  },
  {
    id: 'secret',
    secret: true,
    achievements: [
      {
        id: 'secret-midnight',
        metric: 'midnight',
        threshold: 5,
        medal: 'secret',
        reqKind: 'after_midnight',
        live: true,
      },
      {
        id: 'secret-festival',
        metric: 'festival',
        threshold: 15,
        medal: 'secret',
        reqKind: 'festival_winners',
        live: false,
      },
      {
        id: 'secret-trilogy',
        metric: 'trilogy',
        threshold: 3,
        medal: 'secret',
        reqKind: 'trilogies',
        live: false,
      },
      {
        id: 'secret-loyalty',
        metric: 'director_loyalty',
        threshold: 10,
        medal: 'secret',
        reqKind: 'director_loyalty',
        live: false,
      },
    ],
  },
  {
    id: 'super',
    achievements: [
      {
        id: 'super-historian',
        metric: 'decades',
        threshold: DECADES_TOTAL,
        medal: 'super_legendary',
        reqKind: 'decades_all',
        live: true,
      },
      {
        id: 'super-countries',
        metric: 'countries',
        threshold: 20,
        medal: 'super_legendary',
        reqKind: 'countries',
        live: false,
      },
      {
        id: 'super-archivist',
        metric: 'archivist',
        threshold: 2000,
        medal: 'super_legendary',
        reqKind: 'films_log',
        live: true,
      },
    ],
  },
];
