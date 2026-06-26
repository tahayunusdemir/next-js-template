import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { FilmCast } from '@/components/films/film-cast';
import { FilmDetailHeader } from '@/components/films/film-detail-header';
import type { Movie } from '@/libs/Films';
import { getFilmCounts, getMovie, getUserFilmStatus } from '@/libs/Films';
import { getMovieDetails, posterUrl } from '@/libs/Tmdb';
import type { TmdbMovieDetails } from '@/types/Tmdb';
import { getBaseUrl, getI18nPath } from '@/utils/Helpers';

type FilmPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

const EMPTY_STATUS = { watched: false, watchlist: false };

// Parses the leading numeric TMDB id from an `id` or `id-slug` segment.
function parseId(segment: string) {
  const id = Number.parseInt(segment, 10);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

// Builds a details shape from the catalogue row when the live TMDB call is unavailable.
function detailsFromMovie(movie: Movie): TmdbMovieDetails {
  return {
    id: movie.tmdbId,
    title: movie.title,
    original_title: movie.originalTitle ?? movie.title,
    overview: movie.overview ?? '',
    poster_path: movie.posterPath,
    backdrop_path: movie.backdropPath,
    release_date: movie.releaseDate ?? '',
    popularity: movie.popularity,
    vote_average: movie.voteAverage,
    vote_count: movie.voteCount,
    genre_ids: movie.genreIds,
    original_language: movie.originalLanguage ?? '',
    adult: movie.adult,
    tagline: null,
    runtime: null,
    status: '',
    homepage: null,
    imdb_id: null,
    genres: movie.genreIds.map((id) => ({ id, name: '' })),
  };
}

export async function generateMetadata(props: FilmPageProps): Promise<Metadata> {
  const { locale, id } = await props.params;
  const movieId = parseId(id);
  const movie = movieId ? await getMovie(movieId) : undefined;

  if (!movie) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'FilmDetailPage' });
  const poster = posterUrl(movie.posterPath, 'w500');

  return {
    title: t('meta_title', { title: movie.title }),
    description: movie.overview?.trim()
      ? movie.overview
      : t('meta_description', { title: movie.title }),
    alternates: { canonical: getI18nPath(`/films/${movie.tmdbId}`, locale) },
    openGraph: {
      title: movie.title,
      description: movie.overview ?? undefined,
      images: poster ? [poster] : undefined,
      type: 'video.movie',
    },
  };
}

export default async function FilmPage(props: FilmPageProps) {
  const { locale, id } = await props.params;
  setRequestLocale(locale);

  const movieId = parseId(id);

  if (!movieId) {
    notFound();
  }

  const movie = await getMovie(movieId);

  if (!movie) {
    notFound();
  }

  const [details, counts, { userId }] = await Promise.all([
    getMovieDetails({ id: movieId, locale }),
    getFilmCounts(movieId),
    auth(),
  ]);

  const statusMap = userId ? await getUserFilmStatus({ userId, movieIds: [movieId] }) : undefined;
  const status = statusMap?.get(movieId) ?? EMPTY_STATUS;
  const resolvedDetails = details ?? detailsFromMovie(movie);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: movie.title,
    image: posterUrl(movie.posterPath, 'w500') ?? undefined,
    datePublished: movie.releaseDate ?? undefined,
    url: `${getBaseUrl()}${getI18nPath(`/films/${movie.tmdbId}`, locale)}`,
  };

  return (
    <div className="pb-16">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires raw script content
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <FilmDetailHeader details={resolvedDetails} status={status} counts={counts} locale={locale} />

      <div className="mx-auto w-full max-w-5xl px-4">
        <FilmCast details={resolvedDetails} />
      </div>
    </div>
  );
}
