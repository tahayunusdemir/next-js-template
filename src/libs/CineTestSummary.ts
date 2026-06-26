import { cineTestQuestions } from '@/data/cinetest-questions';
import type { MovieGenreKey } from '@/data/genres';
import { genreKey } from '@/data/genres';
import type { CineAnswerMap, PersonPick } from '@/types/CineTest';

// Pure helpers that turn a stored answer map into the short, display-ready picks shown on
// the result page and the profile — the favorite people and the genres a viewer's film
// picks lean toward. No database or TMDB access; everything is read from the snapshot.

/**
 * Pulls the favorite director or actor out of the answers, resolving the question by role
 * so callers never hard-code a question id.
 * @param answers - The stored answer snapshot.
 * @param role - Which person pick to read.
 * @returns The picked person, or undefined when that question was skipped.
 */
export function cinePersonByRole(
  answers: CineAnswerMap,
  role: 'director' | 'actor',
): PersonPick | undefined {
  const question = cineTestQuestions.find(
    (candidate) => candidate.kind === 'person-search' && candidate.role === role,
  );
  const answer = question ? answers[question.id] : undefined;

  return answer?.kind === 'person-search' ? answer.pick : undefined;
}

/**
 * Ranks the genre categories a viewer's film picks lean toward, most-picked first. Each
 * poster pick carries its film's genres, so a few short category labels summarize taste.
 * @param answers - The stored answer snapshot.
 * @param limit - How many genre keys to return.
 * @returns The top genre keys, most frequent first.
 */
export function cineTopGenres(answers: CineAnswerMap, limit = 5): MovieGenreKey[] {
  const counts = new Map<MovieGenreKey, number>();

  function tally(genreIds: number[]) {
    for (const genreId of genreIds) {
      const key = genreKey(genreId);

      if (key) {
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
  }

  for (const answer of Object.values(answers)) {
    if (answer?.kind === 'poster') {
      tally(answer.genreIds);
    } else if (answer?.kind === 'favorites') {
      for (const pick of answer.picks) {
        tally(pick.genreIds);
      }
    }
  }

  return [...counts.entries()]
    .toSorted((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key]) => key);
}

/**
 * Reads the single catalogue picks (the nine taste questions) out of the answers, in question
 * order — the films shown as posters alongside the favourites on the result page.
 * @param answers - The stored answer snapshot.
 * @returns The picked TMDB ids, in display order.
 */
export function cinePosterPicks(answers: CineAnswerMap): number[] {
  const ids: number[] = [];

  for (const question of cineTestQuestions) {
    const answer = answers[question.id];

    if (answer?.kind === 'poster') {
      ids.push(answer.tmdbId);
    }
  }

  return ids;
}
