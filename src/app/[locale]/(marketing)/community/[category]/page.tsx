import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { CommunityFeed } from '@/components/community/community-feed';
import { Section } from '@/components/marketing/section';
import { getCommunityCategory } from '@/data/community-categories';
import { getCategoryPostCounts, listPosts } from '@/libs/Community';
import { listMembers } from '@/libs/Social';
import { getI18nPath } from '@/utils/Helpers';
import { CommunityFeedValidation } from '@/validations/CommunityValidation';

type CategoryPageProps = {
  params: Promise<{ locale: string; category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(props: CategoryPageProps): Promise<Metadata> {
  const { locale, category } = await props.params;
  const found = getCommunityCategory(category);

  if (!found) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'CommunityPage' });
  const name = t(`category_${found.slug}_name`);
  const description = t(`category_${found.slug}_tagline`);

  return {
    title: t('category_meta_title', { name }),
    description,
    alternates: { canonical: getI18nPath(`/community/${found.slug}`, locale) },
    openGraph: { title: name, description, type: 'website' },
  };
}

export default async function CategoryPage(props: CategoryPageProps) {
  const { locale, category } = await props.params;
  setRequestLocale(locale);

  const found = getCommunityCategory(category);

  if (!found) {
    notFound();
  }

  const parsed = CommunityFeedValidation.safeParse(await props.searchParams);
  const search = parsed.success ? parsed.data : CommunityFeedValidation.parse({});

  const { userId } = await auth();
  const [{ items, total }, counts, members] = await Promise.all([
    listPosts({
      category: found.slug,
      sort: search.sort,
      viewerId: userId ?? undefined,
      page: search.page,
    }),
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
        activeCategory={found}
        members={members}
      />
    </Section>
  );
}
