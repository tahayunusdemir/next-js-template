'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { genreKey } from '@/data/genres';
import type { TmdbMovieDetails } from '@/types/Tmdb';

const TABS = ['cast', 'crew', 'details', 'genres', 'releases'] as const;

function Detail(props: { label: string; value?: string }) {
  if (!props.value) {
    return null;
  }

  return (
    <div className="flex justify-between gap-4 border-b border-border/50 py-1.5">
      <dt className="text-muted-foreground">{props.label}</dt>
      <dd>{props.value}</dd>
    </div>
  );
}

export function FilmCast(props: { details: TmdbMovieDetails }) {
  const t = useTranslations('FilmDetailPage');
  const tFilms = useTranslations('Films');
  const { details } = props;

  const cast = details.credits?.cast.slice(0, 30) ?? [];
  const crew = details.credits?.crew.slice(0, 20) ?? [];
  const releases =
    details.release_dates?.results.find((item) => item.iso_3166_1 === 'US') ??
    details.release_dates?.results[0];

  return (
    <Tabs defaultValue="cast" className="w-full">
      <TabsList className="flex-wrap">
        {TABS.map((tab) => (
          <TabsTrigger key={tab} value={tab}>
            {t(`tab_${tab}`)}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="cast" className="pt-4">
        {cast.length ? (
          <div className="flex flex-wrap gap-2">
            {cast.map((member) => (
              <Badge key={member.id} variant="secondary" className="font-normal">
                {member.name}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t('no_cast')}</p>
        )}
      </TabsContent>

      <TabsContent value="crew" className="pt-4">
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {crew.map((member, index) => (
            <li
              key={`${member.id}-${member.job}-${index}`}
              className="flex justify-between gap-4 text-sm"
            >
              <span>{member.name}</span>
              <span className="text-muted-foreground">{member.job}</span>
            </li>
          ))}
        </ul>
      </TabsContent>

      <TabsContent value="details" className="pt-4">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <Detail label={t('detail_status')} value={details.status} />
          <Detail label={t('detail_language')} value={details.original_language?.toUpperCase()} />
          <Detail label={t('detail_release')} value={details.release_date} />
          <Detail
            label={t('detail_runtime')}
            value={details.runtime ? t('runtime', { minutes: details.runtime }) : undefined}
          />
        </dl>
      </TabsContent>

      <TabsContent value="genres" className="pt-4">
        <div className="flex flex-wrap gap-2">
          {details.genres.map((genre) => {
            const key = genreKey(genre.id);

            return (
              <Badge key={genre.id} variant="outline" className="font-normal">
                {key ? tFilms(`genre_${key}`) : genre.name}
              </Badge>
            );
          })}
        </div>
      </TabsContent>

      <TabsContent value="releases" className="pt-4">
        {releases?.release_dates.length ? (
          <ul className="flex flex-col gap-1.5 text-sm">
            {releases.release_dates.map((release) => (
              <li
                key={`${release.type}-${release.release_date}`}
                className="flex justify-between gap-4"
              >
                <span>{release.release_date.slice(0, 10)}</span>
                <span className="text-muted-foreground">{release.certification || '—'}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{t('no_releases')}</p>
        )}
      </TabsContent>
    </Tabs>
  );
}
