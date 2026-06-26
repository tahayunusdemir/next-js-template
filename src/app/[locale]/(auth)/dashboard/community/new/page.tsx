import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CommunityModeProvider } from '@/components/community/community-mode';
import { PostComposer } from '@/components/community/post-composer';
import { getCommunityCategory } from '@/data/community-categories';

type DashboardNewPostPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardNewPostPage(props: DashboardNewPostPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const searchParams = await props.searchParams;
  const requested = searchParams.category;
  const category = typeof requested === 'string' ? getCommunityCategory(requested) : undefined;

  const t = await getTranslations({ locale, namespace: 'CommunityPage' });

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {t('new_post_title')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('new_post_subtitle')}</p>
        </div>
        <CommunityModeProvider interactive basePath="/dashboard/community">
          <PostComposer defaultCategory={category?.slug} />
        </CommunityModeProvider>
      </div>
    </div>
  );
}
