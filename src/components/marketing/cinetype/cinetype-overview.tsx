import { useTranslations } from 'next-intl';
import { cineAspects } from '@/data/cinetype';
import type { CineType } from '@/types/CineType';

// Per-type breakdown across the four aspects, shown for every type (full or not).
export function CineOverview(props: { type: CineType }) {
  const t = useTranslations('CineType');
  const tDetail = useTranslations('CineTypeDetailPage');

  return (
    <section>
      <h2 className="font-heading text-2xl font-semibold tracking-tight">
        {tDetail('overview_title')}
      </h2>
      <p className="mt-2 text-base text-pretty text-muted-foreground">
        {t(`role_${props.type.roleSlug}_description`)}
      </p>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        {cineAspects.map((aspect) => {
          const letter = props.type.letters[aspect.kind];

          return (
            <div
              key={aspect.kind}
              className="flex gap-4 rounded-xl border bg-card p-4 ring-1 ring-foreground/5"
            >
              <dt className="flex size-11 shrink-0 items-center justify-center rounded-lg border font-heading text-lg font-semibold">
                {letter}
              </dt>
              <dd>
                <p className="text-xs text-muted-foreground">{t(`aspect_${aspect.kind}_name`)}</p>
                <p className="font-medium">{t(`pole_${letter}_name`)}</p>
                <p className="mt-0.5 text-sm text-pretty text-muted-foreground">
                  {t(`pole_${letter}_summary`)}
                </p>
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
