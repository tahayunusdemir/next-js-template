import { describe, expect, it } from 'vitest';
import type { CineVector } from '@/types/CineTest';
import { CINE_AXES, CINE_TEXTURE_AXES } from '@/types/CineTest';
import type { CineType } from '@/types/CineType';
import { cineTypeFromVector, descriptorFromVector, recommendedGenres } from './cinetest-personas';
import { cineTypes } from './cinetype';
import type { MovieGenreKey } from './genres';
import { movieGenres } from './genres';

function zeroVector(): CineVector {
  return { gaze: 0, eye: 0, pulse: 0, compass: 0, tempo: 0, palette: 0, mood: 0, ending: 0 };
}

// A definite ±1 vector that reconstructs a type's exact four-letter code.
function vectorFromLetters(type: CineType): CineVector {
  return {
    ...zeroVector(),
    gaze: type.letters.gaze === 'C' ? 1 : -1,
    eye: type.letters.eye === 'R' ? 1 : -1,
    pulse: type.letters.pulse === 'M' ? 1 : -1,
    compass: type.letters.compass === 'F' ? 1 : -1,
  };
}

function genreId(key: MovieGenreKey) {
  const genre = movieGenres.find((candidate) => candidate.key === key);

  if (!genre) {
    throw new Error(`unknown genre key: ${key}`);
  }

  return genre.id;
}

describe(cineTypeFromVector, () => {
  it('resolves every sign combination back to its own persona', () => {
    for (const type of cineTypes) {
      expect(cineTypeFromVector(vectorFromLetters(type))).toBe(type.slug);
    }
  });

  it('falls to the nostalgist on a perfectly centered vector', () => {
    expect(cineTypeFromVector(zeroVector())).toBe('nostalgist');
  });

  it('resolves all-positive disposition to the programmer', () => {
    expect(cineTypeFromVector({ ...zeroVector(), gaze: 1, eye: 1, pulse: 1, compass: 1 })).toBe(
      'programmer',
    );
  });

  it('resolves all-negative disposition to the nostalgist', () => {
    expect(cineTypeFromVector({ ...zeroVector(), gaze: -1, eye: -1, pulse: -1, compass: -1 })).toBe(
      'nostalgist',
    );
  });

  it('ignores texture axes when resolving the code', () => {
    expect(cineTypeFromVector({ ...zeroVector(), tempo: 1, palette: 1, mood: 1, ending: 1 })).toBe(
      'nostalgist',
    );
  });
});

describe(descriptorFromVector, () => {
  it('returns balanced when no texture axis clears the threshold', () => {
    expect(descriptorFromVector({ ...zeroVector(), tempo: 0.1, mood: -0.1 })).toBe('balanced');
  });

  it('picks the dominant texture axis on its high side', () => {
    expect(descriptorFromVector({ ...zeroVector(), mood: 0.6, tempo: 0.3 })).toBe('mood_high');
  });

  it('picks the dominant texture axis on its low side', () => {
    expect(descriptorFromVector({ ...zeroVector(), ending: -0.5 })).toBe('ending_low');
  });

  it('ignores disposition axes', () => {
    expect(descriptorFromVector({ ...zeroVector(), gaze: 1, eye: 1, pulse: 1, compass: 1 })).toBe(
      'balanced',
    );
  });
});

describe(recommendedGenres, () => {
  it('ranks the aligned genre first for a mood-led vector', () => {
    const result = recommendedGenres({ vector: { ...zeroVector(), mood: 1 } });

    expect(result[0]).toBe(genreId('horror'));
  });

  it('ranks the aligned genre first for a reflective vector', () => {
    const result = recommendedGenres({ vector: { ...zeroVector(), eye: 1 } });

    expect(result[0]).toBe(genreId('documentary'));
  });

  it('caps the result at the requested limit', () => {
    const result = recommendedGenres({ vector: { ...zeroVector(), mood: 1 }, limit: 5 });

    expect(result).toHaveLength(5);
  });

  it('defaults to three genres', () => {
    expect(recommendedGenres({ vector: { ...zeroVector(), mood: 1 } })).toHaveLength(3);
  });

  it('returns a stable order for the same vector', () => {
    const vector = { ...zeroVector(), eye: 0.5, palette: 0.4 };

    expect(recommendedGenres({ vector })).toStrictEqual(recommendedGenres({ vector }));
  });
});

describe('axis taxonomy', () => {
  it('splits eight axes into four disposition and four texture', () => {
    expect(CINE_AXES).toHaveLength(8);
    expect(CINE_TEXTURE_AXES).toHaveLength(4);

    const disposition = CINE_AXES.filter((axis) => !CINE_TEXTURE_AXES.some((tex) => tex === axis));

    expect(disposition).toStrictEqual(['gaze', 'eye', 'pulse', 'compass']);
  });

  it('nests every texture axis inside the full axis list', () => {
    for (const axis of CINE_TEXTURE_AXES) {
      expect(CINE_AXES).toContain(axis);
    }
  });
});
