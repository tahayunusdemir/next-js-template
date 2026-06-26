import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CineAspects } from '@/components/marketing/cinetype/cinetype-aspects';
import { CineCta } from '@/components/marketing/cinetype/cinetype-cta';
import { CineDirectory } from '@/components/marketing/cinetype/cinetype-directory';
import { CineHero } from '@/components/marketing/cinetype/cinetype-hero';
import { Section, SectionHeading } from '@/components/marketing/section';

type CineTypePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: CineTypePageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'CineTypePage' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
    openGraph: { title: t('meta_title'), description: t('meta_description'), type: 'website' },
  };
}

export default async function CineTypePage(props: CineTypePageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'CineTypePage' });

  return (
    <>
      <CineHero />
      <CineAspects />
      <Section id="directory">
        <SectionHeading title={t('directory_title')} subtitle={t('directory_subtitle')} />
        <div className="mt-12">
          <CineDirectory />
        </div>
      </Section>
      <CineCta />
    </>
  );
}
