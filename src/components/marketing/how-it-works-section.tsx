import { ClipboardListIcon, CompassIcon, SparklesIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { RevealGroup, RevealItem } from '@/components/marketing/reveal';
import { Section, SectionHeading } from '@/components/marketing/section';

function Step(props: { index: number; icon: LucideIcon; title: string; description: string }) {
  const Icon = props.icon;
  return (
    <div className="group relative flex flex-col items-center text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border bg-card text-foreground shadow-sm ring-1 ring-foreground/10 transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-md">
        <Icon className="size-6" />
      </div>
      <span className="mt-4 text-xs font-medium text-muted-foreground">
        {String(props.index).padStart(2, '0')}
      </span>
      <h3 className="mt-1 font-heading text-lg font-medium">{props.title}</h3>
      <p className="mt-2 max-w-xs text-sm text-pretty text-muted-foreground">{props.description}</p>
    </div>
  );
}

export function HowItWorksSection() {
  const t = useTranslations('HowItWorks');

  const steps = [
    { icon: ClipboardListIcon, title: t('test_title'), description: t('test_description') },
    { icon: SparklesIcon, title: t('type_title'), description: t('type_description') },
    { icon: CompassIcon, title: t('match_title'), description: t('match_description') },
  ];

  return (
    <Section id="how-it-works">
      <SectionHeading badge={t('badge')} title={t('title')} subtitle={t('subtitle')} />
      <div className="relative mt-16">
        {/* Connecting line behind the steps on larger screens */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-7 -z-10 mx-auto hidden h-px max-w-2xl bg-border md:block"
        />
        <RevealGroup className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
          {steps.map((step, index) => (
            <RevealItem key={step.title}>
              <Step
                index={index + 1}
                icon={step.icon}
                title={step.title}
                description={step.description}
              />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </Section>
  );
}
