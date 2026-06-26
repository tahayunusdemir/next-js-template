import { SiImdb, SiThemoviedatabase } from '@icons-pack/react-simple-icons';
import { FilmIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import type { FilmStatus } from '@/libs/Films';
import { backdropUrl, posterUrl } from '@/libs/Tmdb';
import type { TmdbMovieDetails } from '@/types/Tmdb';
import { FilmDetailActions } from './film-detail-actions';

type FilmDetailHeaderProps = {
  details: TmdbMovieDetails;
  status: FilmStatus;
  counts: { watched: number; watchlist: number };
  locale: string;
};

export async function FilmDetailHeader(props: FilmDetailHeaderProps) {
  const t = await getTranslations({ locale: props.locale, namespace: 'FilmDetailPage' });
  const { details } = props;

  const poster = posterUrl(details.poster_path, 'w500');
  const backdrop = backdropUrl(details.backdrop_path, 'w1280');
  const year = details.release_date?.slice(0, 4);
  const director = details.credits?.crew.find((member) => member.job === 'Director');

  return (
    <div className="relative">
      {backdrop ? (
        <div className="absolute inset-x-0 top-0 -z-10 h-72 overflow-hidden sm:h-96">
          <Image src={backdrop} alt="" fill priority className="object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>
      ) : null}

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 pt-32 pb-8 sm:flex-row sm:pt-48">
        <div className="mx-auto w-40 shrink-0 sm:mx-0 sm:w-56">
          <div className="aspect-[2/3] overflow-hidden rounded-xl bg-muted ring-1 ring-border">
            {poster ? (
              <Image
                src={poster}
                alt={details.title}
                width={500}
                height={750}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <FilmIcon className="size-8" />
              </div>
            )}
          </div>

          <FilmDetailActions movieId={details.id} status={props.status} counts={props.counts} />
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              {details.title}
              {year ? <span className="ml-2 font-normal text-muted-foreground">{year}</span> : null}
            </h1>
            {director ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {t('directed_by', { name: director.name })}
              </p>
            ) : null}
          </div>

          {details.tagline ? (
            <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
              {details.tagline}
            </p>
          ) : null}

          {details.overview ? (
            <p className="max-w-prose text-pretty text-foreground/90">{details.overview}</p>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
            {details.runtime ? (
              <span className="text-muted-foreground">
                {t('runtime', { minutes: details.runtime })}
              </span>
            ) : null}
            <a
              href={`https://www.themoviedb.org/movie/${details.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <SiThemoviedatabase className="size-4" />
              TMDB
            </a>
            {details.imdb_id ? (
              <a
                href={`https://www.imdb.com/title/${details.imdb_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <SiImdb className="size-4" />
                IMDb
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
