'use client';

import {
  ArrowRightIcon,
  ClockIcon,
  CompassIcon,
  FilmIcon,
  SparklesIcon,
  UsersIcon,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Section } from '@/components/marketing/section';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from '@/libs/I18nNavigation';

export type CineTestCooldown = {
  active: boolean;
  nextAvailableAt?: number;
  lastResultId?: string;
};

// The four selling points, keyed to i18n. Literal keys keep t() finite.
const FEATURES = [
  { key: 'axes', Icon: CompassIcon },
  { key: 'personas', Icon: UsersIcon },
  { key: 'films', Icon: FilmIcon },
  { key: 'recs', Icon: SparklesIcon },
] as const;

// Marketing landing shown before the test runs: what CineTest is, how it works, and why
// it's worth five minutes — with the single "start" CTA. While the once-a-month cooldown
// is active the CTA is replaced by a notice that links back to the last result.
export function CineTestLanding(props: { onStart: () => void; cooldown: CineTestCooldown }) {
  const t = useTranslations('CineTestPage');
  const locale = useLocale();

  const nextDate = props.cooldown.nextAvailableAt
    ? new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(
        new Date(props.cooldown.nextAvailableAt),
      )
    : '';

  function startCta(size: 'lg' | 'default') {
    if (props.cooldown.active) {
      return (
        <div className="rounded-2xl border border-dashed bg-muted/40 p-5 text-left">
          <p className="flex items-center gap-2 text-sm font-medium">
            <ClockIcon className="size-4" />
            {t('cooldown_title')}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('cooldown_description', { date: nextDate })}
          </p>
          {props.cooldown.lastResultId ? (
            <Link
              href={`/dashboard/cinetest/result/${props.cooldown.lastResultId}`}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-4')}
            >
              {t('cooldown_view_last')}
              <ArrowRightIcon className="size-4" />
            </Link>
          ) : null}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Button size={size} onClick={props.onStart}>
          {t('start')}
          <ArrowRightIcon className="size-4" />
        </Button>
        <p className="text-xs text-muted-foreground">{t('intro_meta')}</p>
      </div>
    );
  }

  return (
    <Section className="py-12 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <header className="text-center">
          <Badge variant="outline" className="rounded-full">
            {t('intro_eyebrow')}
          </Badge>
          <h1 className="mt-5 font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {t('intro_title')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-muted-foreground sm:text-lg">
            {t('intro_description')}
          </p>
          <div className="mt-8 flex justify-center">{startCta('lg')}</div>
          <p className="mt-3 text-xs text-muted-foreground">{t('monthly_note')}</p>
        </header>

        <div className="mt-16">
          <h2 className="text-center font-heading text-2xl font-semibold tracking-tight">
            {t('intro_how_title')}
          </h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {[t('intro_step_1'), t('intro_step_2'), t('intro_step_3')].map((step, index) => (
              <li key={step} className="rounded-2xl border bg-card p-6 ring-1 ring-foreground/10">
                <span className="flex size-9 items-center justify-center rounded-full border font-heading text-sm font-semibold tabular-nums">
                  {index + 1}
                </span>
                <p className="mt-4 text-sm text-muted-foreground">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-16">
          <h2 className="text-center font-heading text-2xl font-semibold tracking-tight">
            {t('features_title')}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div
                key={feature.key}
                className="flex gap-4 rounded-2xl border bg-card p-6 ring-1 ring-foreground/10"
              >
                <feature.Icon className="size-5 shrink-0 text-muted-foreground" />
                <div>
                  <h3 className="text-sm font-semibold">{t(`feature_${feature.key}_title`)}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(`feature_${feature.key}_desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 rounded-3xl border bg-card p-8 text-center ring-1 ring-foreground/10 sm:p-12">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            {t('landing_cta_title')}
          </h2>
          <p className="mx-auto mt-3 max-w-prose text-pretty text-muted-foreground">
            {t('landing_cta_description')}
          </p>
          <div className="mt-7 flex justify-center">{startCta('default')}</div>
        </div>
      </div>
    </Section>
  );
}
