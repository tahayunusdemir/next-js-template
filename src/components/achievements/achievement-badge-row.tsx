'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AchievementMedal, AchievementView } from '@/types/Achievements';

// Each medal rung gets a subtle text accent so the ladder reads at a glance while staying
// close to the app's mostly monochrome surface.
const MEDAL_TEXT: Record<AchievementMedal, string> = {
  bronze: 'text-amber-700 dark:text-amber-500',
  silver: 'text-zinc-500 dark:text-zinc-300',
  gold: 'text-yellow-700 dark:text-yellow-500',
  legendary: 'text-violet-600 dark:text-violet-400',
  mythic: 'text-fuchsia-600 dark:text-fuchsia-400',
  secret: 'text-indigo-600 dark:text-indigo-400',
  super_legendary: 'text-emerald-600 dark:text-emerald-400',
};

// One badge row: name, medal + requirement line, and its state (unlocked, in-progress bar, or
// a "coming soon" note when the metric has no data source yet). Secret badges stay nameless
// until they unlock.
export function AchievementBadgeRow(props: { badge: AchievementView; secret: boolean }) {
  const t = useTranslations('DashboardAchievementsPage');
  const hidden = props.secret && !props.badge.unlocked;
  const name = hidden ? t('secret_locked_name') : t(`${props.badge.id}_name`);
  const pct = Math.min(100, Math.round((props.badge.value / props.badge.threshold) * 100));
  const showProgress = props.badge.live && !props.badge.unlocked && props.badge.value > 0;

  return (
    <li
      className={cn(
        'flex flex-col gap-1.5 rounded-lg p-3 ring-1 ring-foreground/5',
        props.badge.unlocked ? 'bg-muted/40' : 'bg-transparent',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={cn('text-sm font-medium', hidden && 'text-muted-foreground')}>{name}</span>
        {props.badge.unlocked ? (
          <Badge variant="secondary" className="shrink-0">
            {t('unlocked')}
          </Badge>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">
        <span className={cn('font-medium', MEDAL_TEXT[props.badge.medal])}>
          {t(`medal_${props.badge.medal}`)}
        </span>
        {' · '}
        {t(props.badge.reqKind, { count: props.badge.threshold })}
      </p>

      {props.badge.live ? null : (
        <p className="text-xs text-muted-foreground/70">{t('coming_soon')}</p>
      )}

      {showProgress ? (
        <div className="mt-0.5 flex items-center gap-2">
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
          <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
            {props.badge.value} / {props.badge.threshold}
          </span>
        </div>
      ) : null}
    </li>
  );
}
