'use client';

import { FilmIcon } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import { cn } from '@/lib/utils';
import type { FilmStatus, Movie } from '@/libs/Films';
import { Link } from '@/libs/I18nNavigation';
import { posterUrl } from '@/libs/Tmdb';
import { FilmActions } from './film-actions';

type FilmCardProps = {
  movie: Movie;
  status: FilmStatus;
  interactive: boolean;
};

// Picks the selection-ring color: watched (green) takes precedence over watchlist (blue).
function ringFor(status: FilmStatus) {
  if (status.watched) {
    return 'ring-2 ring-green-500';
  }

  if (status.watchlist) {
    return 'ring-2 ring-sky-500';
  }

  return 'ring-1 ring-border';
}

export function FilmCard(props: FilmCardProps) {
  const [status, setStatus] = React.useState(props.status);
  const poster = posterUrl(props.movie.posterPath, 'w342');
  const year = props.movie.releaseDate?.slice(0, 4);

  // Watched/watchlisted posters read as "handled": dimmed at rest, restored on hover/focus.
  const marked = status.watched || status.watchlist;
  const fade = marked ? 'opacity-70 group-hover:opacity-100 group-focus-within:opacity-100' : '';

  return (
    <div className="group relative">
      <Link
        href={`/films/${props.movie.tmdbId}`}
        title={props.movie.title}
        className={cn(
          'relative block aspect-[2/3] overflow-hidden rounded-lg bg-muted ring-offset-2 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          ringFor(status),
        )}
      >
        {poster ? (
          <Image
            src={poster}
            alt={props.movie.title}
            fill
            sizes="(min-width: 1280px) 10vw, (min-width: 640px) 16vw, 33vw"
            className={cn('object-cover transition-opacity duration-300', fade)}
          />
        ) : (
          <div
            className={cn(
              'flex h-full flex-col items-center justify-center gap-2 p-2 text-center text-muted-foreground transition-opacity duration-300',
              fade,
            )}
          >
            <FilmIcon className="size-6" />
            <span className="line-clamp-3 text-xs">
              {props.movie.title}
              {year ? ` (${year})` : ''}
            </span>
          </div>
        )}
      </Link>

      {props.interactive ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end gap-1 rounded-b-lg bg-gradient-to-t from-black/70 to-transparent p-1.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <div className="pointer-events-auto">
            <FilmActions movieId={props.movie.tmdbId} status={status} onStatusChange={setStatus} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
