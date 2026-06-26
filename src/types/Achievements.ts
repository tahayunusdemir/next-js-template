// Type-only declarations for the Achievements catalogue (src/data/achievements.ts). Ids,
// medals, metrics, and requirement kinds are literal unions so the generated next-intl keys
// (`${id}_name`, `medal_${medal}`, `${groupId}_title`, the requirement templates) stay within
// the strict literal union `t()` accepts — see the `next-intl-strict-dynamic-keys` memo.

/** Medal rung a badge sits on; also the prefix shown before its requirement line. */
export type AchievementMedal =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'legendary'
  | 'mythic'
  | 'secret'
  | 'super_legendary';

/** A countable signal a badge unlocks against; resolved to a number by the engine. */
type AchievementMetric =
  | 'watched'
  | 'comedy'
  | 'horror'
  | 'scifi'
  | 'drama'
  | 'classic'
  | 'modern'
  | 'hidden_gems'
  | 'genre_variety'
  | 'decades'
  | 'archivist'
  | 'matches'
  | 'midnight'
  | 'rewatch'
  | 'directors'
  | 'director_loyalty'
  | 'trilogy'
  | 'festival'
  | 'emotional'
  | 'slow'
  | 'countries';

/** Requirement-text template key; rendered with the badge threshold as `{count}`. */
type AchievementReqKind =
  | 'films'
  | 'films_log'
  | 'comedy_films'
  | 'horror_films'
  | 'scifi_films'
  | 'drama_films'
  | 'classic_films'
  | 'modern_films'
  | 'rewatches'
  | 'matches'
  | 'hidden_gems_intro'
  | 'hidden_gems'
  | 'genres'
  | 'all_genres'
  | 'after_midnight'
  | 'festival_winners'
  | 'trilogies'
  | 'director_loyalty'
  | 'directors'
  | 'emotional_films'
  | 'slow_films'
  | 'decades_all'
  | 'countries';

/** Group (card) the badges are organised under. */
type AchievementGroupId =
  | 'total'
  | 'comedy'
  | 'horror'
  | 'scifi'
  | 'drama'
  | 'classic'
  | 'modern'
  | 'rewatch'
  | 'matches'
  | 'discovery'
  | 'directors'
  | 'emotional'
  | 'slow'
  | 'genres'
  | 'secret'
  | 'super';

/** Stable slug for one badge; drives both its DOM key and its `${id}_name` i18n key. */
type AchievementId =
  | 'total-bronze'
  | 'total-silver'
  | 'total-gold'
  | 'total-legendary'
  | 'total-mythic'
  | 'comedy-bronze'
  | 'comedy-silver'
  | 'comedy-gold'
  | 'comedy-legendary'
  | 'horror-bronze'
  | 'horror-silver'
  | 'horror-gold'
  | 'horror-legendary'
  | 'scifi-bronze'
  | 'scifi-silver'
  | 'scifi-gold'
  | 'scifi-legendary'
  | 'drama-bronze'
  | 'drama-silver'
  | 'drama-gold'
  | 'drama-legendary'
  | 'classic-bronze'
  | 'classic-silver'
  | 'classic-gold'
  | 'classic-legendary'
  | 'modern-bronze'
  | 'modern-silver'
  | 'modern-gold'
  | 'modern-legendary'
  | 'rewatch-bronze'
  | 'rewatch-silver'
  | 'rewatch-gold'
  | 'rewatch-legendary'
  | 'matches-bronze'
  | 'matches-silver'
  | 'matches-gold'
  | 'matches-legendary'
  | 'discovery-bronze'
  | 'discovery-silver'
  | 'discovery-gold'
  | 'discovery-legendary'
  | 'directors-bronze'
  | 'directors-silver'
  | 'directors-gold'
  | 'directors-legendary'
  | 'emotional-bronze'
  | 'emotional-silver'
  | 'emotional-gold'
  | 'emotional-legendary'
  | 'slow-bronze'
  | 'slow-silver'
  | 'slow-gold'
  | 'slow-legendary'
  | 'genres-bronze'
  | 'genres-silver'
  | 'genres-gold'
  | 'genres-legendary'
  | 'secret-midnight'
  | 'secret-festival'
  | 'secret-trilogy'
  | 'secret-loyalty'
  | 'super-historian'
  | 'super-countries'
  | 'super-archivist';

/** One badge: a single rung unlocked when its metric reaches `threshold`. */
type Achievement = {
  id: AchievementId;
  metric: AchievementMetric;
  threshold: number;
  medal: AchievementMedal;
  reqKind: AchievementReqKind;
  /** False when the metric has no data source yet; the badge renders locked. */
  live: boolean;
};

/** One card: a set of badges, usually a single-metric ladder. */
export type AchievementGroup = {
  id: AchievementGroupId;
  /** Hide unearned badge names behind a placeholder until unlocked. */
  secret?: boolean;
  achievements: Achievement[];
};

/** Per-metric tallies for a viewer, the input to `buildAchievementView`. */
export type AchievementMetricValues = Record<AchievementMetric, number>;

/** One badge resolved against a viewer's metrics, ready to render. */
export type AchievementView = {
  id: AchievementId;
  medal: AchievementMedal;
  reqKind: AchievementReqKind;
  threshold: number;
  live: boolean;
  value: number;
  unlocked: boolean;
};

/** One card resolved against a viewer's metrics. */
export type AchievementGroupView = {
  id: AchievementGroupId;
  secret: boolean;
  unlockedCount: number;
  total: number;
  achievements: AchievementView[];
};

/** The full page model: every group plus the headline tally. */
export type AchievementsView = {
  groups: AchievementGroupView[];
  totalUnlocked: number;
  totalCount: number;
};
