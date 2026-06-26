import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Link } from '@/libs/I18nNavigation';
import type { CineType } from '@/types/CineType';

const linkClassName =
  'flex flex-col gap-1 rounded-2xl border bg-card p-5 ring-1 ring-foreground/10 transition-colors hover:bg-muted';

// Previous / next links between types in directory order.
export function CineTypeNav(props: { prev: CineType; next: CineType }) {
  const t = useTranslations('CineType');
  const tDetail = useTranslations('CineTypeDetailPage');

  return (
    <nav className="grid gap-4 sm:grid-cols-2">
      <Link href={`/cinetype/${props.prev.slug}`} className={linkClassName}>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <ArrowLeftIcon className="size-3.5" />
          {tDetail('prev_label')}
        </span>
        <span className="font-heading text-lg font-medium">{t(`${props.prev.slug}_name`)}</span>
      </Link>
      <Link
        href={`/cinetype/${props.next.slug}`}
        className={cn(linkClassName, 'sm:items-end sm:text-right')}
      >
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          {tDetail('next_label')}
          <ArrowRightIcon className="size-3.5" />
        </span>
        <span className="font-heading text-lg font-medium">{t(`${props.next.slug}_name`)}</span>
      </Link>
    </nav>
  );
}
