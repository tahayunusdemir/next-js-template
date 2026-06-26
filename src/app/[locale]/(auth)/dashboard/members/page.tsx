import { currentUser } from '@clerk/nextjs/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { ConnectionList } from '@/components/profile/connection-list';
import { FollowButton } from '@/components/profile/follow-button';
import { ensureProfile } from '@/libs/Profile';
import { listBlocked, listFollowing, listMembers } from '@/libs/Social';
import { getI18nPath } from '@/utils/Helpers';

type MembersPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function MembersPage(props: MembersPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const user = await currentUser();

  if (!user) {
    redirect(getI18nPath('/sign-in', locale));
  }

  await ensureProfile(user);
  const t = await getTranslations({ locale, namespace: 'MembersPage' });

  const [members, following, blocked] = await Promise.all([
    listMembers({ limit: 50 }),
    listFollowing({ userId: user.id }),
    listBlocked({ userId: user.id }),
  ]);

  const followingIds = new Set(following.map((connection) => connection.id));
  const blockedIds = new Set(blocked.map((connection) => connection.id));
  const others = members.filter((member) => member.id !== user.id);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <ConnectionList
        items={others}
        locale={locale}
        emptyMessage={t('empty')}
        renderActions={(connection) => (
          <FollowButton
            size="sm"
            targetId={connection.id}
            initial={{
              isFollowing: followingIds.has(connection.id),
              isBlocked: blockedIds.has(connection.id),
            }}
          />
        )}
      />
    </div>
  );
}
