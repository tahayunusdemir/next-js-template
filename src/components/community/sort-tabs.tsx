'use client';

import { ClockIcon, FlameIcon, TrendingUpIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from '@/libs/I18nNavigation';
import { COMMUNITY_SORTS } from '@/types/Community';
import type { CommunitySort } from '@/types/Community';

const ICONS = { hot: FlameIcon, new: ClockIcon, top: TrendingUpIcon };

// Segmented control that drives the `?sort=` param (hot is the default, so it clears it)
// and resets pagination.
export function SortTabs(props: { sort: CommunitySort }) {
  const t = useTranslations('CommunityPage');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function select(value: CommunitySort) {
    const params = new URLSearchParams(searchParams);

    if (value === 'hot') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }

    params.delete('page');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-border p-0.5">
      {COMMUNITY_SORTS.map((value) => {
        const Icon = ICONS[value];
        const active = props.sort === value;

        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => {
              select(value);
            }}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors',
              active
                ? 'bg-muted font-medium text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-4" />
            {t(`sort_${value}`)}
          </button>
        );
      })}
    </div>
  );
}
