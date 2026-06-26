import { ArrowRightIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Mascot } from '@/components/marketing/mascot';
import { Reveal } from '@/components/marketing/reveal';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from '@/libs/I18nNavigation';

export function CtaSection() {
  const t = useTranslations('CallToAction');

  return (
    <section className="border-b border-dashed py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="relative overflow-hidden rounded-3xl border bg-card px-6 py-16 text-center ring-1 ring-foreground/10 sm:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_80%_at_50%_0%,var(--color-foreground)/8%,transparent_70%)]"
          />
          {/* Mascot — placeholder, swap for the real SVG later */}
          <div className="mx-auto mb-6 w-24 motion-safe:animate-float">
            <Mascot />
          </div>
          <h2 className="mx-auto max-w-2xl font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {t('title')}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">
            {t('subtitle')}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'group w-full rounded-full px-6 transition-transform hover:-translate-y-0.5 sm:w-auto',
              )}
            >
              {t('primary_cta')}
              <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/about#contact"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'w-full rounded-full px-6 transition-transform hover:-translate-y-0.5 sm:w-auto',
              )}
            >
              {t('secondary_cta')}
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">{t('note')}</p>
        </Reveal>
      </div>
    </section>
  );
}
