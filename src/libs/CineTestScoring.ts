import {
  cineTypeFromVector,
  descriptorFromVector,
  POSTER_AXIS_MAX,
  textureWeightsForGenres,
} from '@/data/cinetest-personas';
import { cineTestQuestions } from '@/data/cinetest-questions';
import type {
  AxisWeights,
  CineAnswerMap,
  CineContribution,
  CineFilmPicks,
  CineTestAnswer,
  CineTestQuestion,
  CineTestResult,
  CineVector,
} from '@/types/CineTest';
import { CINE_AXES, CINE_TEXTURE_AXES } from '@/types/CineTest';

// Pure, deterministic scoring shared by the client preview and the server write.
// Answers → signed per-axis contributions → normalize by each axis's available
// magnitude → resolve persona + descriptor. No randomness; re-scoring is stable.

function emptyVector(): CineVector {
  return {
    gaze: 0,
    eye: 0,
    pulse: 0,
    compass: 0,
    tempo: 0,
    palette: 0,
    mood: 0,
    ending: 0,
  };
}

function addWeights(target: CineVector, weights: AxisWeights) {
  for (const axis of CINE_AXES) {
    const value = weights[axis];

    if (value !== undefined) {
      target[axis] += value;
    }
  }
}

// The signed per-axis contribution of one answer to one question.
function contributionFor(question: CineTestQuestion, answer: CineTestAnswer): AxisWeights {
  if (question.kind === 'likert' && answer.kind === 'likert') {
    const magnitude = (answer.value / 2) * (question.reverse ? -1 : 1);

    return { [question.axis]: magnitude };
  }

  if (question.kind === 'choice' && answer.kind === 'choice') {
    const option = question.options.find((candidate) => candidate.key === answer.optionKey);

    return option ? option.weights : {};
  }

  // A film pick loads the texture axes (via its genres), never the disposition code.
  if (question.kind === 'poster' && answer.kind === 'poster') {
    return textureWeightsForGenres(answer.genreIds);
  }

  // Favourites load texture from the union of their picks' genres; the helper caps the
  // result per axis, so the four picks weigh the same as one poster pick.
  if (question.kind === 'favorites' && answer.kind === 'favorites') {
    return textureWeightsForGenres(answer.picks.flatMap((pick) => pick.genreIds));
  }

  // person-search stays a taste signal only — it does not score axes.
  return {};
}

// The largest |contribution| each axis can receive in a single direction across the
// whole test, used to normalize raw scores into [-1, 1] so axis strengths stay
// comparable. A choice question yields exactly one option, so an axis can only collect
// same-signed picks — summing both directions would double-count it.
export function maxMagnitudes(questions: CineTestQuestion[]): CineVector {
  const totals = emptyVector();
  const choicePositive = emptyVector();
  const choiceNegative = emptyVector();

  for (const question of questions) {
    if (question.kind === 'likert') {
      totals[question.axis] += 1;
    } else if (question.kind === 'choice') {
      for (const axis of CINE_AXES) {
        const values = question.options.map((option) => option.weights[axis] ?? 0);
        choicePositive[axis] += Math.max(0, ...values);
        choiceNegative[axis] += Math.max(0, ...values.map((value) => -value));
      }
    } else if (question.kind === 'poster' || question.kind === 'favorites') {
      // Film picks load texture only, capped per axis (see POSTER_AXIS_MAX).
      for (const axis of CINE_TEXTURE_AXES) {
        totals[axis] += POSTER_AXIS_MAX;
      }
    }
  }

  for (const axis of CINE_AXES) {
    totals[axis] += Math.max(choicePositive[axis], choiceNegative[axis]);
  }

  return totals;
}

const CONTRIBUTION_EPSILON = 0.001;
const HIGHLIGHT_COUNT = 6;

function filmPicksFromAnswers(answers: CineAnswerMap): CineFilmPicks {
  const picks: CineFilmPicks = { movies: [], favorites: [] };

  for (const question of cineTestQuestions) {
    const answer = answers[question.id];

    if (!answer) {
      continue;
    }

    if (answer.kind === 'poster') {
      picks.movies.push(answer.tmdbId);
    } else if (answer.kind === 'favorites') {
      // Favourites lead the movie list (best signal) and double as the "top films".
      const ids = answer.picks.map((pick) => pick.tmdbId);
      picks.movies.unshift(...ids);
      picks.favorites = ids;
    } else if (answer.kind === 'person-search' && question.kind === 'person-search') {
      if (question.role === 'director') {
        picks.director = answer.pick.personId;
      } else {
        picks.actor = answer.pick.personId;
      }
    }
  }

  return picks;
}

/**
 * Scores a (possibly partial) answer map into a full CineTest result.
 * @param answers - The respondent's answers, keyed by question id.
 * @returns The resolved persona, normalized vector, descriptor, picks, and highlights.
 */
export function scoreAnswers(answers: CineAnswerMap): CineTestResult {
  const raw = emptyVector();
  const highlights: CineContribution[] = [];

  for (const question of cineTestQuestions) {
    const answer = answers[question.id];

    if (!answer) {
      continue;
    }

    const contribution = contributionFor(question, answer);
    addWeights(raw, contribution);

    for (const axis of CINE_AXES) {
      const value = contribution[axis];

      if (value !== undefined && Math.abs(value) >= CONTRIBUTION_EPSILON) {
        highlights.push({ questionId: question.id, axis, value });
      }
    }
  }

  const maxima = maxMagnitudes(cineTestQuestions);
  const vector = emptyVector();

  for (const axis of CINE_AXES) {
    vector[axis] = maxima[axis] > 0 ? Math.max(-1, Math.min(1, raw[axis] / maxima[axis])) : 0;
  }

  const topHighlights = highlights
    .toSorted((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, HIGHLIGHT_COUNT);

  return {
    cineType: cineTypeFromVector(vector),
    vector,
    descriptor: descriptorFromVector(vector),
    filmPicks: filmPicksFromAnswers(answers),
    highlights: topHighlights,
  };
}
