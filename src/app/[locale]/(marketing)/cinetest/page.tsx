import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CineTestPromo } from '@/components/marketing/cinetest/cinetest-promo';

type CineTestPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: CineTestPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'CineTestPage' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
    openGraph: { title: t('meta_title'), description: t('meta_description'), type: 'website' },
  };
}

export default async function CineTestPage(props: CineTestPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <CineTestPromo />;
}
