'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { FilmStatus, Movie } from '@/libs/Films';
import type { FilmDensity } from '@/validations/FilmValidation';
import { FilmCard } from './film-card';
import { FilmDensityToggle } from './film-density-toggle';

type ProfileFilm = { movie: Movie; status: FilmStatus };

// Profile grids live in the narrow profile column, so the densities top out at 6 columns
// (compact ≈ 6 wide, comfortable ≈ 3–4 wide) — the "6×12 / 3×6" toggle at profile scale.
const COLUMNS: Record<FilmDensity, string> = {
  compact: 'grid-cols-4 gap-2 sm:grid-cols-6',
  comfortable: 'grid-cols-3 gap-3 sm:grid-cols-4',
};

export function ProfileFilms(props: { films: ProfileFilm[]; interactive: boolean }) {
  const [density, setDensity] = React.useState<FilmDensity>('compact');

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <FilmDensityToggle density={density} onChange={setDensity} size="sm" />
      </div>

      <div className={cn('grid', COLUMNS[density])}>
        {props.films.map(({ movie, status }) => (
          <FilmCard
            key={movie.tmdbId}
            movie={movie}
            status={status}
            interactive={props.interactive}
          />
        ))}
      </div>
    </div>
  );
}
