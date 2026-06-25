import {
  BarChart3Icon,
  PlugIcon,
  ShieldCheckIcon,
  UsersIcon,
  WorkflowIcon,
  ZapIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Section, SectionHeading } from '@/components/marketing/section';
import { cn } from '@/lib/utils';

// Mini node diagram shown in the "workflows" feature tile.
function WorkflowVisual() {
  return (
    <div
      aria-hidden
      className="mt-6 flex flex-1 items-center justify-center gap-2 rounded-lg border bg-background/60 p-4"
    >
      {['', '', ''].map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-8 w-16 rounded-md border bg-card shadow-sm" />
          {i < 2 ? <div className="h-px w-4 bg-border" /> : null}
        </div>
      ))}
    </div>
  );
}

// Mini bar chart shown in the "automation" feature tile.
function AutomationVisual() {
  return (
    <div
      aria-hidden
      className="mt-6 flex flex-1 items-end gap-1.5 rounded-lg border bg-background/60 p-4"
    >
      {[35, 55, 45, 70, 60, 85, 75].map((h, i) => (
        <div key={i} style={{ height: `${h}%` }} className="flex-1 rounded-t-sm bg-foreground/70" />
      ))}
    </div>
  );
}

function FeatureCard(props: {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const Icon = props.icon;
  return (
    <div
      className={cn(
        'group flex flex-col rounded-xl border bg-card p-6 ring-1 ring-foreground/10 transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lg',
        props.className,
      )}
    >
      <div className="mb-4 flex size-10 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors group-hover:border-foreground/20 group-hover:text-foreground">
        <Icon className="size-5" />
      </div>
      <h3 className="font-heading text-base font-medium">{props.title}</h3>
      <p className="mt-2 max-w-md text-sm text-pretty text-muted-foreground">{props.description}</p>
      {props.children}
    </div>
  );
}

export function FeaturesSection() {
  const t = useTranslations('Features');

  return (
    <Section id="features">
      <SectionHeading badge={t('badge')} title={t('title')} subtitle={t('subtitle')} />
      <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <FeatureCard
          icon={WorkflowIcon}
          title={t('workflows_title')}
          description={t('workflows_description')}
          className="lg:col-span-2"
        >
          <WorkflowVisual />
        </FeatureCard>
        <FeatureCard
          icon={BarChart3Icon}
          title={t('analytics_title')}
          description={t('analytics_description')}
        />
        <FeatureCard
          icon={UsersIcon}
          title={t('collaboration_title')}
          description={t('collaboration_description')}
        />
        <FeatureCard
          icon={ShieldCheckIcon}
          title={t('security_title')}
          description={t('security_description')}
        />
        <FeatureCard
          icon={PlugIcon}
          title={t('integrations_title')}
          description={t('integrations_description')}
        />
        <FeatureCard
          icon={ZapIcon}
          title={t('automation_title')}
          description={t('automation_description')}
          className="lg:col-span-2"
        >
          <AutomationVisual />
        </FeatureCard>
      </div>
    </Section>
  );
}
