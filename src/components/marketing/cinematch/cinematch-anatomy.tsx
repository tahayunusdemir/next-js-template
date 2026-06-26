import { CheckIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Section, SectionHeading } from '@/components/marketing/section';
import { MatchAxes } from '@/components/matches/match-axes';
import { Badge } from '@/components/ui/badge';
import type { MatchAxisView } from '@/types/CineMatch';

// A worked example of a 93% pairing, reusing the real match-axes breakdown so the marketing
// card and the dashboard render identically.
const DEMO_AXES: MatchAxisView[] = [
  { axis: 'gaze', minePole: 'C', theirPole: 'C', delta: 3 },
  { axis: 'eye', minePole: 'R', theirPole: 'R', delta: 5 },
  { axis: 'pulse', minePole: 'M', theirPole: 'M', delta: 4 },
  { axis: 'compass', minePole: 'F', theirPole: 'F', delta: 4 },
];

const DEMO_SHARED = 37;

export function CineMatchAnatomy() {
  const t = useTranslations('CineMatchPage');
  const tc = useTranslations('CineMatch');

  const points = [t('anatomy_point_1'), t('anatomy_point_2'), t('anatomy_point_3')];

  const stats = [
    { value: t('stat_threshold_value'), label: t('stat_threshold_label') },
    { value: t('stat_requests_value'), label: t('stat_requests_label') },
    { value: t('stat_axes_value'), label: t('stat_axes_label') },
    { value: t('stat_horizon_value'), label: t('stat_horizon_label') },
  ];

  return (
    <Section id="anatomy">
      <SectionHeading
        badge={t('anatomy_badge')}
        title={t('anatomy_title')}
        subtitle={t('anatomy_subtitle')}
      />

      <div className="mx-auto mt-12 grid max-w-5xl items-center gap-8 lg:grid-cols-2">
        <ul className="space-y-3">
          {points.map((point) => (
            <li key={point} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckIcon className="mt-0.5 size-4 shrink-0 text-foreground" />
              {point}
            </li>
          ))}
        </ul>

        <div className="rounded-2xl border bg-card p-5 ring-1 ring-foreground/10">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-medium">{t('demo_you')}</p>
              <p className="truncate text-xs text-muted-foreground">{t('demo_you_meta')}</p>
            </div>
            <div className="shrink-0 text-center">
              <div className="text-3xl leading-none font-semibold tabular-nums">
                {t('demo_score')}
              </div>
              <Badge variant="secondary" className="mt-1.5">
                {tc('above_threshold')}
              </Badge>
            </div>
            <div className="min-w-0 text-right">
              <p className="truncate font-medium">{t('demo_them_name')}</p>
              <p className="truncate text-xs text-muted-foreground">{t('demo_them_meta')}</p>
            </div>
          </div>

          <div className="mt-5">
            <MatchAxes axes={DEMO_AXES} />
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            {tc('shared_watched', { count: DEMO_SHARED })}
          </p>
        </div>
      </div>

      <dl className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <dt className="font-heading text-3xl font-semibold sm:text-4xl">{stat.value}</dt>
            <dd className="mt-1 text-xs tracking-wide text-muted-foreground uppercase">
              {stat.label}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
