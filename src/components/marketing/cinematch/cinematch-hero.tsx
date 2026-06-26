import { ArrowRightIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from '@/libs/I18nNavigation';

// Landing header for CineMatch: the pitch, the early-access constraints as chips, and the
// two entry points (sign up to join the pool, or take the CineTest first).
export function CineMatchHero() {
  const t = useTranslations('CineMatchPage');
  const chips = [t('hero_chip_requests'), t('hero_chip_consent'), t('hero_chip_no_card')];

  return (
    <section className="border-b border-dashed">
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <Badge variant="outline" className="mb-4">
          {t('hero_badge')}
        </Badge>
        <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {t('hero_title')}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
          {t('hero_subtitle')}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {chips.map((chip) => (
            <Badge key={chip} variant="secondary" className="rounded-full">
              {chip}
            </Badge>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/sign-up"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'group rounded-full px-6 transition-transform hover:-translate-y-0.5',
            )}
          >
            {t('hero_cta_primary')}
            <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/cinetest"
            className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'rounded-full px-6')}
          >
            {t('hero_cta_secondary')}
          </Link>
        </div>
      </div>
    </section>
  );
}
