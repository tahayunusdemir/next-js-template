import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FilmEmpty } from '@/components/films/film-empty';
import { FilmGrid } from '@/components/films/film-grid';
import { FilmPagination } from '@/components/films/film-pagination';
import { FilmsToolbar } from '@/components/films/films-toolbar';
import { Section } from '@/components/marketing/section';
import type { FilmStatus } from '@/libs/Films';
import { getUserFilmStatus, listMovies } from '@/libs/Films';
import { getI18nPath } from '@/utils/Helpers';
import { FILM_PAGE_SIZE, FilmsSearchValidation } from '@/validations/FilmValidation';

type FilmsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(props: FilmsPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'FilmsPage' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
    alternates: { canonical: getI18nPath('/films', locale) },
    openGraph: { title: t('meta_title'), description: t('meta_description'), type: 'website' },
  };
}

export default async function FilmsPage(props: FilmsPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const parsed = FilmsSearchValidation.safeParse(await props.searchParams);
  const search = parsed.success ? parsed.data : FilmsSearchValidation.parse({});
  const { items, total } = await listMovies({
    page: search.page,
    sort: search.sort,
    query: search.q,
    genre: search.genre,
    decade: search.decade,
  });

  const { userId } = await auth();
  const status = userId
    ? await getUserFilmStatus({ userId, movieIds: items.map((movie) => movie.tmdbId) })
    : new Map<number, FilmStatus>();

  const t = await getTranslations({ locale, namespace: 'FilmsPage' });
  const totalPages = Math.ceil(total / FILM_PAGE_SIZE);

  return (
    <Section className="py-10 sm:py-16">
      <div className="flex flex-col gap-8">
        <FilmsToolbar total={total} density={search.density} />

        {items.length ? (
          <>
            <FilmGrid movies={items} status={status} density={search.density} interactive />
            <FilmPagination page={search.page} totalPages={totalPages} />
          </>
        ) : (
          <FilmEmpty message={t('empty')} />
        )}
      </div>
    </Section>
  );
}
