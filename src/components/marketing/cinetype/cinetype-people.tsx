import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { cinePersonPositions } from '@/data/cinetype';
import type { CineTypeSlug } from '@/types/CineType';

// "<Type>s you may know" — famous people chips.
export function CinePeople(props: { slug: CineTypeSlug }) {
  const t = useTranslations('CineType');
  const tDetail = useTranslations('CineTypeDetailPage');
  const name = t(`${props.slug}_name`);

  return (
    <section>
      <h2 className="font-heading text-2xl font-semibold tracking-tight">
        {tDetail('people_title', { name })}
      </h2>
      <ul className="mt-4 flex flex-wrap gap-2">
        {cinePersonPositions.map((position) => (
          <li key={position}>
            <Badge variant="secondary" className="text-sm font-normal">
              {t(`${props.slug}_person_${position}`)}
            </Badge>
          </li>
        ))}
      </ul>
    </section>
  );
}
