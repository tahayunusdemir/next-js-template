import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CtaSection } from '@/components/marketing/cta-section';
import { FaqSection } from '@/components/marketing/faq-section';
import { FeaturesSection } from '@/components/marketing/features-section';
import { HeroSection } from '@/components/marketing/hero-section';
import { HowItWorksSection } from '@/components/marketing/how-it-works-section';
import { LogoCloud } from '@/components/marketing/logo-cloud';
import { PricingSection } from '@/components/marketing/pricing-section';
import { StructuredData } from '@/components/marketing/structured-data';
import { TestimonialsSection } from '@/components/marketing/testimonials-section';

type IndexPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IndexPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'LandingPage',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
    openGraph: {
      title: t('meta_title'),
      description: t('meta_description'),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta_title'),
      description: t('meta_description'),
    },
  };
}

export default async function Index(props: IndexPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <>
      <StructuredData />
      <HeroSection />
      <LogoCloud />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection showCompareLink />
      <FaqSection />
      <CtaSection />
    </>
  );
}
