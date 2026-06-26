'use client';

import { SearchIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import * as React from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { genreKey, movieGenres } from '@/data/genres';
import { usePathname, useRouter } from '@/libs/I18nNavigation';
import type { FilmDensity, FilmSort } from '@/validations/FilmValidation';
import { FILM_SORTS } from '@/validations/FilmValidation';
import { FilmDensityToggle } from './film-density-toggle';

const DECADES = [2020, 2010, 2000, 1990, 1980, 1970, 1960, 1950] as const;
const ALL = 'all';

export function FilmsToolbar(props: { total: number; density: FilmDensity }) {
  const t = useTranslations('Films');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Writes one search param (clearing it for empty/`all`) and resets pagination.
  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams);

    if (!value || value === ALL) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`);
  }

  function onSearch(value: string) {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    timeout.current = setTimeout(() => {
      setParam('q', value.trim());
    }, 350);
  }

  const sort = FILM_SORTS.find((value) => value === searchParams.get('sort')) ?? 'popularity';
  const genre = searchParams.get('genre') ?? ALL;
  const decade = searchParams.get('decade') ?? ALL;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{t('count', { count: props.total })}</p>
        <FilmDensityToggle
          density={props.density}
          onChange={(value) => {
            setParam('density', value);
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            defaultValue={searchParams.get('q') ?? ''}
            placeholder={t('search_placeholder')}
            aria-label={t('search_placeholder')}
            onChange={(event) => {
              onSearch(event.target.value);
            }}
            className="pl-9"
          />
        </div>

        <Select
          value={genre}
          onValueChange={(value) => {
            setParam('genre', value);
          }}
        >
          <SelectTrigger className="w-40" aria-label={t('genre_label')}>
            <SelectValue placeholder={t('genre_label')}>
              {(value) => {
                const key = genreKey(Number(value));
                return key ? t(`genre_${key}`) : t('genre_label');
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="start" alignItemWithTrigger={false}>
            <SelectItem value={ALL}>{t('genre_label')}</SelectItem>
            {movieGenres.map((item) => (
              <SelectItem key={item.id} value={String(item.id)}>
                {t(`genre_${item.key}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={decade}
          onValueChange={(value) => {
            setParam('decade', value);
          }}
        >
          <SelectTrigger className="w-32" aria-label={t('decade_label')}>
            <SelectValue placeholder={t('decade_label')}>
              {(value) => (value === ALL ? t('decade_label') : `${value}s`)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="start" alignItemWithTrigger={false}>
            <SelectItem value={ALL}>{t('decade_label')}</SelectItem>
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
            setParam('sort', value);
          }}
        >
          <SelectTrigger className="w-40" aria-label={t('sort_label')}>
            <SelectValue placeholder={t('sort_label')}>
              {(value: FilmSort) => t(`sort_${value}`)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="start" alignItemWithTrigger={false}>
            {FILM_SORTS.map((value) => (
              <SelectItem key={value} value={value}>
                {t(`sort_${value}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
