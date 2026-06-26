import { CINE_MATCH_AXES } from '@/types/CineMatch';
import type { CineMatchAxis, CinePoleLetter, MatchAxisCell } from '@/types/CineMatch';
import { CINE_AXES } from '@/types/CineTest';
import type { CineVector } from '@/types/CineTest';

// Pure, deterministic scoring for CineMatch, shared by the matcher and any preview.
// Similarity is one number from two parts: how close two viewers sit on the trait axes
// (personality) and how many films they've both marked watched (overlap). No randomness;
// re-scoring the same inputs is stable. All thresholds live in MATCH_CONFIG so the bar can
// be tuned without touching the math.

/** Early-access tuning for the matcher — every magic number in one place. */
export const MATCH_CONFIG = {
  /** Share of the score from the trait axes; the rest comes from shared watched films. */
  weightPersonality: 0.7,
  weightFilms: 0.3,
  /** Minimum similarity (0–100) before a match is ever surfaced. */
  threshold: 90,
  /** Shared-watched count at which the film component saturates to its full weight. */
  filmTarget: 30,
  /** Requests allowed per rolling window, and the window / search horizon in days. */
  requestsPerWindow: 3,
  windowDays: 7,
  /** Watched films required to join the pool. */
  minWatched: 20,
} as const;

// The negative- and positive-pole CineType letter for each disposition axis, matching the
// code derivation in cinetest-personas.ts (positive pole = C/R/M/F).
const AXIS_POLES: Record<CineMatchAxis, readonly [CinePoleLetter, CinePoleLetter]> = {
  gaze: ['S', 'C'],
  eye: ['V', 'R'],
  pulse: ['H', 'M'],
  compass: ['A', 'F'],
};

// A perfect 0 falls to the negative pole, matching codeFromVector so a viewer's match pole
// always agrees with their resolved CineType code.
function poleFor(axis: CineMatchAxis, value: number): CinePoleLetter {
  const [negative, positive] = AXIS_POLES[axis];

  return value > 0 ? positive : negative;
}

/**
 * Scores how close two trait vectors sit, across all eight axes, as a 0–1 similarity. Each
 * axis spans [-1, 1] (max gap 2), so the summed gap normalizes to a distance in [0, 1]
 * that is inverted into similarity (1 = identical taste).
 * @param a - The first viewer's normalized trait vector.
 * @param b - The second viewer's normalized trait vector.
 * @returns The personality similarity in [0, 1].
 */
export function personalitySimilarity(a: CineVector, b: CineVector): number {
  let distance = 0;

  for (const axis of CINE_AXES) {
    distance += Math.abs(a[axis] - b[axis]);
  }

  return 1 - distance / (2 * CINE_AXES.length);
}

/**
 * Maps the count of films two viewers have both marked watched onto a 0–1 score that
 * saturates at MATCH_CONFIG.filmTarget, so a deep overlap reaches full weight while a thin
 * one stays modest.
 * @param shared - The number of films both viewers have marked watched.
 * @returns The film-overlap similarity in [0, 1].
 */
export function filmSimilarity(shared: number): number {
  return Math.min(1, shared / MATCH_CONFIG.filmTarget);
}

/**
 * Counts the films present in both watched sets.
 * @param a - One viewer's watched film ids.
 * @param b - The other viewer's watched film ids.
 * @returns The size of the intersection.
 */
export function sharedWatchedCount(a: Set<number>, b: Set<number>): number {
  let shared = 0;

  for (const id of a) {
    if (b.has(id)) {
      shared += 1;
    }
  }

  return shared;
}

/**
 * Blends personality and film overlap into a single 0–100 similarity score.
 * @param props - Both trait vectors and the shared watched count.
 * @returns The rounded similarity percentage.
 */
export function matchScore(props: {
  vectorA: CineVector;
  vectorB: CineVector;
  shared: number;
}): number {
  const personality = personalitySimilarity(props.vectorA, props.vectorB);
  const films = filmSimilarity(props.shared);

  return Math.round(
    (MATCH_CONFIG.weightPersonality * personality + MATCH_CONFIG.weightFilms * films) * 100,
  );
}

/**
 * Builds the four-axis anatomy snapshot for a pair, oriented to the sorted ids (a, b). Each
 * delta scales the axis gap onto a 0–10 integer so the breakdown reads as small numbers.
 * @param a - The first (sorted) viewer's trait vector.
 * @param b - The second (sorted) viewer's trait vector.
 * @returns One cell per disposition axis: each side's pole and the gap.
 */
export function axisCells(a: CineVector, b: CineVector): MatchAxisCell[] {
  return CINE_MATCH_AXES.map((axis) => ({
    axis,
    aPole: poleFor(axis, a[axis]),
    bPole: poleFor(axis, b[axis]),
    delta: Math.round(Math.abs(a[axis] - b[axis]) * 5),
  }));
}
