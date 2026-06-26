'use client';

import { ClockIcon, EyeIcon } from 'lucide-react';
import * as React from 'react';
import type { FilmStatus } from '@/libs/Films';
import { FilmActions } from './film-actions';

type FilmDetailActionsProps = {
  movieId: number;
  status: FilmStatus;
  // Global watched/watchlist totals already counting this user's initial status.
  counts: { watched: number; watchlist: number };
};

// Detail-page action bar: owns the status so the buttons and the totals beneath them
// move together optimistically, adjusting each count by this user's net change.
export function FilmDetailActions(props: FilmDetailActionsProps) {
  const [status, setStatus] = React.useState(props.status);

  const counts = {
    watched: props.counts.watched + Number(status.watched) - Number(props.status.watched),
    watchlist: props.counts.watchlist + Number(status.watchlist) - Number(props.status.watchlist),
  };

  return (
    <div className="mt-4 flex flex-col gap-3">
      <FilmActions
        movieId={props.movieId}
        status={status}
        onStatusChange={setStatus}
        variant="detail"
      />
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <EyeIcon className="size-4 text-green-500" />
          {counts.watched}
        </span>
        <span className="inline-flex items-center gap-1">
          <ClockIcon className="size-4 text-sky-500" />
          {counts.watchlist}
        </span>
      </div>
    </div>
  );
}
