'use client';

import { ChevronLeftIcon, ChevronRightIcon, SearchIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import type { CineBrowseMovie } from '@/app/[locale]/(auth)/dashboard/cinetest/actions';
import { searchCineFilms } from '@/app/[locale]/(auth)/dashboard/cinetest/actions';
import { FilmDensityToggle } from '@/components/films/film-density-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { genreKey, movieGenres } from '@/data/genres';
import { cn } from '@/lib/utils';
import type { FilmDensity, FilmSort } from '@/validations/FilmValidation';
import { FILM_SORTS } from '@/validations/FilmValidation';
import { FilmPickCard } from './film-pick-card';

const DECADES = [2020, 2010, 2000, 1990, 1980, 1970, 1960, 1950] as const;
const ALL = 'all';
const DEBOUNCE_MS = 350;

// Mirrors the /films catalogue densities: compact tops out at 12 columns ("6×12"),
// comfortable at 6 ("3×6"). Only the column count/poster size changes.
const COLUMNS: Record<FilmDensity, string> = {
  compact: 'grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12',
  comfortable: 'grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
};

// Browse the film catalogue (same filters/sort as /films) and pick films for the current
// question. Single mode swaps the pick; multi (favourites) toggles up to `max`, badged in order.
export function FilmPicker(props: {
  mode: 'single' | 'multi';
  max?: number;
  selectedIds: number[];
  onPick: (movie: CineBrowseMovie) => void;
}) {
  const t = useTranslations('CineTestPage');
  const tFilms = useTranslations('Films');

  const [query, setQuery] = React.useState('');
  const [debounced, setDebounced] = React.useState('');
  const [genre, setGenre] = React.useState(ALL);
  const [decade, setDecade] = React.useState(ALL);
  const [sort, setSort] = React.useState<FilmSort>('popularity');
  const [density, setDensity] = React.useState<FilmDensity>('compact');
  const [page, setPage] = React.useState(1);

  const [items, setItems] = React.useState<CineBrowseMovie[]>([]);
  const [total, setTotal] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [failed, setFailed] = React.useState(false);

  // Debounce only the free-text query; the selects/pager apply immediately.
  React.useEffect(() => {
    const handle = setTimeout(() => {
      setDebounced(query.trim());
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(handle);
    };
  }, [query]);

  // Fetch the catalogue page whenever the filter state settles. The cleanup flag drops a
  // stale response so a slow request can't overwrite a newer one.
  React.useEffect(() => {
    let active = true;
    setLoading(true);

    async function load() {
      const response = await searchCineFilms({
        page,
        sort,
        density,
        q: debounced || undefined,
        genre: genre === ALL ? undefined : Number(genre),
        decade: decade === ALL ? undefined : Number(decade),
      });

      if (!active) {
        return;
      }

      if (response.ok) {
        setItems(response.items);
        setTotal(response.total);
        setPageSize(response.pageSize);
        setFailed(false);
      } else {
        setItems([]);
        setTotal(0);
        setFailed(true);
      }

      setLoading(false);
    }

    void load();

    return () => {
      active = false;
    };
  }, [debounced, genre, decade, sort, density, page]);

  // Any filter change resets pagination so results start from the first page.
  function resetTo(setter: () => void) {
    setter();
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const atCapacity = props.mode === 'multi' && props.selectedIds.length >= (props.max ?? 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{tFilms('count', { count: total })}</p>
        <FilmDensityToggle density={density} onChange={setDensity} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            placeholder={tFilms('search_placeholder')}
            aria-label={tFilms('search_placeholder')}
            className="pl-9"
            onChange={(event) => {
              resetTo(() => {
                setQuery(event.target.value);
              });
            }}
          />
        </div>

        <Select
          value={genre}
          onValueChange={(value) => {
            resetTo(() => {
              setGenre(value ?? ALL);
            });
          }}
        >
          <SelectTrigger className="w-40" aria-label={tFilms('genre_label')}>
            <SelectValue placeholder={tFilms('genre_label')}>
              {(value) => {
                const key = genreKey(Number(value));
                return key ? tFilms(`genre_${key}`) : tFilms('genre_label');
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="start" alignItemWithTrigger={false}>
            <SelectItem value={ALL}>{tFilms('genre_label')}</SelectItem>
            {movieGenres.map((item) => (
              <SelectItem key={item.id} value={String(item.id)}>
                {tFilms(`genre_${item.key}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={decade}
          onValueChange={(value) => {
            resetTo(() => {
              setDecade(value ?? ALL);
            });
          }}
        >
          <SelectTrigger className="w-32" aria-label={tFilms('decade_label')}>
            <SelectValue placeholder={tFilms('decade_label')}>
              {(value) => (value === ALL ? tFilms('decade_label') : `${value}s`)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="start" alignItemWithTrigger={false}>
            <SelectItem value={ALL}>{tFilms('decade_label')}</SelectItem>
            {DECADES.map((value) => (
              <SelectItem key={value} value={String(value)}>
                {`${value}s`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sort}
          onValueChange={(value) => {
            resetTo(() => {
              setSort(value ?? 'popularity');
            });
          }}
        >
          <SelectTrigger className="w-40" aria-label={tFilms('sort_label')}>
            <SelectValue placeholder={tFilms('sort_label')}>
              {(value: FilmSort) => tFilms(`sort_${value}`)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="start" alignItemWithTrigger={false}>
            {FILM_SORTS.map((value) => (
              <SelectItem key={value} value={value}>
                {tFilms(`sort_${value}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {failed ? <p className="text-sm text-muted-foreground">{t('browse_error')}</p> : null}

      {!failed && !loading && items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('browse_empty')}</p>
      ) : null}

      {items.length ? (
        <div className={cn('grid transition-opacity', COLUMNS[density], loading && 'opacity-60')}>
          {items.map((movie) => {
            const order = props.selectedIds.indexOf(movie.tmdbId);
            const selected = order !== -1;

            return (
              <FilmPickCard
                key={movie.tmdbId}
                movie={movie}
                selected={selected}
                order={props.mode === 'multi' && selected ? order + 1 : undefined}
                disabled={atCapacity && !selected}
                onToggle={() => {
                  props.onPick(movie);
                }}
              />
            );
          })}
        </div>
      ) : null}

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            aria-label={t('browse_prev')}
            disabled={page <= 1 || loading}
            onClick={() => {
              setPage((value) => Math.max(1, value - 1));
            }}
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <span className="text-sm text-muted-foreground tabular-nums">
            {t('browse_page', { page, total: totalPages })}
          </span>
          <Button
            variant="outline"
            size="icon"
            aria-label={t('browse_next')}
            disabled={page >= totalPages || loading}
            onClick={() => {
              setPage((value) => Math.min(totalPages, value + 1));
            }}
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
