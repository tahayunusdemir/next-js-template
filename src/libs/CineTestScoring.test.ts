import { describe, expect, it } from 'vitest';
import { cineTestQuestions } from '@/data/cinetest-questions';
import type { CineTestAnswers, LikertValue } from '@/types/CineTest';
import { CINE_AXES } from '@/types/CineTest';
import { maxMagnitudes, scoreAnswers } from './CineTestScoring';

// Answers every Likert statement with the same value. Each axis carries two
// forward statements and one reverse one, so a uniform value lands every axis on
// the same side: +2 → all-positive (programmer), −2 → all-negative (nostalgist).
function likertSubmission(value: LikertValue): CineTestAnswers {
  const answers: CineTestAnswers = {};

  for (const question of cineTestQuestions) {
    if (question.kind === 'likert') {
      answers[question.id] = { kind: 'likert', value };
    }
  }

  return answers;
}

describe(scoreAnswers, () => {
  it('returns a centered vector and nostalgist for no answers', () => {
    const result = scoreAnswers({});

    expect(Object.values(result.vector).every((value) => value === 0)).toBeTruthy();
    expect(result.cineType).toBe('nostalgist');
  });

  it('moves the keyed axis toward its positive pole for an agree likert', () => {
    const result = scoreAnswers({ q01: { kind: 'likert', value: 2 } });

    expect(result.vector.gaze).toBeGreaterThan(0);
  });

  it('inverts the contribution for a reverse-keyed likert', () => {
    const result = scoreAnswers({ q09: { kind: 'likert', value: 2 } });

    expect(result.vector.gaze).toBeLessThan(0);
  });

  it('directs a choice answer onto its option weights', () => {
    const toward = scoreAnswers({ q25: { kind: 'choice', optionKey: 'c' } });
    const away = scoreAnswers({ q27: { kind: 'choice', optionKey: 'c' } });

    expect(toward.vector.pulse).toBeGreaterThan(0);
    expect(away.vector.pulse).toBeLessThan(0);
  });

  it('loads the texture axes from a film pick without touching the code', () => {
    // Horror (genre 27) loads mood/tempo/ending; the disposition axes stay centered,
    // so a film pick can flavor the result but never changes the four-letter code.
    const result = scoreAnswers({ q38: { kind: 'poster', tmdbId: 155, genreIds: [27] } });

    expect(result.vector.mood).toBeGreaterThan(0);
    expect(result.vector.gaze).toBe(0);
    expect(result.vector.eye).toBe(0);
    expect(result.vector.pulse).toBe(0);
    expect(result.vector.compass).toBe(0);
  });

  it('loads texture from the favourites pick and lists them as top films', () => {
    const result = scoreAnswers({
      q37: {
        kind: 'favorites',
        picks: [
          { tmdbId: 155, genreIds: [27] },
          { tmdbId: 27_205, genreIds: [27] },
        ],
      },
    });

    expect(result.vector.mood).toBeGreaterThan(0);
    expect(result.vector.gaze).toBe(0);
    expect(result.filmPicks.favorites).toStrictEqual([155, 27_205]);
    expect(result.filmPicks.movies).toContain(155);
  });

  it('leaves every axis centered for a film with no mapped genres', () => {
    const result = scoreAnswers({ q38: { kind: 'poster', tmdbId: 155, genreIds: [] } });

    expect(Object.values(result.vector).every((value) => value === 0)).toBeTruthy();
  });

  it('collects poster and person picks into film picks', () => {
    const answers: CineTestAnswers = {
      q38: { kind: 'poster', tmdbId: 155, genreIds: [18] },
      q47: {
        kind: 'person-search',
        pick: { personId: 525, name: 'Christopher Nolan', profilePath: null },
      },
      q48: {
        kind: 'person-search',
        pick: { personId: 6193, name: 'Leonardo DiCaprio', profilePath: null },
      },
    };
    const result = scoreAnswers(answers);

    expect(result.filmPicks.movies).toContain(155);
    expect(result.filmPicks.director).toBe(525);
    expect(result.filmPicks.actor).toBe(6193);
  });

  it('is deterministic for identical answers', () => {
    const answers: CineTestAnswers = {
      q01: { kind: 'likert', value: 1 },
      q25: { kind: 'choice', optionKey: 'b' },
    };

    expect(scoreAnswers(answers)).toStrictEqual(scoreAnswers(answers));
  });

  it('resolves a strongly-agreed submission to the programmer', () => {
    expect(scoreAnswers(likertSubmission(2)).cineType).toBe('programmer');
  });

  it('resolves a strongly-disagreed submission to the nostalgist', () => {
    expect(scoreAnswers(likertSubmission(-2)).cineType).toBe('nostalgist');
  });

  it('keeps every normalized axis within the unit range', () => {
    const { vector } = scoreAnswers(likertSubmission(2));

    for (const axis of CINE_AXES) {
      expect(vector[axis]).toBeGreaterThanOrEqual(-1);
      expect(vector[axis]).toBeLessThanOrEqual(1);
    }
  });

  it('caps highlights at six, ordered by descending magnitude', () => {
    const { highlights } = scoreAnswers(likertSubmission(2));
    const magnitudes = highlights.map((highlight) => Math.abs(highlight.value));

    expect(highlights).toHaveLength(6);
    expect(magnitudes).toStrictEqual([...magnitudes].toSorted((a, b) => b - a));
  });
});

describe(maxMagnitudes, () => {
  it('loads every axis with comparable available magnitude', () => {
    const maxima = maxMagnitudes(cineTestQuestions);
    const values = Object.values(maxima);

    expect(Math.min(...values)).toBeGreaterThan(0);
    // No axis should dominate; keep the spread within a sane band.
    expect(Math.max(...values) / Math.min(...values)).toBeLessThan(3.5);
  });
});
