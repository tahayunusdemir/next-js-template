import { auth } from '@clerk/nextjs/server';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { CommunityFeed } from '@/components/community/community-feed';
import { CommunityModeProvider } from '@/components/community/community-mode';
import { getCommunityCategory } from '@/data/community-categories';
import { getCategoryPostCounts, listPosts } from '@/libs/Community';
import { CommunityFeedValidation } from '@/validations/CommunityValidation';

type DashboardCategoryPageProps = {
  params: Promise<{ locale: string; category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardCategoryPage(props: DashboardCategoryPageProps) {
  const { locale, category } = await props.params;
  setRequestLocale(locale);

  const found = getCommunityCategory(category);

  if (!found) {
    notFound();
  }

  const parsed = CommunityFeedValidation.safeParse(await props.searchParams);
  const search = parsed.success ? parsed.data : CommunityFeedValidation.parse({});

  const { userId } = await auth();
  const [{ items, total }, counts] = await Promise.all([
    listPosts({
      category: found.slug,
      sort: search.sort,
      viewerId: userId ?? undefined,
      page: search.page,
    }),
    getCategoryPostCounts(),
  ]);

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6">
      <CommunityModeProvider interactive basePath="/dashboard/community">
        <CommunityFeed
          locale={locale}
          basePath="/dashboard/community"
          interactive
          sort={search.sort}
          page={search.page}
          items={items}
          total={total}
          counts={counts}
          activeCategory={found}
        />
      </CommunityModeProvider>
    </div>
  );
}
