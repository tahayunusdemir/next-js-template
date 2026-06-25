import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';

export function AboutIntro() {
  const t = useTranslations('AboutPage');

  return (
    <section className="relative overflow-hidden border-b border-dashed pt-20 pb-16 sm:pt-24 sm:pb-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(60%_60%_at_50%_0%,var(--color-foreground)/8%,transparent_70%)]"
      />
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">
            {t('badge')}
          </Badge>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-4 text-base text-pretty text-muted-foreground sm:text-lg">
            {t('subtitle')}
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-[auto_1fr] md:gap-12">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">{t('story_title')}</h2>
          <div className="space-y-4 text-pretty text-muted-foreground">
            <p>{t('story_p1')}</p>
            <p>{t('story_p2')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
