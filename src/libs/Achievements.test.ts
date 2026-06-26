import { describe, expect, it } from 'vitest';
import type { AchievementMetricValues } from '@/types/Achievements';
import type { WatchedFact } from './Achievements';
import { buildAchievementView, reduceWatchedFacts, zeroMetrics } from './Achievements';

function fact(overrides: Partial<WatchedFact> = {}): WatchedFact {
  return {
    genreIds: [],
    releaseDate: '2010-01-01',
    voteCount: 5000,
    watchedAt: null,
    ...overrides,
  };
}

function metrics(overrides: Partial<AchievementMetricValues> = {}): AchievementMetricValues {
  return { ...zeroMetrics(), ...overrides };
}

describe(reduceWatchedFacts, () => {
  it('counts total watched films', () => {
    const result = reduceWatchedFacts([fact(), fact(), fact()]);

    expect(result.watched).toBe(3);
    expect(result.archivist).toBe(3);
  });

  it('counts films per genre by tmdb id', () => {
    const result = reduceWatchedFacts([
      fact({ genreIds: [35] }),
      fact({ genreIds: [35, 18] }),
      fact({ genreIds: [27] }),
    ]);

    expect(result.comedy).toBe(2);
    expect(result.drama).toBe(1);
    expect(result.horror).toBe(1);
    expect(result.scifi).toBe(0);
  });

  it('splits classic and modern by release year', () => {
    const result = reduceWatchedFacts([
      fact({ releaseDate: '1955-06-01' }),
      fact({ releaseDate: '1969-12-31' }),
      fact({ releaseDate: '2001-03-03' }),
      fact({ releaseDate: '1985-01-01' }),
    ]);

    expect(result.classic).toBe(2);
    expect(result.modern).toBe(1);
  });

  it('counts hidden gems below the vote ceiling', () => {
    const result = reduceWatchedFacts([
      fact({ voteCount: 500 }),
      fact({ voteCount: 99_999 }),
      fact({ voteCount: 250_000 }),
    ]);

    expect(result.hidden_gems).toBe(2);
  });

  it('counts distinct genres for variety', () => {
    const result = reduceWatchedFacts([fact({ genreIds: [35, 18] }), fact({ genreIds: [18, 27] })]);

    expect(result.genre_variety).toBe(3);
  });

  it('counts distinct decades within the historian range', () => {
    const result = reduceWatchedFacts([
      fact({ releaseDate: '1925-01-01' }),
      fact({ releaseDate: '1928-01-01' }),
      fact({ releaseDate: '2019-01-01' }),
      fact({ releaseDate: '1890-01-01' }),
    ]);

    expect(result.decades).toBe(2);
  });

  it('counts films watched after midnight', () => {
    const result = reduceWatchedFacts([
      fact({ watchedAt: new Date(2021, 0, 1, 2, 30) }),
      fact({ watchedAt: new Date(2021, 0, 1, 5, 0) }),
      fact({ watchedAt: new Date(2021, 0, 1, 14, 0) }),
      fact({ watchedAt: null }),
    ]);

    expect(result.midnight).toBe(2);
  });
});

describe(buildAchievementView, () => {
  it('exposes 64 badges across 16 groups', () => {
    const view = buildAchievementView(zeroMetrics());

    expect(view.groups).toHaveLength(16);
    expect(view.totalCount).toBe(64);
    expect(view.totalUnlocked).toBe(0);
  });

  it('unlocks a badge once its metric reaches the threshold', () => {
    const view = buildAchievementView(metrics({ watched: 100, archivist: 100 }));
    const total = view.groups.find((group) => group.id === 'total');

    expect(total?.unlockedCount).toBe(2);
    expect(total?.achievements.find((badge) => badge.id === 'total-silver')?.unlocked).toBeTruthy();
    expect(total?.achievements.find((badge) => badge.id === 'total-gold')?.unlocked).toBeFalsy();
  });

  it('never unlocks a badge whose metric has no data source', () => {
    const view = buildAchievementView(metrics({ rewatch: 999 }));
    const rewatch = view.groups.find((group) => group.id === 'rewatch');

    expect(rewatch?.unlockedCount).toBe(0);
    expect(rewatch?.achievements.every((badge) => !badge.live)).toBeTruthy();
  });

  it('flags the secret group', () => {
    const view = buildAchievementView(zeroMetrics());

    expect(view.groups.find((group) => group.id === 'secret')?.secret).toBeTruthy();
    expect(view.groups.find((group) => group.id === 'total')?.secret).toBeFalsy();
  });
});
