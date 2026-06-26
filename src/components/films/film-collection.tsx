import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserFilmStatus, listMovies, listUserFilms } from '@/libs/Films';
import { getI18nPath } from '@/utils/Helpers';
import type { FilmStatusField } from '@/validations/FilmValidation';
import { FILM_PAGE_SIZE, FilmsSearchValidation } from '@/validations/FilmValidation';
import { FilmEmpty } from './film-empty';
import { FilmGrid } from './film-grid';
import { FilmPagination } from './film-pagination';
import { FilmsToolbar } from './films-toolbar';

// Shared body for the dashboard films pages: the same search, filter, density, and
// pagination controls, either over the full catalogue or scoped to one user collection.
export async function FilmCollection(props: {
  kind: 'catalogue' | FilmStatusField;
  locale: string;
  title: string;
  subtitle: string;
  emptyMessage: string;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect(getI18nPath('/sign-in', props.locale));
  }

  const parsed = FilmsSearchValidation.safeParse(props.searchParams);
  const search = parsed.success ? parsed.data : FilmsSearchValidation.parse({});
  const { items, total } =
    props.kind === 'catalogue'
      ? await listMovies({
          page: search.page,
          sort: search.sort,
          query: search.q,
          genre: search.genre,
          decade: search.decade,
        })
      : await listUserFilms({
          userId,
          kind: props.kind,
          page: search.page,
          sort: search.sort,
          query: search.q,
          genre: search.genre,
          decade: search.decade,
        });

  const status = await getUserFilmStatus({ userId, movieIds: items.map((movie) => movie.tmdbId) });
  const totalPages = Math.ceil(total / FILM_PAGE_SIZE);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">{props.title}</h1>
        <p className="text-sm text-muted-foreground">{props.subtitle}</p>
      </div>

      <FilmsToolbar total={total} density={search.density} />

      {items.length ? (
        <>
          <FilmGrid movies={items} status={status} density={search.density} interactive />
          <FilmPagination page={search.page} totalPages={totalPages} />
        </>
      ) : (
        <FilmEmpty message={props.emptyMessage} />
      )}
    </div>
  );
}
