import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CineMatchAnatomy } from '@/components/marketing/cinematch/cinematch-anatomy';
import { CineMatchCta } from '@/components/marketing/cinematch/cinematch-cta';
import { CineMatchFaq } from '@/components/marketing/cinematch/cinematch-faq';
import { CineMatchHero } from '@/components/marketing/cinematch/cinematch-hero';
import { CineMatchSteps } from '@/components/marketing/cinematch/cinematch-steps';

type CineMatchPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: CineMatchPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'CineMatchPage' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
    openGraph: { title: t('meta_title'), description: t('meta_description'), type: 'website' },
  };
}

export default async function CineMatchPage(props: CineMatchPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <>
      <CineMatchHero />
      <CineMatchSteps />
      <CineMatchAnatomy />
      <CineMatchFaq />
      <CineMatchCta />
    </>
  );
}
