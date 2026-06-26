import { currentUser } from '@clerk/nextjs/server';
import { ArrowLeftIcon } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import { MatchCard } from '@/components/matches/match-card';
import { getMatch } from '@/libs/CineMatch';
import { Link } from '@/libs/I18nNavigation';
import { ensureProfile } from '@/libs/Profile';
import { getI18nPath } from '@/utils/Helpers';

type DashboardMatchPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function DashboardMatchPage(props: DashboardMatchPageProps) {
  const { locale, id } = await props.params;
  setRequestLocale(locale);

  const user = await currentUser();

  if (!user) {
    redirect(getI18nPath('/sign-in', locale));
  }

  await ensureProfile(user);

  const match = await getMatch({ userId: user.id, matchId: id });

  if (!match) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'DashboardMatchesPage' });

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <Link
          href="/dashboard/matches"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          {t('back')}
        </Link>

        <header>
          <h1 className="text-xl font-semibold tracking-tight">{t('anatomy_title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('breakdown_note')}</p>
        </header>

        <MatchCard match={match} locale={locale} />
      </div>
    </div>
  );
}
