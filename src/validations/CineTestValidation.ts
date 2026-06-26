import * as z from 'zod';

// Validates the answer payload posted by the test flow before server-side scoring.
// The map is loosely keyed by question id; each value is a discriminated answer.

/** Question-id key length bound; ids look like `q12`, so 8 chars is ample. */
const QUESTION_ID_MAX = 8;
/** Upper bound on answers per submission, so a malformed map can never balloon. */
const MAX_ANSWERS = 100;
/** Person name / profile-path length bound from the TMDB search payload. */
const PERSON_FIELD_MAX = 200;
/** Free-text person search query length bound. */
const PERSON_QUERY_MAX = 80;
/** Upper bound on genre ids carried by a poster pick (TMDB lists at most a handful). */
const GENRE_IDS_MAX = 20;
/** Upper bound on films carried by the favourites pick. */
const FAVORITES_MAX = 4;

const LikertAnswer = z.object({
  kind: z.literal('likert'),
  value: z.union([z.literal(-2), z.literal(-1), z.literal(0), z.literal(1), z.literal(2)]),
});

const ChoiceAnswer = z.object({
  kind: z.literal('choice'),
  optionKey: z.enum(['a', 'b', 'c', 'd']),
});

const FilmPick = z.object({
  tmdbId: z.number().int().positive(),
  genreIds: z.array(z.number().int().nonnegative()).max(GENRE_IDS_MAX),
});

const PosterAnswer = z.object({
  kind: z.literal('poster'),
  tmdbId: z.number().int().positive(),
  genreIds: z.array(z.number().int().nonnegative()).max(GENRE_IDS_MAX),
});

const FavoritesAnswer = z.object({
  kind: z.literal('favorites'),
  picks: z.array(FilmPick).min(1).max(FAVORITES_MAX),
});

const PersonAnswer = z.object({
  kind: z.literal('person-search'),
  pick: z.object({
    personId: z.number().int().positive(),
    name: z.string().min(1).max(PERSON_FIELD_MAX),
    profilePath: z.string().max(PERSON_FIELD_MAX).nullable(),
  }),
});

const CineTestAnswerValidation = z.discriminatedUnion('kind', [
  LikertAnswer,
  ChoiceAnswer,
  PosterAnswer,
  FavoritesAnswer,
  PersonAnswer,
]);

export const CineTestSubmitValidation = z.object({
  answers: z
    .record(z.string().min(1).max(QUESTION_ID_MAX), CineTestAnswerValidation)
    .refine((map) => Object.keys(map).length <= MAX_ANSWERS, 'too many answers'),
});

export const CinePersonSearchValidation = z.object({
  query: z.string().trim().min(1).max(PERSON_QUERY_MAX),
  role: z.enum(['director', 'actor']),
});

export const CinePersonRoleValidation = z.object({
  role: z.enum(['director', 'actor']),
});
