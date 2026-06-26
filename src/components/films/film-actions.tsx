'use client';

import { ClockIcon, EyeIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { toast } from 'sonner';
import { setFilmStatus } from '@/app/[locale]/(marketing)/films/actions';
import { cn } from '@/lib/utils';
import type { FilmStatus } from '@/libs/Films';

type FilmActionsProps = {
  movieId: number;
  status: FilmStatus;
  // Controlled: the parent owns `status` so the poster ring and counts stay in sync.
  onStatusChange: (status: FilmStatus) => void;
  // 'overlay' = compact icon buttons on a poster; 'detail' = labelled buttons.
  variant?: 'overlay' | 'detail';
};

// Watched = green, watchlist = blue — the only two semantic accents in the monochrome UI.
const FIELDS = [
  {
    field: 'watched' as const,
    Icon: EyeIcon,
    active: 'text-green-500 hover:text-green-400',
  },
  {
    field: 'watchlist' as const,
    Icon: ClockIcon,
    active: 'text-sky-500 hover:text-sky-400',
  },
];

export function FilmActions(props: FilmActionsProps) {
  const t = useTranslations('Films');
  const [pending, startTransition] = React.useTransition();
  const variant = props.variant ?? 'overlay';

  function toggle(field: keyof FilmStatus) {
    const previous = props.status;
    const next = { ...previous, [field]: !previous[field] };

    props.onStatusChange(next);

    startTransition(async () => {
      const result = await setFilmStatus({ movieId: props.movieId, field, value: next[field] });

      if (!result.ok) {
        props.onStatusChange(previous);
        toast.error(result.reason === 'auth' ? t('sign_in_required') : t('action_error'));
      }
    });
  }

  return (
    <div className={cn('flex items-center', variant === 'overlay' ? 'gap-1' : 'gap-2')}>
      {FIELDS.map(({ field, Icon, active }) => {
        const isActive = props.status[field];

        return (
          <button
            key={field}
            type="button"
            disabled={pending}
            aria-pressed={isActive}
            aria-label={t(`${field}_toggle`)}
            onClick={() => {
              toggle(field);
            }}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-md transition-colors disabled:opacity-60',
              variant === 'overlay'
                ? 'size-8 bg-background/80 backdrop-blur-sm hover:bg-background'
                : 'h-9 border border-border px-3 text-sm hover:bg-muted',
              isActive ? active : 'text-foreground/80 hover:text-foreground',
            )}
          >
            <Icon className={cn('size-4', isActive && 'fill-current')} />
            {variant === 'detail' ? <span>{t(field)}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
