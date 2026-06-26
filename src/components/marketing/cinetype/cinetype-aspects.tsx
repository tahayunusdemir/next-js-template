import { useTranslations } from 'next-intl';
import { Section, SectionHeading } from '@/components/marketing/section';
import { cineAspects } from '@/data/cinetype';

// Educational strip explaining the four aspects and their two poles each.
export function CineAspects() {
  const tPage = useTranslations('CineTypePage');
  const t = useTranslations('CineType');

  return (
    <Section id="aspects" className="bg-muted/30">
      <SectionHeading title={tPage('aspects_title')} subtitle={tPage('aspects_subtitle')} />

      <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2">
        {cineAspects.map((aspect) => (
          <div
            key={aspect.kind}
            className="rounded-2xl border bg-card p-6 ring-1 ring-foreground/10"
          >
            <h3 className="font-heading text-lg font-medium">{t(`aspect_${aspect.kind}_name`)}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(`aspect_${aspect.kind}_description`)}
            </p>
            <dl className="mt-5 space-y-4">
              {aspect.poles.map((pole) => (
                <div key={pole.letter} className="flex gap-3">
                  <dt className="flex size-8 shrink-0 items-center justify-center rounded-lg border font-heading text-sm font-semibold">
                    {pole.letter}
                  </dt>
                  <dd>
                    <p className="text-sm font-medium">{t(`pole_${pole.letter}_name`)}</p>
                    <p className="text-sm text-pretty text-muted-foreground">
                      {t(`pole_${pole.letter}_summary`)}
                    </p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </Section>
  );
}
