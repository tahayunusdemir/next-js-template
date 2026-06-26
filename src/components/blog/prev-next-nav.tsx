import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ResolvedPost } from '@/libs/Blog';
import { Link } from '@/libs/I18nNavigation';

// Previous/next article links shown at the foot of a post. Order follows the listing
// (newest first), so "previous" is the newer neighbour. Mirrors chanhdai.com's
// findNeighbour-driven footer navigation.
export function PrevNextNav(props: { previous: ResolvedPost | null; next: ResolvedPost | null }) {
  const t = useTranslations('Blog');

  if (!props.previous && !props.next) {
    return null;
  }

  return (
    <nav className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-6">
      {props.previous ? (
        <Link
          href={`/blog/${props.previous.slug}`}
          className="group flex flex-col gap-1 rounded-xl border p-4 transition-colors hover:bg-muted/50"
        >
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowLeftIcon aria-hidden className="size-3" />
            {t('prev_post')}
          </span>
          <span className="line-clamp-1 font-medium tracking-tight group-hover:underline">
            {props.previous.title}
          </span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}

      {props.next ? (
        <Link
          href={`/blog/${props.next.slug}`}
          className="group flex flex-col items-end gap-1 rounded-xl border p-4 text-right transition-colors hover:bg-muted/50"
        >
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            {t('next_post')}
            <ArrowRightIcon aria-hidden className="size-3" />
          </span>
          <span className="line-clamp-1 font-medium tracking-tight group-hover:underline">
            {props.next.title}
          </span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}
    </nav>
  );
}
