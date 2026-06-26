import { cn } from '@/lib/utils';
import type { FilmStatus, Movie } from '@/libs/Films';
import type { FilmDensity } from '@/validations/FilmValidation';
import { FilmCard } from './film-card';

type FilmGridProps = {
  movies: Movie[];
  status: Map<number, FilmStatus>;
  density: FilmDensity;
  interactive: boolean;
};

const EMPTY_STATUS: FilmStatus = { watched: false, watchlist: false };

// Density only changes columns/poster size; the page size stays constant (FILM_PAGE_SIZE).
const COLUMNS: Record<FilmDensity, string> = {
  compact: 'grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12',
  comfortable: 'grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
};

export function FilmGrid(props: FilmGridProps) {
  return (
    <div className={cn('grid', COLUMNS[props.density])}>
      {props.movies.map((movie) => (
        <FilmCard
          key={movie.tmdbId}
          movie={movie}
          status={props.status.get(movie.tmdbId) ?? EMPTY_STATUS}
          interactive={props.interactive}
        />
      ))}
    </div>
  );
}
