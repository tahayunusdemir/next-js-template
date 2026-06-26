import { currentUser } from '@clerk/nextjs/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { AchievementGroupCard } from '@/components/achievements/achievement-group-card';
import { buildAchievementView, getAchievementMetrics } from '@/libs/Achievements';
import { getI18nPath } from '@/utils/Helpers';

type DashboardAchievementsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardAchievementsPage(props: DashboardAchievementsPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const user = await currentUser();

  if (!user) {
    redirect(getI18nPath('/sign-in', locale));
  }

  const [t, metrics] = await Promise.all([
    getTranslations({ locale, namespace: 'DashboardAchievementsPage' }),
    getAchievementMetrics(user.id),
  ]);

  const view = buildAchievementView(metrics);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h1 className="text-xl font-semibold tracking-tight">{t('title')}</h1>
            <span className="text-sm font-medium text-muted-foreground tabular-nums">
              {t('progress', { unlocked: view.totalUnlocked, total: view.totalCount })}
            </span>
          </div>
          <p className="max-w-prose text-sm text-muted-foreground">{t('subtitle')}</p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {view.groups.map((group) => (
            <AchievementGroupCard group={group} key={group.id} />
          ))}
        </div>
      </div>
    </div>
  );
}
