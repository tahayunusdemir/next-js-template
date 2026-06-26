'use client';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link, usePathname } from '@/libs/I18nNavigation';

type FeedPaginationProps = {
  page: number;
  totalPages: number;
};

// Builds a windowed page list: 1 … around current … last (with -1 marking ellipsis gaps).
function pageWindow(page: number, total: number) {
  const pages = new Set([1, total, page, page - 1, page + 1]);
  const sorted = [...pages]
    .filter((value) => value >= 1 && value <= total)
    .toSorted((a, b) => a - b);

  const result: number[] = [];
  let previous = 0;
  for (const value of sorted) {
    if (value - previous > 1) {
      result.push(-1);
    }
    result.push(value);
    previous = value;
  }

  return result;
}

export function FeedPagination(props: FeedPaginationProps) {
  const t = useTranslations('CommunityPage');
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (props.totalPages <= 1) {
    return null;
  }

  function hrefFor(page: number) {
    const params = new URLSearchParams(searchParams);

    if (page <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }

    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  const hasPrevious = props.page > 1;
  const hasNext = props.page < props.totalPages;

  return (
    <nav aria-label={t('pagination_label')} className="flex items-center justify-center gap-1">
      {hasPrevious ? (
        <Link
          href={hrefFor(props.page - 1)}
          aria-label={t('previous')}
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
        >
          <ChevronLeftIcon className="size-4" />
        </Link>
      ) : (
        <span
          aria-hidden
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'icon' }),
            'pointer-events-none opacity-40',
          )}
        >
          <ChevronLeftIcon className="size-4" />
        </span>
      )}

      {pageWindow(props.page, props.totalPages).map((value, index) =>
        value === -1 ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: ellipsis markers have no stable id
          <span key={`gap-${index}`} className="px-2 text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={value}
            href={hrefFor(value)}
            aria-current={value === props.page ? 'page' : undefined}
            className={cn(
              buttonVariants({ variant: value === props.page ? 'outline' : 'ghost', size: 'icon' }),
            )}
          >
            {value}
          </Link>
        ),
      )}

      {hasNext ? (
        <Link
          href={hrefFor(props.page + 1)}
          aria-label={t('next')}
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
        >
          <ChevronRightIcon className="size-4" />
        </Link>
      ) : (
        <span
          aria-hidden
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'icon' }),
            'pointer-events-none opacity-40',
          )}
        >
          <ChevronRightIcon className="size-4" />
        </span>
      )}
    </nav>
  );
}
