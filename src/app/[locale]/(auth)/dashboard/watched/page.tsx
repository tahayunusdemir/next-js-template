import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FilmCollection } from '@/components/films/film-collection';

type DashboardWatchedPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardWatchedPage(props: DashboardWatchedPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'DashboardWatchedPage' });

  return (
    <FilmCollection
      kind="watched"
      locale={locale}
      title={t('title')}
      subtitle={t('subtitle')}
      emptyMessage={t('empty')}
      searchParams={await props.searchParams}
    />
  );
}
