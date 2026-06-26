import { describe, expect, it } from 'vitest';
import type { CineVector } from '@/types/CineTest';
import {
  axisCells,
  filmSimilarity,
  matchScore,
  MATCH_CONFIG,
  personalitySimilarity,
  sharedWatchedCount,
} from './CineMatchScoring';

function vector(overrides: Partial<CineVector> = {}): CineVector {
  return {
    gaze: 0,
    eye: 0,
    pulse: 0,
    compass: 0,
    tempo: 0,
    palette: 0,
    mood: 0,
    ending: 0,
    ...overrides,
  };
}

describe(personalitySimilarity, () => {
  it('returns 1 for identical vectors', () => {
    const v = vector({ gaze: 0.5, eye: -0.5 });

    expect(personalitySimilarity(v, v)).toBe(1);
  });

  it('returns 0 for opposite poles on every axis', () => {
    const a = vector({
      gaze: 1,
      eye: 1,
      pulse: 1,
      compass: 1,
      tempo: 1,
      palette: 1,
      mood: 1,
      ending: 1,
    });
    const b = vector({
      gaze: -1,
      eye: -1,
      pulse: -1,
      compass: -1,
      tempo: -1,
      palette: -1,
      mood: -1,
      ending: -1,
    });

    expect(personalitySimilarity(a, b)).toBe(0);
  });

  it('shrinks as one axis drifts apart', () => {
    const near = personalitySimilarity(vector(), vector({ gaze: 0.2 }));
    const far = personalitySimilarity(vector(), vector({ gaze: 0.9 }));

    expect(near).toBeGreaterThan(far);
  });
});

describe(filmSimilarity, () => {
  it('saturates to 1 at the film target', () => {
    expect(filmSimilarity(MATCH_CONFIG.filmTarget)).toBe(1);
    expect(filmSimilarity(MATCH_CONFIG.filmTarget * 2)).toBe(1);
  });

  it('scales linearly below the target', () => {
    expect(filmSimilarity(MATCH_CONFIG.filmTarget / 2)).toBeCloseTo(0.5);
  });

  it('returns 0 for no overlap', () => {
    expect(filmSimilarity(0)).toBe(0);
  });
});

describe(sharedWatchedCount, () => {
  it('counts only films present in both sets', () => {
    expect(sharedWatchedCount(new Set([1, 2, 3]), new Set([2, 3, 4]))).toBe(2);
  });

  it('returns 0 for disjoint sets', () => {
    expect(sharedWatchedCount(new Set([1]), new Set([2]))).toBe(0);
  });
});

describe(matchScore, () => {
  it('clears the threshold for twins with a deep film overlap', () => {
    const v = vector({ gaze: 0.4, eye: -0.3 });
    const score = matchScore({ vectorA: v, vectorB: v, shared: MATCH_CONFIG.filmTarget });

    expect(score).toBe(100);
    expect(score).toBeGreaterThanOrEqual(MATCH_CONFIG.threshold);
  });

  it('weights personality above films', () => {
    const personalityOnly = matchScore({
      vectorA: vector(),
      vectorB: vector(),
      shared: 0,
    });
    const filmsOnly = matchScore({
      vectorA: vector({ gaze: 1, eye: 1, pulse: 1, compass: 1 }),
      vectorB: vector({ gaze: -1, eye: -1, pulse: -1, compass: -1 }),
      shared: MATCH_CONFIG.filmTarget,
    });

    expect(personalityOnly).toBeGreaterThan(filmsOnly);
  });
});

describe(axisCells, () => {
  it('reports both poles and the scaled gap per disposition axis', () => {
    const cells = axisCells(vector({ gaze: 0.8 }), vector({ gaze: 0.4 }));
    const gaze = cells.find((cell) => cell.axis === 'gaze');

    expect(cells).toHaveLength(4);
    expect(gaze?.aPole).toBe('C');
    expect(gaze?.bPole).toBe('C');
    expect(gaze?.delta).toBe(2);
  });

  it('resolves a zero axis to its negative pole', () => {
    const cells = axisCells(vector(), vector());

    expect(cells.every((cell) => cell.delta === 0)).toBeTruthy();
    expect(cells.find((cell) => cell.axis === 'eye')?.aPole).toBe('V');
  });
});
