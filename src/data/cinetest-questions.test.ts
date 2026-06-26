import { describe, expect, it } from 'vitest';
import { CINE_AXES } from '@/types/CineTest';
import {
  CINE_TEST_PAGES,
  CINE_TEST_TOTAL,
  cineTestQuestions,
  FAVORITES_PICK_COUNT,
  questionsForPage,
} from './cinetest-questions';

describe('cineTest question set', () => {
  it('contains 48 questions with unique ids', () => {
    const ids = cineTestQuestions.map((question) => question.id);

    expect(CINE_TEST_TOTAL).toBe(48);
    expect(new Set(ids).size).toBe(48);
  });

  it('splits into four pages of twelve', () => {
    for (const page of CINE_TEST_PAGES) {
      expect(questionsForPage(page)).toHaveLength(12);
    }
  });

  it('groups each page into a single format', () => {
    const formatByPage: Record<number, string[]> = {
      1: ['likert'],
      2: ['likert'],
      3: ['choice'],
      4: ['favorites', 'poster', 'person-search'],
    };

    for (const page of CINE_TEST_PAGES) {
      for (const question of questionsForPage(page)) {
        expect(formatByPage[page]).toContain(question.kind);
      }
    }
  });

  it('resolves the disposition code only from the likert and choice pages', () => {
    // The four-letter code comes from the disposition axes, which only likert + choice
    // touch (pages 1–3). Page 4 carries film mechanics, which flavor texture only.
    const dispositionKinds = new Set(['likert', 'choice']);
    const codePages = cineTestQuestions.filter((question) => question.page !== 4);
    const filmPage = cineTestQuestions.filter((question) => question.page === 4);

    expect(codePages.every((question) => dispositionKinds.has(question.kind))).toBeTruthy();
    expect(filmPage.some((question) => dispositionKinds.has(question.kind))).toBeFalsy();
  });

  it('ends with the favorite director then actor', () => {
    expect(cineTestQuestions.at(-2)).toMatchObject({ kind: 'person-search', role: 'director' });
    expect(cineTestQuestions.at(-1)).toMatchObject({ kind: 'person-search', role: 'actor' });
  });

  it('gives every choice question four distinct option keys', () => {
    for (const question of cineTestQuestions) {
      if (question.kind !== 'choice') {
        continue;
      }

      const keys = question.options.map((option) => option.key);

      expect(keys).toStrictEqual(['a', 'b', 'c', 'd']);
    }
  });

  it('opens page four with a pick-four favourites question', () => {
    const [first] = questionsForPage(4);

    expect(first).toMatchObject({ kind: 'favorites', id: 'q37', count: FAVORITES_PICK_COUNT });
  });

  it('fills the rest of the film page with nine single picks', () => {
    const posters = questionsForPage(4).filter((question) => question.kind === 'poster');

    expect(posters).toHaveLength(9);
  });

  it('covers every axis evenly across the likert statements', () => {
    const counts = new Map<string, number>();

    for (const question of cineTestQuestions) {
      if (question.kind === 'likert') {
        counts.set(question.axis, (counts.get(question.axis) ?? 0) + 1);
      }
    }

    for (const axis of CINE_AXES) {
      expect(counts.get(axis)).toBe(3);
    }
  });
});
