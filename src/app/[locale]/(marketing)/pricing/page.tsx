import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ComparisonSection } from '@/components/marketing/comparison-section';
import { CtaSection } from '@/components/marketing/cta-section';
import { PricingSection } from '@/components/marketing/pricing-section';
import { TrustBadges } from '@/components/marketing/trust-badges';

type PricingPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: PricingPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'PricingPage' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
    openGraph: { title: t('meta_title'), description: t('meta_description'), type: 'website' },
  };
}

export default async function PricingRoutePage(props: PricingPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <>
      <PricingSection />
      <ComparisonSection />
      <TrustBadges />
      <CtaSection />
    </>
  );
}
