import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FilmCollection } from '@/components/films/film-collection';

type DashboardFilmsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardFilmsPage(props: DashboardFilmsPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'DashboardFilmsPage' });

  return (
    <FilmCollection
      kind="catalogue"
      locale={locale}
      title={t('title')}
      subtitle={t('subtitle')}
      emptyMessage={t('empty')}
      searchParams={await props.searchParams}
    />
  );
}
