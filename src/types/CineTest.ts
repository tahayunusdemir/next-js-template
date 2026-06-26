// Type model for the CineTest — the cinema persona quiz. The engine is content-
// agnostic: questions are static, typed data (src/data/cinetest-questions.ts) whose
// scoring weights live next to each option. Display copy flows through next-intl,
// keyed off the literal ids below so the strict t() accepts the dynamic keys.

import type { CineTypeSlug } from '@/types/CineType';

/**
 * The eight bipolar axes measured by the test. The four "disposition" axes resolve
 * the 4-letter CineType code; the four "texture" axes describe the films a viewer is
 * drawn to, driving explainability, the flavor descriptor, and TMDB recommendations.
 * Every axis is a signed continuum in [-1, +1] after normalization (0 = balanced).
 * See docs/cinepersona-docs/cinetype/cinetype-framework.md.
 */
export type CineAxis =
  // Disposition axes — resolve the CineType code (see cinetest-personas.ts).
  | 'gaze' // Solitary (−) ↔ Communal (+)     ~ how you watch         (S/C)
  | 'eye' // Visceral (−) ↔ Reflective (+)   ~ what pulls you in     (V/R)
  | 'pulse' // Heart (−) ↔ Mind (+)            ~ how you respond       (H/M)
  | 'compass' // Anchored (−) ↔ Frontier (+)     ~ where taste travels   (A/F)
  // Texture axes — the films you're drawn to: flavor descriptor + recommendations.
  | 'tempo' // Slow-burn (−) ↔ Kinetic (+)     ~ pacing
  | 'palette' // Grounded (−) ↔ Fantastical (+)  ~ realism vs the imagined
  | 'mood' // Light (−) ↔ Dark (+)            ~ tonal weight
  | 'ending'; // Resolved (−) ↔ Ambiguous (+)    ~ closure vs open questions

export const CINE_AXES: readonly CineAxis[] = [
  'gaze',
  'eye',
  'pulse',
  'compass',
  'tempo',
  'palette',
  'mood',
  'ending',
];

/** The four texture axes that flavor the result without changing the code. */
export const CINE_TEXTURE_AXES = ['tempo', 'palette', 'mood', 'ending'] as const;

/** Signed per-axis weights carried by an answer option (magnitude = loading strength). */
export type AxisWeights = Partial<Record<CineAxis, number>>;

/** The normalized hidden trait vector: one signed score per axis. */
export type CineVector = Record<CineAxis, number>;

export type CinePage = 1 | 2 | 3 | 4;

// --- question ids, partitioned by kind so dynamic i18n keys stay finite -------
// Each kind owns a sub-union of ids; this keeps template-literal keys such as
// `${ChoiceQuestionId}_a` from expanding into a cross-product of non-existent keys.

type LikertQuestionId =
  | 'q01'
  | 'q02'
  | 'q03'
  | 'q04'
  | 'q05'
  | 'q06'
  | 'q07'
  | 'q08'
  | 'q09'
  | 'q10'
  | 'q11'
  | 'q12'
  | 'q13'
  | 'q14'
  | 'q15'
  | 'q16'
  | 'q17'
  | 'q18'
  | 'q19'
  | 'q20'
  | 'q21'
  | 'q22'
  | 'q23'
  | 'q24';

type ChoiceQuestionId =
  | 'q25'
  | 'q26'
  | 'q27'
  | 'q28'
  | 'q29'
  | 'q30'
  | 'q31'
  | 'q32'
  | 'q33'
  | 'q34'
  | 'q35'
  | 'q36';

/** The pick-four "all-time favourites" question — its own id so the profile/result
 * can single it out from the single-pick taste questions. */
type FavoritesQuestionId = 'q37';

type PosterQuestionId = 'q38' | 'q39' | 'q40' | 'q41' | 'q42' | 'q43' | 'q44' | 'q45' | 'q46';

type PersonQuestionId = 'q47' | 'q48';

export type CineTestQuestionId =
  | LikertQuestionId
  | ChoiceQuestionId
  | FavoritesQuestionId
  | PosterQuestionId
  | PersonQuestionId;

/** Choice option slot keys (also the answer value) — four per scenario question. */
export type ChoiceOptionKey = 'a' | 'b' | 'c' | 'd';

// --- the question union -------------------------------------------------------

type BaseQuestion = { page: CinePage };

/** Agree–disagree on one statement. Loads a single axis; `reverse` flips the sign. */
export type LikertQuestion = BaseQuestion & {
  kind: 'likert';
  id: LikertQuestionId;
  axis: CineAxis;
  reverse?: boolean;
};

/** Pick one of four stances in a film-watching scenario; each loads one or more axes. */
export type ChoiceQuestion = BaseQuestion & {
  kind: 'choice';
  id: ChoiceQuestionId;
  options: [
    { key: 'a'; weights: AxisWeights },
    { key: 'b'; weights: AxisWeights },
    { key: 'c'; weights: AxisWeights },
    { key: 'd'; weights: AxisWeights },
  ];
};

/**
 * Pick a single film from the catalogue browser that fits the question's prompt. The pick
 * loads the four texture axes via the genre→axis mapping (never the four-letter code) and
 * feeds recommendations — the film is chosen from the live catalogue, so no static ids or
 * axis weights live on the question itself.
 */
export type PosterQuestion = BaseQuestion & {
  kind: 'poster';
  id: PosterQuestionId;
};

/**
 * Pick several all-time favourite films from the catalogue browser. Like a poster pick it
 * loads the texture axes (from the union of the picks' genres) and feeds recommendations,
 * but it also surfaces as the viewer's "top films" on the profile and result page.
 */
export type FavoritesQuestion = BaseQuestion & {
  kind: 'favorites';
  id: FavoritesQuestionId;
  /** How many films the viewer picks (also enforced before advancing). */
  count: number;
};

/** Favorite director / actor via TMDB search — an optional taste signal, not scored. */
export type PersonSearchQuestion = BaseQuestion & {
  kind: 'person-search';
  id: PersonQuestionId;
  role: 'director' | 'actor';
};

export type CineTestQuestion =
  | LikertQuestion
  | ChoiceQuestion
  | FavoritesQuestion
  | PosterQuestion
  | PersonSearchQuestion;

/** One film picked from the catalogue browser, carrying its genres for pure scoring. */
export type FilmPick = { tmdbId: number; genreIds: number[] };

// --- answers ------------------------------------------------------------------

/** A 5-point agree–disagree value, signed around a neutral midpoint. */
export type LikertValue = -2 | -1 | 0 | 1 | 2;

export type PersonPick = { personId: number; name: string; profilePath: string | null };

/** One respondent answer, discriminated to match its question kind. */
export type CineTestAnswer =
  | { kind: 'likert'; value: LikertValue }
  | { kind: 'choice'; optionKey: ChoiceOptionKey }
  // genreIds ride along with each pick so scoring stays pure (no movie lookup needed).
  | { kind: 'poster'; tmdbId: number; genreIds: number[] }
  | { kind: 'favorites'; picks: FilmPick[] }
  | { kind: 'person-search'; pick: PersonPick };

/** The full answer map, keyed by question id. Persisted verbatim for explainability. */
export type CineTestAnswers = Partial<Record<CineTestQuestionId, CineTestAnswer>>;

/**
 * A loosely-keyed answer map for inputs that cross a boundary (validated payloads,
 * rows read back from the database). `CineTestAnswers` is assignable to this.
 */
export type CineAnswerMap = Partial<Record<string, CineTestAnswer>>;

/** The favorite picks pulled out of the answers for recommendations + display. */
export type CineFilmPicks = {
  /** Every picked film (favourites + taste picks), for recommendations. */
  movies: number[];
  /** The "all-time favourites" subset, in pick order — the profile/result "top films". */
  favorites: number[];
  director?: number;
  actor?: number;
};

/** One contributing answer surfaced on the result page ("what pushed you here"). */
export type CineContribution = { questionId: CineTestQuestionId; axis: CineAxis; value: number };

/** The fully scored result, shared between the client preview and the server write. */
export type CineTestResult = {
  cineType: CineTypeSlug;
  vector: CineVector;
  descriptor: CineDescriptorKey;
  filmPicks: CineFilmPicks;
  /** Top ±contributions per axis, for the explainability breakdown. */
  highlights: CineContribution[];
};

/** Localized "cinematic flavor" line chosen from the texture axes. */
export type CineDescriptorKey =
  | 'balanced'
  | 'tempo_high'
  | 'tempo_low'
  | 'palette_high'
  | 'palette_low'
  | 'mood_high'
  | 'mood_low'
  | 'ending_high'
  | 'ending_low';
