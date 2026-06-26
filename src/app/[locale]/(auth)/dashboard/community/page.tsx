import { auth } from '@clerk/nextjs/server';
import { setRequestLocale } from 'next-intl/server';
import { CommunityFeed } from '@/components/community/community-feed';
import { CommunityModeProvider } from '@/components/community/community-mode';
import { getCategoryPostCounts, listPosts } from '@/libs/Community';
import { CommunityFeedValidation } from '@/validations/CommunityValidation';

type DashboardCommunityPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardCommunityPage(props: DashboardCommunityPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const parsed = CommunityFeedValidation.safeParse(await props.searchParams);
  const search = parsed.success ? parsed.data : CommunityFeedValidation.parse({});

  const { userId } = await auth();
  const [{ items, total }, counts] = await Promise.all([
    listPosts({ sort: search.sort, viewerId: userId ?? undefined, page: search.page }),
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
        />
      </CommunityModeProvider>
    </div>
  );
}
