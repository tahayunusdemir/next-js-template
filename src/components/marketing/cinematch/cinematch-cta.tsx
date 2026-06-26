import { ArrowRightIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from '@/libs/I18nNavigation';

// Closing call to action: sign up to join the pool, or take the CineTest first.
export function CineMatchCta() {
  const t = useTranslations('CineMatchPage');

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border bg-card px-6 py-16 text-center ring-1 ring-foreground/10 sm:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_80%_at_50%_0%,var(--color-foreground)/8%,transparent_70%)]"
          />
          <Badge variant="outline" className="mb-4">
            {t('cta_badge')}
          </Badge>
          <h2 className="mx-auto max-w-2xl font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {t('cta_title')}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">
            {t('cta_subtitle')}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/sign-up"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'group rounded-full px-6 transition-transform hover:-translate-y-0.5',
              )}
            >
              {t('cta_button')}
              <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/cinetest"
              className={cn(
                buttonVariants({ size: 'lg', variant: 'outline' }),
                'rounded-full px-6',
              )}
            >
              {t('cta_secondary')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
