'use client';

import { useTranslations } from 'next-intl';
import * as React from 'react';
import type { CineBrowseMovie } from '@/app/[locale]/(auth)/dashboard/cinetest/actions';
import { Section } from '@/components/marketing/section';
import { Button } from '@/components/ui/button';
import { CINE_TEST_TOTAL, cineTestQuestions, filmTasteQuestions } from '@/data/cinetest-questions';
import { posterUrl, profileUrl } from '@/libs/Tmdb';
import type {
  CineTestAnswers,
  CineTestQuestion,
  FavoritesQuestion,
  FilmPick,
  PosterQuestion,
} from '@/types/CineTest';
import type { PicksPanelEntry } from './cinetest-picks-panel';
import { CineTestPicksPanel } from './cinetest-picks-panel';
import { CineTestProgress } from './cinetest-progress';
import { getServerSnapshot, getSnapshot, setAnswer, subscribe } from './cinetest-store';
import { FilmPicker } from './film-picker';
import { QuestionPersonSearch } from './question-person-search';

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Counts answered questions across the whole test for the progress bar; a favourites question
// counts once it has at least one pick.
function answeredCountFor(answers: CineTestAnswers) {
  return cineTestQuestions.filter((question) => {
    const answer = answers[question.id];

    if (!answer) {
      return false;
    }

    return answer.kind === 'favorites' ? answer.picks.length > 0 : true;
  }).length;
}

// Whether a film question blocks advancing: favourites need every slot filled, single picks
// need one, and the director/actor questions are optional taste signals.
function isComplete(question: CineTestQuestion, answers: CineTestAnswers) {
  const answer = answers[question.id];

  if (question.kind === 'favorites') {
    return answer?.kind === 'favorites' && answer.picks.length === question.count;
  }

  if (question.kind === 'poster') {
    return answer?.kind === 'poster';
  }

  return true;
}

// The page-4 film-taste flow: one question at a time, each a catalogue browse + pick, with a
// floating panel tracking every selection. Back from the first question returns to page 3.
export function CineTestFilmStage(props: {
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const t = useTranslations('CineTestPage');
  const tQuestion = useTranslations('CineTest');
  const state = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [index, setIndex] = React.useState(0);
  // Picked films keyed by id, so the panel can show poster thumbnails without re-fetching.
  const [picked, setPicked] = React.useState<Map<number, CineBrowseMovie>>(new Map());

  const { answers } = state;
  const question = filmTasteQuestions[index];

  if (!question) {
    return null;
  }

  function cacheMovie(movie: CineBrowseMovie) {
    setPicked((previous) => {
      if (previous.has(movie.tmdbId)) {
        return previous;
      }

      return new Map([...previous, [movie.tmdbId, movie]]);
    });
  }

  function pickFavorite(target: FavoritesQuestion, movie: CineBrowseMovie) {
    const answer = answers[target.id];
    const picks = answer?.kind === 'favorites' ? answer.picks : [];
    const selected = picks.some((pick) => pick.tmdbId === movie.tmdbId);

    let next: FilmPick[];

    if (selected) {
      next = picks.filter((pick) => pick.tmdbId !== movie.tmdbId);
    } else if (picks.length >= target.count) {
      return;
    } else {
      next = [...picks, { tmdbId: movie.tmdbId, genreIds: movie.genreIds }];
    }

    cacheMovie(movie);
    setAnswer(target.id, { kind: 'favorites', picks: next });
  }

  function pickPoster(target: PosterQuestion, movie: CineBrowseMovie) {
    cacheMovie(movie);
    setAnswer(target.id, { kind: 'poster', tmdbId: movie.tmdbId, genreIds: movie.genreIds });
  }

  function selectedIdsFor(target: CineTestQuestion) {
    const answer = answers[target.id];

    if (target.kind === 'favorites' && answer?.kind === 'favorites') {
      return answer.picks.map((pick) => pick.tmdbId);
    }

    if (target.kind === 'poster' && answer?.kind === 'poster') {
      return [answer.tmdbId];
    }

    return [];
  }

  function labelFor(target: CineTestQuestion) {
    if (target.kind === 'favorites' || target.kind === 'poster') {
      return tQuestion(`${target.id}_label`);
    }

    if (target.kind === 'person-search') {
      return tQuestion(`${target.id}_label`);
    }

    return '';
  }

  // Sub-lines only exist for the film-taste questions (q37–q48); narrow by kind so the strict
  // t() key union never expands over the likert/choice ids that have no `_sub`.
  function subFor(target: CineTestQuestion) {
    if (target.kind === 'favorites' || target.kind === 'poster') {
      return tQuestion(`${target.id}_sub`);
    }

    if (target.kind === 'person-search') {
      return tQuestion(`${target.id}_sub`);
    }

    return '';
  }

  const entries: PicksPanelEntry[] = filmTasteQuestions.map((target, position) => {
    const answer = answers[target.id];
    const base = { id: target.id, label: labelFor(target), current: position === index };

    if (target.kind === 'favorites') {
      const picks = answer?.kind === 'favorites' ? answer.picks : [];

      return {
        ...base,
        posters: picks.map((pick) =>
          posterUrl(picked.get(pick.tmdbId)?.posterPath ?? null, 'w185'),
        ),
      };
    }

    if (target.kind === 'poster') {
      const has = answer?.kind === 'poster';

      return {
        ...base,
        posters: has ? [posterUrl(picked.get(answer.tmdbId)?.posterPath ?? null, 'w185')] : [],
      };
    }

    const person = answer?.kind === 'person-search' ? answer.pick : undefined;

    return {
      ...base,
      posters: [],
      person: person ? { name: person.name, avatar: profileUrl(person.profilePath) } : undefined,
    };
  });

  const isLast = index === filmTasteQuestions.length - 1;
  const canAdvance = isComplete(question, answers);
  const allComplete = filmTasteQuestions.every((target) => isComplete(target, answers));
  const questionNumber = cineTestQuestions.indexOf(question) + 1;

  function goBack() {
    if (index > 0) {
      setIndex(index - 1);
      scrollTop();
    } else {
      props.onBack();
    }
  }

  function goNext() {
    if (!isLast) {
      setIndex(index + 1);
      scrollTop();
    }
  }

  // The current step: a multi-pick favourites browse, a single-pick browse, or the
  // director/actor typeahead. The stage owns the heading, so the person step hides its legend.
  function renderStep(target: CineTestQuestion) {
    if (target.kind === 'favorites') {
      return (
        <FilmPicker
          mode="multi"
          max={target.count}
          selectedIds={selectedIdsFor(target)}
          onPick={(movie) => {
            pickFavorite(target, movie);
          }}
        />
      );
    }

    if (target.kind === 'poster') {
      return (
        <FilmPicker
          mode="single"
          selectedIds={selectedIdsFor(target)}
          onPick={(movie) => {
            pickPoster(target, movie);
          }}
        />
      );
    }

    if (target.kind === 'person-search') {
      const answer = answers[target.id];

      return (
        <QuestionPersonSearch
          question={target}
          hideLegend
          value={answer?.kind === 'person-search' ? answer.pick : undefined}
          onValue={(pick) => {
            setAnswer(target.id, { kind: 'person-search', pick });
          }}
        />
      );
    }

    return null;
  }

  return (
    <Section className="py-8 sm:py-12">
      <CineTestProgress answered={answeredCountFor(answers)} total={CINE_TEST_TOTAL} step={4} />

      <div className="mt-8">
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          {t('page_4_title')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('page_4_subtitle')}</p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="min-w-0">
          <div className="mb-5">
            <p className="text-xs font-medium text-muted-foreground">
              {t('question_index', { index: questionNumber, total: CINE_TEST_TOTAL })}
            </p>
            <h2 className="mt-2 font-heading text-lg font-medium text-balance">
              {tQuestion(`${question.id}_text`)}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{subFor(question)}</p>
            {question.kind === 'favorites' ? (
              <p className="mt-2 text-xs text-muted-foreground">
                {t('favorites_hint', {
                  count: selectedIdsFor(question).length,
                  total: question.count,
                })}
              </p>
            ) : null}
          </div>

          {renderStep(question)}
        </div>

        <CineTestPicksPanel
          title={t('picks_panel_title')}
          emptyLabel={t('picks_panel_empty')}
          entries={entries}
          onJump={(position) => {
            setIndex(position);
            scrollTop();
          }}
        />
      </div>

      <div className="sticky bottom-0 mt-10 flex items-center justify-between gap-3 border-t bg-background/80 py-4 backdrop-blur">
        <Button variant="outline" onClick={goBack} disabled={props.submitting}>
          {t('back')}
        </Button>
        {isLast ? (
          <Button onClick={props.onSubmit} disabled={!allComplete || props.submitting}>
            {props.submitting ? t('submitting') : t('submit')}
          </Button>
        ) : (
          <Button onClick={goNext} disabled={!canAdvance}>
            {t('next')}
          </Button>
        )}
      </div>

      {isLast && !allComplete ? (
        <p className="mt-2 text-right text-xs text-muted-foreground">{t('incomplete_hint')}</p>
      ) : null}
    </Section>
  );
}
