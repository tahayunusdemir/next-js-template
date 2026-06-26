import { useTranslations } from 'next-intl';
import { cineSectionKeys } from '@/data/cinetype';
import type { CineTypeSlug } from '@/types/CineType';

// Long-form narrative sections for a type.
export function CineSections(props: { slug: CineTypeSlug }) {
  const t = useTranslations('CineType');

  return (
    <div className="space-y-10">
      {cineSectionKeys.map((key) => (
        <section key={key}>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            {t(`section_${key}_title`)}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-pretty text-muted-foreground">
            {t(`${props.slug}_${key}`)}
          </p>
        </section>
      ))}
    </div>
  );
}
