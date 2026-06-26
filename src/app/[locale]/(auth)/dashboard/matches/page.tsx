import { currentUser } from '@clerk/nextjs/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { MatchCard } from '@/components/matches/match-card';
import { PoolStatusCard } from '@/components/matches/pool-status-card';
import { getPoolStatus, listMatches, sweepUserRequests } from '@/libs/CineMatch';
import { ensureProfile } from '@/libs/Profile';
import { getI18nPath } from '@/utils/Helpers';

type DashboardMatchesPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardMatchesPage(props: DashboardMatchesPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const user = await currentUser();

  if (!user) {
    redirect(getI18nPath('/sign-in', locale));
  }

  // Make sure the user has a profile row so they are matchable and addressable.
  await ensureProfile(user);

  // Opportunistic catch-up: re-evaluate this user's searching requests so an active viewer
  // sees a fresh match or a promoted fallback without waiting on the scheduled sweep.
  await sweepUserRequests(user.id);

  const [t, status, matches] = await Promise.all([
    getTranslations({ locale, namespace: 'DashboardMatchesPage' }),
    getPoolStatus(user.id),
    listMatches(user.id),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <header>
          <h1 className="text-xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
        </header>

        <PoolStatusCard status={status} locale={locale} />

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">{t('matches_title')}</h2>
          {matches.length === 0 ? (
            <p className="rounded-xl bg-card p-6 text-sm text-muted-foreground ring-1 ring-foreground/10">
              {t('matches_empty')}
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} locale={locale} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
