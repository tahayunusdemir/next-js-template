import type { AxisWeights, CineDescriptorKey, CineVector } from '@/types/CineTest';
import { CINE_AXES, CINE_TEXTURE_AXES } from '@/types/CineTest';
import type { CineTypeSlug } from '@/types/CineType';
import { cineTypes } from './cinetype';
import type { MovieGenreKey } from './genres';
import { genreKey, movieGenres } from './genres';

// Maps the scored trait vector onto a CineType persona, a flavor descriptor, and TMDB
// recommendation genres. See docs/cinepersona-docs/cinetype/cinetype-framework.md.

// --- disposition axes → 4-letter code → persona -------------------------------

// Each disposition axis contributes one code letter. A perfect 0 falls to the
// negative pole (S/V/H/A) so re-scoring the same answers is deterministic.
function codeFromVector(vector: CineVector) {
  const gaze = vector.gaze > 0 ? 'C' : 'S';
  const eye = vector.eye > 0 ? 'R' : 'V';
  const pulse = vector.pulse > 0 ? 'M' : 'H';
  const compass = vector.compass > 0 ? 'F' : 'A';

  return `${gaze}${eye}${pulse}${compass}`;
}

/**
 * Resolves the four disposition axes to one of the 16 CineType personas.
 * @param vector - The normalized trait vector.
 * @returns The matching CineType slug.
 */
export function cineTypeFromVector(vector: CineVector): CineTypeSlug {
  const code = codeFromVector(vector);
  const type = cineTypes.find((candidate) => candidate.code === code);

  // Every sign combination maps to exactly one of the 16 codes, so this is total.
  return type ? type.slug : 'nostalgist';
}

// The four disposition axes and the positive-pole letter each contributes — used to
// score how closely a vector leans toward every persona (the affinity breakdown).
const DISPOSITION_AXES = ['gaze', 'eye', 'pulse', 'compass'] as const;
const POSITIVE_LETTER = { gaze: 'C', eye: 'R', pulse: 'M', compass: 'F' } as const;

export type CineTypeAffinity = { slug: CineTypeSlug; code: string; percent: number };

/**
 * Scores how close a vector sits to each of the 16 personas, as a 0–100% match. Each
 * disposition axis aligns (+) or opposes (−) a persona's pole; the summed alignment in
 * [−4, 4] maps linearly to a percentage. The respondent's own type ranks first.
 * @param vector - The normalized trait vector.
 * @returns Every persona with its match percentage, strongest first.
 */
export function typeAffinities(vector: CineVector): CineTypeAffinity[] {
  return cineTypes
    .map((type) => {
      let alignment = 0;

      for (const axis of DISPOSITION_AXES) {
        const target = type.letters[axis] === POSITIVE_LETTER[axis] ? 1 : -1;
        alignment += vector[axis] * target;
      }

      return { slug: type.slug, code: type.code, percent: Math.round(((alignment + 4) / 8) * 100) };
    })
    .toSorted((a, b) => b.percent - a.percent);
}

// --- texture axes → flavor descriptor -----------------------------------------

const DESCRIPTOR_THRESHOLD = 0.2;

/**
 * Picks the localized flavor line from the strongest texture axis.
 * @param vector - The normalized trait vector.
 * @returns The descriptor key, or `balanced` when no texture axis stands out.
 */
export function descriptorFromVector(vector: CineVector): CineDescriptorKey {
  let strongest: (typeof CINE_TEXTURE_AXES)[number] | undefined;
  let peak = DESCRIPTOR_THRESHOLD;

  for (const axis of CINE_TEXTURE_AXES) {
    if (Math.abs(vector[axis]) >= peak) {
      peak = Math.abs(vector[axis]);
      strongest = axis;
    }
  }

  if (!strongest) {
    return 'balanced';
  }

  return vector[strongest] >= 0 ? `${strongest}_high` : `${strongest}_low`;
}

// --- TMDB genre ↔ axis mapping ------------------------------------------------

// How each genre loads the axes, keyed by the canonical genre keys from
// src/data/genres.ts so the TMDB ids stay defined in exactly one place. Used to rank
// recommendations against a user's vector (dot product in recommendedGenres).
const GENRE_AXIS: Partial<Record<MovieGenreKey, AxisWeights>> = {
  action: { eye: -0.3, tempo: 0.5, mood: 0.2, compass: -0.1 },
  adventure: { eye: -0.2, tempo: 0.3, palette: 0.3, compass: 0.3 },
  animation: { palette: 0.5, mood: -0.2 },
  comedy: { pulse: -0.2, mood: -0.5, tempo: 0.1 },
  crime: { eye: 0.2, mood: 0.4, ending: 0.2 },
  documentary: { eye: 0.6, pulse: 0.3, palette: -0.5 },
  drama: { eye: 0.4, pulse: -0.2, tempo: -0.3, mood: 0.2 },
  family: { mood: -0.5, ending: -0.3, palette: 0.2 },
  fantasy: { palette: 0.6, compass: 0.2, eye: -0.1 },
  history: { eye: 0.3, palette: -0.3, tempo: -0.2 },
  horror: { mood: 0.7, tempo: 0.3, ending: 0.2 },
  music: { pulse: -0.2, mood: -0.1 },
  mystery: { eye: 0.4, pulse: 0.2, ending: 0.5 },
  romance: { pulse: -0.5, mood: -0.1, ending: -0.2 },
  science_fiction: { eye: 0.3, palette: 0.6, compass: 0.3 },
  thriller: { tempo: 0.4, mood: 0.5, ending: 0.2 },
  war: { eye: 0.3, mood: 0.5, palette: -0.2 },
  western: { palette: -0.2, mood: 0.2, compass: -0.1 },
};

// --- film picks → texture-axis weights ----------------------------------------

// How strongly a single picked film's genres load the texture axes, and the per-axis
// cap so one multi-genre film can't dominate. Film picks feed the texture axes only —
// never the four-letter code (see cinetype-framework.md §4, §7.1).
const POSTER_GENRE_SCALE = 0.5;
const POSTER_AXIS_CAP = 0.35;

/**
 * The most a single film pick can load any one texture axis. Used to keep score
 * normalization deterministic regardless of which films the live pool surfaces.
 */
export const POSTER_AXIS_MAX = POSTER_AXIS_CAP;

/**
 * Maps a picked film's TMDB genres onto signed texture-axis weights.
 * @param genreIds - The film's TMDB genre ids.
 * @returns Texture-only weights (disposition axes are never touched), capped per axis.
 */
export function textureWeightsForGenres(genreIds: number[]): AxisWeights {
  const weights: AxisWeights = {};

  for (const genreId of genreIds) {
    const key = genreKey(genreId);
    const axisWeights = key ? GENRE_AXIS[key] : undefined;

    if (!axisWeights) {
      continue;
    }

    for (const axis of CINE_TEXTURE_AXES) {
      const value = axisWeights[axis];

      if (value !== undefined) {
        weights[axis] = (weights[axis] ?? 0) + value * POSTER_GENRE_SCALE;
      }
    }
  }

  for (const axis of CINE_TEXTURE_AXES) {
    const value = weights[axis];

    if (value !== undefined) {
      weights[axis] = Math.max(-POSTER_AXIS_CAP, Math.min(POSTER_AXIS_CAP, value));
    }
  }

  return weights;
}

/**
 * Ranks TMDB genres by how well they match the user's vector (dot product).
 * @param props - The trait vector and how many genres to return.
 * @returns The best-matching genre ids, most relevant first.
 */
export function recommendedGenres(props: { vector: CineVector; limit?: number }): number[] {
  const scored = movieGenres.flatMap((genre) => {
    const weights = GENRE_AXIS[genre.key];

    if (!weights) {
      return [];
    }

    let dot = 0;

    for (const axis of CINE_AXES) {
      const value = weights[axis];

      if (value !== undefined) {
        dot += value * props.vector[axis];
      }
    }

    return [{ genreId: genre.id, dot }];
  });

  return scored
    .toSorted((a, b) => b.dot - a.dot)
    .slice(0, props.limit ?? 3)
    .map((entry) => entry.genreId);
}
