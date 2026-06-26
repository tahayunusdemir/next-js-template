import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CommunityFeed } from '@/components/community/community-feed';
import { Section } from '@/components/marketing/section';
import { getCategoryPostCounts, listPosts } from '@/libs/Community';
import { listMembers } from '@/libs/Social';
import { getI18nPath } from '@/utils/Helpers';
import { CommunityFeedValidation } from '@/validations/CommunityValidation';

type CommunityPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(props: CommunityPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'CommunityPage' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
    alternates: { canonical: getI18nPath('/community', locale) },
    openGraph: { title: t('meta_title'), description: t('meta_description'), type: 'website' },
  };
}

export default async function CommunityPage(props: CommunityPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const parsed = CommunityFeedValidation.safeParse(await props.searchParams);
  const search = parsed.success ? parsed.data : CommunityFeedValidation.parse({});

  const { userId } = await auth();
  const [{ items, total }, counts, members] = await Promise.all([
    listPosts({ sort: search.sort, viewerId: userId ?? undefined, page: search.page }),
    getCategoryPostCounts(),
    listMembers({ limit: 1 }),
  ]);

  return (
    <Section className="py-10 sm:py-16">
      <CommunityFeed
        locale={locale}
        basePath="/community"
        interactive={false}
        sort={search.sort}
        page={search.page}
        items={items}
        total={total}
        counts={counts}
        members={members}
      />
    </Section>
  );
}
