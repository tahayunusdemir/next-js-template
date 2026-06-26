import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { CineOverview } from '@/components/marketing/cinetype/cinetype-overview';
import { CinePeople } from '@/components/marketing/cinetype/cinetype-people';
import { CineProfileHeader } from '@/components/marketing/cinetype/cinetype-profile-header';
import { CineSections } from '@/components/marketing/cinetype/cinetype-sections';
import { CineTraits } from '@/components/marketing/cinetype/cinetype-traits';
import { CineTypeNav } from '@/components/marketing/cinetype/cinetype-type-nav';
import { Section } from '@/components/marketing/section';
import { cineTypes, getAdjacentCineTypes, getCineTypeBySlug } from '@/data/cinetype';

type CineTypeDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return cineTypes.map((type) => ({ slug: type.slug }));
}

export async function generateMetadata(props: CineTypeDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const type = getCineTypeBySlug(slug);

  if (!type) {
    return {};
  }

  const tContent = await getTranslations({ locale, namespace: 'CineType' });
  const t = await getTranslations({ locale, namespace: 'CineTypeDetailPage' });
  const name = tContent(`${type.slug}_name`);

  const title = t('meta_title', { name, code: type.code });
  const description = t('meta_description', { name });

  return {
    title,
    description,
    openGraph: { title, description, type: 'profile' },
  };
}

export default async function CineTypeDetailPage(props: CineTypeDetailPageProps) {
  const { locale, slug } = await props.params;
  setRequestLocale(locale);

  const type = getCineTypeBySlug(slug);

  if (!type) {
    notFound();
  }

  const adjacent = getAdjacentCineTypes(type.slug);

  return (
    <>
      <CineProfileHeader type={type} />
      <Section>
        <div className="mx-auto max-w-3xl space-y-14">
          <CineOverview type={type} />
          <CineTraits slug={type.slug} />
          <CineSections slug={type.slug} />
          <CinePeople slug={type.slug} />

          {adjacent ? <CineTypeNav prev={adjacent.prev} next={adjacent.next} /> : null}
        </div>
      </Section>
    </>
  );
}
