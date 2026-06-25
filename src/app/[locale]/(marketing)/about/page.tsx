import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AboutIntro } from '@/components/marketing/about-intro';
import { ContactSection } from '@/components/marketing/contact-section';
import { CtaSection } from '@/components/marketing/cta-section';
import { StatsSection } from '@/components/marketing/stats-section';
import { TeamSection } from '@/components/marketing/team-section';

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: AboutPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'AboutPage' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
    openGraph: { title: t('meta_title'), description: t('meta_description'), type: 'website' },
  };
}

export default async function AboutPage(props: AboutPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <>
      <AboutIntro />
      <StatsSection />
      <TeamSection />
      <ContactSection />
      <CtaSection />
    </>
  );
}
