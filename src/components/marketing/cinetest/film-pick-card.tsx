'use client';

import { CheckIcon, FilmIcon } from 'lucide-react';
import Image from 'next/image';
import type { CineBrowseMovie } from '@/app/[locale]/(auth)/dashboard/cinetest/actions';
import { cn } from '@/lib/utils';
import { posterUrl } from '@/libs/Tmdb';

// A selectable catalogue poster used by the CineTest film picker. Single picks show a check;
// multi (favourites) picks show their 1-based order so the four choices read as a ranking.
export function FilmPickCard(props: {
  movie: CineBrowseMovie;
  selected: boolean;
  order?: number;
  disabled?: boolean;
  onToggle: () => void;
}) {
  const poster = posterUrl(props.movie.posterPath, 'w342');
  const year = props.movie.releaseDate?.slice(0, 4);

  return (
    <button
      type="button"
      aria-pressed={props.selected}
      disabled={props.disabled}
      title={props.movie.title}
      onClick={props.onToggle}
      className={cn(
        'group relative block aspect-[2/3] overflow-hidden rounded-lg bg-muted ring-offset-2 ring-offset-background transition-[transform,box-shadow] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        props.selected ? 'ring-2 ring-primary' : 'ring-1 ring-border',
        props.disabled ? 'cursor-not-allowed opacity-40' : 'hover:-translate-y-0.5 hover:shadow-md',
      )}
    >
      {poster ? (
        <Image
          src={poster}
          alt={props.movie.title}
          fill
          sizes="(min-width: 1280px) 10vw, (min-width: 640px) 16vw, 33vw"
          className="object-cover"
        />
      ) : (
        <span className="flex h-full flex-col items-center justify-center gap-2 p-2 text-center text-muted-foreground">
          <FilmIcon className="size-6" />
          <span className="line-clamp-3 text-xs">
            {props.movie.title}
            {year ? ` (${year})` : ''}
          </span>
        </span>
      )}
      {props.selected ? (
        <span className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground tabular-nums">
          {props.order ?? <CheckIcon className="size-4" />}
        </span>
      ) : null}
    </button>
  );
}
