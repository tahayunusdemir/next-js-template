import { useTranslations } from 'next-intl';
import { Section, SectionHeading } from '@/components/marketing/section';

// The three-step flow (join → request → both opt in) plus the three guarantees that frame
// the matcher: the 90% bar, mutual consent, and free early access.
export function CineMatchSteps() {
  const t = useTranslations('CineMatchPage');

  const steps = [
    { kicker: t('step1_kicker'), title: t('step1_title'), body: t('step1_body') },
    { kicker: t('step2_kicker'), title: t('step2_title'), body: t('step2_body') },
    { kicker: t('step3_kicker'), title: t('step3_title'), body: t('step3_body') },
  ];

  const features = [
    { title: t('feature1_title'), body: t('feature1_body') },
    { title: t('feature2_title'), body: t('feature2_body') },
    { title: t('feature3_title'), body: t('feature3_body') },
  ];

  return (
    <Section id="how-it-works">
      <SectionHeading
        badge={t('steps_badge')}
        title={t('steps_title')}
        subtitle={t('steps_subtitle')}
      />

      <ol className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">
        {steps.map((step) => (
          <li
            key={step.kicker}
            className="rounded-2xl border bg-card p-6 ring-1 ring-foreground/10"
          >
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {step.kicker}
            </span>
            <h3 className="mt-3 font-heading text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>

      <div className="mx-auto mt-4 grid max-w-5xl gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-2xl border border-dashed p-6">
            <h3 className="font-medium">{feature.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{feature.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
