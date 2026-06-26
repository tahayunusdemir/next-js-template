import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LegalContent } from '@/components/marketing/legal-content';
import { getI18nPath } from '@/utils/Helpers';

type PrivacyPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: PrivacyPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'PrivacyPage' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
    alternates: { canonical: getI18nPath('/privacy', locale) },
    openGraph: { title: t('meta_title'), description: t('meta_description'), type: 'website' },
  };
}

export default async function PrivacyPage(props: PrivacyPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'PrivacyPage' });

  const sections = [
    { heading: t('s1_heading'), body: t('s1_body') },
    { heading: t('s2_heading'), body: t('s2_body') },
    { heading: t('s3_heading'), body: t('s3_body') },
    { heading: t('s4_heading'), body: t('s4_body') },
    { heading: t('s5_heading'), body: t('s5_body') },
    { heading: t('s6_heading'), body: t('s6_body') },
  ];

  return (
    <LegalContent
      title={t('title')}
      updated={t('updated')}
      intro={t('intro')}
      sections={sections}
    />
  );
}
