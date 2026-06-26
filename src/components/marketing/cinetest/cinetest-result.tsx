import { ArrowRightIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { CineLetterChips } from '@/components/marketing/cinetype/cinetype-letter-chips';
import { Section } from '@/components/marketing/section';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { typeAffinities } from '@/data/cinetest-personas';
import { cn } from '@/lib/utils';
import { Link } from '@/libs/I18nNavigation';
import { profileUrl } from '@/libs/Tmdb';
import type { CineAxis, CineTestResult } from '@/types/CineTest';
import { CINE_AXES } from '@/types/CineTest';
import type { CineType } from '@/types/CineType';
import { CineTestRadar } from './cinetest-radar';

export type CineResultPerson = { name: string; profilePath: string | null };
export type CineResultMovie = { tmdbId: number; title: string; posterUrl: string | null };

function AxisBar(props: { axis: CineAxis; value: number }) {
  const t = useTranslations('CineTestResultPage');
  // Keep the marker fully inside the track: ±1 maps to 4%–96%, not 0%–100%.
  const position = 4 + ((props.value + 1) / 2) * 92;

  return (
    <li>
      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>{t(`axis_${props.axis}_low`)}</span>
        <span className="font-medium text-foreground">{t(`axis_${props.axis}_name`)}</span>
        <span>{t(`axis_${props.axis}_high`)}</span>
      </div>
      <div className="relative h-2 rounded-full bg-muted">
        <span
          className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary"
          style={{ left: `${position}%` }}
        />
      </div>
    </li>
  );
}

function PosterGrid(props: { movies: CineResultMovie[] }) {
  return (
    <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
      {props.movies.map((movie) => (
        <Link
          key={movie.tmdbId}
          href={`/films/${movie.tmdbId}`}
          title={movie.title}
          className="relative block aspect-[2/3] overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10"
        >
          {movie.posterUrl ? (
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              fill
              sizes="(min-width: 640px) 16vw, 33vw"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full items-center p-2 text-center text-xs text-muted-foreground">
              {movie.title}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}

function PersonCard(props: { label: string; person: CineResultPerson }) {
  const avatarUrl = profileUrl(props.person.profilePath);

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-3 ring-1 ring-foreground/10">
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={props.person.name}
          width={48}
          height={48}
          className="size-12 rounded-full object-cover"
        />
      ) : (
        <span className="size-12 rounded-full bg-muted" />
      )}
      <div>
        <p className="text-xs text-muted-foreground">{props.label}</p>
        <p className="text-sm font-medium">{props.person.name}</p>
      </div>
    </div>
  );
}

// Static, server-rendered result: persona, axis breakdown, explainability, picks,
// and TMDB recommendations. Reuses the CineType directory's letter chips + linking.
export function CineTestResult(props: {
  type: CineType;
  result: CineTestResult;
  director?: CineResultPerson;
  actor?: CineResultPerson;
  favorites?: CineResultMovie[];
  picks?: CineResultMovie[];
  recommendations: CineResultMovie[];
  signedIn?: boolean;
}) {
  const t = useTranslations('CineTestResultPage');
  const tType = useTranslations('CineType');

  // Each bipolar axis (−1…+1) maps to 0–100 (50 = balanced) for the radar shape.
  const radarData = CINE_AXES.map((axis) => ({
    label: t(`axis_${axis}_name`),
    value: Math.round(((props.result.vector[axis] + 1) / 2) * 100),
  }));

  // The five personas this vector sits closest to; the first is the assigned type.
  const affinities = typeAffinities(props.result.vector).slice(0, 5);

  return (
    <Section className="py-12 sm:py-16">
      <div className="mx-auto max-w-2xl space-y-12">
        <header className="text-center">
          <Badge variant="outline" className="mb-4">
            {t('badge')}
          </Badge>
          <p className="text-sm text-muted-foreground">{t('your_type_label')}</p>
          <h1 className="mt-1 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            {tType(`${props.type.slug}_name`)}
          </h1>
          <p className="mt-2 font-heading text-lg text-muted-foreground">{props.type.code}</p>
          <p className="mx-auto mt-4 max-w-prose text-pretty text-muted-foreground">
            {t(`descriptor_${props.result.descriptor}`)}
          </p>
          <div className="mt-6">
            <CineLetterChips type={props.type} />
          </div>
          <Link
            href={`/cinetype/${props.type.slug}`}
            className={cn(buttonVariants({ variant: 'outline' }), 'mt-6 rounded-full')}
          >
            {t('explore_profile', { name: tType(`${props.type.slug}_name`) })}
            <ArrowRightIcon className="size-4" />
          </Link>
        </header>

        <section aria-labelledby="cinetest-traits">
          <h2 id="cinetest-traits" className="font-heading text-xl font-semibold">
            {t('traits_title')}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('traits_intro')}</p>
          <CineTestRadar label={t('traits_title')} data={radarData} />
          <ul className="mt-6 space-y-5">
            {CINE_AXES.map((axis) => (
              <AxisBar key={axis} axis={axis} value={props.result.vector[axis]} />
            ))}
          </ul>
        </section>

        <section aria-labelledby="cinetest-affinity">
          <h2 id="cinetest-affinity" className="font-heading text-xl font-semibold">
            {t('affinity_title')}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('affinity_intro')}</p>
          <ul className="mt-6 space-y-4">
            {affinities.map((affinity) => (
              <li key={affinity.slug}>
                <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                  <Link href={`/cinetype/${affinity.slug}`} className="font-medium hover:underline">
                    {tType(`${affinity.slug}_name`)}
                  </Link>
                  <span className="text-muted-foreground tabular-nums">
                    {t('affinity_match', { percent: affinity.percent })}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-primary"
                    style={{ width: `${affinity.percent}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {props.result.highlights.length ? (
          <section aria-labelledby="cinetest-highlights">
            <h2 id="cinetest-highlights" className="font-heading text-xl font-semibold">
              {t('highlights_title')}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{t('highlights_intro')}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {props.result.highlights.map((highlight) => (
                <li key={`${highlight.questionId}-${highlight.axis}`}>
                  <Badge variant="outline" className="font-normal">
                    {t(`axis_${highlight.axis}_name`)} ·{' '}
                    {t(`axis_${highlight.axis}_${highlight.value >= 0 ? 'high' : 'low'}`)}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {props.director || props.actor ? (
          <section aria-labelledby="cinetest-picks">
            <h2 id="cinetest-picks" className="font-heading text-xl font-semibold">
              {t('picks_title')}
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {props.director ? (
                <PersonCard label={t('director_label')} person={props.director} />
              ) : null}
              {props.actor ? <PersonCard label={t('actor_label')} person={props.actor} /> : null}
            </div>
          </section>
        ) : null}

        {props.favorites?.length || props.picks?.length ? (
          <section aria-labelledby="cinetest-films">
            <h2 id="cinetest-films" className="font-heading text-xl font-semibold">
              {t('films_title')}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{t('films_intro')}</p>
            {props.favorites?.length ? (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {t('favorites_label')}
                </h3>
                <PosterGrid movies={props.favorites} />
              </div>
            ) : null}
            {props.picks?.length ? (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-muted-foreground">{t('picks_label')}</h3>
                <PosterGrid movies={props.picks} />
              </div>
            ) : null}
          </section>
        ) : null}

        {props.recommendations.length ? (
          <section aria-labelledby="cinetest-recs">
            <h2 id="cinetest-recs" className="font-heading text-xl font-semibold">
              {t('recommendations_title')}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{t('recommendations_intro')}</p>
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
              {props.recommendations.map((movie) => (
                <Link
                  key={movie.tmdbId}
                  href={`/films/${movie.tmdbId}`}
                  title={movie.title}
                  className="relative block aspect-[2/3] overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10"
                >
                  {movie.posterUrl ? (
                    <Image
                      src={movie.posterUrl}
                      alt={movie.title}
                      fill
                      sizes="(min-width: 640px) 16vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center p-2 text-center text-xs text-muted-foreground">
                      {movie.title}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {props.signedIn ? null : (
          <section className="rounded-3xl border bg-card p-8 text-center ring-1 ring-foreground/10">
            <h2 className="font-heading text-xl font-semibold">{t('signup_title')}</h2>
            <p className="mx-auto mt-2 max-w-prose text-sm text-pretty text-muted-foreground">
              {t('signup_description')}
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/sign-up" className={cn(buttonVariants(), 'rounded-full')}>
                {t('signup_cta')}
                <ArrowRightIcon className="size-4" />
              </Link>
              <Link
                href="/sign-in"
                className={cn(buttonVariants({ variant: 'outline' }), 'rounded-full')}
              >
                {t('signin_cta')}
              </Link>
            </div>
          </section>
        )}

        <div className="text-center">
          <Link href="/dashboard/cinetest" className={cn(buttonVariants({ variant: 'ghost' }))}>
            {t('retake')}
          </Link>
        </div>
      </div>
    </Section>
  );
}
