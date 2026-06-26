import type { CinePage, CineTestQuestion, ChoiceQuestion, LikertQuestion } from '@/types/CineTest';

// The 48-question scaffold. Structure + scoring weights are authored here; all
// display copy lives in next-intl keyed off each question id (e.g. `q07_text`).
// The set is grouped by format so each page reads as one consistent mode:
//   • Pages 1–2 (q01–q24): Likert agree/disagree statements — three per axis.
//   • Page 3   (q25–q36): four-option, scenario-based choices.
//   • Page 4   (q37–q48): film taste — a pick-four favourites set, nine single catalogue
//     picks, then favorite director/actor, each answered one at a time.
// Personality is scored entirely from the Likert + choice questions (q01–q36);
// the poster + person questions on page 4 are taste signals only.

function likert(
  id: LikertQuestion['id'],
  page: CinePage,
  axis: LikertQuestion['axis'],
  reverse?: boolean,
): LikertQuestion {
  return reverse ? { kind: 'likert', id, page, axis, reverse } : { kind: 'likert', id, page, axis };
}

// A scenario question maps its four options (a–d) onto one axis pole each.
function choice(
  id: ChoiceQuestion['id'],
  page: CinePage,
  options: ChoiceQuestion['options'],
): ChoiceQuestion {
  return { kind: 'choice', id, page, options };
}

/** How many films the "all-time favourites" question (q37) asks for. */
export const FAVORITES_PICK_COUNT = 4;

export const cineTestQuestions: CineTestQuestion[] = [
  // --- Pages 1–2 — Likert (three statements per axis) -----------------------
  likert('q01', 1, 'gaze'),
  likert('q02', 1, 'eye'),
  likert('q03', 1, 'pulse'),
  likert('q04', 1, 'compass'),
  likert('q05', 1, 'tempo'),
  likert('q06', 1, 'palette'),
  likert('q07', 1, 'mood'),
  likert('q08', 1, 'ending'),
  likert('q09', 1, 'gaze', true),
  likert('q10', 1, 'eye', true),
  likert('q11', 1, 'pulse', true),
  likert('q12', 1, 'compass', true),
  likert('q13', 2, 'tempo', true),
  likert('q14', 2, 'palette', true),
  likert('q15', 2, 'mood', true),
  likert('q16', 2, 'ending', true),
  likert('q17', 2, 'gaze'),
  likert('q18', 2, 'eye'),
  likert('q19', 2, 'pulse'),
  likert('q20', 2, 'compass'),
  likert('q21', 2, 'tempo'),
  likert('q22', 2, 'palette'),
  likert('q23', 2, 'mood'),
  likert('q24', 2, 'ending'),

  // --- Page 3 — scenario choices (four options, one axis pole each) ---------
  choice('q25', 3, [
    { key: 'a', weights: { gaze: 0.6 } },
    { key: 'b', weights: { eye: 0.6 } },
    { key: 'c', weights: { pulse: 0.6 } },
    { key: 'd', weights: { compass: 0.6 } },
  ]),
  choice('q26', 3, [
    { key: 'a', weights: { tempo: 0.6 } },
    { key: 'b', weights: { palette: 0.6 } },
    { key: 'c', weights: { mood: 0.6 } },
    { key: 'd', weights: { ending: 0.6 } },
  ]),
  choice('q27', 3, [
    { key: 'a', weights: { gaze: -0.6 } },
    { key: 'b', weights: { eye: -0.6 } },
    { key: 'c', weights: { pulse: -0.6 } },
    { key: 'd', weights: { compass: -0.6 } },
  ]),
  choice('q28', 3, [
    { key: 'a', weights: { tempo: -0.6 } },
    { key: 'b', weights: { palette: -0.6 } },
    { key: 'c', weights: { mood: -0.6 } },
    { key: 'd', weights: { ending: -0.6 } },
  ]),
  choice('q29', 3, [
    { key: 'a', weights: { gaze: 0.6 } },
    { key: 'b', weights: { pulse: 0.6 } },
    { key: 'c', weights: { tempo: 0.6 } },
    { key: 'd', weights: { mood: 0.6 } },
  ]),
  choice('q30', 3, [
    { key: 'a', weights: { eye: 0.6 } },
    { key: 'b', weights: { compass: 0.6 } },
    { key: 'c', weights: { palette: 0.6 } },
    { key: 'd', weights: { ending: 0.6 } },
  ]),
  choice('q31', 3, [
    { key: 'a', weights: { gaze: -0.6 } },
    { key: 'b', weights: { pulse: -0.6 } },
    { key: 'c', weights: { tempo: -0.6 } },
    { key: 'd', weights: { mood: -0.6 } },
  ]),
  choice('q32', 3, [
    { key: 'a', weights: { eye: -0.6 } },
    { key: 'b', weights: { compass: -0.6 } },
    { key: 'c', weights: { palette: -0.6 } },
    { key: 'd', weights: { ending: -0.6 } },
  ]),
  choice('q33', 3, [
    { key: 'a', weights: { gaze: 0.6 } },
    { key: 'b', weights: { eye: 0.6 } },
    { key: 'c', weights: { tempo: 0.6 } },
    { key: 'd', weights: { palette: 0.6 } },
  ]),
  choice('q34', 3, [
    { key: 'a', weights: { pulse: 0.6 } },
    { key: 'b', weights: { compass: 0.6 } },
    { key: 'c', weights: { mood: 0.6 } },
    { key: 'd', weights: { ending: 0.6 } },
  ]),
  choice('q35', 3, [
    { key: 'a', weights: { gaze: -0.6 } },
    { key: 'b', weights: { eye: -0.6 } },
    { key: 'c', weights: { tempo: -0.6 } },
    { key: 'd', weights: { palette: -0.6 } },
  ]),
  choice('q36', 3, [
    { key: 'a', weights: { pulse: -0.6 } },
    { key: 'b', weights: { compass: -0.6 } },
    { key: 'c', weights: { mood: -0.6 } },
    { key: 'd', weights: { ending: -0.6 } },
  ]),

  // --- Page 4 — film taste (favourites, single catalogue picks, director + actor) -
  { kind: 'favorites', id: 'q37', page: 4, count: FAVORITES_PICK_COUNT },
  { kind: 'poster', id: 'q38', page: 4 },
  { kind: 'poster', id: 'q39', page: 4 },
  { kind: 'poster', id: 'q40', page: 4 },
  { kind: 'poster', id: 'q41', page: 4 },
  { kind: 'poster', id: 'q42', page: 4 },
  { kind: 'poster', id: 'q43', page: 4 },
  { kind: 'poster', id: 'q44', page: 4 },
  { kind: 'poster', id: 'q45', page: 4 },
  { kind: 'poster', id: 'q46', page: 4 },
  { kind: 'person-search', id: 'q47', page: 4, role: 'director' },
  { kind: 'person-search', id: 'q48', page: 4, role: 'actor' },
];

export const CINE_TEST_PAGES: readonly CinePage[] = [1, 2, 3, 4];
export const CINE_TEST_TOTAL = cineTestQuestions.length;

/**
 * How long a respondent must wait between tests. The server enforces this per signed-in
 * user; the client mirrors it from the last local completion to gate the landing. Shared
 * here so both sides agree on one window.
 */
const COOLDOWN_DAYS = 30;
export const CINETEST_COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

/**
 * Returns the 12 questions on a given page, in display order.
 * @param page - The page number (1–4).
 * @returns The questions belonging to that page.
 */
export function questionsForPage(page: CinePage) {
  return cineTestQuestions.filter((question) => question.page === page);
}

/** The page-4 film-taste questions, in display order — answered one at a time. */
export const filmTasteQuestions = questionsForPage(4);
