import { Reveal } from '@/components/marketing/reveal';
import { Badge } from '@/components/ui/badge';
import { DashedLine } from '@/components/ui/dashed-line';
import { cn } from '@/lib/utils';

// Consistent vertical rhythm, max-width and dashed divider for marketing sections.
export function Section(props: {
  id?: string;
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={props.id} className={cn('relative scroll-mt-24 py-20 sm:py-28', props.className)}>
      <div
        className={cn('mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8', props.containerClassName)}
      >
        {props.children}
      </div>
      <DashedLine className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8" />
    </section>
  );
}

// Centered badge + title + subtitle block shared across sections.
export function SectionHeading(props: {
  badge?: string;
  title: React.ReactNode;
  subtitle?: string;
  className?: string;
}) {
  return (
    <Reveal className={cn('mx-auto max-w-2xl text-center', props.className)}>
      {props.badge ? (
        <Badge variant="outline" className="mb-4">
          {props.badge}
        </Badge>
      ) : null}
      <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {props.title}
      </h2>
      {props.subtitle ? (
        <p className="mt-4 text-base text-pretty text-muted-foreground sm:text-lg">
          {props.subtitle}
        </p>
      ) : null}
    </Reveal>
  );
}
