import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';

// Intro header for the CineType directory index.
export function CineHero() {
  const t = useTranslations('CineTypePage');

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
      </div>
    </section>
  );
}
