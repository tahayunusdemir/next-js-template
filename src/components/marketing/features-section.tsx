import {
  BarChart3Icon,
  BookmarkIcon,
  FilmIcon,
  MessageCircleIcon,
  SparklesIcon,
  UsersIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { RevealGroup, RevealItem } from '@/components/marketing/reveal';
import { Section, SectionHeading } from '@/components/marketing/section';
import { cn } from '@/lib/utils';

// Mini node diagram shown in the "CineTest" feature tile, evoking the test flow.
function TestFlowVisual() {
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

// Mini bar chart shown in the "taste profile" feature tile.
function TasteBarsVisual() {
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
        'group flex h-full flex-col rounded-xl border bg-card p-6 ring-1 ring-foreground/10 transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lg',
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
      <RevealGroup className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <RevealItem className="lg:col-span-2">
          <FeatureCard
            icon={SparklesIcon}
            title={t('cinetest_title')}
            description={t('cinetest_description')}
          >
            <TestFlowVisual />
          </FeatureCard>
        </RevealItem>
        <RevealItem>
          <FeatureCard
            icon={FilmIcon}
            title={t('recommendations_title')}
            description={t('recommendations_description')}
          />
        </RevealItem>
        <RevealItem>
          <FeatureCard
            icon={UsersIcon}
            title={t('matching_title')}
            description={t('matching_description')}
          />
        </RevealItem>
        <RevealItem>
          <FeatureCard
            icon={MessageCircleIcon}
            title={t('community_title')}
            description={t('community_description')}
          />
        </RevealItem>
        <RevealItem>
          <FeatureCard
            icon={BookmarkIcon}
            title={t('tracking_title')}
            description={t('tracking_description')}
          />
        </RevealItem>
        <RevealItem className="lg:col-span-2">
          <FeatureCard
            icon={BarChart3Icon}
            title={t('profile_title')}
            description={t('profile_description')}
          >
            <TasteBarsVisual />
          </FeatureCard>
        </RevealItem>
      </RevealGroup>
    </Section>
  );
}
