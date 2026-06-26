'use client';

import { useTranslations } from 'next-intl';
import { Progress } from '@/components/ui/progress';
import { CINE_TEST_PAGES } from '@/data/cinetest-questions';
import { cn } from '@/lib/utils';

// Completion indicator: a slim sticky bar on narrow screens, and a card pinned to the
// right edge that floats alongside the question column on wide screens.
export function CineTestProgress(props: { answered: number; total: number; step: number }) {
  const t = useTranslations('CineTestPage');
  const pct = Math.round((props.answered / props.total) * 100);

  const segments = (
    <div className="flex gap-1.5" aria-hidden>
      {CINE_TEST_PAGES.map((page) => (
        <span
          key={page}
          className={cn('h-1 flex-1 rounded-full', page <= props.step ? 'bg-primary' : 'bg-muted')}
        />
      ))}
    </div>
  );

  return (
    <>
      <div className="sticky top-16 z-30 -mx-4 border-b bg-background/80 px-4 py-3 backdrop-blur sm:top-20 lg:hidden">
        <div className="mx-auto flex max-w-2xl flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{t('progress_label', { current: props.answered, total: props.total })}</span>
            <span>{t('step_label', { step: props.step, total: CINE_TEST_PAGES.length })}</span>
          </div>
          <Progress
            value={pct}
            aria-label={t('progress_label', { current: props.answered, total: props.total })}
          />
          {segments}
        </div>
      </div>

      <aside className="fixed top-1/2 right-6 z-30 hidden w-44 -translate-y-1/2 lg:block">
        <div className="flex flex-col gap-3 rounded-2xl border bg-card/90 p-4 shadow-sm ring-1 ring-foreground/10 backdrop-blur">
          <div>
            <p className="text-2xl font-semibold tracking-tight tabular-nums">
              {props.answered}
              <span className="text-base font-normal text-muted-foreground">/{props.total}</span>
            </p>
            <p className="text-xs text-muted-foreground">{t('progress_answered_label')}</p>
          </div>
          <Progress
            value={pct}
            aria-label={t('progress_label', { current: props.answered, total: props.total })}
          />
          {segments}
          <p className="text-xs font-medium text-muted-foreground">
            {t('step_label', { step: props.step, total: CINE_TEST_PAGES.length })}
          </p>
        </div>
      </aside>
    </>
  );
}
