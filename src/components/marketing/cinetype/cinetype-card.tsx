import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/libs/I18nNavigation';
import type { CineType } from '@/types/CineType';
import { CineLetterChips } from './cinetype-letter-chips';

// Summary card for a single personality type; links to its detail page.
export function CineTypeCard(props: { type: CineType }) {
  const t = useTranslations('CineType');

  return (
    <Link
      href={`/cinetype/${props.type.slug}`}
      className="group flex flex-col rounded-2xl border bg-card p-6 ring-1 ring-foreground/10 transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-heading text-2xl font-semibold tracking-tight">
          {props.type.code}
        </span>
        <Badge variant="outline" className="font-normal">
          {t(`role_${props.type.roleSlug}_name`)}
        </Badge>
      </div>
      <h3 className="mt-3 font-heading text-lg font-medium">{t(`${props.type.slug}_name`)}</h3>
      <p className="mt-1 flex-1 text-sm text-pretty text-muted-foreground">
        {t(`${props.type.slug}_tagline`)}
      </p>
      <CineLetterChips type={props.type} className="mt-5" />
    </Link>
  );
}
