import { describe, expect, it } from 'vitest';
import { FilmStatusValidation, FilmsSearchValidation } from './FilmValidation';

describe('films search validation', () => {
  it('applies defaults for an empty query', () => {
    const result = FilmsSearchValidation.parse({});

    expect(result).toMatchObject({ page: 1, sort: 'popularity', density: 'compact' });
  });

  it('coerces numeric page, genre, and decade from strings', () => {
    const result = FilmsSearchValidation.parse({ page: '3', genre: '28', decade: '1990' });

    expect(result).toMatchObject({ page: 3, genre: 28, decade: 1990 });
  });

  it('rejects an unknown sort value', () => {
    const result = FilmsSearchValidation.safeParse({ sort: 'rude' });

    expect(result.success).toBeFalsy();
  });

  it('trims the search query', () => {
    const result = FilmsSearchValidation.parse({ q: '  blade  ' });

    expect(result.q).toBe('blade');
  });
});

describe('film status validation', () => {
  it('coerces a string movie id to a number', () => {
    const result = FilmStatusValidation.parse({ movieId: '550', field: 'watched', value: true });

    expect(result.movieId).toBe(550);
  });

  it('rejects an unknown status field', () => {
    const result = FilmStatusValidation.safeParse({ movieId: 1, field: 'liked', value: true });

    expect(result.success).toBeFalsy();
  });
});
