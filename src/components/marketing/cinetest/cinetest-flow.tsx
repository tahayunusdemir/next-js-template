'use client';

import { useLocale, useTranslations } from 'next-intl';
import * as React from 'react';
import { toast } from 'sonner';
import { submitCineTest } from '@/app/[locale]/(auth)/dashboard/cinetest/actions';
import { Section } from '@/components/marketing/section';
import { Button } from '@/components/ui/button';
import {
  CINE_TEST_TOTAL,
  CINETEST_COOLDOWN_MS,
  cineTestQuestions,
  questionsForPage,
} from '@/data/cinetest-questions';
import { cn } from '@/lib/utils';
import { useRouter } from '@/libs/I18nNavigation';
import type { CinePage, CineTestAnswers, CineTestQuestion } from '@/types/CineTest';
import { CineTestFilmStage } from './cinetest-film-stage';
import { CineTestLanding } from './cinetest-landing';
import { CineTestProgress } from './cinetest-progress';
import {
  completeTest,
  getServerSnapshot,
  getSnapshot,
  setAnswer,
  setPage,
  subscribe,
} from './cinetest-store';
import { QuestionChoice } from './question-choice';
import { QuestionLikert } from './question-likert';

// Previous/next page for the footer nav, kept literal so no casts are needed.
const PAGE_NAV: Record<CinePage, { prev: CinePage; next: CinePage }> = {
  1: { prev: 1, next: 2 },
  2: { prev: 1, next: 3 },
  3: { prev: 2, next: 4 },
  4: { prev: 3, next: 4 },
};

function goToPage(page: CinePage) {
  setPage(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function isAnswered(question: CineTestQuestion, answers: CineTestAnswers) {
  return Boolean(answers[question.id]);
}

export function CineTestFlow() {
  const t = useTranslations('CineTestPage');
  const locale = useLocale();
  const router = useRouter();
  const state = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [submitting, setSubmitting] = React.useState(false);
  const [started, setStarted] = React.useState(false);

  const { answers, page } = state;
  // Mirror the once-a-month limit from the last local completion so the landing can gate
  // the CTA. Signed-in users are also enforced server-side on submit.
  const nextAvailableAt = state.completedAt ? state.completedAt + CINETEST_COOLDOWN_MS : undefined;
  const inCooldown = nextAvailableAt !== undefined && Date.now() < nextAvailableAt;
  const pageQuestions = questionsForPage(page);
  const answeredCount = cineTestQuestions.filter((question) =>
    isAnswered(question, answers),
  ).length;
  // Pages 1–3 are agree/disagree + scenario questions; every one must be answered to advance.
  const pageComplete = pageQuestions.every((question) => isAnswered(question, answers));
  // Gate the intro on explicit answers only, so a fresh visit always sees it; a saved
  // in-progress test (with real answers) resumes straight to its page.
  const explicitCount = cineTestQuestions.filter((question) => answers[question.id]).length;
  const showIntro = !started && explicitCount === 0;

  async function submitTest() {
    setSubmitting(true);

    const response = await submitCineTest({ answers }).catch(() => null);

    if (response?.ok) {
      completeTest(response.id);
      router.push(`/dashboard/cinetest/result/${response.id}`);
      return;
    }

    // Already taken this window: send them to their existing result with a heads-up.
    if (response && response.reason === 'cooldown') {
      const date = new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(response.nextAvailableAt));
      toast.warning(t('cooldown_toast', { date }));
      router.push(`/dashboard/cinetest/result/${response.lastId}`);
      return;
    }

    toast.error(t('submit_error'));
    setSubmitting(false);
  }

  function renderQuestion(question: CineTestQuestion) {
    const answer = answers[question.id];

    if (question.kind === 'likert') {
      return (
        <QuestionLikert
          question={question}
          value={answer?.kind === 'likert' ? answer.value : undefined}
          onValue={(value) => {
            setAnswer(question.id, { kind: 'likert', value });
          }}
        />
      );
    }

    if (question.kind === 'choice') {
      return (
        <QuestionChoice
          question={question}
          value={answer?.kind === 'choice' ? answer.optionKey : undefined}
          onValue={(optionKey) => {
            setAnswer(question.id, { kind: 'choice', optionKey });
          }}
        />
      );
    }

    // Film-taste questions (page 4) render in their own one-at-a-time stage, not here.
    return null;
  }

  if (showIntro) {
    return (
      <CineTestLanding
        onStart={() => {
          setStarted(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        cooldown={{
          active: inCooldown,
          nextAvailableAt,
          lastResultId: state.lastResultId,
        }}
      />
    );
  }

  // Page 4 (film taste) is a wide, one-at-a-time browse-and-pick flow with its own nav.
  if (page === 4) {
    return (
      <CineTestFilmStage
        onBack={() => {
          goToPage(3);
        }}
        onSubmit={() => {
          void submitTest();
        }}
        submitting={submitting}
      />
    );
  }

  return (
    <Section className="py-8 sm:py-12">
      <CineTestProgress answered={answeredCount} total={CINE_TEST_TOTAL} step={page} />

      <div className="mx-auto mt-8 max-w-2xl">
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          {t(`page_${page}_title`)}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t(`page_${page}_subtitle`)}</p>

        <ol className="mt-8 space-y-6">
          {pageQuestions.map((question, index) => {
            // Progressive reveal: a question stays blurred and inert until every earlier
            // question on the page is answered, so focus lands on one statement at a time
            // and the next unblurs the moment the current one is answered.
            const locked = pageQuestions
              .slice(0, index)
              .some((earlier) => !isAnswered(earlier, answers));

            return (
              <li
                key={question.id}
                inert={locked}
                className={cn(
                  'rounded-2xl border bg-card p-5 ring-1 ring-foreground/10 transition-[filter,opacity] duration-500 sm:p-6',
                  locked && 'opacity-40 blur-[3px]',
                )}
              >
                <p className="mb-4 text-xs font-medium text-muted-foreground">
                  {t('question_index', {
                    index: cineTestQuestions.indexOf(question) + 1,
                    total: CINE_TEST_TOTAL,
                  })}
                </p>
                {renderQuestion(question)}
              </li>
            );
          })}
        </ol>

        <div className="sticky bottom-0 mt-10 flex items-center justify-between gap-3 border-t bg-background/80 py-4 backdrop-blur">
          <Button
            variant="outline"
            onClick={() => {
              goToPage(PAGE_NAV[page].prev);
            }}
            disabled={page === 1}
          >
            {t('back')}
          </Button>
          <Button
            onClick={() => {
              goToPage(PAGE_NAV[page].next);
            }}
            disabled={!pageComplete}
          >
            {t('next')}
          </Button>
        </div>

        {pageComplete ? null : (
          <p className="mt-2 text-right text-xs text-muted-foreground">{t('incomplete_hint')}</p>
        )}
      </div>
    </Section>
  );
}
