import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { MessageButton } from '@/components/chat/message-button';
import { FollowButton } from '@/components/profile/follow-button';
import { ProfileActions } from '@/components/profile/profile-actions';
import { ProfileView } from '@/components/profile/profile-view';
import { getProfileByHandle } from '@/libs/Profile';
import { getRelationship } from '@/libs/Social';
import { getBaseUrl, getI18nPath } from '@/utils/Helpers';

type ProfilePageProps = {
  params: Promise<{ locale: string; handle: string }>;
};

export async function generateMetadata(props: ProfilePageProps): Promise<Metadata> {
  const { locale, handle } = await props.params;
  const profile = await getProfileByHandle(handle);

  // Mirror the page's 404 guard so private profiles never leak a name/bio into <head>.
  if (!profile || !profile.isPublic) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'ProfilePage' });
  const name = profile.displayName?.trim() ? profile.displayName : `@${profile.handle}`;
  const title = t('meta_title', { name });
  const description = profile.bio?.trim() ? profile.bio : t('meta_description', { name });
  const url = getI18nPath(`/u/${profile.handle}`, locale);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'profile',
      title,
      description,
      url,
      images: profile.avatarUrl ? [{ url: profile.avatarUrl }] : undefined,
    },
  };
}

export default async function ProfilePage(props: ProfilePageProps) {
  const { locale, handle } = await props.params;
  setRequestLocale(locale);

  const profile = await getProfileByHandle(handle);

  // The public route is outside Clerk middleware/ClerkProvider, so the action row is
  // viewer-only; the owner edits from the dashboard. Private profiles 404 here.
  if (!profile || !profile.isPublic) {
    notFound();
  }

  // Clerk runs on `/u` (proxy.ts needsClerkContext) so server `auth()` works here even
  // though there is no ClerkProvider; the follow action runs server-side.
  const { userId } = await auth();
  const isOwner = userId === profile.id;
  const relationship =
    userId && !isOwner
      ? await getRelationship({ viewerId: userId, targetId: profile.id })
      : { isFollowing: false, isBlocked: false, isBlockedBy: false };

  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      {isOwner ? null : (
        <>
          <FollowButton
            targetId={profile.id}
            initial={{ isFollowing: relationship.isFollowing, isBlocked: relationship.isBlocked }}
            blockedByTarget={relationship.isBlockedBy}
            signedIn={Boolean(userId)}
          />
          {relationship.isBlocked || relationship.isBlockedBy ? null : (
            <MessageButton targetId={profile.id} signedIn={Boolean(userId)} />
          )}
        </>
      )}
      <ProfileActions isOwner={isOwner} />
    </div>
  );

  const name = profile.displayName?.trim() ? profile.displayName : `@${profile.handle}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name,
      alternateName: `@${profile.handle}`,
      image: profile.avatarUrl ?? undefined,
      url: `${getBaseUrl()}/u/${profile.handle}`,
    },
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 md:py-16">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires raw script content
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProfileView profile={profile} locale={locale} actions={actions} />
    </div>
  );
}
