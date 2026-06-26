import { auth, currentUser } from '@clerk/nextjs/server';
import {
  ArrowRightIcon,
  BookmarkIcon,
  FilmIcon,
  HeartHandshakeIcon,
  MessageCircleIcon,
  UsersIcon,
  UsersRoundIcon,
} from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FilmCard } from '@/components/films/film-card';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { FilmStatus } from '@/libs/Films';
import { getPopularMovies, getUserFilmStatus } from '@/libs/Films';
import { Link } from '@/libs/I18nNavigation';

const EMPTY_STATUS: FilmStatus = { watched: false, watchlist: false };

export default async function DashboardPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const [tHome, tNav, { userId }, user] = await Promise.all([
    getTranslations({ locale, namespace: 'DashboardHomePage' }),
    getTranslations({ locale, namespace: 'DashboardLayout' }),
    auth(),
    currentUser(),
  ]);

  const movies = await getPopularMovies({ limit: 6 });
  const status =
    userId && movies.length
      ? await getUserFilmStatus({ userId, movieIds: movies.map((movie) => movie.tmdbId) })
      : null;

  const name = user?.firstName ?? user?.username ?? null;

  // Curated jump-off points to the sidebar sections people reach for most.
  const quickLinks = [
    {
      id: 'films',
      href: '/dashboard/films/',
      icon: FilmIcon,
      title: tNav('films_link'),
      description: tHome('films_desc'),
    },
    {
      id: 'matches',
      href: '/dashboard/matches/',
      icon: HeartHandshakeIcon,
      title: tNav('matches_link'),
      description: tHome('matches_desc'),
    },
    {
      id: 'community',
      href: '/dashboard/community/',
      icon: UsersRoundIcon,
      title: tNav('community_link'),
      description: tHome('community_desc'),
    },
    {
      id: 'members',
      href: '/dashboard/members/',
      icon: UsersIcon,
      title: tNav('members_link'),
      description: tHome('members_desc'),
    },
    {
      id: 'watchlist',
      href: '/dashboard/watchlist/',
      icon: BookmarkIcon,
      title: tNav('watchlist_link'),
      description: tHome('watchlist_desc'),
    },
    {
      id: 'messages',
      href: '/dashboard/messages/',
      icon: MessageCircleIcon,
      title: tNav('messages_link'),
      description: tHome('messages_desc'),
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {name ? tHome('greeting', { name }) : tHome('title')}
        </h1>
        <p className="max-w-prose text-sm text-muted-foreground">{tHome('subtitle')}</p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">{tHome('quick_links')}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;

            return (
              <Link
                key={link.id}
                href={link.href}
                className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card className="h-full transition-colors group-hover:bg-accent">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
                        <Icon className="size-5" />
                      </div>
                      <ArrowRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <CardTitle className="mt-2">{link.title}</CardTitle>
                    <CardDescription>{link.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {movies.length ? (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-muted-foreground">{tHome('popular_title')}</h2>
            <Link
              href="/dashboard/films/"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {tHome('see_all')}
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {movies.map((movie) => (
              <FilmCard
                key={movie.tmdbId}
                movie={movie}
                status={status?.get(movie.tmdbId) ?? EMPTY_STATUS}
                interactive={Boolean(userId)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
