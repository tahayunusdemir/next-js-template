'use client';

import { CheckCircle2Icon, CircleIcon, SparklesIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { toast } from 'sonner';
import {
  joinPoolAction,
  leavePoolAction,
  requestMatchAction,
} from '@/app/[locale]/(auth)/dashboard/matches/actions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link, useRouter } from '@/libs/I18nNavigation';
import type { PoolStatus } from '@/types/CineMatch';
import { formatRelativeTime } from '@/utils/Time';

function formatDate(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
}

// One eligibility step: a struck-through done state or a CTA linking to the missing step.
function GateStep(props: { done: boolean; label: string; href: string; cta: string }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-sm">
        {props.done ? (
          <CheckCircle2Icon className="size-4 text-green-600" />
        ) : (
          <CircleIcon className="size-4 text-muted-foreground" />
        )}
        <span className={cn(props.done && 'text-muted-foreground line-through')}>
          {props.label}
        </span>
      </span>
      {props.done ? null : (
        <Button size="sm" variant="outline" render={<Link href={props.href} />}>
          {props.cta}
        </Button>
      )}
    </li>
  );
}

// The pool status card: gates entry on CineTest + watched films, then exposes join/leave and
// the weekly request budget with any in-flight searches and their fallback deadline.
export function PoolStatusCard(props: { status: PoolStatus; locale: string }) {
  const t = useTranslations('DashboardMatchesPage');
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const { status, locale } = props;

  async function join() {
    setPending(true);
    const result = await joinPoolAction();
    setPending(false);

    if (result.ok) {
      toast.success(t('joined_pool'));
      router.refresh();
    } else if (result.reason === 'not_eligible') {
      toast.error(t('join_blocked'));
    } else {
      toast.error(t('action_error'));
    }
  }

  async function leave() {
    setPending(true);
    await leavePoolAction();
    setPending(false);
    toast(t('left_pool'));
    router.refresh();
  }

  async function request() {
    setPending(true);
    const result = await requestMatchAction();
    setPending(false);

    if (!result.ok) {
      if (result.reason === 'not_eligible') {
        toast.error(t('request_not_eligible'));
      } else if (result.reason === 'not_in_pool') {
        toast.error(t('request_not_in_pool'));
      } else if (result.reason === 'no_requests_left') {
        toast.error(t('request_no_requests_left'));
      } else {
        toast.error(t('action_error'));
      }

      return;
    }

    if (result.matched) {
      toast.success(t('request_matched'));
    } else {
      toast(t('request_searching'));
    }

    router.refresh();
  }

  if (!status.eligibility.isEligible) {
    const watchedDone = status.eligibility.watchedCount >= status.eligibility.minWatched;

    return (
      <section className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <h2 className="font-medium">{t('gate_title')}</h2>
        <ul className="mt-4 space-y-3">
          <GateStep
            done={status.eligibility.hasCineType}
            label={
              status.eligibility.hasCineType ? t('gate_cinetest_done') : t('gate_cinetest_todo')
            }
            href="/dashboard/cinetest"
            cta={t('take_cinetest')}
          />
          <GateStep
            done={watchedDone}
            label={
              watchedDone
                ? t('gate_watched_done', { count: status.eligibility.watchedCount })
                : t('gate_watched_progress', {
                    count: status.eligibility.watchedCount,
                    min: status.eligibility.minWatched,
                  })
            }
            href="/dashboard/films"
            cta={t('browse_films')}
          />
        </ul>
      </section>
    );
  }

  const soonestFallback = status.activeSearches.at(-1)?.expiresAt;

  return (
    <section className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'size-2 rounded-full',
                status.isInPool ? 'bg-green-600' : 'bg-muted-foreground',
              )}
            />
            <h2 className="font-medium">
              {status.isInPool ? t('pool_status_in') : t('pool_status_out')}
            </h2>
          </div>
          {status.isInPool && status.joinedAt ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {t('pool_joined', { date: formatDate(status.joinedAt, locale) })}
              {status.refreshedAt
                ? ` · ${t('pool_refreshed', { date: formatDate(status.refreshedAt, locale) })}`
                : ''}
            </p>
          ) : (
            <p className="mt-1 max-w-prose text-xs text-muted-foreground">{t('pool_out_note')}</p>
          )}
        </div>
        <div className="text-sm font-medium tabular-nums">
          {t('pool_requests_left', { left: status.requestsLeft, total: status.requestsTotal })}
        </div>
      </div>

      {status.isInPool ? (
        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          <p>{t('pool_window_note', { days: status.windowDays })}</p>
          {status.activeSearches.length > 0 ? (
            <p>
              {t('pool_searching', { count: status.activeSearches.length })}
              {soonestFallback
                ? ` · ${t('pool_fallback_at', { time: formatRelativeTime(soonestFallback, locale) })}`
                : ''}
            </p>
          ) : (
            <p>{t('pool_no_requests_spent')}</p>
          )}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {status.isInPool ? (
          <>
            <Button disabled={pending || status.requestsLeft <= 0} onClick={() => void request()}>
              <SparklesIcon />
              {pending ? t('working') : t('request_match')}
            </Button>
            <Button variant="ghost" disabled={pending} onClick={() => void leave()}>
              {t('leave_pool')}
            </Button>
          </>
        ) : (
          <Button disabled={pending} onClick={() => void join()}>
            {t('join_pool')}
          </Button>
        )}
      </div>
    </section>
  );
}
