'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { LikertQuestion, LikertValue } from '@/types/CineTest';

// Five-point agree–disagree scale drawn as graduated dots: large, saturated poles that
// shrink and cool toward a neutral midpoint. Agree (green) sits left, disagree (violet)
// right; only the two poles are labelled so the row stays uncluttered. The value order
// is left-to-right, not by sign — scoring keys off the value, never the position.
const SCALE = [
  {
    value: 2,
    labelKey: 'scale_strongly_agree',
    size: 'size-9 sm:size-11',
    idle: 'border-emerald-500/60 hover:border-emerald-500 hover:bg-emerald-500/10',
    active: 'border-emerald-500 bg-emerald-500 ring-emerald-500/25',
  },
  {
    value: 1,
    labelKey: 'scale_agree',
    size: 'size-7 sm:size-9',
    idle: 'border-emerald-500/45 hover:border-emerald-500 hover:bg-emerald-500/10',
    active: 'border-emerald-500 bg-emerald-500 ring-emerald-500/25',
  },
  {
    value: 0,
    labelKey: 'scale_neutral',
    size: 'size-6 sm:size-7',
    idle: 'border-muted-foreground/40 hover:border-muted-foreground hover:bg-muted',
    active: 'border-muted-foreground bg-muted-foreground ring-muted-foreground/25',
  },
  {
    value: -1,
    labelKey: 'scale_disagree',
    size: 'size-7 sm:size-9',
    idle: 'border-violet-500/45 hover:border-violet-500 hover:bg-violet-500/10',
    active: 'border-violet-500 bg-violet-500 ring-violet-500/25',
  },
  {
    value: -2,
    labelKey: 'scale_strongly_disagree',
    size: 'size-9 sm:size-11',
    idle: 'border-violet-500/60 hover:border-violet-500 hover:bg-violet-500/10',
    active: 'border-violet-500 bg-violet-500 ring-violet-500/25',
  },
] as const satisfies readonly {
  value: LikertValue;
  labelKey: string;
  size: string;
  idle: string;
  active: string;
}[];

// Agree–disagree statement on a five-point scale.
export function QuestionLikert(props: {
  question: LikertQuestion;
  value: LikertValue | undefined;
  onValue: (value: LikertValue) => void;
}) {
  const t = useTranslations('CineTest');
  const tPage = useTranslations('CineTestPage');

  return (
    <fieldset className="space-y-6">
      <legend className="font-heading text-lg font-medium text-balance">
        {t(`${props.question.id}_text`)}
      </legend>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 text-xs font-medium sm:text-sm">
          <span className="text-emerald-600 dark:text-emerald-400">{tPage('scale_agree')}</span>
          <span className="text-violet-600 dark:text-violet-400">{tPage('scale_disagree')}</span>
        </div>
        <div className="flex items-center justify-between gap-1 px-1 sm:justify-center sm:gap-3">
          {SCALE.map((item) => {
            const active = props.value === item.value;

            return (
              <button
                key={item.value}
                type="button"
                aria-pressed={active}
                aria-label={tPage(item.labelKey)}
                title={tPage(item.labelKey)}
                onClick={() => {
                  props.onValue(item.value);
                }}
                className={cn(
                  'rounded-full border-2 transition-[background-color,border-color,box-shadow,transform] duration-200 active:scale-90',
                  item.size,
                  active
                    ? cn('ring-2 ring-offset-2 ring-offset-card', item.active)
                    : cn('bg-transparent', item.idle),
                )}
              />
            );
          })}
        </div>
      </div>
    </fieldset>
  );
}
