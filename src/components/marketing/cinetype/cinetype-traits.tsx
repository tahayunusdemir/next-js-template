import { useTranslations } from 'next-intl';
import { cineTraitPositions } from '@/data/cinetype';
import type { CineTypeSlug } from '@/types/CineType';

// Strengths and weaknesses, rendered as two parallel lists.
export function CineTraits(props: { slug: CineTypeSlug }) {
  const t = useTranslations('CineType');
  const tDetail = useTranslations('CineTypeDetailPage');

  const columns = [
    { kind: 'strength', title: tDetail('traits_strengths_title') },
    { kind: 'weakness', title: tDetail('traits_weaknesses_title') },
  ] as const;

  return (
    <section>
      <h2 className="font-heading text-2xl font-semibold tracking-tight">
        {tDetail('traits_title')}
      </h2>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        {columns.map((column) => (
          <div key={column.kind}>
            <h3 className="font-heading text-lg font-medium">{column.title}</h3>
            <ul className="mt-4 space-y-4">
              {cineTraitPositions.map((position) => (
                <li key={position}>
                  <p className="font-medium">
                    {t(`${props.slug}_${column.kind}_${position}_title`)}
                  </p>
                  <p className="mt-0.5 text-sm text-pretty text-muted-foreground">
                    {t(`${props.slug}_${column.kind}_${position}_description`)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
