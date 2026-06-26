'use client';

import { useTranslations } from 'next-intl';
import type { MatchAxisView } from '@/types/CineMatch';

// The four-axis anatomy breakdown shared by the match card and the detail page: each row
// shows the disposition axis, both viewers' pole, and the gap (Δ) — smaller is closer.
export function MatchAxes(props: { axes: MatchAxisView[] }) {
  const t = useTranslations('CineMatch');

  return (
    <dl className="grid grid-cols-2 gap-2.5">
      {props.axes.map((axis) => (
        <div key={axis.axis} className="rounded-lg bg-muted/40 p-3">
          <div className="flex items-center justify-between gap-2">
            <dt className="truncate text-xs font-medium text-muted-foreground">
              {t(`axis_${axis.axis}`)}
            </dt>
            <span className="shrink-0 text-xs font-semibold tabular-nums">
              {t('delta', { value: axis.delta })}
            </span>
          </div>
          <dd className="mt-1.5 flex items-center gap-1.5 text-sm">
            <span className="font-medium">{t(`pole_${axis.minePole}`)}</span>
            <span aria-hidden className="text-muted-foreground">
              /
            </span>
            <span className="text-muted-foreground">{t(`pole_${axis.theirPole}`)}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
