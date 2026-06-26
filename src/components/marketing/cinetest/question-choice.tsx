'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { ChoiceOptionKey, ChoiceQuestion } from '@/types/CineTest';

// Pick one of four stances in a film-watching scenario.
export function QuestionChoice(props: {
  question: ChoiceQuestion;
  value: ChoiceOptionKey | undefined;
  onValue: (value: ChoiceOptionKey) => void;
}) {
  const t = useTranslations('CineTest');

  return (
    <fieldset className="space-y-5">
      <legend className="font-heading text-lg font-medium text-balance">
        {t(`${props.question.id}_text`)}
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {props.question.options.map((option) => {
          const active = props.value === option.key;

          return (
            <button
              key={option.key}
              type="button"
              aria-pressed={active}
              onClick={() => {
                props.onValue(option.key);
              }}
              className={cn(
                'rounded-2xl border p-5 text-left text-sm ring-1 ring-foreground/5 transition-colors',
                active ? 'border-primary bg-primary/10' : 'hover:bg-muted',
              )}
            >
              {t(`${props.question.id}_${option.key}`)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
