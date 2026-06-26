import { describe, expect, it } from 'vitest';
import { CineTestSubmitValidation } from './CineTestValidation';

const choice = (optionKey: string) => ({
  answers: { q25: { kind: 'choice', optionKey } },
});

describe('cinetest submit validation', () => {
  it('accepts a four-option choice answer', () => {
    const result = CineTestSubmitValidation.safeParse(choice('d'));

    expect(result.success).toBeTruthy();
  });

  it('rejects a choice option outside a–d', () => {
    const result = CineTestSubmitValidation.safeParse(choice('e'));

    expect(result.success).toBeFalsy();
  });

  it('rejects a removed answer kind', () => {
    const result = CineTestSubmitValidation.safeParse({
      answers: { q04: { kind: 'ranking', order: ['i1', 'i2'] } },
    });

    expect(result.success).toBeFalsy();
  });

  it('accepts a poster pick carrying its genre ids', () => {
    const result = CineTestSubmitValidation.safeParse({
      answers: { q37: { kind: 'poster', tmdbId: 155, genreIds: [18, 27] } },
    });

    expect(result.success).toBeTruthy();
  });

  it('rejects a poster pick missing its genre ids', () => {
    const result = CineTestSubmitValidation.safeParse({
      answers: { q37: { kind: 'poster', tmdbId: 155 } },
    });

    expect(result.success).toBeFalsy();
  });

  it('accepts a favourites pick of up to four films', () => {
    const result = CineTestSubmitValidation.safeParse({
      answers: {
        q37: {
          kind: 'favorites',
          picks: [
            { tmdbId: 155, genreIds: [18] },
            { tmdbId: 27_205, genreIds: [28] },
          ],
        },
      },
    });

    expect(result.success).toBeTruthy();
  });

  it('rejects a favourites pick beyond four films', () => {
    const picks = Array.from({ length: 5 }, (_unused, index) => ({
      tmdbId: index + 1,
      genreIds: [18],
    }));
    const result = CineTestSubmitValidation.safeParse({
      answers: { q37: { kind: 'favorites', picks } },
    });

    expect(result.success).toBeFalsy();
  });

  it('rejects an empty question-id key', () => {
    const result = CineTestSubmitValidation.safeParse({
      answers: { '': { kind: 'choice', optionKey: 'a' } },
    });

    expect(result.success).toBeFalsy();
  });
});
