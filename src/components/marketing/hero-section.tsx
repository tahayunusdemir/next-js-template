import { ArrowRightIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Mascot } from '@/components/marketing/mascot';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from '@/libs/I18nNavigation';

export function HeroSection() {
  const t = useTranslations('Hero');

  return (
    <section className="relative overflow-hidden border-b border-dashed pt-20 pb-20 sm:pt-28 sm:pb-24">
      {/* Subtle radial glow + grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(60%_60%_at_50%_0%,var(--color-foreground)/8%,transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] [mask-image:radial-gradient(70%_50%_at_50%_0%,black,transparent)] bg-[size:40px_40px] opacity-40"
      />

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          {/* Mascot — placeholder, swap for the real SVG later */}
          <div className="mb-8 w-40 motion-safe:animate-float sm:w-48">
            <Mascot />
          </div>

          <Link
            href="/pricing"
            className="motion-safe:animate-in motion-safe:duration-700 motion-safe:fade-in"
          >
            <Badge
              variant="outline"
              className="gap-1.5 py-1 transition-colors hover:bg-muted hover:text-foreground"
            >
              <span className="size-1.5 rounded-full bg-primary" />
              {t('badge')}
            </Badge>
          </Link>

          <h1 className="mt-6 font-heading text-4xl font-semibold tracking-tight text-balance motion-safe:animate-in motion-safe:duration-700 motion-safe:fade-in motion-safe:slide-in-from-bottom-3 sm:text-6xl">
            {t.rich('title', {
              accent: (chunks) => (
                <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  {chunks}
                </span>
              ),
            })}
          </h1>

          <p className="mt-6 max-w-2xl text-base text-pretty text-muted-foreground motion-safe:animate-in motion-safe:duration-1000 motion-safe:fade-in sm:text-lg">
            {t('subtitle')}
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 motion-safe:animate-in motion-safe:duration-1000 motion-safe:fade-in sm:flex-row">
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
              href="/#how-it-works"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'w-full rounded-full px-6 transition-transform hover:-translate-y-0.5 sm:w-auto',
              )}
            >
              {t('secondary_cta')}
            </Link>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">{t('note')}</p>
        </div>
      </div>
    </section>
  );
}
