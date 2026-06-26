import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FilmCollection } from '@/components/films/film-collection';

type DashboardWatchlistPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardWatchlistPage(props: DashboardWatchlistPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'DashboardWatchlistPage' });

  return (
    <FilmCollection
      kind="watchlist"
      locale={locale}
      title={t('title')}
      subtitle={t('subtitle')}
      emptyMessage={t('empty')}
      searchParams={await props.searchParams}
    />
  );
}
