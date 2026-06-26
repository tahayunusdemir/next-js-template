import { ArrowRightIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { ProfileFilms } from '@/components/films/profile-films';
import { ProfileBio } from '@/components/profile/profile-bio';
import { ProfileEmpty } from '@/components/profile/profile-empty';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileSection } from '@/components/profile/profile-section';
import { Badge } from '@/components/ui/badge';
import { getLatestCineTestResultForUser } from '@/libs/CineTest';
import { cinePersonByRole, cineTopGenres } from '@/libs/CineTestSummary';
import type { FilmStatus } from '@/libs/Films';
import { getUserFilms } from '@/libs/Films';
import { Link } from '@/libs/I18nNavigation';
import type { Profile } from '@/libs/Profile';
import { getConnectionCounts } from '@/libs/Social';

const WATCHED_STATUS: FilmStatus = { watched: true, watchlist: false };
const WATCHLIST_STATUS: FilmStatus = { watched: false, watchlist: true };

// Only the latest few films preview on the profile; the full collection lives on its own page.
const PREVIEW_LIMIT = 6;

// Shared profile body used by both the public page (/u/<handle>) and the embedded
// dashboard page. `actions` is the context-specific action row (viewer vs owner).
// Film sections render read-only — owners manage watched/watchlist from the films pages.
// `linkCollections` adds "see all" links to the owner's dashboard collection pages.
export async function ProfileView(props: {
  profile: Profile;
  locale: string;
  actions?: React.ReactNode;
  linkCollections?: boolean;
}) {
  const t = await getTranslations({ locale: props.locale, namespace: 'ProfilePage' });
  const tFilms = await getTranslations({ locale: props.locale, namespace: 'Films' });
  const { profile } = props;

  function seeAll(href: string) {
    if (!props.linkCollections) {
      return null;
    }

    return (
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {t('see_all')}
        <ArrowRightIcon className="size-3.5" />
      </Link>
    );
  }

  const [watched, watchlist, counts, cineResult] = await Promise.all([
    getUserFilms({ userId: profile.id, kind: 'watched', limit: PREVIEW_LIMIT }),
    getUserFilms({ userId: profile.id, kind: 'watchlist', limit: PREVIEW_LIMIT }),
    getConnectionCounts(profile.id),
    getLatestCineTestResultForUser(profile.id),
  ]);

  // The test's film-taste picks, summarized as short category labels for the profile.
  const cinePicks = cineResult
    ? {
        genres: cineTopGenres(cineResult.answers),
        director: cinePersonByRole(cineResult.answers, 'director')?.name,
        actor: cinePersonByRole(cineResult.answers, 'actor')?.name,
      }
    : undefined;
  const hasCinePicks = Boolean(
    cinePicks &&
    (cinePicks.genres.length > 0 ||
      cinePicks.director !== undefined ||
      cinePicks.actor !== undefined),
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5">
        <ProfileHeader
          displayName={profile.displayName}
          handle={profile.handle}
          avatarUrl={profile.avatarUrl}
          country={profile.country}
          joinedAt={profile.createdAt}
          cineType={profile.cineType}
          level={profile.level}
          followers={counts.followers}
          following={counts.following}
          locale={props.locale}
        />
        {props.actions}
        <ProfileBio bio={profile.bio} website={profile.website} />
      </div>

      <ProfileSection title={t('section_cine_picks')}>
        {cinePicks && hasCinePicks ? (
          <div className="flex flex-wrap gap-2">
            {cinePicks.genres.map((genre) => (
              <Badge key={genre} variant="secondary">
                {tFilms(`genre_${genre}`)}
              </Badge>
            ))}
            {cinePicks.director ? (
              <Badge variant="outline">{t('pick_director', { name: cinePicks.director })}</Badge>
            ) : null}
            {cinePicks.actor ? (
              <Badge variant="outline">{t('pick_actor', { name: cinePicks.actor })}</Badge>
            ) : null}
          </div>
        ) : (
          <ProfileEmpty message={t('empty_cine_picks')} />
        )}
      </ProfileSection>

      <ProfileSection title={t('section_watchlist')} action={seeAll('/dashboard/watchlist/')}>
        {watchlist.length ? (
          <ProfileFilms
            films={watchlist.map((movie) => ({ movie, status: WATCHLIST_STATUS }))}
            interactive={false}
          />
        ) : (
          <ProfileEmpty message={t('empty_watchlist')} />
        )}
      </ProfileSection>

      <ProfileSection title={t('section_recently_watched')} action={seeAll('/dashboard/watched/')}>
        {watched.length ? (
          <ProfileFilms
            films={watched.map((movie) => ({ movie, status: WATCHED_STATUS }))}
            interactive={false}
          />
        ) : (
          <ProfileEmpty message={t('empty_recently_watched')} />
        )}
      </ProfileSection>

      <ProfileSection title={t('section_badges')}>
        <ProfileEmpty message={t('empty_badges')} />
      </ProfileSection>
    </div>
  );
}
